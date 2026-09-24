from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.ai.nvidia_provider import NVIDIAProvider

from app.repositories.generated_summary_repository import (
    create_summary,
    get_summaries_by_material,
)

from app.repositories.important_point_repository import (
    create_important_point,
    get_important_points_by_material,
    delete_important_points_by_material,
)

from app.repositories.question_repository import (
    create_questions,
    get_questions_by_material,
    delete_questions_by_material,
)
from app.core.config import settings
from app.core.redis import get_sync_redis


provider = NVIDIAProvider()


def _consume_ai_quota(user_id: int) -> None:
    if not settings.redis_url:
        if settings.environment.lower() != "production":
            return
        raise RuntimeError("REDIS_URL is not configured")

    now = datetime.now(timezone.utc)
    key = f"ai-quota:{user_id}:{now.date().isoformat()}"
    redis = get_sync_redis()
    try:
        count = redis.incr(key)
        if count == 1:
            seconds_until_reset = int(
                (now.replace(hour=0, minute=0, second=0, microsecond=0)
                 + timedelta(days=1) - now).total_seconds()
            )
            redis.expire(key, max(seconds_until_reset, 1))
        if count > settings.ai_daily_quota:
            raise ValueError("Daily AI generation limit reached")
    finally:
        redis.close()


def generate_summary(
    db: Session,
    material_id: int,
    content: str,
    user_id: int,
):
    if not content.strip():
        raise ValueError("Material has no content")

    existing = get_summaries_by_material(
        db=db,
        material_id=material_id,
    )

    if existing:
        return existing[0]

    _consume_ai_quota(user_id)
    summary_text = provider.generate_summary(content)

    return create_summary(
        db=db,
        material_id=material_id,
        summary=summary_text,
    )


def generate_important_points(
    db: Session,
    material_id: int,
    content: str,
    user_id: int,
):
    if not content.strip():
        raise ValueError("Material has no content")

    existing = get_important_points_by_material(
        db=db,
        material_id=material_id,
    )

    if existing:
        return existing

    _consume_ai_quota(user_id)
    points = provider.generate_important_points(content)

    created_points = []

    for position, point in enumerate(points, start=1):
        created_points.append(
            create_important_point(
                db=db,
                material_id=material_id,
                point=point,
                position=position,
            )
        )

    return created_points


def generate_questions(
    db: Session,
    material_id: int,
    content: str,
    user_id: int,
):
    if not content.strip():
        raise ValueError("Material has no content")

    existing = get_questions_by_material(
        db=db,
        material_id=material_id,
    )

    if existing:
        return existing

    _consume_ai_quota(user_id)
    questions = provider.generate_questions(content)

    return create_questions(
      db=db,
      material_id=material_id,
      questions=questions,
  )



def regenerate_summary(
    db: Session,
    material_id: int,
    content: str,
    user_id: int,
):
    if not content.strip():
        raise ValueError("Material has no content")

    _consume_ai_quota(user_id)
    summary_text = provider.generate_summary(content)

    return create_summary(
        db=db,
        material_id=material_id,
        summary=summary_text,
    )


def regenerate_important_points(
    db: Session,
    material_id: int,
    content: str,
    user_id: int,
):
    if not content.strip():
        raise ValueError("Material has no content")

    _consume_ai_quota(user_id)
    # Generate the new points first.
    points = provider.generate_important_points(content)

    if not points:
        raise ValueError(
            "AI did not generate any important points"
        )

    # Delete the old points only after successful AI generation.
    delete_important_points_by_material(
        db=db,
        material_id=material_id,
    )

    created_points = []

    for position, point in enumerate(points, start=1):
        created_points.append(
            create_important_point(
                db=db,
                material_id=material_id,
                point=point,
                position=position,
            )
        )

    return created_points


def regenerate_questions(
    db: Session,
    material_id: int,
    content: str,
    user_id: int,
):
    if not content.strip():
        raise ValueError("Material has no content")

    _consume_ai_quota(user_id)
    questions = provider.generate_questions(content)

    if not questions:
        raise ValueError(
            "AI did not generate any questions"
        )

    # Remove the old question bank only after
    # successful generation.
    delete_questions_by_material(
        db=db,
        material_id=material_id,
    )

    return create_questions(
        db=db,
        material_id=material_id,
        questions=questions,
    )

def get_summaries(
    db: Session,
    material_id: int,
):
    return get_summaries_by_material(
        db=db,
        material_id=material_id,
    )


def get_important_points(
    db: Session,
    material_id: int,
):
    return get_important_points_by_material(
        db=db,
        material_id=material_id,
    )


def get_questions(
    db: Session,
    material_id: int,
):
    return get_questions_by_material(
        db=db,
        material_id=material_id,
    )