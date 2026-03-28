import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parents[2]
DB_DIR = BASE_DIR / "database"
DB_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DB_DIR / "cinento_projects.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            format TEXT NOT NULL,
            genre TEXT NOT NULL,
            language TEXT NOT NULL,
            tone TEXT NOT NULL,
            setting TEXT NOT NULL,
            idea TEXT NOT NULL,
            output_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cur.execute("PRAGMA table_info(projects)")
    columns = [row["name"] for row in cur.fetchall()]

    if "user_id" not in columns:
        cur.execute("ALTER TABLE projects ADD COLUMN user_id INTEGER")

    conn.commit()
    conn.close()


def save_project(user_id: int, data: Dict[str, Any], output_json: str) -> int:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO projects (
            user_id, title, format, genre, language, tone, setting, idea, output_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            data.get("title", ""),
            data.get("format", ""),
            data.get("genre", ""),
            data.get("language", ""),
            data.get("tone", ""),
            data.get("setting", ""),
            data.get("idea", ""),
            output_json,
        ),
    )

    project_id = cur.lastrowid
    conn.commit()
    conn.close()
    return project_id


def list_projects(user_id: int) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, title, format, genre, language, created_at
        FROM projects
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,),
    )

    rows = cur.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_project(project_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user_id),
    )

    row = cur.fetchone()
    conn.close()

    if not row:
        return None

    return dict(row)