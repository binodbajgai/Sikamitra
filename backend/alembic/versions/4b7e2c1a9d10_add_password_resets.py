"""add password reset records

Revision ID: 4b7e2c1a9d10
Revises: 8e2f4b6c1a90
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4b7e2c1a9d10"
down_revision: Union[str, Sequence[str], None] = "8e2f4b6c1a90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("password_resets"):
        op.create_table(
            "password_resets",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("token", sa.String(length=255), nullable=False),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.UniqueConstraint("token"),
        )

    existing_indexes = {
        index["name"] for index in inspector.get_indexes("password_resets")
    }
    if "ix_password_resets_email" not in existing_indexes:
        op.create_index("ix_password_resets_email", "password_resets", ["email"])
    if "ix_password_resets_token" not in existing_indexes:
        op.create_index("ix_password_resets_token", "password_resets", ["token"])


def downgrade() -> None:
    op.drop_index("ix_password_resets_token", table_name="password_resets")
    op.drop_index("ix_password_resets_email", table_name="password_resets")
    op.drop_table("password_resets")
