from app.repositories.generated_summary_repository import (
    get_summaries_by_material,
)

from app.repositories.important_point_repository import (
    get_important_points_by_material,
)

from app.repositories.question_repository import (
    get_questions_by_material,
)

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
    get_summaries,
    get_important_points,
    get_questions,
    regenerate_summary,
    regenerate_important_points,
    regenerate_questions,
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

@router.post(
    "/materials/{material_id}/summary/regenerate",
    response_model=SummaryResponse,
)
def regenerate_summary_endpoint(
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
        return regenerate_summary(
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
    "/materials/{material_id}/important-points/regenerate",
    response_model=list[ImportantPointResponse],
)
def regenerate_important_points_endpoint(
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
        return regenerate_important_points(
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
    "/materials/{material_id}/questions/regenerate",
    response_model=list[QuestionResponse],
)
def regenerate_questions_endpoint(
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
        return regenerate_questions(
            db,
            material.id,
            material.content or "",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

@router.get(
    "/materials/{material_id}/summary",
    response_model=SummaryResponse,
)
def get_summary(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_material(
        db,
        material_id,
        current_user.id,
    )

    summaries = get_summaries_by_material(
        db=db,
        material_id=material_id,
    )

    if not summaries:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No summary found for this material",
        )

    return summaries[0]


@router.get(
    "/materials/{material_id}/important-points",
    response_model=list[ImportantPointResponse],
)
def get_important_points(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_material(
        db,
        material_id,
        current_user.id,
    )

    points = get_important_points_by_material(
        db=db,
        material_id=material_id,
    )

    if not points:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
        detail="No important points found for this material",
        )

    return points


@router.get(
    "/materials/{material_id}/questions",
    response_model=list[QuestionResponse],
)
def get_questions(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_user_material(
        db,
        material_id,
        current_user.id,
    )

    questions = get_questions_by_material(
        db=db,
        material_id=material_id,
    )

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No questions found for this material",
        )

    return questions


@router.get(
    "/materials/{material_id}/summaries",
    response_model=list[SummaryResponse],
)
def get_material_summaries(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = get_user_material(
        db,
        material_id,
        current_user.id,
    )

    return get_summaries(
        db=db,
        material_id=material.id,
    )


@router.get(
    "/materials/{material_id}/important-points",
    response_model=list[ImportantPointResponse],
)
def get_material_important_points(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = get_user_material(
        db,
        material_id,
        current_user.id,
    )

    return get_important_points(
        db=db,
        material_id=material.id,
    )


@router.get(
    "/materials/{material_id}/questions",
    response_model=list[QuestionResponse],
)
def get_material_questions(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material = get_user_material(
        db,
        material_id,
        current_user.id,
    )

    return get_questions(
        db=db,
        material_id=material.id,
    )

@router.post(
    "/materials/{material_id}/summary/regenerate",
    response_model=SummaryResponse,
)
def regenerate_material_summary(
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
        return regenerate_summary(
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
    "/materials/{material_id}/important-points/regenerate",
    response_model=list[ImportantPointResponse],
)
def regenerate_material_important_points(
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
        return regenerate_important_points(
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
    "/materials/{material_id}/questions/regenerate",
    response_model=list[QuestionResponse],
)
def regenerate_material_questions(
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
        return regenerate_questions(
            db,
            material.id,
            material.content or "",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )