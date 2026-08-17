from sqlalchemy.orm import Session

from app.repositories.study_material_repository import (
    create_study_material,
    delete_study_material,
    get_study_material_by_id,
    get_user_study_materials,
)
from app.schemas.study_material import StudyMaterialCreate


def create_material(
    db: Session,
    user_id: int,
    material_data: StudyMaterialCreate,
):
    return create_study_material(
        db=db,
        user_id=user_id,
        subject_id=material_data.subject_id,
        title=material_data.title,
        source_type=material_data.source_type,
        content=material_data.content,
        file_name=material_data.file_name,
    )


def get_material(
    db: Session,
    material_id: int,
    user_id: int,
):
    return get_study_material_by_id(
        db=db,
        material_id=material_id,
        user_id=user_id,
    )


def get_materials_for_user(
    db: Session,
    user_id: int,
):
    return get_user_study_materials(
        db=db,
        user_id=user_id,
    )


def remove_material(
    db: Session,
    material_id: int,
    user_id: int,
):
    material = get_study_material_by_id(
        db=db,
        material_id=material_id,
        user_id=user_id,
    )

    if material is None:
        raise ValueError("Study material not found")

    delete_study_material(db, material)