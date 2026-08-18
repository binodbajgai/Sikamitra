from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MockTestCreate(BaseModel):
    title: str
    question_count: int


class MockTestResponse(BaseModel):
    id: int
    user_id: int
    material_id: int | None
    subject_id: int | None
    title: str
    question_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MockTestQuestionResponse(BaseModel):
    id: int
    mock_test_id: int
    question_id: int
    question_order: int

    model_config = ConfigDict(from_attributes=True)