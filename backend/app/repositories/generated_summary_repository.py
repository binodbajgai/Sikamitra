from sqlalchemy.orm import Session

from app.models.generated_summary import GeneratedSummary


def create_summary(
    db: Session,
    material_id: int,
    summary: str,
) -> GeneratedSummary:
    generated_summary = GeneratedSummary(
        material_id=material_id,
        summary=summary,
    )

    db.add(generated_summary)
    db.commit()
    db.refresh(generated_summary)

    return generated_summary


def get_summaries_by_material(
    db: Session,
    material_id: int,
) -> list[GeneratedSummary]:
    return (
        db.query(GeneratedSummary)
        .filter(GeneratedSummary.material_id == material_id)
        .order_by(GeneratedSummary.created_at.desc())
        .all()
    )