"""Tests for the agents endpoints."""

import pytest
from fastapi.testclient import TestClient

import yaml


@pytest.fixture()
def tmp_path(tmp_path_factory):
    return tmp_path_factory.mktemp("data")


@pytest.fixture()
def personas_dir(tmp_path):
    """Create mock persona YAML files in a temp directory."""
    personas = {
        "christensen": {
            "identity": {
                "name": "Clayton Christensen",
                "role": "Strategic Advisor",
                "background": "Harvard professor.",
                "era": "1990s-2020s",
                "notable_works": ["The Innovator's Dilemma"],
            },
            "voice": {
                "tone": ["Warm", "Professorial"],
                "phrases": ["Let me tell you a story..."],
                "style": ["Uses examples"],
            },
            "frameworks": {
                "disruption_theory": {"description": "Low-end disruption"},
                "jobs_to_be_done": {"description": "Hire products for jobs"},
            },
            "case_studies": {
                "steel_minimills": {"pattern": "Low-end disruption"},
            },
            "metadata": {
                "version": "1.0.0",
                "author": "Matthew",
                "created": "2025-01-14",
                "updated": "2025-01-14",
                "tags": ["business-strategy"],
                "category": "business-strategist",
            },
        },
        "hopper": {
            "identity": {
                "name": "Grace Hopper",
                "role": "Systems Architect",
                "background": "Navy rear admiral and computer scientist.",
            },
            "voice": {
                "tone": ["Direct"],
                "phrases": ["It's easier to ask forgiveness..."],
                "style": ["No-nonsense"],
            },
            "frameworks": {
                "compiler_design": {"description": "Compiler architecture"},
                "standardization": {"description": "Standards matter"},
                "systems_integration": {"description": "Systems thinking"},
            },
            "case_studies": {
                "first_compiler": {"pattern": "Pioneering new abstractions"},
                "cobol": {"pattern": "Standardization at scale"},
            },
            "metadata": {
                "version": "1.0.0",
                "author": "Matthew",
                "created": "2025-01-15",
                "updated": "2025-01-15",
                "tags": ["systems", "architecture"],
                "category": "technical-architect",
            },
        },
    }

    for pid, data in personas.items():
        persona_dir = tmp_path / pid
        persona_dir.mkdir()
        with open(persona_dir / "persona.yaml", "w") as f:
            yaml.dump(data, f)

    return tmp_path


@pytest.fixture()
def client(tmp_path, personas_dir, monkeypatch):
    import api.deps as deps_module
    from api.readers.academy_reader import AcademyReader
    from api.readers.um_reader import UMReader
    from contracts.store import ContractStore

    monkeypatch.setattr(deps_module, "_store", ContractStore(data_dir=tmp_path))
    monkeypatch.setattr(deps_module, "_academy", AcademyReader(personas_dir=personas_dir))
    monkeypatch.setattr(deps_module, "_um", UMReader(db_path=tmp_path / "nonexistent.db"))

    from api.main import app
    return TestClient(app)


def test_list_agents(client):
    resp = client.get("/api/v1/agents")
    assert resp.status_code == 200
    agents = resp.json()
    assert len(agents) == 2
    names = {a["name"] for a in agents}
    assert "Clayton Christensen" in names
    assert "Grace Hopper" in names


def test_list_agents_fields(client):
    resp = client.get("/api/v1/agents")
    agents = resp.json()
    christensen = next(a for a in agents if a["id"] == "christensen")
    assert christensen["role"] == "Strategic Advisor"
    assert christensen["category"] == "business-strategist"
    assert christensen["framework_count"] == 2
    assert christensen["case_study_count"] == 1
    assert christensen["status"] == "available"


def test_get_agent_detail(client):
    resp = client.get("/api/v1/agents/christensen")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Clayton Christensen"
    assert "Harvard professor" in data["background"]
    assert data["era"] == "1990s-2020s"
    assert "disruption_theory" in data["frameworks"]
    assert "jobs_to_be_done" in data["frameworks"]
    assert "steel_minimills" in data["case_studies"]
    assert data["voice_tone"] == ["Warm", "Professorial"]


def test_get_agent_not_found(client):
    resp = client.get("/api/v1/agents/nonexistent")
    assert resp.status_code == 404


def test_agent_detail_metadata(client):
    resp = client.get("/api/v1/agents/hopper")
    data = resp.json()
    assert data["metadata"]["version"] == "1.0.0"
    assert data["metadata"]["author"] == "Matthew"
    assert "systems" in data["metadata"]["tags"]
