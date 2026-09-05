"""add profile image to users

Revision ID: 7c1d9a2e4f10
Revises: f482f59fb66e
Create Date: 2026-09-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7c1d9a2e4f10"
down_revision: Union[str, Sequence[str], None] = "f482f59fb66e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("profile_image", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "profile_image")
