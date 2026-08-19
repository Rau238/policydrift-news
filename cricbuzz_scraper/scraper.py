"""Core Playwright Scraper implementation for extracting live cricket scores from Cricbuzz."""

import asyncio
import re
from typing import Dict, List, Optional, Any, Union
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Browser, BrowserContext, Page, Playwright

from .config import (
    BASE_URL,
    LIVE_SCORES_URL,
    LIVE_SCORES_RECENT_URL,
    LIVE_SCORES_UPCOMING_URL,
    DEFAULT_BROWSER_CONFIG,
    DEFAULT_CONTEXT_CONFIG,
    PAGE_TIMEOUT_MS,
    NAVIGATION_TIMEOUT_MS,
    ELEMENT_TIMEOUT_MS,
    SELECTORS,
)
from .logger import get_logger
from .models import (
    BatsmanScore,
    BowlerFigures,
    DetailedLiveMatch,
    InningsScorecard,
    LiveMatchesOverview,
    MatchState,
    MatchSummary,
    TeamInnings,
)

logger = get_logger("cricbuzz.scraper")


def _parse_score_string(score_text: str) -> Dict[str, Any]:
    """Extracts runs, wickets, overs from strings like '284/7 (48.3 ov)' or '152 (20 ov)'."""
    result: Dict[str, Any] = {
        "runs": None,
        "wickets": None,
        "overs": None,
        "score_str": score_text.strip(),
    }
    if not score_text:
        return result

    # Match runs/wickets e.g. 284/7 or 284
    score_match = re.search(r"(\d+)(?:/(\d+))?", score_text)
    if score_match:
        result["runs"] = int(score_match.group(1))
        result["wickets"] = int(score_match.group(2)) if score_match.group(2) is not None else 10

    # Match overs e.g. (48.3) or (50 ov)
    overs_match = re.search(r"\(([\d\.]+)(?:\s*ov)?\)", score_text, re.IGNORECASE)
    if overs_match:
        try:
            result["overs"] = float(overs_match.group(1))
        except ValueError:
            pass

    return result


def _infer_match_state(status_text: str) -> MatchState:
    """Infers match state from status string."""
    text = (status_text or "").lower()
    if any(term in text for term in ["won by", "complete", "match tied", "no result", "drawn"]):
        return MatchState.COMPLETED
    if any(term in text for term in ["opt to", "need ", "trail by", "lead by", "day ", "stumps", "innings break", "lunch", "tea", "rain delay"]):
        return MatchState.LIVE
    if any(term in text for term in ["starts at", "match starts", "upcoming", "scheduled", "preview"]):
        return MatchState.UPCOMING
    if any(term in text for term in ["delayed", "delay"]):
        return MatchState.DELAYED
    if any(term in text for term in ["abandoned", "cancelled"]):
        return MatchState.ABANDONED
    return MatchState.LIVE


