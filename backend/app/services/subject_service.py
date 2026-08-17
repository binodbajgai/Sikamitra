from sqlalchemy.orm import Session

from app.repositories.subject_repository import (
    create_subject,
    delete_subject,
    get_subject_by_id,
    get_subject_materials,
    get_user_subjects,
)
from app.schemas.subject import SubjectCreate


def create_user_subject(
    db: Session,
    user_id: int,
    subject_data: SubjectCreate,
):
    return create_subject(
        db=db,
        user_id=user_id,
        name=subject_data.name,
        description=subject_data.description,
    )


def get_subject(
    db: Session,
    subject_id: int,
    user_id: int,
):
    return get_subject_by_id(
        db=db,
        subject_id=subject_id,
        user_id=user_id,
    )


def get_subjects_for_user(
    db: Session,
    user_id: int,
):
    return get_user_subjects(
        db=db,
        user_id=user_id,
    )


def get_materials_for_subject(
    db: Session,
    subject_id: int,
    user_id: int,
):
    subject = get_subject_by_id(
        db=db,
        subject_id=subject_id,
        user_id=user_id,
    )

    if subject is None:
        raise ValueError("Subject not found")

    return get_subject_materials(
        db=db,
        subject_id=subject_id,
        user_id=user_id,
    )


def remove_subject(
    db: Session,
    subject_id: int,
    user_id: int,
):
    subject = get_subject_by_id(
        db=db,
        subject_id=subject_id,
        user_id=user_id,
    )

    if subject is None:
        raise ValueError("Subject not found")

    delete_subject(db, subject)