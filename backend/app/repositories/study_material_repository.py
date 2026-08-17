from sqlalchemy.orm import Session

from app.models.study_material import StudyMaterial


def create_study_material(
    db: Session,
    user_id: int,
    title: str,
    source_type: str,
    subject_id: int | None = None,
    content: str | None = None,
    file_name: str | None = None,
) -> StudyMaterial:
    material = StudyMaterial(
        user_id=user_id,
        subject_id=subject_id,
        title=title,
        source_type=source_type,
        content=content,
        file_name=file_name,
    )

    db.add(material)
    db.commit()
    db.refresh(material)

    return material


def get_study_material_by_id(
    db: Session,
    material_id: int,
    user_id: int,
) -> StudyMaterial | None:
    return (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id == user_id,
        )
        .first()
    )


def get_user_study_materials(
    db: Session,
    user_id: int,
) -> list[StudyMaterial]:
    return (
        db.query(StudyMaterial)
        .filter(StudyMaterial.user_id == user_id)
        .order_by(StudyMaterial.created_at.desc())
        .all()
    )


def delete_study_material(
    db: Session,
    material: StudyMaterial,
) -> None:
    db.delete(material)
    db.commit()