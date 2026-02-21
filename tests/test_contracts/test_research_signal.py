"""Tests for ResearchSignal contract and ContractStore integration."""

from datetime import datetime

import pytest

from contracts.research_signal import ResearchSignal, SignalRelevance, SignalSource
from contracts.store import ContractStore


class TestResearchSignalModel:

    def test_minimal_valid_signal(self):
        signal = ResearchSignal(
            signal_id="sig-001",
            source=SignalSource.ARXIV_HF,
            title="Test Paper",
            summary="A test summary",
            relevance=SignalRelevance.HIGH,
        )
        assert signal.contract_version == "1.0.0"
        assert signal.signal_id == "sig-001"
        assert signal.source == SignalSource.ARXIV_HF
        assert signal.relevance == SignalRelevance.HIGH
        assert signal.tags == []
        assert signal.url is None
        assert signal.domain is None
        assert signal.raw_data is None
        assert signal.consumed_by is None

    def test_full_signal_with_all_fields(self):
        signal = ResearchSignal(
            signal_id="sig-042",
            source=SignalSource.TOOL_MONITOR,
            title="New MCP Framework",
            summary="A new framework for building MCP servers",
            url="https://example.com/mcp-framework",
            relevance=SignalRelevance.MEDIUM,
            relevance_rationale="Directly related to current tool stack",
            tags=["mcp", "framework", "tooling"],
            domain="developer-tools",
            raw_data={"stars": 1500, "language": "Python"},
            consumed_by="idea-surfacer",
            emitted_at=datetime(2026, 2, 20, 12, 0, 0),
        )
        assert signal.url == "https://example.com/mcp-framework"
        assert len(signal.tags) == 3
        assert signal.domain == "developer-tools"
        assert signal.raw_data["stars"] == 1500
        assert signal.consumed_by == "idea-surfacer"

    def test_roundtrip_serialization(self):
        signal = ResearchSignal(
            signal_id="sig-rt",
            source=SignalSource.DOMAIN_WATCH,
            title="Healthcare AI Trend",
            summary="Rising adoption of AI in home health",
            relevance=SignalRelevance.HIGH,
            tags=["healthcare", "ai"],
            domain="healthcare-ai",
        )
        json_str = signal.model_dump_json()
        restored = ResearchSignal.model_validate_json(json_str)
        assert restored.signal_id == signal.signal_id
        assert restored.source == signal.source
        assert restored.relevance == signal.relevance
        assert restored.tags == signal.tags

    def test_all_signal_sources(self):
        for source in SignalSource:
            signal = ResearchSignal(
                signal_id=f"sig-{source.value}",
                source=source,
                title="Test",
                summary="Test",
                relevance=SignalRelevance.LOW,
            )
            assert signal.source == source

    def test_all_relevance_levels(self):
        for rel in SignalRelevance:
            signal = ResearchSignal(
                signal_id=f"sig-{rel.value}",
                source=SignalSource.ARXIV_HF,
                title="Test",
                summary="Test",
                relevance=rel,
            )
            assert signal.relevance == rel

    def test_json_schema_has_contract_version(self):
        schema = ResearchSignal.model_json_schema()
        props = schema["properties"]
        assert "contract_version" in props
        assert "signal_id" in props
        assert "source" in props
        assert "relevance" in props


@pytest.fixture
def store(tmp_path):
    """Create a ContractStore with temp directory."""
    s = ContractStore(data_dir=tmp_path, db_path=tmp_path / "test.db")
    yield s
    s.close()


