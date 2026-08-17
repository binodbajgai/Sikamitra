from sqlalchemy.orm import Session

from app.repositories.subject_repository import (
    create_subject,
    delete_subject,
    get_subject_by_id,
    get_subjects_by_user,
)


def create_new_subject(
    db: Session,
    user_id: int,
    name: str,
    description: str | None = None,
):
    name = name.strip()

    if not name:
        raise ValueError("Subject name is required")

    if len(name) > 150:
        raise ValueError(
            "Subject name cannot exceed 150 characters"
        )

    if description:
        description = description.strip()

        if len(description) > 500:
            raise ValueError(
                "Subject description cannot exceed 500 characters"
            )

    return create_subject(
        db=db,
        user_id=user_id,
        name=name,
        description=description,
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


def get_user_subjects(
    db: Session,
    user_id: int,
):
    return get_subjects_by_user(
        db=db,
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

    delete_subject(
        db=db,
        subject=subject,
    )