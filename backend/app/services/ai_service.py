from sqlalchemy.orm import Session

from app.ai.nvidia_provider import NVIDIAProvider

from app.repositories.generated_summary_repository import (
    create_summary,
    get_summaries_by_material,
)

from app.repositories.important_point_repository import (
    create_important_point,
    get_important_points_by_material,
    delete_important_points_by_material,
)

from app.repositories.question_repository import (
    create_question,
    get_questions_by_material,
    delete_questions_by_material,
)


provider = NVIDIAProvider()


def generate_summary(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    existing = get_summaries_by_material(
        db=db,
        material_id=material_id,
    )

    if existing:
        return existing[0]

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

    existing = get_important_points_by_material(
        db=db,
        material_id=material_id,
    )

    if existing:
        return existing

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

    existing = get_questions_by_material(
        db=db,
        material_id=material_id,
    )

    if existing:
        return existing

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



def regenerate_summary(
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


def regenerate_important_points(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    # Generate the new points first.
    points = provider.generate_important_points(content)

    if not points:
        raise ValueError(
            "AI did not generate any important points"
        )

    # Delete the old points only after successful AI generation.
    delete_important_points_by_material(
        db=db,
        material_id=material_id,
    )

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


def regenerate_questions(
    db: Session,
    material_id: int,
    content: str,
):
    if not content.strip():
        raise ValueError("Material has no content")

    questions = provider.generate_questions(content)

    if not questions:
        raise ValueError(
            "AI did not generate any questions"
        )

    # Remove the old question bank only after
    # successful generation.
    delete_questions_by_material(
        db=db,
        material_id=material_id,
    )

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

def get_summaries(
    db: Session,
    material_id: int,
):
    return get_summaries_by_material(
        db=db,
        material_id=material_id,
    )


def get_important_points(
    db: Session,
    material_id: int,
):
    return get_important_points_by_material(
        db=db,
        material_id=material_id,
    )


def get_questions(
    db: Session,
    material_id: int,
):
    return get_questions_by_material(
        db=db,
        material_id=material_id,
    )