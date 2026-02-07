#!/usr/bin/env python3
"""Snow-Town Loop Status Reporter.

Reads all three JSONL files and reports the current state of
the feedback loop.

Usage:
    python scripts/loop_status.py
"""

import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from contracts.store import ContractStore


def report_status() -> None:
    """Print feedback loop status report."""
    store = ContractStore()

    outcomes = store.read_outcomes(limit=10000)
    recommendations = store.read_recommendations(limit=10000)
    patches = store.read_patches(limit=10000)

    # Categorize recommendations
    pending_recs = [r for r in recommendations if r.status == "pending"]
    applied_recs = [r for r in recommendations if r.status == "applied"]
    persona_recs = [r for r in pending_recs if r.target_system == "persona"]
    claude_md_recs = [r for r in pending_recs if r.target_system == "claude_md"]
    pipeline_recs = [r for r in pending_recs if r.target_system == "pipeline"]

    # Categorize patches
    proposed_patches = [p for p in patches if p.status == "proposed"]
    applied_patches = [p for p in patches if p.status == "applied"]
    rejected_patches = [p for p in patches if p.status == "rejected"]

    # Outcome distribution
    outcome_counts: dict[str, int] = {}
    for o in outcomes:
        outcome_counts[o.outcome.value] = outcome_counts.get(o.outcome.value, 0) + 1

    # Oldest unprocessed items
    oldest_rec = None
    if pending_recs:
        oldest_rec = min(r.emitted_at for r in pending_recs)

    oldest_patch = None
    if proposed_patches:
        oldest_patch = min(p.emitted_at for p in proposed_patches)

    # Count completed cycles (outcome -> recommendation -> patch)
    patch_source_ids = set()
    for p in applied_patches:
        patch_source_ids.update(p.source_recommendation_ids)
    completed_cycles = len(patch_source_ids)

    # Print report
    print("=" * 60)
    print("  Snow-Town Feedback Loop Status")
    print(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    print(f"\n  Outcome Records:           {len(outcomes)}")
    for outcome, count in sorted(outcome_counts.items()):
        print(f"    - {outcome}: {count}")

    print(f"\n  Improvement Recommendations: {len(recommendations)}")
    print(f"    - Pending (persona):     {len(persona_recs)}")
    print(f"    - Pending (claude_md):   {len(claude_md_recs)}")
    print(f"    - Pending (pipeline):    {len(pipeline_recs)}")
    print(f"    - Applied:               {len(applied_recs)}")

    print(f"\n  Persona Patches:           {len(patches)}")
    print(f"    - Proposed (review):     {len(proposed_patches)}")
    print(f"    - Applied:               {len(applied_patches)}")
    print(f"    - Rejected:              {len(rejected_patches)}")

    print(f"\n  Completed Feedback Cycles: {completed_cycles}")

    if oldest_rec:
        age = datetime.now() - oldest_rec
        print(f"  Oldest Pending Rec:        {age.days}d {age.seconds // 3600}h ago")

    if oldest_patch:
        age = datetime.now() - oldest_patch
        print(f"  Oldest Pending Patch:      {age.days}d {age.seconds // 3600}h ago")

    # Health check
    print("\n  Health:")
    if not outcomes:
        print("    [!] No outcome records yet - run ideas through UM pipeline")
    elif not recommendations:
        print("    [!] No recommendations yet - run Sky-Lynx analyzer")
    elif not patches and persona_recs:
        print("    [!] Persona recommendations waiting - run persona_upgrader")
    elif proposed_patches:
        print(f"    [!] {len(proposed_patches)} patches awaiting human review")
    else:
        print("    [OK] Loop is flowing")

    print("=" * 60)

    store.close()


if __name__ == "__main__":
    report_status()
