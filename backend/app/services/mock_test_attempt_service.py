from datetime import datetime

from sqlalchemy.orm import Session

from app.models.question import Question

from app.repositories.mock_test_answer_repository import (
    create_answer,
    get_answers_by_attempt,
)
from app.repositories.mock_test_repository import (
    get_mock_test_by_id,
    get_mock_test_questions,
)

from app.repositories.mock_test_attempt_repository import (
    create_attempt,
    get_attempt_by_id,
    get_attempts_by_mock_test,
    update_attempt_result,
)


def start_attempt(
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
        raise ValueError("Mock test not found")

    questions = get_mock_test_questions(
        db=db,
        mock_test_id=mock_test_id,
    )

    if not questions:
        raise ValueError("Mock test has no questions")

    attempt = create_attempt(
        db=db,
        mock_test_id=mock_test_id,
        user_id=user_id,
        total_questions=len(questions),
    )

    db.commit()

    return attempt


def get_attempt(
    db: Session,
    attempt_id: int,
    user_id: int,
):
    attempt = get_attempt_by_id(
        db=db,
        attempt_id=attempt_id,
        user_id=user_id,
    )

    if attempt is None:
        raise ValueError("Mock test attempt not found")

    return attempt


def submit_attempt(
    db: Session,
    attempt_id: int,
    user_id: int,
    answers: list[dict],
):
    attempt = get_attempt_by_id(
        db=db,
        attempt_id=attempt_id,
        user_id=user_id,
    )

    if attempt is None:
        raise ValueError("Mock test attempt not found")

    if attempt.submitted_at is not None:
        raise ValueError("Mock test attempt has already been submitted")

    mock_test_questions = get_mock_test_questions(
        db=db,
        mock_test_id=attempt.mock_test_id,
    )

    allowed_question_ids = {
        item.question_id
        for item in mock_test_questions
    }

    if not answers:
        raise ValueError("No answers submitted")

    submitted_question_ids = set()

    correct_answers = 0
    wrong_answers = 0

    try:
        for answer in answers:
            question_id = answer["question_id"]

            if question_id not in allowed_question_ids:
                raise ValueError(
                    f"Question {question_id} does not belong to this mock test"
                )

            if question_id in submitted_question_ids:
                raise ValueError(
                    f"Question {question_id} was answered more than once"
                )

            submitted_question_ids.add(question_id)

            question = db.get(Question, question_id)

            if question is None:
                raise ValueError(
                    f"Question {question_id} not found"
                )

            selected_option = answer["selected_option"].upper()

            if selected_option not in {"A", "B", "C", "D"}:
                raise ValueError(
                    f"Invalid option '{selected_option}'"
                )

            is_correct = (
                selected_option == question.correct_option.upper()
            )

            if is_correct:
                correct_answers += 1
            else:
                wrong_answers += 1

            create_answer(
                db=db,
                attempt_id=attempt.id,
                question_id=question_id,
                selected_option=selected_option,
                is_correct=is_correct,
            )

        if submitted_question_ids != allowed_question_ids:
            unanswered = allowed_question_ids - submitted_question_ids

            raise ValueError(
                f"Please answer all questions. "
                f"Unanswered questions: {len(unanswered)}"
            )

        score = round(
            (correct_answers / attempt.total_questions) * 100
        )

        attempt.submitted_at = datetime.utcnow()

        result = update_attempt_result(
            db=db,
            attempt=attempt,
            correct_answers=correct_answers,
            wrong_answers=wrong_answers,
            score=score,
        )

        db.commit()

        return result

    except Exception:
        db.rollback()
        raise


def get_attempt_answers(
    db: Session,
    attempt_id: int,
    user_id: int,
):
    attempt = get_attempt_by_id(
        db=db,
        attempt_id=attempt_id,
        user_id=user_id,
    )

    if attempt is None:
        raise ValueError("Mock test attempt not found")

    return get_answers_by_attempt(
        db=db,
        attempt_id=attempt_id,
    )


def get_attempt_history(
    db: Session,
    mock_test_id: int,
    user_id: int,
):
    attempts = get_attempts_by_mock_test(
        db=db,
        mock_test_id=mock_test_id,
        user_id=user_id,
    )

    return attempts


def get_attempt_review(
    db: Session,
    attempt_id: int,
    user_id: int,
):
    attempt = get_attempt_by_id(
        db=db,
        attempt_id=attempt_id,
        user_id=user_id,
    )

    if attempt is None:
        raise ValueError("Mock test attempt not found")

    if attempt.submitted_at is None:
        raise ValueError(
            "Mock test attempt has not been submitted"
        )

    mock_test_questions = get_mock_test_questions(
        db=db,
        mock_test_id=attempt.mock_test_id,
    )

    answers = get_answers_by_attempt(
        db=db,
        attempt_id=attempt.id,
    )

    answers_by_question_id = {
        answer.question_id: answer
        for answer in answers
    }

    review_questions = []

    for item in mock_test_questions:
        question = db.get(
            Question,
            item.question_id,
        )

        if question is None:
            continue

        answer = answers_by_question_id.get(
            question.id
        )

        if answer is None:
            continue

        review_questions.append(
            {
                "question_id": question.id,
                "question_order": item.question_order,
                "question": question.question,
                "option_a": question.option_a,
                "option_b": question.option_b,
                "option_c": question.option_c,
                "option_d": question.option_d,
                "selected_option": answer.selected_option,
                "correct_option": question.correct_option,
                "is_correct": answer.is_correct,
                "explanation": question.explanation,
            }
        )

    return {
        "attempt_id": attempt.id,
        "mock_test_id": attempt.mock_test_id,
        "total_questions": attempt.total_questions,
        "correct_answers": attempt.correct_answers,
        "wrong_answers": attempt.wrong_answers,
        "score": attempt.score,
        "questions": review_questions,
    }