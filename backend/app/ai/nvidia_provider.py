import re

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
                        "- Focus on the main concepts and ideas.\n"
                        "- Explain the material clearly for a university student.\n"
                        "- Do not reproduce the source line by line.\n"
                        "- Do not include large code blocks.\n"
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
            temperature=0.3,
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
            temperature=0.2,
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

        return points

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

                questions.extend(additional_questions)

            all_questions.extend(questions)

        all_questions = self._deduplicate_questions(
            all_questions
        )

        if not all_questions:
            raise ValueError(
                "AI did not generate any valid questions"
            )

        print(
            f"Final question bank contains "
            f"{len(all_questions)} unique questions."
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
                        "- code/query behavior when relevant\n"
                        "- cause and effect relationships\n\n"
                        "Do not invent anything that is absent from the source.\n"
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
            temperature=0.1,
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
    # GENERATE QUESTIONS FROM ALL CONCEPTS
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

                            "Generate an exhaustive set of distinct MCQs "
                            "for EVERY concept provided.\n\n"

                            "Every concept MUST be tested.\n"
                            "Prefer multiple distinct questions for concepts "
                            "that contain multiple testable facts.\n\n"

                            "Use varied question types:\n"
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
                            "- calculation/problem solving when applicable\n"
                            "- code/query interpretation when applicable\n\n"

                            "Do not create trivial rewordings of the same "
                            "question.\n"
                            "Do not invent information.\n"
                            "Questions must be answerable from the source.\n"
                            "Use a mixture of easy, medium, and difficult "
                            "questions.\n\n"

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
                temperature=0.25,
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
                        "Do not require exact wording.\n\n"
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
    # GENERATE QUESTIONS FOR MISSED CONCEPTS
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
                        "The following concepts were missed by the first "
                        "question-generation pass.\n\n"
                        "Generate additional distinct MCQs that specifically "
                        "cover these concepts.\n\n"
                        "Do not repeat existing questions.\n"
                        "Do not invent information.\n\n"
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
            temperature=0.2,
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

            normalized = re.sub(
                r"\s+",
                " ",
                value.strip().lower(),
            )

            if not normalized or normalized in seen:
                continue

            seen.add(normalized)
            unique.append(value.strip())

        return unique

    def _deduplicate_questions(
        self,
        questions: list[dict],
    ) -> list[dict]:

        unique = []
        seen = set()

        for question in questions:

            normalized = re.sub(
                r"\s+",
                " ",
                question["question"].strip().lower(),
            )

            if not normalized:
                continue

            if normalized in seen:
                continue

            seen.add(normalized)
            unique.append(question)

        return unique