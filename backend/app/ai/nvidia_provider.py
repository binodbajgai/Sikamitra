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
                        "- Focus only on the main concepts and ideas.\n"
                        "- Explain the material clearly for a university student.\n"
                        "- Do not reproduce the source material line by line.\n"
                        "- Do not include large code blocks.\n"
                        "- Do not create a giant reference table.\n"
                        "- Do not list every example or syntax detail.\n"
                        "- Use short paragraphs and simple headings when useful.\n"
                        "- Focus on what a student should understand and remember.\n"
                        "- Avoid unnecessary repetition.\n"
                        "- Keep the summary focused and concise.\n"
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

        return response.choices[0].message.content.strip()

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
                        "You are an expert university study assistant. "
                        "Extract the most important concepts from the provided "
                        "study material.\n\n"

                        "Return exactly 8 to 15 important points.\n"
                        "Each point must represent ONE meaningful concept "
                        "that a student should remember.\n\n"

                        "Rules:\n"
                        "- Do not copy the material line by line.\n"
                        "- Do not include source text headings as points.\n"
                        "- Do not include individual lines of code.\n"
                        "- Do not include Markdown code fences.\n"
                        "- Do not include SQL queries as separate points.\n"
                        "- Do not split one example across multiple points.\n"
                        "- Combine related information into one meaningful point.\n"
                        "- Each point should normally be 1-2 sentences.\n"
                        "- Focus on concepts, definitions, rules, differences, "
                        "and important facts.\n"
                        "- Prioritize information useful for exams and revision.\n"
                        "- Do not include trivial details.\n"
                        "- Return only the points, one complete point per line.\n"
                        "- Number the points 1., 2., 3., etc."
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

        text = response.choices[0].message.content.strip()

        points = []

        for line in text.splitlines():
            line = line.strip()

            if not line:
                continue

            # Remove numbering such as:
            # 1.
            # 2)
            # 10.
            line = re.sub(
                r"^\s*\d+[\.\)]\s*",
                "",
                line,
            ).strip()

            # Remove bullet characters if the model adds them.
            line = re.sub(
                r"^[-•*]\s*",
                "",
                line,
            ).strip()

            if line:
                points.append(line)

        return points

    def generate_questions(
        self,
        content: str,
    ) -> list[dict]:

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a university study assistant. "
                        "Generate multiple-choice questions from "
                        "the provided study material. "
                        "Return each question in exactly this format:\n"
                        "QUESTION: ...\n"
                        "A: ...\n"
                        "B: ...\n"
                        "C: ...\n"
                        "D: ...\n"
                        "ANSWER: A/B/C/D\n"
                        "EXPLANATION: ..."
                    ),
                },
                {
                    "role": "user",
                    "content": content,
                },
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        text = response.choices[0].message.content.strip()

        print("AI QUESTION RESPONSE:")
        print(text)

        return self._parse_questions(text)

    def _parse_questions(self, text: str) -> list[dict]:
        questions = []

        blocks = text.split("QUESTION:")

        for block in blocks[1:]:
            lines = [
                line.strip()
                for line in block.splitlines()
                if line.strip()
            ]

            question = lines[0] if lines else ""

            options = {}

            for line in lines:
                if line.startswith("A:"):
                    options["A"] = line[2:].strip()

                elif line.startswith("B:"):
                    options["B"] = line[2:].strip()

                elif line.startswith("C:"):
                    options["C"] = line[2:].strip()

                elif line.startswith("D:"):
                    options["D"] = line[2:].strip()

            answer = next(
                (
                    line.split(":", 1)[1].strip()
                    for line in lines
                    if line.startswith("ANSWER:")
                ),
                "",
            )

            explanation = next(
                (
                    line.split(":", 1)[1].strip()
                    for line in lines
                    if line.startswith("EXPLANATION:")
                ),
                "",
            )

            if question and len(options) == 4 and answer:
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