from sqlalchemy.orm import Session

from app.models.question import Question


def create_question(
    db: Session,
    material_id: int,
    question: str,
    option_a: str,
    option_b: str,
    option_c: str,
    option_d: str,
    correct_option: str,
    explanation: str | None = None,
) -> Question:
    new_question = Question(
        material_id=material_id,
        question=question,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        correct_option=correct_option,
        explanation=explanation,
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return new_question


def get_questions_by_material(
    db: Session,
    material_id: int,
) -> list[Question]:
    return (
        db.query(Question)
        .filter(Question.material_id == material_id)
        .order_by(Question.created_at.asc())
        .all()
    )

def get_question_by_id(
    db: Session,
    question_id: int,
) -> Question | None:
    return (
        db.query(Question)
        .filter(Question.id == question_id)
        .first()
    )