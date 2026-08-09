from abc import ABC, abstractmethod


class AIProvider(ABC):

    @abstractmethod
    def generate_summary(self, content: str) -> str:
        pass

    @abstractmethod
    def generate_important_points(self, content: str) -> list[str]:
        pass

    @abstractmethod
    def generate_questions(self, content: str) -> list[dict]:
        pass