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
                        "You are a study assistant. "
                        "Create a concise and accurate summary "
                        "of the provided study material."
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
                        "You are a study assistant. "
                        "Extract the most important points from "
                        "the study material. Return each point "
                        "on a separate line."
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

        text = response.choices[0].message.content.strip()

        return [
            line.strip("-• ").strip()
            for line in text.splitlines()
            if line.strip()
        ]

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