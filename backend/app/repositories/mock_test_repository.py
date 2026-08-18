from sqlalchemy.orm import Session

from app.models.mock_test import MockTest
from app.models.mock_test_question import MockTestQuestion
from app.models.question import Question


# ============================================================
# CREATE MOCK TEST
# ============================================================

def create_mock_test(
    db: Session,
    user_id: int,
    title: str,
    question_count: int,
    material_id: int | None = None,
    subject_id: int | None = None,
) -> MockTest:
    mock_test = MockTest(
        user_id=user_id,
        material_id=material_id,
        subject_id=subject_id,
        title=title,
        question_count=question_count,
    )

    db.add(mock_test)
    db.commit()
    db.refresh(mock_test)

    return mock_test


# ============================================================
# ADD QUESTION TO MOCK TEST
# ============================================================

def create_mock_test_question(
    db: Session,
    mock_test_id: int,
    question_id: int,
    question_order: int,
) -> MockTestQuestion:
    mock_test_question = MockTestQuestion(
        mock_test_id=mock_test_id,
        question_id=question_id,
        question_order=question_order,
    )

    db.add(mock_test_question)
    db.commit()
    db.refresh(mock_test_question)

    return mock_test_question


# ============================================================
# GET MOCK TEST BY ID
# ============================================================

def get_mock_test_by_id(
    db: Session,
    mock_test_id: int,
    user_id: int,
) -> MockTest | None:
    return (
        db.query(MockTest)
        .filter(
            MockTest.id == mock_test_id,
            MockTest.user_id == user_id,
        )
        .first()
    )


# ============================================================
# GET ALL MOCK TESTS FOR USER
# ============================================================

def get_user_mock_tests(
    db: Session,
    user_id: int,
) -> list[MockTest]:
    return (
        db.query(MockTest)
        .filter(
            MockTest.user_id == user_id,
        )
        .order_by(MockTest.created_at.desc())
        .all()
    )


# ============================================================
# GET MOCK TEST QUESTIONS
# ============================================================

def get_mock_test_questions(
    db: Session,
    mock_test_id: int,
) -> list[MockTestQuestion]:
    return (
        db.query(MockTestQuestion)
        .filter(
            MockTestQuestion.mock_test_id == mock_test_id,
        )
        .order_by(
            MockTestQuestion.question_order.asc()
        )
        .all()
    )


# ============================================================
# GET MOCK TEST QUESTIONS WITH QUESTION DETAILS
# ============================================================

def get_mock_test_questions_with_details(
    db: Session,
    mock_test_id: int,
) -> list[tuple[MockTestQuestion, Question]]:
    return (
        db.query(
            MockTestQuestion,
            Question,
        )
        .join(
            Question,
            Question.id == MockTestQuestion.question_id,
        )
        .filter(
            MockTestQuestion.mock_test_id == mock_test_id,
        )
        .order_by(
            MockTestQuestion.question_order.asc()
        )
        .all()
    )


# ============================================================
# DELETE MOCK TEST
# ============================================================

def delete_mock_test(
    db: Session,
    mock_test: MockTest,
) -> None:
    db.delete(mock_test)
    db.commit()