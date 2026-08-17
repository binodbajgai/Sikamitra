from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.study_material import StudyMaterialResponse
from app.schemas.subject import (
    SubjectCreate,
    SubjectResponse,
)
from app.services.subject_service import (
    create_user_subject,
    get_materials_for_subject,
    get_subject,
    get_subjects_for_user,
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
    return create_user_subject(
        db=db,
        user_id=current_user.id,
        subject_data=subject_data,
    )


@router.get(
    "/",
    response_model=list[SubjectResponse],
)
def list_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_subjects_for_user(
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


@router.get(
    "/{subject_id}/materials",
    response_model=list[StudyMaterialResponse],
)
def list_subject_materials(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_materials_for_subject(
            db=db,
            subject_id=subject_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


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