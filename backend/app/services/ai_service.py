from sqlalchemy.orm import Session

from app.ai.nvidia_provider import NVIDIAProvider
from app.repositories.generated_summary_repository import create_summary
from app.repositories.important_point_repository import create_important_point
from app.repositories.question_repository import create_question


provider = NVIDIAProvider()


def generate_summary(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    summary_text = provider.generate_summary(content)

    return create_summary(
        db=db,
        material_id=material_id,
        summary=summary_text,
    )


def generate_important_points(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    points = provider.generate_important_points(content)

    created_points = []

    for position, point in enumerate(points, start=1):
        created_points.append(
            create_important_point(
                db=db,
                material_id=material_id,
                point=point,
                position=position,
            )
        )

    return created_points


def generate_questions(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    questions = provider.generate_questions(content)

    created_questions = []

    for question in questions:
        created_questions.append(
            create_question(
                db=db,
                material_id=material_id,
                question=question["question"],
                option_a=question["option_a"],
                option_b=question["option_b"],
                option_c=question["option_c"],
                option_d=question["option_d"],
                correct_option=question["correct_option"],
                explanation=question["explanation"],
            )
        )

    return created_questions