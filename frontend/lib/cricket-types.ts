export type MatchState = 'LIVE' | 'COMPLETED' | 'UPCOMING' | 'PREVIEW';

export interface BatsmanScore {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  is_striker?: boolean;
  out_desc?: string | null;
}

export interface BowlerFigures {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface TeamInnings {
  team_name: string;
  runs?: number | null;
  wickets?: number | null;
  overs?: number | null;
  score_str: string;
  is_batting?: boolean;
  is_declared?: boolean;
}

export interface InningsScorecard {
  innings_id: number;
  team_name: string;
  runs: number;
  wickets: number;
  overs: number;
  run_rate?: number | null;
  score_str: string;
  is_declared: boolean;
  is_follow_on: boolean;
  batsmen: BatsmanScore[];
  bowlers: BowlerFigures[];
  extras?: string | null;
}

export interface MatchSummary {
  match_id: string | number;
  title: string;
  series?: string | null;
  match_format?: string | null;
  state: MatchState;
  status: string;
  team1_score?: string | null;
  team2_score?: string | null;
  result_text?: string | null;
  match_url?: string | null;
}

export interface DetailedLiveMatch {
  match_id: string | number;
  title: string;
  series?: string | null;
  match_format?: string | null;
  state: MatchState;
  status_text: string;
  venue?: string | null;
  toss?: string | null;
  winner?: string | null;
  player_of_the_match?: string | null;
  innings: TeamInnings[];
  full_scorecard?: InningsScorecard[];
  current_batting_team?: string | null;
  current_bowling_team?: string | null;
  current_batsmen: BatsmanScore[];
  current_bowlers: BowlerFigures[];
  crr?: number | null;
  rrr?: number | null;
  target?: number | null;
  partnership?: string | null;
  last_wicket?: string | null;
  recent_overs?: string | null;
  recent_commentary: string[];
  last_updated: string;
}

export interface LiveMatchesOverview {
  live_matches: MatchSummary[];
  recent_matches: MatchSummary[];
  upcoming_matches: MatchSummary[];
  timestamp: string;
}
