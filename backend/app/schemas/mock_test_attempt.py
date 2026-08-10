from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MockTestAnswerCreate(BaseModel):
    question_id: int
    selected_option: str = Field(
        min_length=1,
        max_length=1,
        pattern=r"^[ABCDabcd]$",
    )    


class MockTestAttemptCreate(BaseModel):
    answers: list[MockTestAnswerCreate]


class MockTestAttemptResponse(BaseModel):
    id: int
    mock_test_id: int
    user_id: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    score: int
    started_at: datetime
    submitted_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class MockTestAnswerResponse(BaseModel):
    id: int
    attempt_id: int
    question_id: int
    selected_option: str
    is_correct: bool
    answered_at: datetime

    model_config = ConfigDict(from_attributes=True)