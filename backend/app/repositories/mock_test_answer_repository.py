from sqlalchemy.orm import Session

from app.models.mock_test_answer import MockTestAnswer


def create_answer(
    db: Session,
    attempt_id: int,
    question_id: int,
    selected_option: str,
    is_correct: bool,
) -> MockTestAnswer:
    answer = MockTestAnswer(
        attempt_id=attempt_id,
        question_id=question_id,
        selected_option=selected_option,
        is_correct=is_correct,
    )

    db.add(answer)
    db.flush()

    return answer


def get_answers_by_attempt(
    db: Session,
    attempt_id: int,
) -> list[MockTestAnswer]:
    return (
        db.query(MockTestAnswer)
        .filter(MockTestAnswer.attempt_id == attempt_id)
        .order_by(MockTestAnswer.id.asc())
        .all()
    )