from pydantic import BaseModel


class MockTestAnswerReviewResponse(BaseModel):
    question_id: int
    question: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    selected_option: str
    correct_option: str
    is_correct: bool

    explanation: str | None