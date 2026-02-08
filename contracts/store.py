"""ContractStore: Dual-write to JSONL (source of truth) + SQLite (query layer).

JSONL files are append-only and git-tracked.
SQLite is rebuildable from JSONL at any time.
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import TypeVar

from pydantic import BaseModel

from .improvement_recommendation import ImprovementRecommendation
from .outcome_record import OutcomeRecord
from .persona_upgrade_patch import PersonaUpgradePatch

T = TypeVar("T", bound=BaseModel)

# Default paths
DATA_DIR = Path(__file__).parent.parent / "data"
DB_PATH = DATA_DIR / "persona_metrics.db"


class ContractStore:
    """Dual-write store for Snow-Town contracts.

    Source of truth: JSONL files (append-only, git-tracked).
    Query layer: SQLite (rebuildable from JSONL).
    """

    def __init__(self, data_dir: Path | None = None, db_path: Path | None = None):
        self.data_dir = data_dir or DATA_DIR
        self.db_path = db_path or (self.data_dir / "persona_metrics.db")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self._conn: sqlite3.Connection | None = None

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is None:
            self._conn = sqlite3.connect(str(self.db_path))
            self._conn.row_factory = sqlite3.Row
            self._ensure_tables()
        return self._conn

    def _ensure_tables(self) -> None:
        conn = self._conn
        assert conn is not None
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS outcome_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                idea_id INTEGER NOT NULL,
                idea_title TEXT NOT NULL,
                outcome TEXT NOT NULL,
                overall_score REAL,
                recommendation TEXT,
                capabilities_fit TEXT,
                build_outcome TEXT,
                artifact_count INTEGER DEFAULT 0,
                tech_stack TEXT DEFAULT '[]',
                total_duration_seconds REAL DEFAULT 0,
                tags TEXT DEFAULT '[]',
                github_url TEXT,
                emitted_at TEXT NOT NULL,
                raw_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS improvement_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recommendation_id TEXT NOT NULL UNIQUE,
                session_id TEXT,
                recommendation_type TEXT NOT NULL,
                target_system TEXT DEFAULT 'persona',
                title TEXT NOT NULL,
                priority TEXT DEFAULT 'medium',
                scope TEXT,
                status TEXT DEFAULT 'pending',
                emitted_at TEXT NOT NULL,
                raw_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS persona_patches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patch_id TEXT NOT NULL UNIQUE,
                persona_id TEXT NOT NULL,
                rationale TEXT,
                from_version TEXT,
                to_version TEXT,
                schema_valid INTEGER DEFAULT 1,
                status TEXT DEFAULT 'proposed',
                emitted_at TEXT NOT NULL,
                raw_json TEXT NOT NULL
            );
        """)
        conn.commit()

    def _jsonl_path(self, contract_type: str) -> Path:
        paths = {
            "outcome_record": self.data_dir / "outcome_records.jsonl",
            "improvement_recommendation": self.data_dir / "improvement_recommendations.jsonl",
            "persona_patch": self.data_dir / "persona_patches.jsonl",
        }
        return paths[contract_type]

    def _append_jsonl(self, contract_type: str, record: BaseModel) -> None:
        path = self._jsonl_path(contract_type)
        with open(path, "a") as f:
            f.write(record.model_dump_json() + "\n")

    # --- OutcomeRecord ---

    def write_outcome(self, record: OutcomeRecord) -> None:
        """Write an OutcomeRecord to JSONL and SQLite."""
        self._append_jsonl("outcome_record", record)
        conn = self._get_conn()
        conn.execute(
            """INSERT INTO outcome_records
            (idea_id, idea_title, outcome, overall_score, recommendation,
             capabilities_fit, build_outcome, artifact_count, tech_stack,
             total_duration_seconds, tags, github_url, emitted_at, raw_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                record.idea_id,
                record.idea_title,
                record.outcome.value,
                record.overall_score,
                record.recommendation,
                record.capabilities_fit,
                record.build_outcome,
                record.artifact_count,
                json.dumps(record.tech_stack),
                record.total_duration_seconds,
                json.dumps(record.tags),
                record.github_url,
                record.emitted_at.isoformat(),
                record.model_dump_json(),
            ),
        )
        conn.commit()

    def read_outcomes(self, limit: int = 100) -> list[OutcomeRecord]:
        """Read OutcomeRecords from JSONL (source of truth)."""
        path = self._jsonl_path("outcome_record")
        if not path.exists():
            return []
        records = []
        for line in path.read_text().strip().splitlines():
            if line:
                records.append(OutcomeRecord.model_validate_json(line))
        return records[-limit:]

    def query_outcomes(
        self,
        outcome: str | None = None,
        idea_id: int | None = None,
        limit: int = 100,
    ) -> list[OutcomeRecord]:
        """Query OutcomeRecords from SQLite."""
        conn = self._get_conn()
        query = "SELECT raw_json FROM outcome_records"
        conditions: list[str] = []
        params: list = []
        if outcome:
            conditions.append("outcome = ?")
            params.append(outcome)
        if idea_id is not None:
            conditions.append("idea_id = ?")
            params.append(idea_id)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY emitted_at DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(query, params).fetchall()
        return [OutcomeRecord.model_validate_json(row["raw_json"]) for row in rows]

    # --- ImprovementRecommendation ---

    def write_recommendation(self, rec: ImprovementRecommendation) -> None:
        """Write an ImprovementRecommendation to JSONL and SQLite."""
        self._append_jsonl("improvement_recommendation", rec)
        conn = self._get_conn()
        conn.execute(
            """INSERT OR REPLACE INTO improvement_recommendations
            (recommendation_id, session_id, recommendation_type, target_system,
             title, priority, scope, status, emitted_at, raw_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                rec.recommendation_id,
                rec.session_id,
                rec.recommendation_type.value,
                rec.target_system,
                rec.title,
                rec.priority,
                rec.scope.value,
                rec.status,
                rec.emitted_at.isoformat(),
                rec.model_dump_json(),
            ),
        )
        conn.commit()

    def read_recommendations(self, limit: int = 100) -> list[ImprovementRecommendation]:
        """Read ImprovementRecommendations from JSONL."""
        path = self._jsonl_path("improvement_recommendation")
        if not path.exists():
            return []
        records = []
        for line in path.read_text().strip().splitlines():
            if line:
                records.append(ImprovementRecommendation.model_validate_json(line))
        return records[-limit:]

    def query_recommendations(
        self,
        target_system: str | None = None,
        status: str | None = None,
        limit: int = 100,
    ) -> list[ImprovementRecommendation]:
        """Query ImprovementRecommendations from SQLite."""
        conn = self._get_conn()
        query = "SELECT raw_json FROM improvement_recommendations"
        conditions: list[str] = []
        params: list = []
        if target_system:
            conditions.append("target_system = ?")
            params.append(target_system)
        if status:
            conditions.append("status = ?")
            params.append(status)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY emitted_at DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(query, params).fetchall()
        return [ImprovementRecommendation.model_validate_json(row["raw_json"]) for row in rows]

    def update_recommendation_status(self, recommendation_id: str, status: str) -> None:
        """Update the status of a recommendation in SQLite."""
        conn = self._get_conn()
        conn.execute(
            "UPDATE improvement_recommendations SET status = ? WHERE recommendation_id = ?",
            (status, recommendation_id),
        )
        conn.commit()

    # --- PersonaUpgradePatch ---

    def write_patch(self, patch: PersonaUpgradePatch) -> None:
        """Write a PersonaUpgradePatch to JSONL and SQLite."""
        self._append_jsonl("persona_patch", patch)
        conn = self._get_conn()
        conn.execute(
            """INSERT OR REPLACE INTO persona_patches
            (patch_id, persona_id, rationale, from_version, to_version,
             schema_valid, status, emitted_at, raw_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                patch.patch_id,
                patch.persona_id,
                patch.rationale,
                patch.from_version,
                patch.to_version,
                1 if patch.schema_valid else 0,
                patch.status,
                patch.emitted_at.isoformat(),
                patch.model_dump_json(),
            ),
        )
        conn.commit()

    def read_patches(self, limit: int = 100) -> list[PersonaUpgradePatch]:
        """Read PersonaUpgradePatches from JSONL."""
        path = self._jsonl_path("persona_patch")
        if not path.exists():
            return []
        records = []
        for line in path.read_text().strip().splitlines():
            if line:
                records.append(PersonaUpgradePatch.model_validate_json(line))
        return records[-limit:]

    def query_patches(
        self,
        persona_id: str | None = None,
        status: str | None = None,
        limit: int = 100,
    ) -> list[PersonaUpgradePatch]:
        """Query PersonaUpgradePatches from SQLite."""
        conn = self._get_conn()
        query = "SELECT raw_json FROM persona_patches"
        conditions: list[str] = []
        params: list = []
        if persona_id:
            conditions.append("persona_id = ?")
            params.append(persona_id)
        if status:
            conditions.append("status = ?")
            params.append(status)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY emitted_at DESC LIMIT ?"
        params.append(limit)
        rows = conn.execute(query, params).fetchall()
        return [PersonaUpgradePatch.model_validate_json(row["raw_json"]) for row in rows]

    def update_patch_status(self, patch_id: str, status: str) -> None:
        """Update the status of a patch in SQLite."""
        conn = self._get_conn()
        conn.execute(
            "UPDATE persona_patches SET status = ? WHERE patch_id = ?",
            (status, patch_id),
        )
        conn.commit()

    # --- Rebuild ---

    def rebuild_sqlite(self) -> None:
        """Rebuild SQLite from JSONL files. Useful for recovery."""
        conn = self._get_conn()
        conn.executescript("""
            DELETE FROM outcome_records;
            DELETE FROM improvement_recommendations;
            DELETE FROM persona_patches;
        """)

        for record in self.read_outcomes(limit=10000):
            self.write_outcome(record)
        for rec in self.read_recommendations(limit=10000):
            self.write_recommendation(rec)
        for patch in self.read_patches(limit=10000):
            self.write_patch(patch)

    def close(self) -> None:
        """Close the SQLite connection."""
        if self._conn:
            self._conn.close()
            self._conn = None
