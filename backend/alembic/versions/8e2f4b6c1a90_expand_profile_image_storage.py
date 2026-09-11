"""expand profile image storage

Revision ID: 8e2f4b6c1a90
Revises: 7c1d9a2e4f10
Create Date: 2026-09-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8e2f4b6c1a90"
down_revision: Union[str, Sequence[str], None] = "7c1d9a2e4f10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # PostgreSQL TEXT is already unlimited; this is a no-op for Postgres
    # (was mysql.MEDIUMTEXT previously — not supported by PostgreSQL)
    op.alter_column(
        "users",
        "profile_image",
        existing_type=sa.Text(),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "profile_image",
        existing_type=sa.Text(),
        type_=sa.Text(),
        existing_nullable=True,
    )
