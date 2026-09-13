import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from difflib import SequenceMatcher

from openai import OpenAI

from app.ai.base import AIProvider
from app.core.config import settings


class NVIDIAProvider(AIProvider):
    """NVIDIA-backed generation with bounded, source-grounded question batches."""

    _QUESTION_KEYS = (
        "question",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_option",
        "explanation",
    )

    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.nvidia_api_key,
        )
        self.model = "openai/gpt-oss-20b"

    def generate_summary(self, content: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Summarize the source using only stated information. "
                        "Do not add facts or resolve ambiguity. Keep it concise."
                    ),
                },
                {"role": "user", "content": content},
            ],
            temperature=0.1,
            max_tokens=1000,
        )
        result = response.choices[0].message.content
        if not result or not result.strip():
            raise ValueError("AI did not generate a summary")
        return result.strip()

    def generate_important_points(self, content: str) -> list[str]:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract 8 to 15 important points from the source. "
                        "Use only explicit source information. Return one point "
                        "per line and no introductory text."
                    ),
                },
                {"role": "user", "content": content},
            ],
            temperature=0.1,
            max_tokens=1500,
        )
        result = response.choices[0].message.content
        if not result:
            raise ValueError("AI did not generate important points")
        points = []
        for line in result.splitlines():
            point = re.sub(r"^\s*(?:\d+[\.)]|[-*•])\s*", "", line).strip()
            if point:
                points.append(point)
        return self._deduplicate_strings(points)

    def generate_questions(self, content: str) -> list[dict]:
        if not content or not content.strip():
            raise ValueError("Cannot generate questions from empty content")

        chunks = self._chunk_content(content)
        workers = min(4, len(chunks))
        results: list[dict] = []

        # Each chunk is independent. Running these calls concurrently removes
        # the previous O(chunks * concept-groups * validation-batches) latency.
        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {
                executor.submit(self._generate_and_validate_chunk, chunk): index
                for index, chunk in enumerate(chunks)
            }
            ordered: dict[int, list[dict]] = {}
            for future in as_completed(futures):
                ordered[futures[future]] = future.result()

        for index in range(len(chunks)):
            results.extend(ordered[index])

        results = self._semantic_deduplicate_questions(results)
        if not results:
            raise ValueError("AI did not generate any valid questions")
        return results

    def _generate_and_validate_chunk(self, chunk: str) -> list[dict]:
        # A failed validation is regenerated once, but never persisted as-is.
        for attempt in range(2):
            generated = self._generate_question_batch(chunk)
            valid = self._validate_question_batch(chunk, generated)
            if valid:
                return valid
            if attempt == 0:
                continue
        return []

    def _generate_question_batch(self, chunk: str) -> list[dict]:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Create 4 to 8 multiple-choice questions from ONLY the "
                        "source below. Cover different facts across the source "
                        "and vary recall, conceptual, and application wording. "
                        "Do not use outside knowledge or infer unstated facts. "
                        "Every option must be plausible, distinct, and supported "
                        "by the source; exactly one option may be correct. "
                        "Return ONLY a JSON array of objects with exactly these "
                        "keys: question, option_a, option_b, option_c, "
                        "option_d, correct_option (A/B/C/D), explanation."
                    ),
                },
                {"role": "user", "content": f"SOURCE:\n{chunk}"},
            ],
            temperature=0.1,
            max_tokens=4500,
        )
        result = response.choices[0].message.content or ""
        return self._basic_validate_questions(self._parse_json_questions(result))

    def _validate_question_batch(self, source: str, questions: list[dict]) -> list[dict]:
        if not questions:
            return []
        payload = json.dumps(questions, ensure_ascii=False)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict source fact checker. For each numbered "
                        "question, verify from SOURCE that the stem is answerable, "
                        "the marked answer is the only correct option, every "
                        "distractor is distinct and plausible, and the explanation "
                        "is supported. Reject anything requiring outside knowledge, "
                        "unstated inference, ambiguity, or contradiction. Return "
                        'ONLY JSON: {"valid":[1,2],"invalid":[3]}. An absent or '
                        "malformed response means every question is invalid."
                    ),
                },
                {
                    "role": "user",
                    "content": f"SOURCE:\n{source}\nQUESTIONS:\n{payload}",
                },
            ],
            temperature=0.0,
            max_tokens=1200,
        )
        parsed = self._parse_json_object(response.choices[0].message.content or "")
        if not parsed or not isinstance(parsed.get("valid"), list):
            return []
        valid_indexes = {
            int(index)
            for index in parsed["valid"]
            if isinstance(index, int) or (isinstance(index, str) and index.isdigit())
        }
        return [
            question
            for index, question in enumerate(questions, start=1)
            if index in valid_indexes
        ]

    def _parse_json_questions(self, text: str) -> list[dict]:
        parsed = self._parse_json(text)
        if isinstance(parsed, dict):
            parsed = parsed.get("questions", [])
        if not isinstance(parsed, list):
            return []
        return [item for item in parsed if isinstance(item, dict)]

    def _parse_json_object(self, text: str) -> dict | None:
        parsed = self._parse_json(text)
        return parsed if isinstance(parsed, dict) else None

    @staticmethod
    def _parse_json(text: str) -> object | None:
        cleaned = re.sub(r"^\s*```(?:json)?\s*|\s*```\s*$", "", text.strip(), flags=re.I)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"(\[.*\]|\{.*\})", cleaned, flags=re.S)
            if not match:
                return None
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                return None

    def _basic_validate_questions(self, questions: list[dict]) -> list[dict]:
        valid = []
        for item in questions:
            if any(not isinstance(item.get(key), str) or not item[key].strip()
                   for key in self._QUESTION_KEYS):
                continue
            options = [item[f"option_{letter}"].strip() for letter in "abcd"]
            answer = item["correct_option"].strip().upper()
            normalized = [self._normalize_text(option) for option in options]
            if answer not in "ABCD" or len(set(normalized)) != 4:
                continue
            valid.append({
                "question": item["question"].strip(),
                "option_a": options[0],
                "option_b": options[1],
                "option_c": options[2],
                "option_d": options[3],
                "correct_option": answer,
                "explanation": item["explanation"].strip(),
            })
        return valid

    def _semantic_deduplicate_questions(self, questions: list[dict]) -> list[dict]:
        unique: list[dict] = []
        for question in questions:
            current = self._normalize_text(question["question"])
            if not current:
                continue
            if any(
                SequenceMatcher(None, current, self._normalize_text(existing["question"])).ratio() >= 0.88
                or self._token_overlap(current, self._normalize_text(existing["question"])) >= 0.92
                for existing in unique
            ):
                continue
            unique.append(question)
        return unique

    @staticmethod
    def _token_overlap(first: str, second: str) -> float:
        first_tokens, second_tokens = set(first.split()), set(second.split())
        if not first_tokens or not second_tokens:
            return 0.0
        return len(first_tokens & second_tokens) / min(len(first_tokens), len(second_tokens))

    @staticmethod
    def _normalize_text(value: str) -> str:
        return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", "", value.lower())).strip()

    @staticmethod
    def _deduplicate_strings(values: list[str]) -> list[str]:
        seen = set()
        result = []
        for value in values:
            key = NVIDIAProvider._normalize_text(value)
            if key and key not in seen:
                seen.add(key)
                result.append(value)
        return result

    @staticmethod
    def _chunk_content(content: str, max_chars: int = 9000) -> list[str]:
        normalized = re.sub(r"\r\n?", "\n", content).strip()
        if len(normalized) <= max_chars:
            return [normalized]
        paragraphs = [part.strip() for part in re.split(r"\n\s*\n", normalized) if part.strip()]
        chunks: list[str] = []
        current = ""
        for paragraph in paragraphs:
            if len(paragraph) > max_chars:
                if current:
                    chunks.append(current)
                    current = ""
                chunks.extend(paragraph[start:start + max_chars] for start in range(0, len(paragraph), max_chars))
                continue
            candidate = paragraph if not current else f"{current}\n\n{paragraph}"
            if len(candidate) > max_chars:
                chunks.append(current)
                current = paragraph
            else:
                current = candidate
        if current:
            chunks.append(current)
        return chunks
