import json
import re
from difflib import SequenceMatcher

from openai import OpenAI

from app.ai.base import AIProvider
from app.core.config import settings


class NVIDIAProvider(AIProvider):

    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.nvidia_api_key,
        )

        self.model = "openai/gpt-oss-20b"

    # ============================================================
    # SUMMARY
    # ============================================================

    def generate_summary(self, content: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert university study assistant. "
                        "Create a concise, accurate, student-friendly summary "
                        "of the provided study material.\n\n"
                        "Requirements:\n"
                        "- Use ONLY information contained in the source.\n"
                        "- Focus on the main concepts and ideas.\n"
                        "- Explain the material clearly for a university student.\n"
                        "- Do not reproduce the source line by line.\n"
                        "- Do not add outside knowledge.\n"
                        "- Do not list every example or syntax detail.\n"
                        "- Use short paragraphs and simple headings when useful.\n"
                        "- Avoid unnecessary repetition.\n"
                        "- Aim for approximately 200-400 words."
                    ),
                },
                {
                    "role": "user",
                    "content": content,
                },
            ],
            temperature=0.2,
            max_tokens=1000,
        )

        result = response.choices[0].message.content

        if not result:
            raise ValueError("AI did not generate a summary")

        return result.strip()

    # ============================================================
    # IMPORTANT POINTS
    # ============================================================

    def generate_important_points(
        self,
        content: str,
    ) -> list[str]:

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert university study assistant.\n\n"
                        "Extract the most important concepts from the provided "
                        "study material.\n\n"
                        "STRICT SOURCE RULE:\n"
                        "Use ONLY information explicitly present in the source.\n"
                        "Do not add general knowledge, assumptions, explanations, "
                        "or facts not present in the source.\n\n"
                        "Return 8 to 15 meaningful points.\n"
                        "Each point must represent one concept that a student "
                        "should remember.\n\n"
                        "Rules:\n"
                        "- Focus on concepts, definitions, rules, differences, "
                        "and important facts.\n"
                        "- Combine closely related information.\n"
                        "- Avoid trivial details.\n"
                        "- Do not copy the source line by line.\n"
                        "- Do not return code blocks.\n"
                        "- Return one complete point per line.\n"
                        "- Number the points."
                    ),
                },
                {
                    "role": "user",
                    "content": content,
                },
            ],
            temperature=0.1,
            max_tokens=1500,
        )

        result = response.choices[0].message.content

        if not result:
            raise ValueError(
                "AI did not generate important points"
            )

        points = []

        for line in result.strip().splitlines():
            line = line.strip()

            if not line:
                continue

            line = re.sub(
                r"^\s*\d+[\.\)]\s*",
                "",
                line,
            )

            line = re.sub(
                r"^[-•*]\s*",
                "",
                line,
            )

            if line.strip():
                points.append(line.strip())

        return self._deduplicate_strings(points)

    # ============================================================
    # EXHAUSTIVE QUESTION BANK
    # ============================================================

    def generate_questions(
        self,
        content: str,
    ) -> list[dict]:

        if not content or not content.strip():
            raise ValueError(
                "Cannot generate questions from empty content"
            )

        chunks = self._chunk_content(
            content,
            max_chars=9000,
        )

        all_questions: list[dict] = []

        for chunk_index, chunk in enumerate(
            chunks,
            start=1,
        ):
            print(
                f"Processing question-bank section "
                f"{chunk_index}/{len(chunks)}..."
            )

            concepts = self._extract_concepts(chunk)

            if not concepts:
                continue

            questions = self._generate_questions_from_concepts(
                chunk,
                concepts,
            )

            print(
                f"Generated {len(questions)} raw questions "
                f"for section {chunk_index}."
            )

            # ----------------------------------------------------
            # First deterministic validation
            # ----------------------------------------------------

            questions = self._basic_validate_questions(
                questions
            )

            print(
                f"{len(questions)} questions remain after "
                "basic validation."
            )

            # ----------------------------------------------------
            # AI source-grounding validation
            # ----------------------------------------------------

            questions = self._validate_questions_against_source(
                chunk,
                questions,
            )

            print(
                f"{len(questions)} questions remain after "
                "source validation."
            )

            # ----------------------------------------------------
            # Coverage audit
            # ----------------------------------------------------

            missing = self._find_missing_concepts(
                chunk,
                concepts,
                questions,
            )

            if missing:
                print(
                    f"Coverage check found "
                    f"{len(missing)} missing concepts."
                )

                additional_questions = (
                    self._generate_missing_questions(
                        chunk,
                        concepts,
                        missing,
                    )
                )

                additional_questions = (
                    self._basic_validate_questions(
                        additional_questions
                    )
                )

                additional_questions = (
                    self._validate_questions_against_source(
                        chunk,
                        additional_questions,
                    )
                )

                questions.extend(additional_questions)

            all_questions.extend(questions)

        # --------------------------------------------------------
        # Global deterministic deduplication
        # --------------------------------------------------------

        all_questions = self._deduplicate_questions(
            all_questions
        )

        # --------------------------------------------------------
        # Final semantic deduplication
        # --------------------------------------------------------

        all_questions = self._semantic_deduplicate_questions(
            all_questions
        )

        if not all_questions:
            raise ValueError(
                "AI did not generate any valid questions"
            )

        print(
            f"Final question bank contains "
            f"{len(all_questions)} unique validated questions."
        )

        return all_questions

    # ============================================================
    # CONCEPT EXTRACTION
    # ============================================================

    def _extract_concepts(
        self,
        content: str,
    ) -> list[str]:

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert academic analyst.\n\n"
                        "Read the study material and build an exhaustive "
                        "concept inventory.\n\n"
                        "IMPORTANT:\n"
                        "Use ONLY information explicitly present in the source.\n"
                        "Do not infer missing facts.\n"
                        "Do not resolve contradictions yourself.\n"
                        "If the source contains inconsistent terminology, "
                        "preserve the inconsistency rather than inventing "
                        "a correction.\n\n"
                        "Identify every meaningful item that could reasonably "
                        "be tested in a university or competitive examination.\n\n"
                        "Include:\n"
                        "- definitions\n"
                        "- terminology\n"
                        "- concepts\n"
                        "- rules\n"
                        "- principles\n"
                        "- relationships\n"
                        "- comparisons\n"
                        "- classifications\n"
                        "- processes\n"
                        "- steps\n"
                        "- advantages and disadvantages\n"
                        "- constraints and exceptions\n"
                        "- formulas\n"
                        "- important examples\n"
                        "- practical applications\n"
                        "- code/query behavior when explicitly shown\n"
                        "- cause and effect relationships\n\n"
                        "Do not combine unrelated concepts.\n"
                        "Return one concept per line using exactly:\n"
                        "CONCEPT: ...\n"
                        "Return only the concept inventory."
                    ),
                },
                {
                    "role": "user",
                    "content": content,
                },
            ],
            temperature=0.0,
            max_tokens=5000,
        )

        result = response.choices[0].message.content

        if not result:
            return []

        concepts = []

        for line in result.strip().splitlines():
            line = line.strip()

            if not line.startswith("CONCEPT:"):
                continue

            concept = line[
                len("CONCEPT:"):
            ].strip()

            if concept:
                concepts.append(concept)

        return self._deduplicate_strings(concepts)

    # ============================================================
    # GENERATE QUESTIONS
    # ============================================================

    def _generate_questions_from_concepts(
        self,
        content: str,
        concepts: list[str],
    ) -> list[dict]:

        concept_groups = self._group_items(
            concepts,
            group_size=12,
        )

        questions: list[dict] = []

        for group_index, concept_group in enumerate(
            concept_groups,
            start=1,
        ):
            concept_text = "\n".join(
                f"{index + 1}. {concept}"
                for index, concept in enumerate(
                    concept_group
                )
            )

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert university and "
                            "competitive-exam question writer.\n\n"

                            "Generate a HIGH-QUALITY question set for "
                            "the concepts provided.\n\n"

                            "STRICT SOURCE-GROUNDING RULE:\n"
                            "Every question, option, answer, and explanation "
                            "must be directly supported by the source material.\n"
                            "Do not use external knowledge.\n"
                            "Do not infer unstated reasons.\n"
                            "Do not invent SQL behavior.\n"
                            "Do not correct inconsistencies in the source.\n"
                            "If a concept is ambiguous or contradictory in "
                            "the source, do not create a question that relies "
                            "on resolving that ambiguity.\n\n"

                            "EVERY concept must be meaningfully covered.\n"
                            "Generate multiple questions for a concept ONLY "
                            "when the concept contains genuinely different "
                            "testable facts.\n"
                            "Do NOT create trivial rewordings.\n\n"

                            "Prefer a balanced variety of:\n"
                            "- definition\n"
                            "- identification\n"
                            "- direct concept understanding\n"
                            "- comparison\n"
                            "- rule application\n"
                            "- scenario/application\n"
                            "- example interpretation\n"
                            "- exception\n"
                            "- cause/effect\n"
                            "- process/order\n"
                            "- calculation/problem solving when explicitly "
                            "supported by the source\n"
                            "- code/query interpretation when explicitly "
                            "supported by the source\n\n"

                            "Avoid:\n"
                            "- repeated questions testing the same fact\n"
                            "- outside knowledge\n"
                            "- hidden assumptions\n"
                            "- duplicate options\n"
                            "- ambiguous questions\n"
                            "- questions with more than one correct answer\n\n"

                            "For every question use EXACTLY:\n\n"
                            "QUESTION: ...\n"
                            "A: ...\n"
                            "B: ...\n"
                            "C: ...\n"
                            "D: ...\n"
                            "ANSWER: A/B/C/D\n"
                            "EXPLANATION: ...\n\n"

                            "Return ONLY question blocks."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            "SOURCE MATERIAL:\n\n"
                            f"{content}\n\n"
                            "CONCEPTS THAT MUST BE COVERED:\n\n"
                            f"{concept_text}"
                        ),
                    },
                ],
                temperature=0.15,
                max_tokens=7000,
            )

            result = response.choices[0].message.content

            if not result:
                continue

            parsed = self._parse_questions(result)

            print(
                f"Generated {len(parsed)} questions "
                f"for concept group {group_index}."
            )

            questions.extend(parsed)

        return questions

    # ============================================================
    # BASIC QUESTION VALIDATION
    # ============================================================

    def _basic_validate_questions(
        self,
        questions: list[dict],
    ) -> list[dict]:

        valid_questions = []

        for question in questions:

            question_text = question.get(
                "question",
                "",
            ).strip()

            options = [
                question.get("option_a", "").strip(),
                question.get("option_b", "").strip(),
                question.get("option_c", "").strip(),
                question.get("option_d", "").strip(),
            ]

            answer = question.get(
                "correct_option",
                "",
            ).strip().upper()

            explanation = question.get(
                "explanation",
                "",
            ).strip()

            # Question must exist.
            if not question_text:
                continue

            # Exactly four non-empty options.
            if len(options) != 4 or any(
                not option for option in options
            ):
                continue

            # Options cannot be duplicates.
            normalized_options = [
                self._normalize_text(option)
                for option in options
            ]

            if len(set(normalized_options)) != 4:
                print(
                    "Rejected question because options are duplicated:"
                    f" {question_text}"
                )
                continue

            # Correct answer must be valid.
            if answer not in {"A", "B", "C", "D"}:
                continue

            # Explanation should exist.
            if not explanation:
                continue

            # Reject answer text that appears malformed.
            answer_index = ord(answer) - ord("A")

            if answer_index < 0 or answer_index >= 4:
                continue

            valid_questions.append(
                {
                    "question": question_text,
                    "option_a": options[0],
                    "option_b": options[1],
                    "option_c": options[2],
                    "option_d": options[3],
                    "correct_option": answer,
                    "explanation": explanation,
                }
            )

        return valid_questions

    # ============================================================
    # AI SOURCE VALIDATION
    # ============================================================

    def _validate_questions_against_source(
        self,
        content: str,
        questions: list[dict],
    ) -> list[dict]:

        if not questions:
            return []

        validated_questions: list[dict] = []

        batch_size = 20

        for start in range(
            0,
            len(questions),
            batch_size,
        ):
            batch = questions[
                start:start + batch_size
            ]

            question_text = "\n\n".join(
                (
                    f"QUESTION {index + 1}:\n"
                    f"Question: {question['question']}\n"
                    f"A: {question['option_a']}\n"
                    f"B: {question['option_b']}\n"
                    f"C: {question['option_c']}\n"
                    f"D: {question['option_d']}\n"
                    f"ANSWER: {question['correct_option']}\n"
                    f"EXPLANATION: {question['explanation']}"
                )
                for index, question in enumerate(batch)
            )

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a strict academic fact checker.\n\n"
                            "Validate multiple-choice questions against "
                            "the supplied source material.\n\n"
                            "A question is VALID only if:\n"
                            "1. The question is answerable from the source.\n"
                            "2. The marked answer is supported by the source.\n"
                            "3. The explanation is supported by the source.\n"
                            "4. No option relies on information absent from "
                            "the source in a way that affects correctness.\n"
                            "5. The question does not resolve an unresolved "
                            "source inconsistency.\n"
                            "6. Exactly one option is correct based on the source.\n\n"
                            "Reject questions that:\n"
                            "- introduce outside knowledge\n"
                            "- infer unstated reasons\n"
                            "- contradict the source\n"
                            "- depend on a source inconsistency\n"
                            "- contain ambiguous answers\n"
                            "- contain technically unsupported claims\n\n"
                            "Return ONLY JSON in this form:\n"
                            "{\n"
                            '  "valid": [1, 2, 5],\n'
                            '  "invalid": [3, 4],\n'
                            '  "reasons": {\n'
                            '      "3": "reason",\n'
                            '      "4": "reason"\n'
                            "  }\n"
                            "}"
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"SOURCE MATERIAL:\n\n{content}\n\n"
                            f"QUESTIONS TO VALIDATE:\n\n{question_text}"
                        ),
                    },
                ],
                temperature=0.0,
                max_tokens=3000,
            )

            result = response.choices[0].message.content

            if not result:
                # Fail safe: reject this validation batch rather than
                # silently trusting unvalidated questions.
                continue

            parsed = self._parse_json_response(result)

            if not parsed:
                continue

            valid_indexes = parsed.get(
                "valid",
                [],
            )

            for index in valid_indexes:
                if not isinstance(index, int):
                    continue

                zero_based = index - 1

                if 0 <= zero_based < len(batch):
                    validated_questions.append(
                        batch[zero_based]
                    )

        return validated_questions

    # ============================================================
    # COVERAGE CHECK
    # ============================================================

    def _find_missing_concepts(
        self,
        content: str,
        concepts: list[str],
        questions: list[dict],
    ) -> list[int]:

        if not concepts:
            return []

        question_text = "\n".join(
            question["question"]
            for question in questions
        )

        concept_text = "\n".join(
            f"{index + 1}. {concept}"
            for index, concept in enumerate(concepts)
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an academic question-bank auditor.\n\n"
                        "Determine which concepts have NOT been adequately "
                        "covered by the existing questions.\n\n"
                        "A concept is covered only if at least one question "
                        "meaningfully tests that concept.\n"
                        "Do not require exact wording.\n"
                        "Do not infer coverage from an unrelated question.\n\n"
                        "Return only missing concept numbers using exactly:\n"
                        "MISSING: 2, 5, 9\n\n"
                        "If every concept is adequately covered, return:\n"
                        "MISSING: NONE"
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"CONCEPTS:\n{concept_text}\n\n"
                        f"EXISTING QUESTIONS:\n{question_text}"
                    ),
                },
            ],
            temperature=0.0,
            max_tokens=1000,
        )

        result = response.choices[0].message.content

        if not result:
            return []

        match = re.search(
            r"MISSING:\s*(.+)",
            result.strip(),
            re.IGNORECASE,
        )

        if not match:
            return []

        value = match.group(1).strip()

        if value.upper() == "NONE":
            return []

        missing = []

        for number in re.findall(
            r"\d+",
            value,
        ):
            index = int(number) - 1

            if 0 <= index < len(concepts):
                missing.append(index)

        return sorted(set(missing))

    # ============================================================
    # GENERATE QUESTIONS FOR MISSING CONCEPTS
    # ============================================================

    def _generate_missing_questions(
        self,
        content: str,
        concepts: list[str],
        missing_indexes: list[int],
    ) -> list[dict]:

        missing_concepts = [
            concepts[index]
            for index in missing_indexes
        ]

        concept_text = "\n".join(
            f"{index + 1}. {concept}"
            for index, concept in enumerate(
                missing_concepts
            )
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are completing an academic question bank.\n\n"
                        "Generate additional distinct MCQs only for the "
                        "concepts that were missed.\n\n"
                        "STRICT RULES:\n"
                        "- Use ONLY the source material.\n"
                        "- Do not add outside knowledge.\n"
                        "- Do not resolve contradictions in the source.\n"
                        "- Do not repeat existing concepts unnecessarily.\n"
                        "- Every question must have one unambiguous answer.\n"
                        "- Options must all be unique.\n\n"
                        "Use exactly:\n"
                        "QUESTION: ...\n"
                        "A: ...\n"
                        "B: ...\n"
                        "C: ...\n"
                        "D: ...\n"
                        "ANSWER: A/B/C/D\n"
                        "EXPLANATION: ...\n\n"
                        "Return only question blocks."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"SOURCE MATERIAL:\n{content}\n\n"
                        f"MISSED CONCEPTS:\n{concept_text}"
                    ),
                },
            ],
            temperature=0.1,
            max_tokens=5000,
        )

        result = response.choices[0].message.content

        if not result:
            return []

        return self._parse_questions(
            result.strip()
        )

    # ============================================================
    # QUESTION PARSER
    # ============================================================

    def _parse_questions(
        self,
        text: str,
    ) -> list[dict]:

        questions = []

        blocks = re.split(
            r"(?=QUESTION:\s*)",
            text,
        )

        for block in blocks:

            block = block.strip()

            if not block.startswith("QUESTION:"):
                continue

            lines = [
                line.strip()
                for line in block.splitlines()
                if line.strip()
            ]

            question = ""
            options: dict[str, str] = {}
            answer = ""
            explanation = ""

            for line in lines:

                if line.startswith("QUESTION:"):
                    question = line[
                        len("QUESTION:"):
                    ].strip()

                elif line.startswith("A:"):
                    options["A"] = line[2:].strip()

                elif line.startswith("B:"):
                    options["B"] = line[2:].strip()

                elif line.startswith("C:"):
                    options["C"] = line[2:].strip()

                elif line.startswith("D:"):
                    options["D"] = line[2:].strip()

                elif line.startswith("ANSWER:"):
                    answer = line[
                        len("ANSWER:"):
                    ].strip().upper()

                elif line.startswith("EXPLANATION:"):
                    explanation = line[
                        len("EXPLANATION:"):
                    ].strip()

            if (
                question
                and len(options) == 4
                and answer in {"A", "B", "C", "D"}
                and explanation
            ):
                questions.append(
                    {
                        "question": question,
                        "option_a": options["A"],
                        "option_b": options["B"],
                        "option_c": options["C"],
                        "option_d": options["D"],
                        "correct_option": answer,
                        "explanation": explanation,
                    }
                )

        return questions

    # ============================================================
    # JSON PARSER
    # ============================================================

    def _parse_json_response(
        self,
        text: str,
    ) -> dict | None:

        cleaned = text.strip()

        # Remove markdown code fences if present.
        cleaned = re.sub(
            r"^```(?:json)?\s*",
            "",
            cleaned,
            flags=re.IGNORECASE,
        )

        cleaned = re.sub(
            r"\s*```$",
            "",
            cleaned,
        )

        try:
            parsed = json.loads(cleaned)

            if not isinstance(parsed, dict):
                return None

            return parsed

        except json.JSONDecodeError:
            # Try to recover a JSON object from surrounding text.
            match = re.search(
                r"\{.*\}",
                cleaned,
                flags=re.DOTALL,
            )

            if not match:
                return None

            try:
                parsed = json.loads(
                    match.group(0)
                )

                if not isinstance(parsed, dict):
                    return None

                return parsed

            except json.JSONDecodeError:
                return None

    # ============================================================
    # EXACT + FUZZY QUESTION DEDUPLICATION
    # ============================================================

    def _deduplicate_questions(
        self,
        questions: list[dict],
    ) -> list[dict]:

        unique = []
        seen = set()

        for question in questions:

            normalized = self._normalize_text(
                question["question"]
            )

            if not normalized:
                continue

            if normalized in seen:
                continue

            seen.add(normalized)
            unique.append(question)

        return unique

    # ============================================================
    # SEMANTIC-LIKE DEDUPLICATION
    # ============================================================

    def _semantic_deduplicate_questions(
        self,
        questions: list[dict],
    ) -> list[dict]:

        unique: list[dict] = []

        for question in questions:

            current = self._normalize_text(
                question["question"]
            )

            duplicate = False

            for existing in unique:

                previous = self._normalize_text(
                    existing["question"]
                )

                similarity = SequenceMatcher(
                    None,
                    current,
                    previous,
                ).ratio()

                if similarity >= 0.88:
                    duplicate = True
                    break

                current_tokens = set(
                    current.split()
                )

                previous_tokens = set(
                    previous.split()
                )

                if not current_tokens or not previous_tokens:
                    continue

                intersection = (
                    len(
                        current_tokens
                        & previous_tokens
                    )
                )

                smaller = min(
                    len(current_tokens),
                    len(previous_tokens),
                )

                overlap = (
                    intersection / smaller
                )

                if overlap >= 0.92:
                    duplicate = True
                    break

            if not duplicate:
                unique.append(question)

        return unique

    # ============================================================
    # CONTENT CHUNKING
    # ============================================================

    def _chunk_content(
        self,
        content: str,
        max_chars: int = 9000,
    ) -> list[str]:

        normalized = re.sub(
            r"\r\n?",
            "\n",
            content,
        ).strip()

        if len(normalized) <= max_chars:
            return [normalized]

        paragraphs = [
            paragraph.strip()
            for paragraph in normalized.split("\n\n")
            if paragraph.strip()
        ]

        chunks = []
        current = ""

        for paragraph in paragraphs:

            if len(paragraph) > max_chars:

                if current:
                    chunks.append(current)
                    current = ""

                for start in range(
                    0,
                    len(paragraph),
                    max_chars,
                ):
                    chunks.append(
                        paragraph[
                            start:start + max_chars
                        ]
                    )

                continue

            candidate = (
                paragraph
                if not current
                else f"{current}\n\n{paragraph}"
            )

            if len(candidate) <= max_chars:
                current = candidate
            else:
                if current:
                    chunks.append(current)

                current = paragraph

        if current:
            chunks.append(current)

        return chunks

    # ============================================================
    # HELPERS
    # ============================================================

    def _group_items(
        self,
        items: list[str],
        group_size: int,
    ) -> list[list[str]]:

        return [
            items[start:start + group_size]
            for start in range(
                0,
                len(items),
                group_size,
            )
        ]

    def _deduplicate_strings(
        self,
        values: list[str],
    ) -> list[str]:

        unique = []
        seen = set()

        for value in values:

            normalized = self._normalize_text(
                value
            )

            if not normalized or normalized in seen:
                continue

            seen.add(normalized)
            unique.append(value.strip())

        return unique

    def _normalize_text(
        self,
        value: str,
    ) -> str:

        value = value.strip().lower()

        value = re.sub(
            r"\s+",
            " ",
            value,
        )

        return value