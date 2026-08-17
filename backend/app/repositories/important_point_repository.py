from sqlalchemy.orm import Session

from app.models.important_point import ImportantPoint


def create_important_point(
    db: Session,
    material_id: int,
    point: str,
    position: int,
) -> ImportantPoint:
    important_point = ImportantPoint(
        material_id=material_id,
        point=point,
        position=position,
    )

    db.add(important_point)
    db.commit()
    db.refresh(important_point)

    return important_point


def get_important_points_by_material(
    db: Session,
    material_id: int,
) -> list[ImportantPoint]:
    return (
        db.query(ImportantPoint)
        .filter(ImportantPoint.material_id == material_id)
        .order_by(ImportantPoint.position.asc())
        .all()
    )


def delete_important_points_by_material(
    db: Session,
    material_id: int,
) -> None:
    (
        db.query(ImportantPoint)
        .filter(ImportantPoint.material_id == material_id)
        .delete(synchronize_session=False)
    )

    db.commit()