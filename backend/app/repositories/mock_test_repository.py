from sqlalchemy.orm import Session

from app.models.mock_test import MockTest
from app.models.mock_test_question import MockTestQuestion
from app.models.question import Question


def create_mock_test(
    db: Session,
    user_id: int,
    material_id: int,
    title: str,
    question_count: int,
) -> MockTest:
    mock_test = MockTest(
        user_id=user_id,
        material_id=material_id,
        title=title,
        question_count=question_count,
    )

    db.add(mock_test)
    db.commit()
    db.refresh(mock_test)

    return mock_test


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


def get_user_mock_tests(
    db: Session,
    user_id: int,
) -> list[MockTest]:
    return (
        db.query(MockTest)
        .filter(MockTest.user_id == user_id)
        .order_by(MockTest.created_at.desc())
        .all()
    )


def get_mock_test_questions(
    db: Session,
    mock_test_id: int,
) -> list[MockTestQuestion]:
    return (
        db.query(MockTestQuestion)
        .filter(MockTestQuestion.mock_test_id == mock_test_id)
        .order_by(MockTestQuestion.question_order.asc())
        .all()
    )

def get_mock_test_questions_with_details(
    db: Session,
    mock_test_id: int,
) -> list[tuple[MockTestQuestion, Question]]:
    return (
        db.query(MockTestQuestion, Question)
        .join(
            Question,
            MockTestQuestion.question_id == Question.id,
        )
        .filter(
            MockTestQuestion.mock_test_id == mock_test_id
        )
        .order_by(
            MockTestQuestion.question_order.asc()
        )
        .all()
    )


def delete_mock_test(
    db: Session,
    mock_test: MockTest,
) -> None:
    db.delete(mock_test)
    db.commit()