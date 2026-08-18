import random

from sqlalchemy.orm import Session

from app.repositories.mock_test_repository import (
    create_mock_test,
    create_mock_test_question,
    delete_mock_test,
    get_mock_test_by_id,
    get_mock_test_questions_with_details,
    get_user_mock_tests,
)

from app.repositories.question_repository import (
    get_questions_by_material,
)

from app.repositories.subject_repository import (
    get_subject_by_id,
    get_subject_materials,
)

from app.repositories.study_material_repository import (
    get_study_material_by_id,
)

from app.schemas.mock_test import MockTestCreate


# ============================================================
# CREATE MOCK TEST FROM ONE MATERIAL
# ============================================================

def create_test(
    db: Session,
    user_id: int,
    material_id: int,
    test_data: MockTestCreate,
):
    if test_data.question_count <= 0:
        raise ValueError(
            "Question count must be greater than zero"
        )

    material = get_study_material_by_id(
        db=db,
        material_id=material_id,
        user_id=user_id,
    )

    if material is None:
        raise ValueError(
            "Study material not found"
        )

    questions = get_questions_by_material(
        db=db,
        material_id=material_id,
    )

    if len(questions) < test_data.question_count:
        raise ValueError(
            f"Only {len(questions)} questions are available "
            "for this material"
        )

    selected_questions = random.sample(
        questions,
        test_data.question_count,
    )

    mock_test = create_mock_test(
        db=db,
        user_id=user_id,
        material_id=material_id,
        subject_id=None,
        title=test_data.title,
        question_count=test_data.question_count,
    )

    for position, question in enumerate(
        selected_questions,
        start=1,
    ):
        create_mock_test_question(
            db=db,
            mock_test_id=mock_test.id,
            question_id=question.id,
            question_order=position,
        )

    return mock_test


# ============================================================
# CREATE MOCK TEST FROM SUBJECT
# ============================================================

def create_subject_test(
    db: Session,
    user_id: int,
    subject_id: int,
    test_data: MockTestCreate,
):
    if test_data.question_count <= 0:
        raise ValueError(
            "Question count must be greater than zero"
        )

    subject = get_subject_by_id(
        db=db,
        subject_id=subject_id,
        user_id=user_id,
    )

    if subject is None:
        raise ValueError(
            "Subject not found"
        )

    materials = get_subject_materials(
        db=db,
        subject_id=subject_id,
        user_id=user_id,
    )

    if not materials:
        raise ValueError(
            "This subject has no study materials"
        )

    question_pool = []

    for material in materials:
        material_questions = get_questions_by_material(
            db=db,
            material_id=material.id,
        )

        question_pool.extend(
            material_questions
        )

    if not question_pool:
        raise ValueError(
            "No questions are available for this subject. "
            "Generate the question banks for its chapters first."
        )

    if len(question_pool) < test_data.question_count:
        raise ValueError(
            f"Only {len(question_pool)} questions are available "
            f"across this subject, but "
            f"{test_data.question_count} were requested"
        )

    selected_questions = random.sample(
        question_pool,
        test_data.question_count,
    )

    mock_test = create_mock_test(
        db=db,
        user_id=user_id,
        material_id=None,
        subject_id=subject_id,
        title=test_data.title,
        question_count=test_data.question_count,
    )

    for position, question in enumerate(
        selected_questions,
        start=1,
    ):
        create_mock_test_question(
            db=db,
            mock_test_id=mock_test.id,
            question_id=question.id,
            question_order=position,
        )

    return mock_test


# ============================================================
# GET ONE MOCK TEST
# ============================================================

def get_test(
    db: Session,
    mock_test_id: int,
    user_id: int,
):
    mock_test = get_mock_test_by_id(
        db=db,
        mock_test_id=mock_test_id,
        user_id=user_id,
    )

    if mock_test is None:
        raise ValueError(
            "Mock test not found"
        )

    return mock_test


# ============================================================
# LIST USER MOCK TESTS
# ============================================================

def get_tests_for_user(
    db: Session,
    user_id: int,
):
    return get_user_mock_tests(
        db=db,
        user_id=user_id,
    )


# ============================================================
# GET QUESTIONS FOR MOCK TEST
# ============================================================

def get_test_questions(
    db: Session,
    mock_test_id: int,
    user_id: int,
):
    mock_test = get_mock_test_by_id(
        db=db,
        mock_test_id=mock_test_id,
        user_id=user_id,
    )

    if mock_test is None:
        raise ValueError(
            "Mock test not found"
        )

    questions = get_mock_test_questions_with_details(
        db=db,
        mock_test_id=mock_test_id,
    )

    return [
        {
            "question_id": mock_question.question_id,
            "question_order": mock_question.question_order,
            "question": question.question,
            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d,
        }
        for mock_question, question in questions
    ]


# ============================================================
# DELETE MOCK TEST
# ============================================================

def remove_test(
    db: Session,
    mock_test_id: int,
    user_id: int,
):
    mock_test = get_mock_test_by_id(
        db=db,
        mock_test_id=mock_test_id,
        user_id=user_id,
    )

    if mock_test is None:
        raise ValueError(
            "Mock test not found"
        )

    delete_mock_test(
        db=db,
        mock_test=mock_test,
    )