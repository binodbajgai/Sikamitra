from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StudyMaterialCreate(BaseModel):
    title: str
    source_type: str
    subject_id: int | None = None
    content: str | None = None
    file_name: str | None = None


class StudyMaterialResponse(BaseModel):
    id: int
    user_id: int
    subject_id: int | None
    title: str
    source_type: str
    file_name: str | None
    content: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)