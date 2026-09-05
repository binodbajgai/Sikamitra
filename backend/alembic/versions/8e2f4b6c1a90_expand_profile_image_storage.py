"""expand profile image storage

Revision ID: 8e2f4b6c1a90
Revises: 7c1d9a2e4f10
Create Date: 2026-09-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects import mysql


revision: str = "8e2f4b6c1a90"
down_revision: Union[str, Sequence[str], None] = "7c1d9a2e4f10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "profile_image",
        existing_type=mysql.TEXT(),
        type_=mysql.MEDIUMTEXT(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "profile_image",
        existing_type=mysql.MEDIUMTEXT(),
        type_=mysql.TEXT(),
        existing_nullable=True,
    )
