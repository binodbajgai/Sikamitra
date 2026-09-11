from sqlalchemy.orm import Session

from app.models.question import Question


def create_questions(
    db: Session,
    material_id: int,
    questions: list[dict],
) -> list[Question]:
    """
    Create multiple questions in a single database transaction.

    This prevents hundreds of individual commits when generating
    an exhaustive question bank.
    """

    question_objects = [
        Question(
            material_id=material_id,
            question=item["question"],
            option_a=item["option_a"],
            option_b=item["option_b"],
            option_c=item["option_c"],
            option_d=item["option_d"],
            correct_option=item["correct_option"],
            explanation=item.get("explanation"),
        )
        for item in questions
    ]

    db.add_all(question_objects)
    db.commit()

    for question in question_objects:
        db.refresh(question)

    return question_objects


def get_questions_by_material(
    db: Session,
    material_id: int,
) -> list[Question]:
    return (
        db.query(Question)
        .filter(
            Question.material_id == material_id
        )
        .order_by(
            Question.created_at.asc()
        )
        .all()
    )


def get_question_by_id(
    db: Session,
    question_id: int,
) -> Question | None:
    return (
        db.query(Question)
        .filter(
            Question.id == question_id
        )
        .first()
    )


def delete_questions_by_material(
    db: Session,
    material_id: int,
) -> None:
    (
        db.query(Question)
        .filter(
            Question.material_id == material_id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()