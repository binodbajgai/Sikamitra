from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.subject import (
    SubjectCreate,
    SubjectResponse,
)
from app.services.subject_service import (
    create_new_subject,
    get_subject,
    get_user_subjects,
    remove_subject,
)

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"],
)


@router.post(
    "/",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_new_subject(
            db=db,
            user_id=current_user.id,
            name=subject_data.name,
            description=subject_data.description,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/",
    response_model=list[SubjectResponse],
)
def list_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_subjects(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
)
def get_one(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = get_subject(
        db=db,
        subject_id=subject_id,
        user_id=current_user.id,
    )

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    return subject


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        remove_subject(
            db=db,
            subject_id=subject_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )