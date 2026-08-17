from sqlalchemy.orm import Session

from app.models.subject import Subject


def create_subject(
    db: Session,
    user_id: int,
    name: str,
    description: str | None = None,
) -> Subject:
    subject = Subject(
        user_id=user_id,
        name=name,
        description=description,
    )

    db.add(subject)
    db.commit()
    db.refresh(subject)

    return subject


def get_subject_by_id(
    db: Session,
    subject_id: int,
    user_id: int,
) -> Subject | None:
    return (
        db.query(Subject)
        .filter(
            Subject.id == subject_id,
            Subject.user_id == user_id,
        )
        .first()
    )


def get_subjects_by_user(
    db: Session,
    user_id: int,
) -> list[Subject]:
    return (
        db.query(Subject)
        .filter(
            Subject.user_id == user_id,
        )
        .order_by(Subject.created_at.desc())
        .all()
    )


def delete_subject(
    db: Session,
    subject: Subject,
) -> None:
    db.delete(subject)
    db.commit()