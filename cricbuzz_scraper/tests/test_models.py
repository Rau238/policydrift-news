"""Unit tests for Cricbuzz scraper models and parsing helpers."""

import pytest
from cricbuzz_scraper.models import (
    BatsmanScore,
    BowlerFigures,
    DetailedLiveMatch,
    LiveMatchesOverview,
    MatchState,
    MatchSummary,
    TeamInnings,
)
from cricbuzz_scraper.scraper import _parse_score_string, _infer_match_state


def test_parse_score_string():
    """Test score string parser with various formats."""
    # Standard format with overs
    res1 = _parse_score_string("284/7 (48.3 ov)")
    assert res1["runs"] == 284
    assert res1["wickets"] == 7
    assert res1["overs"] == 48.3

    # All out format without explicit wickets
    res2 = _parse_score_string("185 (34.2 ov)")
    assert res2["runs"] == 185
    assert res2["wickets"] == 10
    assert res2["overs"] == 34.2

    # Simple score without overs
    res3 = _parse_score_string("112/3")
    assert res3["runs"] == 112
    assert res3["wickets"] == 3
    assert res3["overs"] is None


def test_infer_match_state():
    """Test match state inference."""
    assert _infer_match_state("India won by 6 wkts") == MatchState.COMPLETED
    assert _infer_match_state("Match tied") == MatchState.COMPLETED
    assert _infer_match_state("Australia need 34 runs in 18 balls") == MatchState.LIVE
    assert _infer_match_state("Day 3: Stumps - England lead by 84 runs") == MatchState.LIVE
    assert _infer_match_state("Starts at 7:30 PM IST") == MatchState.UPCOMING
    assert _infer_match_state("Match delayed due to wet outfield") == MatchState.DELAYED
    assert _infer_match_state("Match abandoned without a ball bowled") == MatchState.ABANDONED


def test_detailed_match_json_serialization():
    """Test Pydantic model serialization to structured JSON."""
    match = DetailedLiveMatch(
        match_id="92834",
        title="India vs Australia, 3rd T20I",
        series="Australia Tour of India 2026",
        state=MatchState.LIVE,
        status_text="India need 24 runs in 12 balls",
        venue="M. Chinnaswamy Stadium, Bengaluru",
        innings=[
            TeamInnings(team_name="AUS", runs=186, wickets=6, overs=20.0, score_str="186/6 (20.0 ov)"),
            TeamInnings(team_name="IND", runs=163, wickets=4, overs=18.0, score_str="163/4 (18.0 ov)", is_batting=True),
        ],
        current_batsmen=[
            BatsmanScore(name="Virat Kohli", runs=68, balls=42, fours=6, sixes=3, strike_rate=161.9, is_striker=True),
            BatsmanScore(name="Hardik Pandya", runs=24, balls=11, fours=2, sixes=2, strike_rate=218.18, is_striker=False),
        ],
        current_bowlers=[
            BowlerFigures(name="Mitchell Starc", overs=3.0, maidens=0, runs=32, wickets=1, economy=10.67)
        ],
        crr=9.05,
        rrr=12.0,
        target=187,
        partnership="48 runs (22 balls)",
        recent_overs="1 4 6 1 2 1 | 4 W 1 1 6",
    )

    json_str = match.model_dump_json()
    assert "India vs Australia" in json_str
    assert "Virat Kohli" in json_str
    assert "Mitchell Starc" in json_str

    # Validate roundtrip deserialization
    restored = DetailedLiveMatch.model_validate_json(json_str)
    assert restored.match_id == "92834"
    assert len(restored.current_batsmen) == 2
    assert restored.current_batsmen[0].name == "Virat Kohli"
    assert restored.target == 187
