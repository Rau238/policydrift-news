"""Pydantic data models for structured live cricket score data."""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class MatchState(str, Enum):
    LIVE = "LIVE"
    COMPLETED = "COMPLETED"
    UPCOMING = "UPCOMING"
    DELAYED = "DELAYED"
    ABANDONED = "ABANDONED"
    UNKNOWN = "UNKNOWN"


class BatsmanScore(BaseModel):
    """Live statistics for an active batsman."""
    name: str = Field(..., description="Batsman name")
    runs: int = Field(default=0, description="Runs scored")
    balls: int = Field(default=0, description="Balls faced")
    fours: int = Field(default=0, description="Number of 4s")
    sixes: int = Field(default=0, description="Number of 6s")
    strike_rate: float = Field(default=0.0, description="Batting strike rate")
    is_striker: bool = Field(default=False, description="True if batsman is currently facing")
    out_desc: Optional[str] = Field(default=None, description="Dismissal info if out, else 'batting'")


class BowlerFigures(BaseModel):
    """Live figures for a bowler."""
    name: str = Field(..., description="Bowler name")
    overs: float = Field(default=0.0, description="Overs bowled")
    maidens: int = Field(default=0, description="Maiden overs")
    runs: int = Field(default=0, description="Runs conceded")
    wickets: int = Field(default=0, description="Wickets taken")
    economy: float = Field(default=0.0, description="Economy rate")


class TeamInnings(BaseModel):
    """Scores and stats for a single innings."""
    team_name: str = Field(..., description="Team name or abbreviation")
    runs: Optional[int] = Field(default=None, description="Total runs")
    wickets: Optional[int] = Field(default=None, description="Wickets fallen")
    overs: Optional[float] = Field(default=None, description="Overs bowled in innings")
    score_str: str = Field(..., description="Raw string representation (e.g. '245/6 (42.3)')")
    is_batting: bool = Field(default=False, description="Whether this team is currently batting")
    is_declared: bool = Field(default=False, description="Whether innings is declared")


class InningsScorecard(BaseModel):
    """Complete scorecard for an individual innings (batting, bowling, extras)."""
    innings_id: Optional[int] = Field(default=None, description="Innings number (1, 2, 3, 4)")
    team_name: str = Field(..., description="Batting team name")
    runs: int = Field(default=0, description="Total runs")
    wickets: int = Field(default=0, description="Total wickets fallen")
    overs: float = Field(default=0.0, description="Total overs bowled")
    run_rate: Optional[float] = Field(default=None, description="Innings run rate")
    score_str: str = Field(..., description="String representation e.g. '462/10 (116.4 ov)'")
    is_declared: bool = Field(default=False, description="Whether declared")
    is_follow_on: bool = Field(default=False, description="Whether follow on")
    batsmen: List[BatsmanScore] = Field(default_factory=list, description="All batsmen in this innings")
    bowlers: List[BowlerFigures] = Field(default_factory=list, description="All bowlers in this innings")
    extras: Optional[str] = Field(default=None, description="Extras summary (e.g. '12 (b 4, lb 2, w 5, nb 1)')")


class MatchSummary(BaseModel):
    """High-level summary of a cricket match from match listings."""
    match_id: str = Field(..., description="Unique Cricbuzz match ID")
    title: str = Field(..., description="Match title, e.g. 'India vs England, 2nd Test'")
    series: Optional[str] = Field(default=None, description="Tournament or series name")
    match_type: Optional[str] = Field(default=None, description="T20, ODI, Test, League")
    state: MatchState = Field(default=MatchState.UNKNOWN, description="State of the match")
    status: str = Field(..., description="Live status or match outcome description")
    venue: Optional[str] = Field(default=None, description="Stadium / City venue")
    match_url: Optional[str] = Field(default=None, description="Full or relative URL to match")
    
    # Quick score snapshot
    team1_name: Optional[str] = None
    team1_score: Optional[str] = None
    team2_name: Optional[str] = None
    team2_score: Optional[str] = None
    
    last_updated: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Timestamp when data was fetched (UTC ISO format)"
    )


class DetailedLiveMatch(BaseModel):
    """Detailed live score or completed match snapshot."""
    match_id: str = Field(..., description="Cricbuzz match identifier")
    title: str = Field(..., description="Full match title")
    series: Optional[str] = Field(default=None, description="Series / tournament name")
    match_format: Optional[str] = Field(default=None, description="T20I / ODI / Test / T20")
    state: MatchState = Field(default=MatchState.LIVE, description="Current match state (LIVE, COMPLETED, UPCOMING)")
    status_text: str = Field(..., description="Match situation or final result description")
    venue: Optional[str] = Field(default=None, description="Match venue")
    toss: Optional[str] = Field(default=None, description="Toss outcome")
    winner: Optional[str] = Field(default=None, description="Winning team name")
    player_of_the_match: Optional[str] = Field(default=None, description="Man of the Match / POTM")
    
    # Teams & Scores
    innings: List[TeamInnings] = Field(default_factory=list, description="Summary of all innings in the match")
    full_scorecard: List[InningsScorecard] = Field(default_factory=list, description="Full innings scorecards (all batsmen & bowlers)")
    current_batting_team: Optional[str] = Field(default=None, description="Team currently batting")
    current_bowling_team: Optional[str] = Field(default=None, description="Team currently bowling")
    
    # Active Players (for Live Matches)
    current_batsmen: List[BatsmanScore] = Field(default_factory=list, description="Active batsmen on crease")
    current_bowlers: List[BowlerFigures] = Field(default_factory=list, description="Current and recent bowlers")
    
    # Situational Metrics
    crr: Optional[float] = Field(default=None, description="Current Run Rate")
    rrr: Optional[float] = Field(default=None, description="Required Run Rate (if chasing)")
    target: Optional[int] = Field(default=None, description="Target runs (if chasing)")
    partnership: Optional[str] = Field(default=None, description="Current wicket partnership runs/balls")
    last_wicket: Optional[str] = Field(default=None, description="Information on last fallen wicket")
    recent_overs: Optional[str] = Field(default=None, description="Summary of balls in recent overs")
    
    # Live Commentary Snippets
    recent_commentary: List[str] = Field(default_factory=list, description="Latest commentary items")
    
    last_updated: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Timestamp of score snapshot (UTC ISO format)"
    )


class LiveMatchesOverview(BaseModel):
    """Categorized overview of all matches retrieved from live scores index."""
    live_matches: List[MatchSummary] = Field(default_factory=list)
    recent_matches: List[MatchSummary] = Field(default_factory=list)
    upcoming_matches: List[MatchSummary] = Field(default_factory=list)
    total_count: int = Field(default=0)
    scraped_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
