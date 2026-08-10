from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.mock_test_attempt import (
    MockTestAnswerCreate,
    MockTestAnswerResponse,
    MockTestAttemptCreate,
    MockTestAttemptResponse,
)
from app.services.mock_test_attempt_service import (
    get_attempt,
    get_attempt_answers,
    start_attempt,
    submit_attempt,
)

from app.services.mock_test_attempt_service import (
    get_attempt,
    get_attempt_answers,
    get_attempt_history,
    start_attempt,
    submit_attempt,
)

router = APIRouter(
    tags=["Mock Test Attempts"],
)


@router.post(
    "/mock-tests/{mock_test_id}/attempts",
    response_model=MockTestAttemptResponse,
    status_code=status.HTTP_201_CREATED,
)
def start_mock_test_attempt(
    mock_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return start_attempt(
            db=db,
            mock_test_id=mock_test_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/mock-test-attempts/{attempt_id}",
    response_model=MockTestAttemptResponse,
)
def get_mock_test_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_attempt(
            db=db,
            attempt_id=attempt_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post(
    "/mock-test-attempts/{attempt_id}/submit",
    response_model=MockTestAttemptResponse,
)
def submit_mock_test_attempt(
    attempt_id: int,
    attempt_data: MockTestAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return submit_attempt(
            db=db,
            attempt_id=attempt_id,
            user_id=current_user.id,
            answers=[
                answer.model_dump()
                for answer in attempt_data.answers
            ],
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/mock-test-attempts/{attempt_id}/answers",
    response_model=list[MockTestAnswerResponse],
)
def get_mock_test_attempt_answers(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_attempt_answers(
            db=db,
            attempt_id=attempt_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.get(
    "/mock-tests/{mock_test_id}/attempts",
    response_model=list[MockTestAttemptResponse],
)
def get_mock_test_attempt_history(
    mock_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_attempt_history(
        db=db,
        mock_test_id=mock_test_id,
        user_id=current_user.id,
    )