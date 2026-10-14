"""Non-destructive initial schema + compatibility columns for early CVForge databases.

Revision ID: 0001_initial
Revises:
"""

from alembic import op
from sqlalchemy import inspect
from app.core.database import Base
import app.models  # noqa: F401

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    # Create missing tables only. Existing accounts, resumes and subscriptions stay intact.
    Base.metadata.create_all(bind=connection, checkfirst=True)
    inspector = inspect(connection)
    for name, table in Base.metadata.tables.items():
        if not inspector.has_table(name):
            continue
        existing = {column["name"] for column in inspector.get_columns(name)}
        for column in table.columns:
            if column.name not in existing:
                op.add_column(name, column.copy())
        # Missing indexes are created after the corresponding columns exist.
        indexes = {item["name"] for item in inspect(connection).get_indexes(name)}
        for index in table.indexes:
            if index.name and index.name not in indexes:
                op.create_index(index.name, name, [col.name for col in index.columns], unique=index.unique)


def downgrade():
    # Deliberately do not drop any pre-existing personal data or payment records.
    raise RuntimeError("Destructive downgrade requires an explicit recovery procedure")
