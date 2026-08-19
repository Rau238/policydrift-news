"""Pydantic data models for structured live football score data from Tribuna."""

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class FootballMatchState(str, Enum):
    LIVE = "LIVE"
    COMPLETED = "COMPLETED"
    UPCOMING = "UPCOMING"
    POSTPONED = "POSTPONED"
    CANCELLED = "CANCELLED"
    UNKNOWN = "UNKNOWN"


class FootballEvent(BaseModel):
    """Event in a football match (goal, card, substitution, VAR)."""
    minute: str = Field(..., description="Match minute, e.g. '45+2'' or '78''")
    event_type: str = Field(..., description="'goal', 'yellow_card', 'red_card', 'sub', 'penalty', 'var'")
    player_name: str = Field(..., description="Main player involved")
    assist_name: Optional[str] = Field(default=None, description="Assisting player or replaced player")
    team_side: str = Field(default="home", description="'home' or 'away'")
    score_after: Optional[str] = Field(default=None, description="Score snapshot after goal, e.g. '2-1'")


class FootballStats(BaseModel):
    """Head-to-head match statistics."""
    possession_home: Optional[int] = Field(default=50, description="Home possession percentage")
    possession_away: Optional[int] = Field(default=50, description="Away possession percentage")
    shots_home: Optional[int] = None
    shots_away: Optional[int] = None
    shots_on_target_home: Optional[int] = None
    shots_on_target_away: Optional[int] = None
    corners_home: Optional[int] = None
    corners_away: Optional[int] = None
    fouls_home: Optional[int] = None
    fouls_away: Optional[int] = None
    yellow_cards_home: Optional[int] = None
    yellow_cards_away: Optional[int] = None
    red_cards_home: Optional[int] = None
    red_cards_away: Optional[int] = None
    offsides_home: Optional[int] = None
    offsides_away: Optional[int] = None


class FootballPlayer(BaseModel):
    """Individual football player entry in lineups."""
    name: str = Field(..., description="Player name")
    number: Optional[int] = Field(default=None, description="Shirt number")
    position: Optional[str] = Field(default=None, description="Position: GK, DEF, MID, FWD")
    is_captain: bool = Field(default=False)
    is_starter: bool = Field(default=True)
    rating: Optional[float] = None


class FootballLineups(BaseModel):
    """Team starting lineups and substitutes."""
    home_formation: Optional[str] = Field(default=None, description="e.g. '4-3-3'")
    away_formation: Optional[str] = Field(default=None, description="e.g. '4-2-3-1'")
    home_starters: List[FootballPlayer] = Field(default_factory=list)
    away_starters: List[FootballPlayer] = Field(default_factory=list)
    home_subs: List[FootballPlayer] = Field(default_factory=list)
    away_subs: List[FootballPlayer] = Field(default_factory=list)
    home_coach: Optional[str] = None
    away_coach: Optional[str] = None


class FootballMatchSummary(BaseModel):
    """High-level summary of a football match for match center / lists."""
    match_id: str = Field(..., description="Unique slug or ID, e.g. 'dinamo-zagreb-vs-viking-fk'")
    title: str = Field(..., description="e.g. 'Dinamo Zagreb vs Viking'")
    league: str = Field(default="Football", description="League / Tournament name")
    state: FootballMatchState = Field(default=FootballMatchState.UNKNOWN)
    status_text: str = Field(..., description="e.g. '78'', 'FT', '20:00', 'HT'")
    minute: Optional[str] = Field(default=None, description="Current match minute")
    
    # Teams & Scores
    home_team: str = Field(..., description="Home team name")
    away_team: str = Field(..., description="Away team name")
    home_score: Optional[int] = Field(default=None, description="Home goals")
    away_score: Optional[int] = Field(default=None, description="Away goals")
    penalty_score: Optional[str] = Field(default=None, description="e.g. '4:5'")
    
    # Team Logos
    home_logo: Optional[str] = None
    away_logo: Optional[str] = None
    
    match_url: Optional[str] = Field(default=None, description="Tribuna match link")
    start_time: Optional[str] = Field(default=None, description="Kickoff ISO time or time string")
    
    last_updated: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="UTC ISO format"
    )


class DetailedFootballMatch(BaseModel):
    """Detailed football match page snapshot with events, stats, lineups."""
    match_id: str = Field(...)
    title: str = Field(...)
    league: str = Field(default="Football")
    round: Optional[str] = None
    state: FootballMatchState = Field(default=FootballMatchState.LIVE)
    status_text: str = Field(..., description="Status string: 'FT', '45+1'', '21:00'")
    minute: Optional[str] = None
    
    # Teams
    home_team: str = Field(...)
    away_team: str = Field(...)
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    penalty_score: Optional[str] = None
    
    home_logo: Optional[str] = None
    away_logo: Optional[str] = None
    
    venue: Optional[str] = None
    referee: Optional[str] = None
    attendance: Optional[str] = None
    
    events: List[FootballEvent] = Field(default_factory=list)
    stats: Optional[FootballStats] = None
    lineups: Optional[FootballLineups] = None
    
    match_url: Optional[str] = None
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class FootballOverview(BaseModel):
    """Aggregated live, recent, and upcoming football matches."""
    live_matches: List[FootballMatchSummary] = Field(default_factory=list)
    recent_matches: List[FootballMatchSummary] = Field(default_factory=list)
    upcoming_matches: List[FootballMatchSummary] = Field(default_factory=list)
    leagues: List[str] = Field(default_factory=list)
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
