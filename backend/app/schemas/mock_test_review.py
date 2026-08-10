from pydantic import BaseModel


class MockTestReviewQuestion(BaseModel):
    question_id: int
    question_order: int

    question: str

    option_a: str
    option_b: str
    option_c: str
    option_d: str

    selected_option: str
    correct_option: str

    is_correct: bool
    explanation: str | None


class MockTestReviewResponse(BaseModel):
    attempt_id: int
    mock_test_id: int

    total_questions: int
    correct_answers: int
    wrong_answers: int
    score: int

    questions: list[MockTestReviewQuestion]