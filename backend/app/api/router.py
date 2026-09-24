from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.generated_summary import GeneratedSummary
from app.models.mock_test import MockTest
from app.models.question import Question
from app.models.study_material import StudyMaterial
from app.models.user import User

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from exc
    return {"status": "healthy"}


@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    material_count = (
        db.query(StudyMaterial)
        .filter(StudyMaterial.user_id == current_user.id)
        .count()
    )

    summary_count = (
        db.query(GeneratedSummary)
        .join(
            StudyMaterial,
            StudyMaterial.id == GeneratedSummary.material_id,
        )
        .filter(StudyMaterial.user_id == current_user.id)
        .count()
    )

    question_count = (
        db.query(Question)
        .join(
            StudyMaterial,
            StudyMaterial.id == Question.material_id,
        )
        .filter(StudyMaterial.user_id == current_user.id)
        .count()
    )

    mock_test_count = (
        db.query(MockTest)
        .filter(MockTest.user_id == current_user.id)
        .count()
    )

    return {
        "materialCount": material_count,
        "summaryCount": summary_count,
        "questionCount": question_count,
        "mockTestCount": mock_test_count,
    }