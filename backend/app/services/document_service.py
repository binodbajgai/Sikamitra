from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.repositories.study_material_repository import create_study_material
from app.utils.document_parser import extract_text


async def process_uploaded_document(
    db: Session,
    user_id: int,
    file: UploadFile,
):
    if not file.filename:
        raise ValueError("File name is required")

    extracted_text = await extract_text(file)

    extension = "." + file.filename.rsplit(".", 1)[-1].lower()

    source_type = extension.lstrip(".")

    title = file.filename.rsplit(".", 1)[0]

    return create_study_material(
        db=db,
        user_id=user_id,
        title=title,
        source_type=source_type,
        content=extracted_text,
        file_name=file.filename,
    )