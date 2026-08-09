from sqlalchemy.orm import Session

from app.repositories.generated_summary_repository import create_summary
from app.repositories.important_point_repository import create_important_point
from app.repositories.question_repository import create_question


def generate_summary(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    summary_text = content[:1000]

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

    sentences = [
        sentence.strip()
        for sentence in content.replace("\n", " ").split(".")
        if sentence.strip()
    ]

    points = []

    for position, sentence in enumerate(sentences[:5], start=1):
        points.append(
            create_important_point(
                db=db,
                material_id=material_id,
                point=sentence,
                position=position,
            )
        )

    return points


def generate_questions(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    question = create_question(
        db=db,
        material_id=material_id,
        question="What is the main topic of this study material?",
        option_a="The content provided in the material",
        option_b="Database administration",
        option_c="Network security",
        option_d="Operating system design",
        correct_option="A",
        explanation="This is a temporary test question. The real AI generator will replace it.",
    )

    return [question]