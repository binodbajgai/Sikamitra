from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.mock_test import (
    MockTestCreate,
    MockTestResponse,
)
from app.schemas.mock_test_question import MockTestQuestionResponse
from app.services.mock_test_service import (
    create_test,
    create_subject_test,
    get_test,
    get_test_questions,
    get_tests_for_user,
    remove_test,
)

router = APIRouter(
    prefix="/mock-tests",
    tags=["Mock Tests"],
)


@router.post(
    "/materials/{material_id}",
    response_model=MockTestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_mock_test(
    material_id: int,
    test_data: MockTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_test(
            db=db,
            user_id=current_user.id,
            material_id=material_id,
            test_data=test_data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/",
    response_model=list[MockTestResponse],
)
def list_mock_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tests_for_user(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{mock_test_id}",
    response_model=MockTestResponse,
)
def get_mock_test(
    mock_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_test(
            db=db,
            mock_test_id=mock_test_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.get(
    "/{mock_test_id}/questions",
    response_model=list[MockTestQuestionResponse],
)
def get_mock_test_question_list(
    mock_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_test_questions(
            db=db,
            mock_test_id=mock_test_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.delete(
    "/{mock_test_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_mock_test(
    mock_test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        remove_test(
            db=db,
            mock_test_id=mock_test_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

@router.post(
    "/subjects/{subject_id}",
    response_model=MockTestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subject_mock_test(
    subject_id: int,
    test_data: MockTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_subject_test(
            db=db,
            user_id=current_user.id,
            subject_id=subject_id,
            test_data=test_data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )