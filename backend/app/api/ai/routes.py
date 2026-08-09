from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.study_material import StudyMaterial
from app.schemas.ai_output import (
    SummaryResponse,
    ImportantPointResponse,
    QuestionResponse,
)
from app.services.ai_service import (
    generate_summary,
    generate_important_points,
    generate_questions,
)

router = APIRouter(
    prefix="/ai",
    tags=["AI Processing"],
)


def get_user_material(
    db: Session,
    material_id: int,
    user_id: int,
) -> StudyMaterial:
    material = (
        db.query(StudyMaterial)
        .filter(
            StudyMaterial.id == material_id,
            StudyMaterial.user_id == user_id,
        )
        .first()
    )

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study material not found",
        )

    return material


@router.post(
    "/materials/{material_id}/summary",
    response_model=SummaryResponse,
)
def create_summary(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = get_user_material(
        db,
        material_id,
        current_user.id,
    )

    try:
        return generate_summary(
            db,
            material.id,
            material.content or "",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post(
    "/materials/{material_id}/important-points",
    response_model=list[ImportantPointResponse],
)
def create_important_points(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = get_user_material(
        db,
        material_id,
        current_user.id,
    )

    try:
        return generate_important_points(
            db,
            material.id,
            material.content or "",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post(
    "/materials/{material_id}/questions",
    response_model=list[QuestionResponse],
)
def create_questions(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = get_user_material(
        db,
        material_id,
        current_user.id,
    )

    try:
        return generate_questions(
            db,
            material.id,
            material.content or "",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )