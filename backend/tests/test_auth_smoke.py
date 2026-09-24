import unittest
from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.main as main_module
from app.core.database import Base, get_db
from app.main import app
from app.models.user import User


class FakeRedis:
    async def incr(self, key: str) -> int:
        return 1

    async def expire(self, key: str, seconds: int) -> bool:
        return True

    async def aclose(self) -> None:
        return None


class AuthSmokeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        cls.session_factory = sessionmaker(
            bind=cls.engine,
            autocommit=False,
            autoflush=False,
        )
        Base.metadata.create_all(cls.engine, tables=[User.__table__])

    @classmethod
    def tearDownClass(cls) -> None:
        Base.metadata.drop_all(cls.engine, tables=[User.__table__])
        cls.engine.dispose()

    def setUp(self) -> None:
        def override_get_db() -> Generator[Session, None, None]:
            db = self.session_factory()
            try:
                yield db
            finally:
                db.close()

        self.override_get_db = override_get_db
        self.original_redis_factory = main_module.get_async_redis
        self.original_smtp_check = main_module.verify_smtp_connection
        main_module.get_async_redis = lambda: FakeRedis()
        main_module.verify_smtp_connection = lambda: False
        app.dependency_overrides[get_db] = self.override_get_db

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        main_module.get_async_redis = self.original_redis_factory
        main_module.verify_smtp_connection = self.original_smtp_check
        with self.session_factory() as db:
            db.query(User).delete()
            db.commit()

    def test_register_login_protected_route_and_client_logout(self) -> None:
        with TestClient(app, base_url="http://localhost") as client:
            registration = client.post(
                "/auth/register",
                json={
                    "full_name": "Smoke Test User",
                    "email": "smoke@example.com",
                    "password": "Password123!",
                },
            )
            self.assertEqual(registration.status_code, 201)

            login = client.post(
                "/auth/login",
                data={
                    "username": "smoke@example.com",
                    "password": "Password123!",
                },
            )
            self.assertEqual(login.status_code, 200)
            token = login.json()["access_token"]

            protected = client.get(
                "/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            self.assertEqual(protected.status_code, 200)
            self.assertEqual(protected.json()["email"], "smoke@example.com")

            without_token = client.get("/auth/me")
            self.assertEqual(without_token.status_code, 401)

            # JWT logout is client-side: discard the token and verify it is no longer sent.
            logged_out = client.get("/auth/me")
            self.assertEqual(logged_out.status_code, 401)


if __name__ == "__main__":
    unittest.main()
