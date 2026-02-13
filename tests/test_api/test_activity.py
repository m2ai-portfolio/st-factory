"""Tests for the activity feed endpoint."""

from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from contracts.outcome_record import OutcomeRecord, TerminalOutcome
from contracts.improvement_recommendation import (
    ImprovementRecommendation,
    RecommendationType,
    TargetScope,
)
from contracts.persona_upgrade_patch import (
    PersonaUpgradePatch,
    PersonaFieldPatch,
    PatchOperation,
)
from contracts.store import ContractStore


@pytest.fixture()
def data_dir(tmp_path):
    return tmp_path


@pytest.fixture()
def store(data_dir):
    return ContractStore(data_dir=data_dir)


@pytest.fixture()
def client(store, data_dir, monkeypatch):
    import api.deps as deps_module
    monkeypatch.setattr(deps_module, "_store", store)
    from api.readers.academy_reader import AcademyReader
    from api.readers.um_reader import UMReader
    monkeypatch.setattr(deps_module, "_academy", AcademyReader(personas_dir=data_dir))
    monkeypatch.setattr(deps_module, "_um", UMReader(db_path=data_dir / "nonexistent.db"))

    from api.main import app
    return TestClient(app)


def test_activity_empty(client):
    resp = client.get("/api/v1/activity")
    assert resp.status_code == 200
    data = resp.json()
    assert data == []


def test_activity_outcomes_only(client, store):
    store.write_outcome(OutcomeRecord(
        idea_id=1,
        idea_title="Test Idea",
        outcome=TerminalOutcome.PUBLISHED,
        overall_score=85.0,
        emitted_at=datetime.now(),
    ))

    resp = client.get("/api/v1/activity")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["event_type"] == "outcome"
    assert data[0]["title"] == "Test Idea"
    assert data[0]["node_id"] == "ultra_magnus"
    assert data[0]["status"] == "published"


def test_activity_all_types_interleaved(client, store):
    now = datetime.now()

    store.write_outcome(OutcomeRecord(
        idea_id=1,
        idea_title="Oldest Outcome",
        outcome=TerminalOutcome.PUBLISHED,
        emitted_at=now - timedelta(hours=3),
    ))
    store.write_recommendation(ImprovementRecommendation(
        recommendation_id="rec-001",
        recommendation_type=RecommendationType.FRAMEWORK_ADDITION,
        title="Middle Recommendation",
        description="Test",
        suggested_change="Test change",
        scope=TargetScope.ALL_PERSONAS,
        emitted_at=now - timedelta(hours=2),
    ))
    store.write_patch(PersonaUpgradePatch(
        patch_id="patch-001",
        persona_id="christensen",
        patches=[PersonaFieldPatch(
            operation=PatchOperation.ADD,
            path="/frameworks/test",
            value={"description": "test"},
        )],
        rationale="Test patch",
        emitted_at=now - timedelta(hours=1),
    ))

    resp = client.get("/api/v1/activity")
    data = resp.json()
    assert len(data) == 3
    # Should be sorted by timestamp descending (newest first)
    assert data[0]["event_type"] == "patch"
    assert data[1]["event_type"] == "recommendation"
    assert data[2]["event_type"] == "outcome"


def test_activity_limit(client, store):
    for i in range(5):
        store.write_outcome(OutcomeRecord(
            idea_id=i,
            idea_title=f"Idea {i}",
            outcome=TerminalOutcome.PUBLISHED,
            emitted_at=datetime.now() - timedelta(minutes=i),
        ))

    resp = client.get("/api/v1/activity?limit=3")
    data = resp.json()
    assert len(data) == 3


def test_activity_required_fields(client, store):
    store.write_outcome(OutcomeRecord(
        idea_id=42,
        idea_title="Field Check",
        outcome=TerminalOutcome.REJECTED,
        emitted_at=datetime.now(),
    ))

    resp = client.get("/api/v1/activity")
    data = resp.json()
    assert len(data) == 1
    event = data[0]
    # All required fields present
    assert "event_type" in event
    assert "id" in event
    assert "title" in event
    assert "status" in event
    assert "node_id" in event
    assert "timestamp" in event
    assert "detail" in event
    assert isinstance(event["detail"], dict)