class TestContractStoreSignals:

    def test_write_and_read_signal(self, store):
        signal = ResearchSignal(
            signal_id="sig-001",
            source=SignalSource.ARXIV_HF,
            title="Attention Is All You Need v2",
            summary="Updated transformer architecture",
            relevance=SignalRelevance.HIGH,
        )
        store.write_signal(signal)

        signals = store.read_signals()
        assert len(signals) == 1
        assert signals[0].signal_id == "sig-001"
        assert signals[0].source == SignalSource.ARXIV_HF

    def test_query_signals_by_source(self, store):
        store.write_signal(ResearchSignal(
            signal_id="sig-a1", source=SignalSource.ARXIV_HF,
            title="Paper A", summary="A", relevance=SignalRelevance.HIGH,
        ))
        store.write_signal(ResearchSignal(
            signal_id="sig-t1", source=SignalSource.TOOL_MONITOR,
            title="Tool A", summary="A", relevance=SignalRelevance.MEDIUM,
        ))
        store.write_signal(ResearchSignal(
            signal_id="sig-a2", source=SignalSource.ARXIV_HF,
            title="Paper B", summary="B", relevance=SignalRelevance.LOW,
        ))

        arxiv = store.query_signals(source="arxiv_hf")
        assert len(arxiv) == 2
        tool = store.query_signals(source="tool_monitor")
        assert len(tool) == 1

    def test_query_signals_by_relevance(self, store):
        store.write_signal(ResearchSignal(
            signal_id="sig-h", source=SignalSource.ARXIV_HF,
            title="High", summary="H", relevance=SignalRelevance.HIGH,
        ))
        store.write_signal(ResearchSignal(
            signal_id="sig-m", source=SignalSource.ARXIV_HF,
            title="Medium", summary="M", relevance=SignalRelevance.MEDIUM,
        ))

        high = store.query_signals(relevance="high")
        assert len(high) == 1
        assert high[0].signal_id == "sig-h"

    def test_query_signals_by_domain(self, store):
        store.write_signal(ResearchSignal(
            signal_id="sig-d1", source=SignalSource.DOMAIN_WATCH,
            title="Healthcare", summary="H", relevance=SignalRelevance.HIGH,
            domain="healthcare-ai",
        ))
        store.write_signal(ResearchSignal(
            signal_id="sig-d2", source=SignalSource.DOMAIN_WATCH,
            title="DevTools", summary="D", relevance=SignalRelevance.MEDIUM,
            domain="developer-tools",
        ))

        healthcare = store.query_signals(domain="healthcare-ai")
        assert len(healthcare) == 1
        assert healthcare[0].title == "Healthcare"

    def test_query_signals_consumed_filter(self, store):
        store.write_signal(ResearchSignal(
            signal_id="sig-c1", source=SignalSource.ARXIV_HF,
            title="Consumed", summary="C", relevance=SignalRelevance.HIGH,
        ))
        store.write_signal(ResearchSignal(
            signal_id="sig-c2", source=SignalSource.ARXIV_HF,
            title="Not consumed", summary="N", relevance=SignalRelevance.HIGH,
        ))
        store.update_signal_consumed_by("sig-c1", "idea-surfacer")

        unconsumed = store.query_signals(consumed=False)
        assert len(unconsumed) == 1
        assert unconsumed[0].signal_id == "sig-c2"

        consumed = store.query_signals(consumed=True)
        assert len(consumed) == 1
        assert consumed[0].consumed_by == "idea-surfacer"

    def test_update_signal_consumed_by(self, store):
        store.write_signal(ResearchSignal(
            signal_id="sig-u1", source=SignalSource.TOOL_MONITOR,
            title="Test", summary="T", relevance=SignalRelevance.MEDIUM,
        ))
        store.update_signal_consumed_by("sig-u1", "sky-lynx-v2")

        signals = store.query_signals(consumed=True)
        assert len(signals) == 1
        assert signals[0].consumed_by == "sky-lynx-v2"

    def test_jsonl_append_only(self, store):
        store.write_signal(ResearchSignal(
            signal_id="sig-j1", source=SignalSource.ARXIV_HF,
            title="A", summary="A", relevance=SignalRelevance.HIGH,
        ))
        store.write_signal(ResearchSignal(
            signal_id="sig-j2", source=SignalSource.TOOL_MONITOR,
            title="B", summary="B", relevance=SignalRelevance.MEDIUM,
        ))

        jsonl = (store.data_dir / "research_signals.jsonl").read_text()
        lines = [l for l in jsonl.strip().splitlines() if l]
        assert len(lines) == 2

    def test_rebuild_includes_signals(self, store):
        store.write_signal(ResearchSignal(
            signal_id="sig-rb", source=SignalSource.ARXIV_HF,
            title="Rebuild Test", summary="R", relevance=SignalRelevance.HIGH,
        ))

        # Clear SQLite but keep JSONL
        conn = store._get_conn()
        conn.execute("DELETE FROM research_signals")
        conn.commit()
        assert len(store.query_signals()) == 0

        store.rebuild_sqlite()

        signals = store.query_signals()
        assert len(signals) >= 1
        assert signals[0].signal_id == "sig-rb"
