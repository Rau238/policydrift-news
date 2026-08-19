export type FootballMatchState = 'LIVE' | 'COMPLETED' | 'UPCOMING' | 'POSTPONED' | 'CANCELLED' | 'UNKNOWN';

export interface FootballEvent {
  minute: string;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'penalty' | 'var' | string;
  player_name: string;
  assist_name?: string | null;
  team_side: 'home' | 'away' | string;
  score_after?: string | null;
}

export interface FootballStats {
  possession_home?: number | null;
  possession_away?: number | null;
  shots_home?: number | null;
  shots_away?: number | null;
  shots_on_target_home?: number | null;
  shots_on_target_away?: number | null;
  corners_home?: number | null;
  corners_away?: number | null;
  fouls_home?: number | null;
  fouls_away?: number | null;
  yellow_cards_home?: number | null;
  yellow_cards_away?: number | null;
  red_cards_home?: number | null;
  red_cards_away?: number | null;
  offsides_home?: number | null;
  offsides_away?: number | null;
}

export interface FootballPlayer {
  name: string;
  number?: number | null;
  position?: string | null;
  is_captain?: boolean;
  is_starter?: boolean;
  rating?: number | null;
}

export interface FootballLineups {
  home_formation?: string | null;
  away_formation?: string | null;
  home_starters?: FootballPlayer[];
  away_starters?: FootballPlayer[];
  home_subs?: FootballPlayer[];
  away_subs?: FootballPlayer[];
  home_coach?: string | null;
  away_coach?: string | null;
}

export interface FootballMatchSummary {
  match_id: string;
  title: string;
  league: string;
  state: FootballMatchState;
  status_text: string;
  minute?: string | null;
  home_team: string;
  away_team: string;
  home_score?: number | null;
  away_score?: number | null;
  penalty_score?: string | null;
  home_logo?: string | null;
  away_logo?: string | null;
  match_url?: string | null;
  start_time?: string | null;
  last_updated?: string;
}

export interface DetailedFootballMatch {
  match_id: string;
  title: string;
  league: string;
  round?: string | null;
  state: FootballMatchState;
  status_text: string;
  minute?: string | null;
  home_team: string;
  away_team: string;
  home_score?: number | null;
  away_score?: number | null;
  penalty_score?: string | null;
  home_logo?: string | null;
  away_logo?: string | null;
  venue?: string | null;
  referee?: string | null;
  attendance?: string | null;
  events?: FootballEvent[];
  stats?: FootballStats | null;
  lineups?: FootballLineups | null;
  match_url?: string | null;
  last_updated?: string;
}

export interface FootballOverview {
  live_matches: FootballMatchSummary[];
  recent_matches: FootballMatchSummary[];
  upcoming_matches: FootballMatchSummary[];
  leagues: string[];
  last_updated: string;
}
