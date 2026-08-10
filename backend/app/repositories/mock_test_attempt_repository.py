from sqlalchemy.orm import Session

from app.models.mock_test_attempt import MockTestAttempt


def create_attempt(
    db: Session,
    mock_test_id: int,
    user_id: int,
    total_questions: int,
) -> MockTestAttempt:
    attempt = MockTestAttempt(
        mock_test_id=mock_test_id,
        user_id=user_id,
        total_questions=total_questions,
    )

    db.add(attempt)
    db.flush()
    db.refresh(attempt)
    
    return attempt


def get_attempt_by_id(
    db: Session,
    attempt_id: int,
    user_id: int,
) -> MockTestAttempt | None:
    return (
        db.query(MockTestAttempt)
        .filter(
            MockTestAttempt.id == attempt_id,
            MockTestAttempt.user_id == user_id,
        )
        .first()
    )


def get_attempts_by_mock_test(
    db: Session,
    mock_test_id: int,
    user_id: int,
) -> list[MockTestAttempt]:
    return (
        db.query(MockTestAttempt)
        .filter(
            MockTestAttempt.mock_test_id == mock_test_id,
            MockTestAttempt.user_id == user_id,
        )
        .order_by(MockTestAttempt.started_at.desc())
        .all()
    )


def update_attempt_result(
    db: Session,
    attempt: MockTestAttempt,
    correct_answers: int,
    wrong_answers: int,
    score: int,
) -> MockTestAttempt:
    attempt.correct_answers = correct_answers
    attempt.wrong_answers = wrong_answers
    attempt.score = score

    db.flush()

    return attempt