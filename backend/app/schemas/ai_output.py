from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SummaryResponse(BaseModel):
    id: int
    material_id: int
    summary: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ImportantPointResponse(BaseModel):
    id: int
    material_id: int
    point: str
    position: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionResponse(BaseModel):
    id: int
    material_id: int
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)