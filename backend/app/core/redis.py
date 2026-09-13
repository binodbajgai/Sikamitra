from redis import Redis
from redis.asyncio import Redis as AsyncRedis

from app.core.config import settings


def get_sync_redis() -> Redis:
    if not settings.redis_url:
        raise RuntimeError("REDIS_URL is not configured")
    return Redis.from_url(settings.redis_url, decode_responses=True)


def get_async_redis() -> AsyncRedis:
    if not settings.redis_url:
        raise RuntimeError("REDIS_URL is not configured")
    return AsyncRedis.from_url(settings.redis_url, decode_responses=True)