class AsyncCricbuzzScraper:
    """Asynchronous Playwright scraper for Cricbuzz live cricket scores."""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self._playwright: Optional[Playwright] = None
        self._browser: Optional[Browser] = None
        self._context: Optional[BrowserContext] = None
        self._intercepted_api_data: Dict[str, Any] = {}

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def start(self) -> None:
        """Initializes Playwright browser and anti-detection context."""
        if self._browser is not None:
            return

        logger.info("Initializing Playwright browser context...")
        self._playwright = await async_playwright().start()
        browser_config = DEFAULT_BROWSER_CONFIG.copy()
        browser_config["headless"] = self.headless

        self._browser = await self._playwright.chromium.launch(**browser_config)
        self._context = await self._browser.new_context(**DEFAULT_CONTEXT_CONFIG)

        # Inject stealth scripts to avoid bot detection
        await self._context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            window.chrome = {
                runtime: {}
            };
        """)

    async def close(self) -> None:
        """Clean up browser resources."""
        if self._context:
            await self._context.close()
            self._context = None
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None
        logger.info("Playwright scraper closed successfully.")

    async def _create_page(self) -> Page:
        """Helper to create and configure a new page with response interception."""
        if not self._context:
            await self.start()
        assert self._context is not None

        page = await self._context.new_page()
        page.set_default_timeout(PAGE_TIMEOUT_MS)
        page.set_default_navigation_timeout(NAVIGATION_TIMEOUT_MS)

        # Intercept Cricbuzz internal API telemetry if triggered in background
        async def handle_response(response):
            try:
                url = response.url
                if "/api/mcenter/" in url and response.status == 200:
                    content_type = response.headers.get("content-type", "")
                    if "json" in content_type:
                        data = await response.json()
                        match_id_match = re.search(r"/api/mcenter/(?:comm|header|score)/(\d+)", url)
                        if match_id_match:
                            m_id = match_id_match.group(1)
                            self._intercepted_api_data[m_id] = data
                            logger.debug(f"Intercepted API response for match {m_id}")
            except Exception:
                pass

        page.on("response", handle_response)
        return page

    async def get_live_matches_overview(self) -> LiveMatchesOverview:
        """Fetches all ongoing, recent, and upcoming matches from the live scores hub."""
        page = await self._create_page()
        try:
            logger.info(f"Navigating to live scores page: {LIVE_SCORES_URL}")
            await page.goto(LIVE_SCORES_URL, wait_until="domcontentloaded")

            # Wait for match cards to render
            try:
                await page.wait_for_selector(
                    "div.cb-col.cb-col-100.cb-lv-main, div.cb-mtch-lst, div.cb-ltst-wgt-hdr",
                    timeout=ELEMENT_TIMEOUT_MS,
                )
            except Exception as e:
                logger.warning(f"Selector timeout on live scores page, attempting fallback parsing: {e}")

            # Small sleep to ensure dynamic JS components render
            await asyncio.sleep(1.0)

            content = await page.content()
            overview = self._parse_live_scores_html(content)
            logger.info(
                f"Successfully parsed live scores: {len(overview.live_matches)} Live, "
                f"{len(overview.recent_matches)} Recent, {len(overview.upcoming_matches)} Upcoming."
            )
            return overview
        except Exception as e:
            logger.error(f"Error fetching live matches overview: {e}", exc_info=True)
            raise
        finally:
            await page.close()

    def _parse_live_scores_html(self, html_content: str) -> LiveMatchesOverview:
        """Parses the live scores index HTML supporting both classic and modern Cricbuzz layouts."""
        soup = BeautifulSoup(html_content, "html.parser")
        overview = LiveMatchesOverview()
        seen_ids = set()

        # Strategy 1: Classic cb-col layout
        match_cards = soup.select(
            "div.cb-col.cb-col-100.cb-lv-main, div.cb-mtch-lst, div.cb-ltst-wgt-hdr"
        )

        if match_cards:
            for card in match_cards:
                try:
                    title_elem = card.select_one("a.cb-lv-scrs-well, a.text-hvr-underline, h3 a, h2 a")
                    if not title_elem:
                        continue

                    title = title_elem.get_text(strip=True)
                    match_href = title_elem.get("href", "")
                    full_url = urljoin(BASE_URL, match_href) if match_href else None

                    match_id = ""
                    id_match = re.search(r"/(\d+)/", match_href or "")
                    if id_match:
                        match_id = id_match.group(1)
                    else:
                        match_id = str(abs(hash(title)) % 1000000)

                    if match_id in seen_ids:
                        continue
                    seen_ids.add(match_id)

                    series_elem = card.select_one(".cb-lv-scr-mtch-hdr, .cb-col-100.cb-font-12.text-gray")
                    series = series_elem.get_text(strip=True) if series_elem else None

                    status_elem = card.select_one(
                        "div.cb-text-live, div.cb-text-complete, div.cb-text-preview, "
                        "div.cb-text-inprogress, div.cb-min-stts, div.cb-text-gray"
                    )
                    if not status_elem:
                        status_elem = card.select_one("div.cb-col-100.cb-font-12.cb-text-gray")
                    
                    status_text = status_elem.get_text(strip=True) if status_elem else "In Progress"

                    score_items = card.select("div.cb-lv-scrs-col, div.cb-scr-wgt-itm, div.cb-hmscg-tm-sec")
                    team1_name, team1_score = None, None
                    team2_name, team2_score = None, None

                    team_rows = card.select(".cb-ovr-flo.cb-hmscg-tm-nm, div.cb-col-50")
                    if len(team_rows) >= 2:
                        team1_name = team_rows[0].get_text(strip=True)
                        team2_name = team_rows[1].get_text(strip=True)

                    score_spans = card.select(".cb-lv-scrs-col span, .cb-ovr-flo")
                    scores_extracted = []
                    for s in score_spans:
                        t = s.get_text(strip=True)
                        if re.search(r"\d+/\d+|\d+\s*\(\d+", t):
                            scores_extracted.append(t)

                    if len(scores_extracted) >= 1:
                        team1_score = scores_extracted[0]
                    if len(scores_extracted) >= 2:
                        team2_score = scores_extracted[1]

                    state = _infer_match_state(status_text)

                    summary = MatchSummary(
                        match_id=match_id,
                        title=title,
                        series=series,
                        state=state,
                        status=status_text,
                        match_url=full_url,
                        team1_name=team1_name,
                        team1_score=team1_score,
                        team2_name=team2_name,
                        team2_score=team2_score,
                    )

                    if state == MatchState.LIVE:
                        overview.live_matches.append(summary)
                    elif state == MatchState.COMPLETED:
                        overview.recent_matches.append(summary)
                    else:
                        overview.upcoming_matches.append(summary)

                except Exception as item_err:
                    logger.debug(f"Error parsing individual match card: {item_err}")
                    continue

        # Strategy 2: Modern Cricbuzz DOM layout (if classic cards not found)
        if not overview.live_matches and not overview.recent_matches and not overview.upcoming_matches:
            score_links = soup.find_all("a", href=lambda h: h and "/live-cricket-scores/" in h)
            for a_elem in score_links:
                try:
                    href = a_elem.get("href", "")
                    id_match = re.search(r"/(\d+)/", href)
                    if not id_match:
                        continue
                    match_id = id_match.group(1)
                    if match_id in seen_ids:
                        continue

                    full_url = urljoin(BASE_URL, href)

                    raw_title_attr = a_elem.get("title", "")
                    title = ""
                    status_text = ""

                    if " - " in raw_title_attr:
                        parts = raw_title_attr.split(" - ", 1)
                        title = parts[0].strip()
                        status_text = parts[1].strip()
                    elif raw_title_attr:
                        title = raw_title_attr.strip()
                        status_text = "In Progress"

                    if not title:
                        title = a_elem.get_text(" ", strip=True)

                    series = None
                    parent_block = a_elem.find_parent("div", class_="mb-3") or a_elem.find_parent("div")
                    if parent_block:
                        series_elem = parent_block.find("a", href=lambda h: h and "/cricket-series/" in h)
                        if series_elem:
                            series = series_elem.get_text(strip=True)

                    state = _infer_match_state(status_text) if status_text else MatchState.LIVE

                    badge = a_elem.find("span", class_=lambda c: c and "cb-live" in str(c).lower()) or a_elem.find(string=lambda t: t and "LIVE" in str(t).upper())
                    if badge and state != MatchState.COMPLETED:
                        state = MatchState.LIVE

                    summary = MatchSummary(
                        match_id=match_id,
                        title=title,
                        series=series,
                        state=state,
                        status=status_text or ("Live" if state == MatchState.LIVE else "Scheduled"),
                        match_url=full_url,
                    )
                    seen_ids.add(match_id)

                    if state == MatchState.LIVE:
                        overview.live_matches.append(summary)
                    elif state == MatchState.COMPLETED:
                        overview.recent_matches.append(summary)
                    else:
                        overview.upcoming_matches.append(summary)
                except Exception as e:
                    logger.debug(f"Error parsing modern link {a_elem}: {e}")

        overview.total_count = len(overview.live_matches) + len(overview.recent_matches) + len(overview.upcoming_matches)
        return overview

    async def get_recent_matches(self) -> LiveMatchesOverview:
        """Fetches all recent and completed matches from the recent matches tab."""
        page = await self._create_page()
        try:
            logger.info(f"Navigating to recent matches page: {LIVE_SCORES_RECENT_URL}")
            await page.goto(LIVE_SCORES_RECENT_URL, wait_until="domcontentloaded")
            await asyncio.sleep(1.0)
            content = await page.content()
            overview = self._parse_live_scores_html(content)
            logger.info(f"Fetched {len(overview.recent_matches)} recent/completed matches.")
            return overview
        except Exception as e:
            logger.error(f"Error fetching recent matches: {e}", exc_info=True)
            raise
        finally:
            await page.close()

    async def get_match_details(self, match_id_or_url: Union[str, int]) -> DetailedLiveMatch:
        """Fetches complete live score snapshot or completed match full scorecard."""
        identifier = str(match_id_or_url).strip()
        match_id = identifier
        target_url = None

        if identifier.startswith("http"):
            target_url = identifier
            id_match = re.search(r"/(\d+)(?:/|$)", target_url)
            if id_match:
                match_id = id_match.group(1)
        else:
            # Try finding the slug from live matches overview first
            try:
                overview = await self.get_live_matches_overview()
                for m in overview.live_matches + overview.recent_matches + overview.upcoming_matches:
                    if m.match_id == identifier and m.match_url:
                        target_url = m.match_url
                        break
            except Exception as res_err:
                logger.debug(f"Could not resolve match URL from overview: {res_err}")

            if not target_url:
                target_url = f"{BASE_URL}/live-cricket-scorecard/{match_id}/match-scorecard"

        page = await self._create_page()
        try:
            # 1. Fetch live commentary / miniscore telemetry
            comm_data = None
            try:
                comm_url = f"{BASE_URL}/api/mcenter/comm/{match_id}"
                comm_res = await page.request.get(
                    comm_url,
                    headers={
                        "Referer": target_url,
                        "User-Agent": DEFAULT_CONTEXT_CONFIG["user_agent"],
                    },
                )
                if comm_res.status == 200:
                    comm_data = await comm_res.json()
            except Exception as api_err:
                logger.debug(f"Comm API request skipped: {api_err}")

            # 2. Fetch full scorecard API (contains all complete innings, all batsmen, all bowlers)
            scorecard_data = None
            try:
                sc_url = f"{BASE_URL}/api/mcenter/scorecard/{match_id}"
                sc_res = await page.request.get(
                    sc_url,
                    headers={
                        "Referer": target_url,
                        "User-Agent": DEFAULT_CONTEXT_CONFIG["user_agent"],
                    },
                )
                if sc_res.status == 200:
                    scorecard_data = await sc_res.json()
            except Exception as sc_err:
                logger.debug(f"Scorecard API request skipped: {sc_err}")

            # 3. Navigate to match page to render full DOM
            logger.info(f"Navigating to match {match_id}: {target_url}")
            await page.goto(target_url, referer=LIVE_SCORES_URL, wait_until="domcontentloaded")

            try:
                await page.wait_for_selector(
                    "div.cb-col-67.cb-scrs-wrp, div.cb-min-bat-rw, div.cb-nav-main, div.cb-min-scrd, div.cb-ltst-wgt-hdr, div.page-wrapper",
                    timeout=ELEMENT_TIMEOUT_MS,
                )
            except Exception:
                logger.debug("Selector wait timed out, continuing with available DOM...")

            await asyncio.sleep(0.8)
            content = await page.content()

            # Parse DOM
            match_details = self._parse_match_details_html(match_id, content)

            # Fuse with commentary telemetry
            combined_comm = comm_data or self._intercepted_api_data.get(match_id)
            if combined_comm:
                self._fuse_api_data(match_details, combined_comm)

            # Fuse with full scorecard data
            if scorecard_data:
                self._fuse_scorecard_data(match_details, scorecard_data)

            logger.info(f"Parsed match details for {match_details.title} [{match_details.status_text}]")
            return match_details
        except Exception as e:
            logger.error(f"Error fetching match details for {match_id}: {e}", exc_info=True)
            raise
        finally:
            await page.close()

    def _parse_match_details_html(self, match_id: str, html_content: str) -> DetailedLiveMatch:
        """Parses live scorecard / mini commentary page HTML into a DetailedLiveMatch object."""
        soup = BeautifulSoup(html_content, "html.parser")

        # 1. Match Header Title
        header_elem = soup.select_one("h1.cb-nav-hdr, h1, .cb-nav-main h1")
        title = header_elem.get_text(strip=True) if header_elem else f"Match {match_id}"
        title = re.sub(r"\s*-\s*Live Cricket Score.*$", "", title, flags=re.IGNORECASE)

        # 2. Status text
        status_elem = soup.select_one(
            "div.cb-text-live, div.cb-text-complete, div.cb-text-inprogress, "
            "div.cb-min-stts, div.text-cbTxtLive, div.cb-text-gray"
        )
        status_text = status_elem.get_text(strip=True) if status_elem else "In Progress"
        state = _infer_match_state(status_text)

        # 3. Series & Venue details
        series_elem = soup.select_one("span.cb-nav-subhdr, div.cb-nav-subhdr, .cb-col-100.cb-font-12.text-gray")
        series = series_elem.get_text(strip=True) if series_elem else None

        venue_elem = soup.select_one(".cb-col-100.cb-font-12.text-gray span")
        venue = venue_elem.get_text(strip=True) if venue_elem else None

        # 4. Innings Scores
        innings_list: List[TeamInnings] = []
        score_rows = soup.select("div.cb-col-100.cb-min-itm-rw, div.cb-scrs-tbl div.cb-col-100")
        for row in score_rows:
            team_lbl = row.select_one(".cb-min-bat-tm, .cb-col-50, .cb-hmscg-tm-nm")
            score_lbl = row.select_one(".cb-min-bat-sc, .cb-col-50.text-right, .cb-ovr-flo")
            if team_lbl and score_lbl:
                t_name = team_lbl.get_text(strip=True)
                s_val = score_lbl.get_text(strip=True)
                if t_name and s_val and any(char.isdigit() for char in s_val):
                    p = _parse_score_string(s_val)
                    innings_list.append(
                        TeamInnings(
                            team_name=t_name,
                            runs=p["runs"],
                            wickets=p["wickets"],
                            overs=p["overs"],
                            score_str=s_val,
                            is_batting="*" in t_name or "*" in s_val,
                        )
                    )

        # 5. Batsmen Table
        batsmen: List[BatsmanScore] = []
        batsman_section = soup.select("div.cb-col-100.cb-min-inf div.cb-col-100")
        for item in batsman_section:
            cols = item.select("div.cb-col")
            if len(cols) >= 5:
                name_col = cols[0].get_text(strip=True)
                if name_col and not any(h in name_col.lower() for h in ["batsman", "bowler", "batter"]):
                    is_striker = "*" in name_col
                    clean_name = name_col.replace("*", "").strip()
                    try:
                        runs = int(cols[1].get_text(strip=True) or 0)
                        balls = int(cols[2].get_text(strip=True) or 0)
                        fours = int(cols[3].get_text(strip=True) or 0)
                        sixes = int(cols[4].get_text(strip=True) or 0)
                        sr = float(cols[5].get_text(strip=True) or 0.0) if len(cols) > 5 else (round((runs / balls * 100), 2) if balls > 0 else 0.0)
                        batsmen.append(
                            BatsmanScore(
                                name=clean_name,
                                runs=runs,
                                balls=balls,
                                fours=fours,
                                sixes=sixes,
                                strike_rate=sr,
                                is_striker=is_striker,
                            )
                        )
                    except (ValueError, IndexError):
                        pass

        # 6. Bowler Table
        bowlers: List[BowlerFigures] = []
        bowler_section = soup.select("div.cb-col-100.cb-min-inf ~ div.cb-col-100.cb-min-inf div.cb-col-100")
        for item in bowler_section:
            cols = item.select("div.cb-col")
            if len(cols) >= 5:
                name_col = cols[0].get_text(strip=True)
                if name_col and not any(h in name_col.lower() for h in ["bowler", "batsman"]):
                    try:
                        overs = float(cols[1].get_text(strip=True) or 0.0)
                        maidens = int(cols[2].get_text(strip=True) or 0)
                        runs = int(cols[3].get_text(strip=True) or 0)
                        wickets = int(cols[4].get_text(strip=True) or 0)
                        econ = float(cols[5].get_text(strip=True) or 0.0) if len(cols) > 5 else (round(runs / overs, 2) if overs > 0 else 0.0)
                        bowlers.append(
                            BowlerFigures(
                                name=name_col,
                                overs=overs,
                                maidens=maidens,
                                runs=runs,
                                wickets=wickets,
                                economy=econ,
                            )
                        )
                    except (ValueError, IndexError):
                        pass

        # 7. Situational Metrics: CRR, RRR, Partnership, Recent Balls
        crr, rrr, target, partnership, recent_overs = None, None, None, None, None
        meta_items = soup.select(".cb-col-100.cb-font-12, .cb-min-rcnt, .cb-text-gray, .cb-col-100 span")
        for meta in meta_items:
            m_text = meta.get_text(" ", strip=True)
            if "CRR:" in m_text and crr is None:
                crr_match = re.search(r"CRR:\s*([\d\.]+)", m_text)
                if crr_match:
                    try:
                        crr = float(crr_match.group(1))
                    except ValueError:
                        pass
            if ("RRR:" in m_text or "Req RR:" in m_text) and rrr is None:
                rrr_match = re.search(r"(?:RRR|Req RR):\s*([\d\.]+)", m_text)
                if rrr_match:
                    try:
                        rrr = float(rrr_match.group(1))
                    except ValueError:
                        pass
            if "Target:" in m_text and target is None:
                tgt_match = re.search(r"Target:\s*(\d+)", m_text)
                if tgt_match:
                    try:
                        target = int(tgt_match.group(1))
                    except ValueError:
                        pass
            if "Partnership:" in m_text and partnership is None:
                p_match = re.search(r"Partnership:\s*([^,\n\r]+?)(?=\s+(?:Recent|CRR|RRR|Target|$))", m_text, re.IGNORECASE)
                if p_match:
                    partnership = p_match.group(1).strip()
            if ("Recent:" in m_text or "Recent balls" in m_text) and recent_overs is None:
                r_match = re.search(r"(?:Recent|Recent balls):\s*([0-9\.\s\w\|]+)", m_text, re.IGNORECASE)
                if r_match:
                    recent_overs = r_match.group(1).strip()

        # 8. Recent Commentary Snippets
        commentary: List[str] = []
        comm_items = soup.select("p.cb-com-ln, div.cb-com-ln, .cb-com-ln, div.cb-col-100.cb-com-ln, div.cb-comm-item")
        for c in comm_items[:8]:
            c_text = c.get_text(" ", strip=True)
            if c_text:
                commentary.append(c_text)

        return DetailedLiveMatch(
            match_id=match_id,
            title=title,
            series=series,
            state=state,
            status_text=status_text,
            venue=venue,
            innings=innings_list,
            current_batsmen=batsmen,
            current_bowlers=bowlers,
            crr=crr,
            rrr=rrr,
            target=target,
            partnership=partnership,
            recent_overs=recent_overs,
            recent_commentary=commentary,
        )

    def _fuse_api_data(self, match: DetailedLiveMatch, api_payload: Dict[str, Any]) -> None:
        """Enriches match details with low-latency Cricbuzz internal API telemetry."""
        try:
            header = api_payload.get("matchHeader", {})
            miniscore = api_payload.get("miniscore", {})

            if header:
                team1 = header.get("team1", {}).get("name") or header.get("team1", {}).get("shortName") or "Team 1"
                team2 = header.get("team2", {}).get("name") or header.get("team2", {}).get("shortName") or "Team 2"
                desc = header.get("matchDescription", "")
                match.title = f"{team1} vs {team2}, {desc}".strip(", ")
                match.series = header.get("seriesName") or match.series
                match.match_format = header.get("matchFormat")
                match.status_text = header.get("status") or match.status_text
                match.state = _infer_match_state(match.status_text)
                toss_winner = header.get("tossResults", {}).get("tossWinnerName")
                toss_decision = header.get("tossResults", {}).get("decision")
                if toss_winner and toss_decision:
                    match.toss = f"{toss_winner} elected to {toss_decision.lower()}"

            if miniscore:
                # CRR, RRR, Target
                if "currentRunRate" in miniscore and miniscore["currentRunRate"]:
                    match.crr = float(miniscore["currentRunRate"])
                if "requiredRunRate" in miniscore and miniscore["requiredRunRate"]:
                    match.rrr = float(miniscore["requiredRunRate"])
                if "target" in miniscore and miniscore["target"]:
                    match.target = int(miniscore["target"])
                if "recentOvsStats" in miniscore and miniscore["recentOvsStats"]:
                    match.recent_overs = str(miniscore["recentOvsStats"])
                if "lastWicket" in miniscore and miniscore["lastWicket"]:
                    match.last_wicket = str(miniscore["lastWicket"])

                # Partnership
                if "partnerShip" in miniscore and miniscore["partnerShip"]:
                    p = miniscore["partnerShip"]
                    match.partnership = f"{p.get('runs', 0)} runs ({p.get('balls', 0)} balls)"

                # Innings list from batTeamScoreObj
                innings_list: List[TeamInnings] = []
                bat_obj = miniscore.get("batTeamScoreObj", {})
                if bat_obj and "teamInningsArray" in bat_obj:
                    for inn in bat_obj["teamInningsArray"]:
                        t_name = inn.get("batTeamName") or bat_obj.get("teamName", "Team")
                        runs = inn.get("score", 0)
                        wkts = inn.get("wickets", 0)
                        ovs = inn.get("overs", 0.0)
                        innings_list.append(
                            TeamInnings(
                                team_name=t_name,
                                runs=runs,
                                wickets=wkts,
                                overs=float(ovs),
                                score_str=f"{runs}/{wkts} ({ovs} ov)",
                                is_batting=True,
                                is_declared=bool(inn.get("isDeclared", False)),
                            )
                        )
                if innings_list:
                    match.innings = innings_list

                # Active Batsmen
                batsmen: List[BatsmanScore] = []
                striker = miniscore.get("batsmanStriker")
                if striker and striker.get("name"):
                    batsmen.append(
                        BatsmanScore(
                            name=striker["name"],
                            runs=int(striker.get("runs", 0)),
                            balls=int(striker.get("balls", 0)),
                            fours=int(striker.get("fours", 0)),
                            sixes=int(striker.get("sixes", 0)),
                            strike_rate=float(striker.get("strikeRate", 0.0)),
                            is_striker=True,
                        )
                    )
                non_striker = miniscore.get("batsmanNonStriker")
                if non_striker and non_striker.get("name"):
                    batsmen.append(
                        BatsmanScore(
                            name=non_striker["name"],
                            runs=int(non_striker.get("runs", 0)),
                            balls=int(non_striker.get("balls", 0)),
                            fours=int(non_striker.get("fours", 0)),
                            sixes=int(non_striker.get("sixes", 0)),
                            strike_rate=float(non_striker.get("strikeRate", 0.0)),
                            is_striker=False,
                        )
                    )
                if batsmen:
                    match.current_batsmen = batsmen

                # Current Bowlers
                bowlers: List[BowlerFigures] = []
                bowler_s = miniscore.get("bowlerStriker")
                if bowler_s and bowler_s.get("name"):
                    bowlers.append(
                        BowlerFigures(
                            name=bowler_s["name"],
                            overs=float(bowler_s.get("overs", 0.0)),
                            maidens=int(bowler_s.get("maidens", 0)),
                            runs=int(bowler_s.get("runs", 0)),
                            wickets=int(bowler_s.get("wickets", 0)),
                            economy=float(bowler_s.get("economy", 0.0)),
                        )
                    )
                bowler_ns = miniscore.get("bowlerNonStriker")
                if bowler_ns and bowler_ns.get("name"):
                    bowlers.append(
                        BowlerFigures(
                            name=bowler_ns["name"],
                            overs=float(bowler_ns.get("overs", 0.0)),
                            maidens=int(bowler_ns.get("maidens", 0)),
                            runs=int(bowler_ns.get("runs", 0)),
                            wickets=int(bowler_ns.get("wickets", 0)),
                            economy=float(bowler_ns.get("economy", 0.0)),
                        )
                    )
                if bowlers:
                    match.current_bowlers = bowlers

            # Commentary items
            comm_list = api_payload.get("matchCommentary", {}).get("commentaryList", [])
            if comm_list:
                parsed_comm = []
                for item in comm_list[:6]:
                    comm_text = item.get("commText", "")
                    # Clean tags like B0$ or B1$
                    clean_comm = re.sub(r"B\d+\$|\\\\n", " ", comm_text).strip()
                    ovs = item.get("overNumber")
                    if ovs is not None and clean_comm:
                        parsed_comm.append(f"{ovs:.1f}: {clean_comm}")
                    elif clean_comm:
                        parsed_comm.append(clean_comm)
                if parsed_comm:
                    match.recent_commentary = parsed_comm

        except Exception as e:
            logger.debug(f"Error fusing API payload: {e}")

    def _fuse_scorecard_data(self, match: DetailedLiveMatch, sc_payload: Dict[str, Any]) -> None:
        """Parses complete innings scorecards, player-level stats, extras, and awards for completed/active matches."""
        try:
            match_header = sc_payload.get("matchHeader", {})
            if match_header:
                if sc_payload.get("isMatchComplete") or match_header.get("complete"):
                    match.state = MatchState.COMPLETED

                # Result & Winner
                res_obj = match_header.get("result", {})
                if res_obj:
                    winning_team = res_obj.get("winningTeam")
                    win_desc = str(res_obj.get("winningMargin") or "")
                    if winning_team:
                        match.winner = winning_team
                    if win_desc:
                        win_by_runs = res_obj.get("winByRuns")
                        win_by_inns = res_obj.get("winByInnings")
                        if win_by_runs:
                            match.status_text = f"{winning_team} won by {win_desc} runs"
                        elif win_by_inns:
                            match.status_text = f"{winning_team} won by an innings and {win_desc} runs"
                        elif not win_desc.lower().startswith("won"):
                            match.status_text = f"{winning_team} won by {win_desc}"
                        else:
                            match.status_text = win_desc

                # Player of the match
                potm = match_header.get("playersOfTheMatch", [])
                if potm and isinstance(potm, list) and len(potm) > 0:
                    match.player_of_the_match = potm[0].get("name")

            # Parse full innings scorecard
            scorecard_list = sc_payload.get("scoreCard", [])
            if scorecard_list:
                full_sc_list: List[InningsScorecard] = []
                summary_innings: List[TeamInnings] = []

                for idx, inn in enumerate(scorecard_list):
                    inn_id = inn.get("inningsId", idx + 1)
                    bat_details = inn.get("batTeamDetails", {})
                    team_name = (
                        bat_details.get("batTeamShortName")
                        or bat_details.get("batTeamName")
                        or inn.get("batTeamName")
                        or (match_header.get("team1", {}).get("shortName") if inn_id % 2 == 1 else match_header.get("team2", {}).get("shortName", f"Innings {inn_id}"))
                    )

                    score_details = inn.get("scoreDetails", {})
                    runs = int(score_details.get("runs", 0))
                    wkts = int(score_details.get("wickets", 0))
                    ovs = float(score_details.get("overs", 0.0))
                    run_rate = float(score_details.get("runRate", 0.0)) if score_details.get("runRate") is not None else None
                    is_dec = bool(score_details.get("isDeclared", False))
                    is_fo = bool(score_details.get("isFollowOn", False))

                    dec_str = " d" if is_dec else ""
                    sc_str = f"{runs}/{wkts}{dec_str} ({ovs} ov)"

                    # Batsmen list
                    batsmen: List[BatsmanScore] = []
                    b_dict = inn.get("batTeamDetails", {}).get("batsmenData", {})
                    for _, b in b_dict.items():
                        b_name = b.get("batName")
                        if b_name:
                            batsmen.append(
                                BatsmanScore(
                                    name=b_name,
                                    runs=int(b.get("runs", 0)),
                                    balls=int(b.get("balls", 0)),
                                    fours=int(b.get("fours", 0)),
                                    sixes=int(b.get("sixes", 0)),
                                    strike_rate=float(b.get("strikeRate", 0.0)),
                                    out_desc=b.get("outDesc") or "not out",
                                )
                            )

                    # Bowlers list
                    bowlers: List[BowlerFigures] = []
                    bw_dict = inn.get("bowlTeamDetails", {}).get("bowlersData", {})
                    for _, bw in bw_dict.items():
                        bw_name = bw.get("bowlName")
                        if bw_name:
                            bowlers.append(
                                BowlerFigures(
                                    name=bw_name,
                                    overs=float(bw.get("overs", 0.0)),
                                    maidens=int(bw.get("maidens", 0)),
                                    runs=int(bw.get("runs", 0)),
                                    wickets=int(bw.get("wickets", 0)),
                                    economy=float(bw.get("economy", 0.0)),
                                )
                            )

                    # Extras
                    extras_info = None
                    ex_dict = inn.get("extrasData", {})
                    if ex_dict:
                        t_ex = ex_dict.get("total", 0)
                        b_ex = ex_dict.get("byes", 0)
                        lb_ex = ex_dict.get("legByes", 0)
                        w_ex = ex_dict.get("wides", 0)
                        nb_ex = ex_dict.get("noBalls", 0)
                        extras_info = f"{t_ex} (b {b_ex}, lb {lb_ex}, w {w_ex}, nb {nb_ex})"

                    full_sc_list.append(
                        InningsScorecard(
                            innings_id=inn_id,
                            team_name=team_name,
                            runs=runs,
                            wickets=wkts,
                            overs=ovs,
                            run_rate=run_rate,
                            score_str=sc_str,
                            is_declared=is_dec,
                            is_follow_on=is_fo,
                            batsmen=batsmen,
                            bowlers=bowlers,
                            extras=extras_info,
                        )
                    )

                    summary_innings.append(
                        TeamInnings(
                            team_name=team_name,
                            runs=runs,
                            wickets=wkts,
                            overs=ovs,
                            score_str=sc_str,
                            is_declared=is_dec,
                        )
                    )

                if full_sc_list:
                    match.full_scorecard = full_sc_list
                if summary_innings:
                    match.innings = summary_innings

        except Exception as e:
            logger.debug(f"Error fusing scorecard payload: {e}")


class CricbuzzScraper:
    """Synchronous wrapper for AsyncCricbuzzScraper for easy CLI and script usage."""

    def __init__(self, headless: bool = True):
        self.headless = headless

    def get_live_matches(self) -> LiveMatchesOverview:
        """Synchronously fetch overview of all live/recent matches."""
        async def _run():
            async with AsyncCricbuzzScraper(headless=self.headless) as scraper:
                return await scraper.get_live_matches_overview()

        return asyncio.run(_run())

    def get_recent_matches(self) -> LiveMatchesOverview:
        """Synchronously fetch all completed/recent matches."""
        async def _run():
            async with AsyncCricbuzzScraper(headless=self.headless) as scraper:
                return await scraper.get_recent_matches()

        return asyncio.run(_run())

    def get_match_score(self, match_id_or_url: Union[str, int]) -> DetailedLiveMatch:
        """Synchronously fetch match scorecard (both live and completed)."""
        async def _run():
            async with AsyncCricbuzzScraper(headless=self.headless) as scraper:
                return await scraper.get_match_details(match_id_or_url)

        return asyncio.run(_run())
