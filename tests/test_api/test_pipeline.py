"""Tests for the pipeline endpoints."""

import json
import sqlite3
from datetime import datetime

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def tmp_path(tmp_path_factory):
    return tmp_path_factory.mktemp("data")


@pytest.fixture()
def ideas_db(tmp_path):
    """Create a test SQLite database with the caught_ideas schema."""
    db_path = tmp_path / "caught_ideas.db"
    conn = sqlite3.connect(str(db_path))
    conn.execute("""
        CREATE TABLE caught_ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            raw_content TEXT NOT NULL,
            tags TEXT,
            source_context TEXT,
            caught_at TIMESTAMP,
            status TEXT DEFAULT 'pending',
            processed_at TIMESTAMP,
            factory_id TEXT,
            error_message TEXT,
            retry_count INTEGER DEFAULT 0,
            stage TEXT DEFAULT 'captured',
            enrichment_result TEXT,
            evaluation_result TEXT,
            scaffolding_result TEXT,
            build_result TEXT,
            review_decision TEXT,
            review_notes TEXT,
            github_url TEXT,
            completed_at TIMESTAMP
        )
    """)

    # Insert test ideas at various stages
    ideas = [
        ("Healthcare AI Tool", "Build an AI tool for healthcare", '["ai", "healthcare"]',
         "captured", "pending", None, None),
        ("CLI Markdown Converter", "Convert markdown to epub", '["cli", "tools"]',
         "evaluated", "processed",
         json.dumps({
             "jtbd_analysis": "Convert docs",
             "disruption_potential": "Low",
             "scores": {"disruption_score": 0.3, "overall_score": 72.0},
             "capabilities_fit": "strong",
             "recommendation": "develop",
             "recommendation_rationale": "Good fit",
             "key_risks": ["Competition"],
         }),
         None),
        ("MCP Server for Notion", "Sync Notion data via MCP", '["mcp", "notion"]',
         "published", "processed",
         json.dumps({
             "jtbd_analysis": "Integrate tools",
             "disruption_potential": "Medium",
             "scores": {"disruption_score": 0.6, "overall_score": 85.0},
             "capabilities_fit": "strong",
             "recommendation": "develop",
             "recommendation_rationale": "Strong fit",
             "key_risks": [],
         }),
         "https://github.com/test/notion-mcp"),
    ]

    for title, content, tags, stage, status, eval_result, github_url in ideas:
        conn.execute(
            """INSERT INTO caught_ideas
            (title, raw_content, tags, caught_at, stage, status, evaluation_result, github_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (title, content, tags, datetime.now().isoformat(), stage, status, eval_result, github_url),
        )

    conn.commit()
    conn.close()
    return db_path


@pytest.fixture()
def client(tmp_path, ideas_db, monkeypatch):
    import api.deps as deps_module
    from api.readers.academy_reader import AcademyReader
    from api.readers.um_reader import UMReader
    from contracts.store import ContractStore

    monkeypatch.setattr(deps_module, "_store", ContractStore(data_dir=tmp_path))
    monkeypatch.setattr(deps_module, "_academy", AcademyReader(personas_dir=tmp_path / "personas"))
    monkeypatch.setattr(deps_module, "_um", UMReader(db_path=ideas_db))

    from api.main import app
    return TestClient(app)


def test_list_ideas(client):
    resp = client.get("/api/v1/pipeline/ideas")
    assert resp.status_code == 200
    ideas = resp.json()
    assert len(ideas) == 3


def test_list_ideas_filter_by_stage(client):
    resp = client.get("/api/v1/pipeline/ideas?stage=captured")
    assert resp.status_code == 200
    ideas = resp.json()
    assert len(ideas) == 1
    assert ideas[0]["title"] == "Healthcare AI Tool"


def test_list_ideas_filter_by_status(client):
    resp = client.get("/api/v1/pipeline/ideas?status=processed")
    assert resp.status_code == 200
    ideas = resp.json()
    assert len(ideas) == 2


def test_list_ideas_with_scores(client):
    resp = client.get("/api/v1/pipeline/ideas")
    ideas = resp.json()
    evaluated = next(i for i in ideas if i["title"] == "CLI Markdown Converter")
    assert evaluated["overall_score"] == 72.0
    assert evaluated["recommendation"] == "develop"
    assert evaluated["stage"] == "evaluated"


def test_get_idea_detail(client):
    resp = client.get("/api/v1/pipeline/ideas/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Healthcare AI Tool"
    assert data["raw_content"] == "Build an AI tool for healthcare"
    assert "ai" in data["tags"]


def test_get_idea_detail_with_evaluation(client):
    resp = client.get("/api/v1/pipeline/ideas/2")
    data = resp.json()
    assert data["evaluation_result"] is not None
    assert data["evaluation_result"]["scores"]["overall_score"] == 72.0


def test_get_idea_not_found(client):
    resp = client.get("/api/v1/pipeline/ideas/999")
    assert resp.status_code == 404


def test_stage_counts(client):
    resp = client.get("/api/v1/pipeline/stages")
    assert resp.status_code == 200
    data = resp.json()
    assert data["captured"] == 1
    assert data["evaluated"] == 1
    assert data["published"] == 1


def test_list_ideas_limit(client):
    resp = client.get("/api/v1/pipeline/ideas?limit=1")
    assert resp.status_code == 200
    ideas = resp.json()
    assert len(ideas) == 1
