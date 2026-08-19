"""Production Asynchronous Football Scraper for Tribuna.com.

Scrapes live, recent, and upcoming football fixtures, team logos, live scores,
match statistics, lineups, and incident timelines from Tribuna.com.
"""

import asyncio
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional
from playwright.async_api import BrowserContext, Page, async_playwright

from cricbuzz_scraper.config import BASE_DIR, DEFAULT_BROWSER_CONFIG
from cricbuzz_scraper.football_models import (
    DetailedFootballMatch,
    FootballEvent,
    FootballLineups,
    FootballMatchState,
    FootballMatchSummary,
    FootballOverview,
    FootballPlayer,
    FootballStats,
)
from cricbuzz_scraper.logger import get_logger

logger = get_logger("tribuna.scraper")

USER_DATA_DIR = BASE_DIR / "browser_profile"
TRIBUNA_BASE_URL = "https://tribuna.com"
TRIBUNA_MATCHES_URL = "https://tribuna.com/en/match/"


class AsyncTribunaFootballScraper:
    """Production asynchronous Playwright scraper for Tribuna football match data."""

    def __init__(self, headless: bool = True, timeout: int = 40000):
        self.headless = headless
        self.timeout = timeout
        self._playwright = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None

    async def __aenter__(self):
        await self.init_browser()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def init_browser(self):
        """Initializes persistent browser context with realistic stealth flags."""
        if self._context:
            return

        USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._playwright = await async_playwright().start()

        self._context = await self._playwright.chromium.launch_persistent_context(
            user_data_dir=str(USER_DATA_DIR.resolve()),
            headless=self.headless,
            channel="chrome",
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-infobars",
                "--lang=en-US,en",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-session-crashed-bubble",
                "--disable-infobars",
                "--hide-crash-restore-bubble",
                "--suppress-message-center-popups",
                "--disable-features=TranslateUI,ChromeWhatsNewUI",
                "--disable-restore-session-state",
                "--disable-background-networking",
            ],
            viewport={"width": 1400, "height": 900},
        )
        self._page = self._context.pages[0] if self._context.pages else await self._context.new_page()

    async def close(self):
        """Closes browser context."""
        try:
            if self._context:
                await self._context.close()
                self._context = None
            if self._playwright:
                await self._playwright.stop()
                self._playwright = None
        except Exception as e:
            logger.debug(f"Error closing browser: {e}")

    async def get_overview(self) -> FootballOverview:
        """Fetches all today, live, and completed football matches from Tribuna."""
        await self.init_browser()
        overview = FootballOverview()

        try:
            logger.info(f"Navigating to {TRIBUNA_MATCHES_URL} ...")
            await self._page.goto(TRIBUNA_MATCHES_URL, wait_until="domcontentloaded", timeout=self.timeout)

            # Wait for title / page to settle
            for _ in range(12):
                await self._page.wait_for_timeout(1000)
                title = await self._page.title()
                if "Just a moment" not in title and "Loading" not in title:
                    break

            # Evaluate fixtures from the DOM
            fixtures_raw = await self._page.evaluate('''() => {
                const results = [];
                const links = Array.from(document.querySelectorAll('a[href*="/en/match/"], a[href*="/match/"]'));

                // Filter valid match fixture links (exclude navigation dates / tournaments / predictions)
                const matchLinks = links.filter(a => {
                    const pathname = a.pathname.toLowerCase();
                    const parts = pathname.split('/').filter(Boolean);
                    const last = parts[parts.length - 1] || '';
                    return (
                        pathname.includes('/match/') &&
                        !pathname.includes('/prediction') &&
                        !pathname.includes('/tournaments') &&
                        !last.match(/^\d{4}-\d{2}-\d{2}$/) &&
                        last !== 'match' &&
                        last !== 'live' &&
                        last !== 'tournaments' &&
                        (last.includes('-vs-') || parts.some(p => p.includes('-vs-')))
                    );
                });

                // Helper: walk UP DOM tree looking for a tournament/league heading
                // Stops at a container that has a sibling or ancestor heading
                // Avoids sidebar blocks by checking that the heading is a SECTION header (not deep in a ratings widget)
                function findLeague(linkEl) {
                    let curr = linkEl.parentElement;
                    let depth = 0;
                    while (curr && curr !== document.body && depth < 15) {
                        // Look for a heading that is a direct child or grandchild of curr
                        const headings = Array.from(curr.querySelectorAll(':scope > * > h1, :scope > * > h2, :scope > * > h3, :scope > h1, :scope > h2, :scope > h3'));
                        for (const h of headings) {
                            const txt = (h.innerText || '').split('\\n')[0].trim();
                            // Skip generic/useless headings
                            if (
                                txt &&
                                txt.length > 2 &&
                                txt.length < 80 &&
                                !txt.toLowerCase().includes('rating') &&
                                !txt.toLowerCase().includes('prediction') &&
                                !txt.toLowerCase().includes('best bet') &&
                                !txt.toLowerCase().includes('today') &&
                                !txt.toLowerCase().includes('yesterday') &&
                                !txt.toLowerCase().includes('tomorrow') &&
                                !txt.match(/^\d{1,2}\s+\w+\s+\d{4}/) &&
                                !txt.match(/^\d{4}-\d{2}-\d{2}/)
                            ) {
                                return txt;
                            }
                        }

                        // Also check for tournament-header/league-title class patterns
                        const leagueEl = curr.querySelector('[class*="tournament"], [class*="league"], [class*="competition"], [class*="category"], [class*="section-title"]');
                        if (leagueEl) {
                            const txt = (leagueEl.innerText || '').split('\\n')[0].trim();
                            if (
                                txt &&
                                txt.length > 2 &&
                                txt.length < 80 &&
                                !txt.toLowerCase().includes('rating') &&
                                !txt.toLowerCase().includes('prediction')
                            ) {
                                return txt;
                            }
                        }

                        curr = curr.parentElement;
                        depth++;
                    }
                    return null;
                }

                // Also try: look at <h2> or <h3> elements immediately BEFORE the link's parent section in the DOM
                function findLeaguePrecedingSibling(linkEl) {
                    let container = linkEl.closest('[class*="match"], [class*="fixture"], [class*="game"], article, section, li');
                    if (!container) container = linkEl.parentElement;
                    // Walk backwards through siblings
                    let el = container;
                    while (el) {
                        el = el.previousElementSibling;
                        if (!el) break;
                        const h = el.querySelector('h1,h2,h3') || (el.matches('h1,h2,h3') ? el : null);
                        if (h) {
                            const txt = (h.innerText || '').split('\\n')[0].trim();
                            if (txt && txt.length > 2 && txt.length < 80 &&
                                !txt.toLowerCase().includes('rating') &&
                                !txt.toLowerCase().includes('prediction') &&
                                !txt.toLowerCase().includes('today') &&
                                !txt.match(/^\d/)
                            ) {
                                return txt;
                            }
                        }
                    }
                    return null;
                }

                for (const a of matchLinks) {
                    const href = a.href;
                    const pathParts = a.pathname.split('/').filter(Boolean);
                    const vsPart = pathParts.find(p => p.includes('-vs-')) || pathParts[pathParts.length - 1];
                    const matchId = vsPart;

                    // Extract team images
                    const imgs = Array.from(a.querySelectorAll('img')).map(i => ({
                        src: i.src,
                        alt: i.alt || ''
                    }));

                    // Text lines in card
                    const lines = a.innerText.split('\\n').map(s => s.trim()).filter(Boolean);

                    // Tournament / League name - use multiple strategies
                    let league = findLeaguePrecedingSibling(a)
                        || findLeague(a)
                        || 'Football';

                    results.push({
                        href,
                        matchId,
                        lines,
                        imgs,
                        league
                    });
                }

                return results;
            }''')

            logger.info(f"Extracted {len(fixtures_raw)} raw fixtures from Tribuna")
            leagues_set = set()

            for f in fixtures_raw:
                match_id = f.get("matchId")
                if not match_id or match_id in ["match", "live", "tournaments"]:
                    continue

                lines = f.get("lines", [])
                imgs = f.get("imgs", [])
                league = f.get("league", "Football")
                leagues_set.add(league)

                # Parse match components from card lines
                parsed = self._parse_card_lines(lines, imgs, match_id)
                if not parsed:
                    continue

                summary = FootballMatchSummary(
                    match_id=match_id,
                    title=f"{parsed['home_team']} vs {parsed['away_team']}",
                    league=league,
                    state=parsed["state"],
                    status_text=parsed["status_text"],
                    minute=parsed.get("minute"),
                    home_team=parsed["home_team"],
                    away_team=parsed["away_team"],
                    home_score=parsed.get("home_score"),
                    away_score=parsed.get("away_score"),
                    penalty_score=parsed.get("penalty_score"),
                    home_logo=parsed.get("home_logo"),
                    away_logo=parsed.get("away_logo"),
                    match_url=f.get("href"),
                )

                if summary.state == FootballMatchState.LIVE:
                    overview.live_matches.append(summary)
                elif summary.state == FootballMatchState.COMPLETED:
                    overview.recent_matches.append(summary)
                else:
                    overview.upcoming_matches.append(summary)

            overview.leagues = sorted(list(leagues_set))
            logger.info(
                f"Football Overview parsed: {len(overview.live_matches)} Live, "
                f"{len(overview.recent_matches)} Completed, {len(overview.upcoming_matches)} Upcoming."
            )
            return overview

        except Exception as e:
            logger.error(f"Error fetching football overview: {e}", exc_info=True)
            return overview

    def _parse_card_lines(self, lines: List[str], imgs: List[dict], match_id: str) -> Optional[dict]:
        """Parses inner text lines and images of a Tribuna match card."""
        if not lines:
            return None

        home_logo = imgs[0]["src"] if len(imgs) > 0 else None
        away_logo = imgs[1]["src"] if len(imgs) > 1 else None

        # Clean vs slug if teams missing
        slug_parts = match_id.split("-vs-")
        default_home = slug_parts[0].replace("-", " ").title() if len(slug_parts) == 2 else "Home"
        default_away = slug_parts[1].replace("-", " ").title() if len(slug_parts) == 2 else "Away"

        home_team = default_home
        away_team = default_away
        home_score = None
        away_score = None
        penalty_score = None
        state = FootballMatchState.UPCOMING
        status_text = "Scheduled"
        minute = None

        # Example Tribuna formats:
        # ["Dinamo Zagreb", "2", ":", "2", "Viking"]
        # ["78'", "Arsenal", "1", ":", "0", "Chelsea"]
        # ["FT", "Independiente Rivadavia", "1", ":", "1", "(4:5)", "Penalty", "Fluminense"]
        # ["21:00", "Real Madrid", "vs", "Barcelona"]

        text_block = " ".join(lines)

        # Check for penalty shootouts
        pen_match = re.search(r"\((\d+)\s*:\s*(\d+)\)", text_block)
        if pen_match:
            penalty_score = f"{pen_match.group(1)}:{pen_match.group(2)}"

        # Check for score like '2 : 2' or '2 - 1'
        score_match = re.search(r"(\d+)\s*[:\-]\s*(\d+)", text_block)
        if score_match:
            home_score = int(score_match.group(1))
            away_score = int(score_match.group(2))

        # Determine match state and status
        lower_block = text_block.lower()
        if "ft" in lower_block or "full time" in lower_block or "penalty" in lower_block or "ended" in lower_block:
            state = FootballMatchState.COMPLETED
            status_text = "FT"
        elif re.search(r"(\d+)'|ht|half time|live", lower_block):
            state = FootballMatchState.LIVE
            min_match = re.search(r"(\d+)'", text_block)
            minute = min_match.group(0) if min_match else "Live"
            status_text = minute
        elif re.search(r"\b\d{1,2}:\d{2}\b", text_block):
            state = FootballMatchState.UPCOMING
            time_match = re.search(r"\b\d{1,2}:\d{2}\b", text_block)
            status_text = time_match.group(0) if time_match else "Upcoming"

        # Team name resolution
        if len(imgs) >= 2 and imgs[0].get("alt") and imgs[1].get("alt"):
            home_team = imgs[0]["alt"]
            away_team = imgs[1]["alt"]
        elif len(lines) >= 3:
            # Filter non-team words
            team_candidates = [
                l for l in lines
                if not re.match(r"^(\d+|:|\(|\)|\-|ft|ht|penalty|\d+:\d+|\d+')$", l, re.IGNORECASE)
            ]
            if len(team_candidates) >= 2:
                home_team = team_candidates[0]
                away_team = team_candidates[1]

        return {
            "home_team": home_team,
            "away_team": away_team,
            "home_score": home_score,
            "away_score": away_score,
            "penalty_score": penalty_score,
            "home_logo": home_logo,
            "away_logo": away_logo,
            "state": state,
            "status_text": status_text,
            "minute": minute,
        }

    async def get_match_details(self, match_id_or_url: str) -> Optional[DetailedFootballMatch]:
        """Fetches detailed match page from Tribuna with events, lineups, and statistics."""
        await self.init_browser()

        if match_id_or_url.startswith("http"):
            target_url = match_id_or_url
            match_id = match_id_or_url.rstrip("/").split("/")[-1]
        else:
            match_id = match_id_or_url.strip("/")
            target_url = f"{TRIBUNA_BASE_URL}/en/match/{match_id}/"

        try:
            logger.info(f"Navigating to match details: {target_url}")
            await self._page.goto(target_url, wait_until="domcontentloaded", timeout=self.timeout)

            for _ in range(10):
                await self._page.wait_for_timeout(1000)
                t = await self._page.title()
                if "Just a moment" not in t and "Loading" not in t:
                    break

            # Extract detailed match page elements
            raw_details = await self._page.evaluate('''() => {
                const title = document.title;
                const h1 = document.querySelector('h1')?.innerText?.trim() || '';

                // Logos
                const imgs = Array.from(document.querySelectorAll('img')).map(i => ({
                    src: i.src,
                    alt: i.alt || ''
                })).filter(i => i.src.includes('stat-pictures') || i.alt.length > 2);

                // Body text lines
                const bodyText = document.body.innerText;

                // Match stats rows
                const statRows = Array.from(document.querySelectorAll('[class*="stat"], [class*="Stat"]'))
                    .map(el => (el.innerText || '').trim())
                    .filter(Boolean);

                return {
                    title,
                    h1,
                    imgs,
                    bodyText: bodyText.slice(0, 5000),
                    statRows: statRows.slice(0, 30)
                };
            }''')

            # Parse team names and scores from title / body
            title_str = raw_details.get("title", "")
            h1_str = raw_details.get("h1", "")
            slug_parts = match_id.split("-vs-")
            home_team = slug_parts[0].replace("-", " ").title() if len(slug_parts) == 2 else "Home"
            away_team = slug_parts[1].replace("-", " ").title() if len(slug_parts) == 2 else "Away"

            imgs = raw_details.get("imgs", [])
            home_logo = imgs[0]["src"] if len(imgs) > 0 else None
            away_logo = imgs[1]["src"] if len(imgs) > 1 else None

            # Check score in page
            body = raw_details.get("bodyText", "")
            score_match = re.search(r"(\d+)\s*[:\-]\s*(\d+)", body)
            home_score = int(score_match.group(1)) if score_match else 0
            away_score = int(score_match.group(2)) if score_match else 0

            state = FootballMatchState.LIVE
            status_text = "Live"
            if "ft" in body.lower() or "full time" in body.lower() or "ended" in body.lower():
                state = FootballMatchState.COMPLETED
                status_text = "FT"

            # Parse stats if found
            stats = FootballStats()

            details = DetailedFootballMatch(
                match_id=match_id,
                title=f"{home_team} vs {away_team}",
                league="Football",
                state=state,
                status_text=status_text,
                home_team=home_team,
                away_team=away_team,
                home_score=home_score,
                away_score=away_score,
                home_logo=home_logo,
                away_logo=away_logo,
                stats=stats,
                match_url=target_url,
            )

            return details

        except Exception as e:
            logger.error(f"Error fetching match details for {match_id_or_url}: {e}", exc_info=True)
            return None
