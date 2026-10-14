"""Alembic preserves pre-existing user records and records its own revision."""
import os
import secrets
import subprocess
import sys
from pathlib import Path
from sqlalchemy import create_engine, text


def test_additive_alembic_upgrade_from_legacy_database(tmp_path):
    db_path = tmp_path / "legacy.sqlite"
    url = "sqlite:///" + str(db_path)
    engine = create_engine(url)
    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL, full_name VARCHAR(200),
            is_active BOOLEAN, plan VARCHAR(20))
        """))
        connection.execute(text("""
            INSERT INTO users (id,email,hashed_password,full_name,is_active,plan)
            VALUES (41,'existing@example.org','EXISTING_HASH','Protected User',1,'free')
        """))
    environment = {**os.environ, "SECRET_KEY": secrets.token_urlsafe(48),
                   "ENVIRONMENT": "test", "DATABASE_URL": url}
    root = Path(__file__).resolve().parents[1]
    for _ in range(2):
        result = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"],
                                env=environment, cwd=root, capture_output=True, text=True)
        assert result.returncode == 0, result.stderr[:800]
    with engine.connect() as connection:
        row = connection.execute(text("SELECT id, full_name, role FROM users WHERE id=41")).one()
        version = connection.execute(text("SELECT version_num FROM alembic_version")).scalar()
        assert row == (41, "Protected User", "user")
        assert version == "0001_initial"
