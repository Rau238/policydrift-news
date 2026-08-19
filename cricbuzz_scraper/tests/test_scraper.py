"""Unit and component tests for HTML extraction and DOM parsing."""

import pytest
from cricbuzz_scraper.scraper import AsyncCricbuzzScraper
from cricbuzz_scraper.models import MatchState


MOCK_LIVE_SCORES_HTML = """
<html>
<body>
  <div class="cb-col cb-col-100 cb-ltst-wgt-hdr">
    <div class="cb-col cb-col-100 cb-lv-main">
      <div class="cb-lv-scr-mtch-hdr">Australia tour of India, 2026</div>
      <a class="cb-lv-scrs-well" href="/live-cricket-scores/105421/ind-vs-aus-1st-t20i">India vs Australia, 1st T20I</a>
      <div class="cb-hmscg-tm-sec">
        <div class="cb-ovr-flo cb-hmscg-tm-nm">IND</div>
        <div class="cb-lv-scrs-col"><span>198/4 (20.0)</span></div>
      </div>
      <div class="cb-hmscg-tm-sec">
        <div class="cb-ovr-flo cb-hmscg-tm-nm">AUS</div>
        <div class="cb-lv-scrs-col"><span>142/3 (15.2)</span></div>
      </div>
      <div class="cb-text-live">Australia need 57 runs in 28 balls</div>
    </div>
  </div>
  
  <div class="cb-col cb-col-100 cb-ltst-wgt-hdr">
    <div class="cb-col cb-col-100 cb-lv-main">
      <div class="cb-lv-scr-mtch-hdr">ICC World Cup 2026</div>
      <a class="cb-lv-scrs-well" href="/live-cricket-scores/105422/eng-vs-sa-final">England vs South Africa, Final</a>
      <div class="cb-hmscg-tm-sec">
        <div class="cb-ovr-flo cb-hmscg-tm-nm">ENG</div>
        <div class="cb-lv-scrs-col"><span>312/8 (50.0)</span></div>
      </div>
      <div class="cb-hmscg-tm-sec">
        <div class="cb-ovr-flo cb-hmscg-tm-nm">SA</div>
        <div class="cb-lv-scrs-col"><span>285 (48.1)</span></div>
      </div>
      <div class="cb-text-complete">England won by 27 runs</div>
    </div>
  </div>
</body>
</html>
"""

MOCK_MATCH_DETAIL_HTML = """
<html>
<body>
  <div class="cb-nav-main">
    <h1 class="cb-nav-hdr">India vs Australia, 1st T20I - Live Cricket Score</h1>
    <span class="cb-nav-subhdr">Australia tour of India 2026</span>
    <div class="cb-col-100 cb-font-12 text-gray">
      <span>Wankhede Stadium, Mumbai</span>
    </div>
  </div>
  
  <div class="cb-min-stts cb-text-live">Australia need 57 runs in 28 balls</div>
  
  <div class="cb-min-scrd">
    <div class="cb-col-100 cb-min-itm-rw">
      <div class="cb-min-bat-tm">IND</div>
      <div class="cb-min-bat-sc">198/4 (20.0 ov)</div>
    </div>
    <div class="cb-col-100 cb-min-itm-rw">
      <div class="cb-min-bat-tm">AUS *</div>
      <div class="cb-min-bat-sc">142/3 (15.2 ov)</div>
    </div>
  </div>

  <div class="cb-col-100 cb-min-inf">
    <div class="cb-col-100">
      <div class="cb-col">Batter</div><div class="cb-col">R</div><div class="cb-col">B</div><div class="cb-col">4s</div><div class="cb-col">6s</div><div class="cb-col">SR</div>
    </div>
    <div class="cb-col-100">
      <div class="cb-col">Glenn Maxwell *</div><div class="cb-col">45</div><div class="cb-col">22</div><div class="cb-col">3</div><div class="cb-col">4</div><div class="cb-col">204.5</div>
    </div>
    <div class="cb-col-100">
      <div class="cb-col">Marcus Stoinis</div><div class="cb-col">18</div><div class="cb-col">10</div><div class="cb-col">2</div><div class="cb-col">0</div><div class="cb-col">180.0</div>
    </div>
  </div>

  <div class="cb-col-100 cb-min-inf">
    <div class="cb-col-100">
      <div class="cb-col">Bowler</div><div class="cb-col">O</div><div class="cb-col">M</div><div class="cb-col">R</div><div class="cb-col">W</div><div class="cb-col">Econ</div>
    </div>
    <div class="cb-col-100">
      <div class="cb-col">Jasprit Bumrah</div><div class="cb-col">3.2</div><div class="cb-col">0</div><div class="cb-col">24</div><div class="cb-col">2</div><div class="cb-col">7.20</div>
    </div>
  </div>

  <div class="cb-col-100 cb-font-12">
    <span>CRR: 9.26</span> <span>RRR: 12.21</span> <span>Target: 199</span>
    <span>Partnership: 36(18)</span>
    <span>Recent: 1 4 6 . 1 2</span>
  </div>

  <div class="cb-com-ln">15.2 Bumrah to Maxwell, 2 runs, driven through deep cover</div>
  <div class="cb-com-ln">15.1 Bumrah to Stoinis, 1 run, tucked to square leg</div>
</body>
</html>
"""


def test_parse_live_scores_html():
    """Verify parsing of live scores listing page."""
    scraper = AsyncCricbuzzScraper()
    overview = scraper._parse_live_scores_html(MOCK_LIVE_SCORES_HTML)

    assert overview.total_count == 2
    assert len(overview.live_matches) == 1
    assert len(overview.recent_matches) == 1

    live_m = overview.live_matches[0]
    assert live_m.match_id == "105421"
    assert "India vs Australia" in live_m.title
    assert live_m.state == MatchState.LIVE
    assert live_m.team1_score == "198/4 (20.0)"
    assert live_m.team2_score == "142/3 (15.2)"

    rec_m = overview.recent_matches[0]
    assert rec_m.match_id == "105422"
    assert "England won by 27 runs" in rec_m.status
    assert rec_m.state == MatchState.COMPLETED


def test_parse_match_details_html():
    """Verify parsing of individual match live score details."""
    scraper = AsyncCricbuzzScraper()
    details = scraper._parse_match_details_html("105421", MOCK_MATCH_DETAIL_HTML)

    assert details.match_id == "105421"
    assert "India vs Australia" in details.title
    assert details.state == MatchState.LIVE
    assert details.status_text == "Australia need 57 runs in 28 balls"
    assert details.venue == "Wankhede Stadium, Mumbai"

    # Innings
    assert len(details.innings) == 2
    assert details.innings[0].team_name == "IND"
    assert details.innings[0].runs == 198
    assert details.innings[0].wickets == 4

    # Batsmen
    assert len(details.current_batsmen) == 2
    assert details.current_batsmen[0].name == "Glenn Maxwell"
    assert details.current_batsmen[0].runs == 45
    assert details.current_batsmen[0].is_striker is True

    # Bowler
    assert len(details.current_bowlers) == 1
    assert details.current_bowlers[0].name == "Jasprit Bumrah"
    assert details.current_bowlers[0].wickets == 2

    # Situational Metrics
    assert details.crr == 9.26
    assert details.rrr == 12.21
    assert details.target == 199
    assert details.partnership == "36(18)"
    assert details.recent_overs == "1 4 6 . 1 2"

    # Commentary
    assert len(details.recent_commentary) >= 2
