"""Tests for the ecosystem endpoint."""

from datetime import datetime

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


def test_ecosystem_empty(client):
    resp = client.get("/api/v1/ecosystem")
    assert resp.status_code == 200
    data = resp.json()
    assert data["loop_health"] == "idle"
    assert data["cycle_count"] == 0
    assert len(data["nodes"]) == 4
    assert len(data["edges"]) == 4
    for node in data["nodes"]:
        assert node["record_count"] == 0
        assert node["health_status"] == "idle"


def test_ecosystem_with_outcomes(client, store):
    store.write_outcome(OutcomeRecord(
        idea_id=1,
        idea_title="Test Idea",
        outcome=TerminalOutcome.PUBLISHED,
        overall_score=85.0,
        emitted_at=datetime.now(),
    ))

    resp = client.get("/api/v1/ecosystem")
    assert resp.status_code == 200
    data = resp.json()
    assert data["loop_health"] == "partial"

    um_node = next(n for n in data["nodes"] if n["node_id"] == "ultra_magnus")
    assert um_node["record_count"] == 1
    assert um_node["health_status"] == "healthy"
    assert um_node["breakdown"]["published"] == 1


def test_ecosystem_with_all_record_types(client, store):
    store.write_outcome(OutcomeRecord(
        idea_id=1,
        idea_title="Test",
        outcome=TerminalOutcome.PUBLISHED,
        emitted_at=datetime.now(),
    ))
    store.write_recommendation(ImprovementRecommendation(
        recommendation_id="rec-001",
        recommendation_type=RecommendationType.FRAMEWORK_ADDITION,
        target_system="persona",
        title="Add framework",
        description="Test",
        suggested_change="Test change",
        scope=TargetScope.ALL_PERSONAS,
        emitted_at=datetime.now(),
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
        emitted_at=datetime.now(),
    ))

    resp = client.get("/api/v1/ecosystem")
    data = resp.json()
    assert data["loop_health"] == "flowing"
    # The 3 core loop nodes should have records; research_agents may be 0
    core_nodes = [n for n in data["nodes"] if n["node_id"] != "research_agents"]
    assert all(n["record_count"] >= 1 for n in core_nodes)


def test_ecosystem_edge_counts(client, store):
    for i in range(3):
        store.write_outcome(OutcomeRecord(
            idea_id=i,
            idea_title=f"Idea {i}",
            outcome=TerminalOutcome.PUBLISHED,
            emitted_at=datetime.now(),
        ))

    resp = client.get("/api/v1/ecosystem")
    data = resp.json()
    um_sl_edge = next(e for e in data["edges"] if e["source"] == "ultra_magnus")
    assert um_sl_edge["total_records"] == 3
    assert um_sl_edge["recent_count"] == 3


def test_health_endpoint(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("ok", "degraded")
    assert "contract_store" in data["sources"]
