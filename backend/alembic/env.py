from logging.config import fileConfig

from alembic import context

from app.core.config import settings
from app.core.database import Base, engine
from app.models.user import User
from app.models.study_material import StudyMaterial
from app.models.generated_summary import GeneratedSummary
from app.models.important_point import ImportantPoint
from app.models.question import Question
from app.models.mock_test import MockTest
from app.models.mock_test_question import MockTestQuestion
from app.models.mock_test_attempt import MockTestAttempt
from app.models.mock_test_answer import MockTestAnswer


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in offline mode."""

    url = settings.database_url

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in online mode."""

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()