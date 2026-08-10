from pydantic import BaseModel


class MockTestQuestionResponse(BaseModel):
    question_id: int
    question_order: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str