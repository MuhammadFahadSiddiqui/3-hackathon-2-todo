"""
Migration script to add all missing columns to the tasks table.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import engine


def migrate():
    """Add all missing columns to tasks table."""
    columns_to_add = [
        ("is_completed", "BOOLEAN DEFAULT false NOT NULL"),
        ("deadline_at", "TIMESTAMP"),
        ("reminder_interval_minutes", "INTEGER"),
        ("last_reminded_at", "TIMESTAMP"),
    ]

    with engine.connect() as conn:
        for column_name, column_def in columns_to_add:
            try:
                result = conn.execute(
                    text(
                        f"""
                        SELECT column_name
                        FROM information_schema.columns
                        WHERE table_name = 'tasks' AND column_name = '{column_name}'
                        """
                    )
                )
                if result.fetchone() is None:
                    conn.execute(text(f"ALTER TABLE tasks ADD COLUMN {column_name} {column_def}"))
                    conn.commit()
                    print(f"Added: {column_name}")
                else:
                    print(f"Exists: {column_name}")
            except Exception as e:
                print(f"Error with {column_name}: {e}")


if __name__ == "__main__":
    print("Fixing task columns...")
    migrate()
    print("Done!")
