"""Unified Sports Background Daemon & Hub.

Auto-discovers and continuously tracks both Cricket (Cricbuzz) and Football (Tribuna)
concurrently within the same unified scraper process, writing atomic JSON snapshots to:
- backend/data/cricket/ (overview.json, recent.json, matches/<id>.json)
- backend/data/football/ (overview.json, recent.json, matches/<id>.json)
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Dict, Set

# Fix Windows console encoding and ensure repo root is on sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from cricbuzz_scraper.config import BASE_DIR
from cricbuzz_scraper.football_models import (
    DetailedFootballMatch,
    FootballMatchState,
    FootballOverview,
)
from cricbuzz_scraper.football_scraper import AsyncTribunaFootballScraper
from cricbuzz_scraper.logger import get_logger
from cricbuzz_scraper.models import DetailedLiveMatch, LiveMatchesOverview, MatchState
from cricbuzz_scraper.scraper import AsyncCricbuzzScraper

logger = get_logger("sports.hub")

# Target Data Directories in backend
BACKEND_DATA_DIR = REPO_ROOT / "backend" / "data"

CRICKET_DATA_DIR = BACKEND_DATA_DIR / "cricket"
CRICKET_MATCHES_DIR = CRICKET_DATA_DIR / "matches"
CRICKET_DATA_DIR.mkdir(parents=True, exist_ok=True)
CRICKET_MATCHES_DIR.mkdir(parents=True, exist_ok=True)

FOOTBALL_DATA_DIR = BACKEND_DATA_DIR / "football"
FOOTBALL_MATCHES_DIR = FOOTBALL_DATA_DIR / "matches"
FOOTBALL_DATA_DIR.mkdir(parents=True, exist_ok=True)
FOOTBALL_MATCHES_DIR.mkdir(parents=True, exist_ok=True)


def _write_json_atomic(filepath: Path, data: dict):
    """Writes data to a temporary file and atomically renames it."""
    tmp_file = filepath.with_suffix(".tmp")
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    if tmp_file.exists():
        tmp_file.replace(filepath)


class UnifiedSportsHubService:
    """Production unified sports hub managing both Cricket & Football discovery and live loops."""

    def __init__(
        self,
        cricket_poll_interval: float = 5.0,
        cricket_discovery_interval: float = 60.0,
        football_poll_interval: float = 15.0,
        football_discovery_interval: float = 60.0,
    ):
        self.cricket_poll_interval = cricket_poll_interval
        self.cricket_discovery_interval = cricket_discovery_interval
        self.football_poll_interval = football_poll_interval
        self.football_discovery_interval = football_discovery_interval

        # Cricket state
        self.cricket_active_tasks: Dict[str, asyncio.Task] = {}
        self.cricket_live_cache: Dict[str, DetailedLiveMatch] = {}
        self.cricket_overview_cache: LiveMatchesOverview = LiveMatchesOverview()
        self.cricket_completed_cache: Dict[str, DetailedLiveMatch] = {}

        # Football state
        self.football_overview_cache: FootballOverview = FootballOverview()
        self.football_matches_cache: Dict[str, DetailedFootballMatch] = {}

        self._running = False

    # =========================================================================
    # CRICKET WORKFLOW
    # =========================================================================

    async def _watch_live_cricket_match(self, match_id: str, slug_url: str = None):
        """Dedicated continuous tracking loop for an individual live cricket match."""
        logger.info(f"[Cricket] Started monitoring live match #{match_id}")
        async with AsyncCricbuzzScraper(headless=True) as scraper:
            while self._running:
                try:
                    match_data = await scraper.get_match_details(slug_url or match_id)
                    self.cricket_live_cache[match_id] = match_data

                    match_file = CRICKET_MATCHES_DIR / f"{match_id}.json"
                    _write_json_atomic(match_file, match_data.model_dump())

                    if match_data.state == MatchState.COMPLETED:
                        logger.info(f"[Cricket] Match #{match_id} completed. Final scorecard recorded.")
                        self.cricket_completed_cache[match_id] = match_data
                        self.cricket_live_cache.pop(match_id, None)
                        self._save_cricket_overview_to_disk()
                        break

                    await asyncio.sleep(self.cricket_poll_interval)
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.warning(f"[Cricket] Error watching match #{match_id}: {e}")
                    await asyncio.sleep(self.cricket_poll_interval * 2)

        self.cricket_active_tasks.pop(match_id, None)

    def _save_cricket_overview_to_disk(self):
        """Persists cricket overview and recent matches to disk."""
        try:
            overview_file = CRICKET_DATA_DIR / "overview.json"
            _write_json_atomic(overview_file, self.cricket_overview_cache.model_dump())

            recent_file = CRICKET_DATA_DIR / "recent.json"
            recent_list = [m.model_dump() for m in self.cricket_completed_cache.values()]
            _write_json_atomic(recent_file, {"matches": recent_list})
        except Exception as e:
            logger.error(f"[Cricket] Error writing overview to disk: {e}")

    async def _run_cricket_loop(self):
        """Continuous Cricket discovery and sync loop."""
        logger.info(f"[Cricket] Loop started (sync every {self.cricket_discovery_interval}s).")
        while self._running:
            try:
                async with AsyncCricbuzzScraper(headless=True) as scraper:
                    overview = await scraper.get_live_matches_overview()
                    self.cricket_overview_cache = overview
                    self._save_cricket_overview_to_disk()

                    current_live_ids: Set[str] = set()
                    for m in overview.live_matches:
                        mid = str(m.match_id)
                        current_live_ids.add(mid)

                        if mid not in self.cricket_active_tasks:
                            task = asyncio.create_task(self._watch_live_cricket_match(mid, m.match_url))
                            self.cricket_active_tasks[mid] = task

                    for active_id in list(self.cricket_active_tasks.keys()):
                        if active_id not in current_live_ids and active_id not in self.cricket_live_cache:
                            self.cricket_active_tasks[active_id].cancel()
                            self.cricket_active_tasks.pop(active_id, None)

                    # Discover recent matches
                    recent_overview = await scraper.get_recent_matches()
                    for rm in recent_overview.recent_matches[:8]:
                        rm_id = str(rm.match_id)
                        match_file = CRICKET_MATCHES_DIR / f"{rm_id}.json"

                        if rm_id not in self.cricket_completed_cache or not match_file.exists():
                            try:
                                full_match = await scraper.get_match_details(rm.match_url or rm_id)
                                self.cricket_completed_cache[rm_id] = full_match
                                _write_json_atomic(match_file, full_match.model_dump())
                            except Exception as ex:
                                logger.warning(f"[Cricket] Failed to fetch scorecard for #{rm_id}: {ex}")

                    self._save_cricket_overview_to_disk()
                    logger.info(
                        f"[Cricket Sync] Live: {len(overview.live_matches)}, "
                        f"Active Watchers: {len(self.cricket_active_tasks)}, "
                        f"Completed: {len(self.cricket_completed_cache)}"
                    )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[Cricket] Error in discovery cycle: {e}")

            await asyncio.sleep(self.cricket_discovery_interval)

    # =========================================================================
    # FOOTBALL WORKFLOW (Tribuna.com)
    # =========================================================================

    def _save_football_overview_to_disk(self):
        """Persists football overview and matches to disk."""
        try:
            overview_file = FOOTBALL_DATA_DIR / "overview.json"
            _write_json_atomic(overview_file, self.football_overview_cache.model_dump())

            recent_file = FOOTBALL_DATA_DIR / "recent.json"
            _write_json_atomic(recent_file, {"matches": [m.model_dump() for m in self.football_overview_cache.recent_matches]})
        except Exception as e:
            logger.error(f"[Football] Error writing overview to disk: {e}")

    async def _run_football_loop(self):
        """Continuous Football discovery and sync loop from Tribuna.com."""
        logger.info(f"[Football] Loop started (sync every {self.football_discovery_interval}s).")
        while self._running:
            try:
                async with AsyncTribunaFootballScraper(headless=True) as scraper:
                    overview = await scraper.get_overview()
                    self.football_overview_cache = overview
                    self._save_football_overview_to_disk()

                    # Save snapshots for all live and recent matches
                    for match_item in overview.live_matches + overview.recent_matches[:10]:
                        mid = match_item.match_id
                        match_file = FOOTBALL_MATCHES_DIR / f"{mid}.json"
                        _write_json_atomic(match_file, match_item.model_dump())

                    logger.info(
                        f"[Football Sync] Live: {len(overview.live_matches)}, "
                        f"Completed: {len(overview.recent_matches)}, "
                        f"Upcoming: {len(overview.upcoming_matches)}"
                    )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[Football] Error in Tribuna discovery cycle: {e}")

            await asyncio.sleep(self.football_discovery_interval)

    # =========================================================================
    # UNIFIED HUB LIFECYCLE
    # =========================================================================

    async def start(self):
        """Launches both Cricket and Football loops concurrently in the same process."""
        self._running = True
        logger.info("Unified Sports Hub starting (Cricket: Cricbuzz, Football: Tribuna)...")

        await asyncio.gather(
            self._run_cricket_loop(),
            self._run_football_loop(),
            return_exceptions=True,
        )

    def stop(self):
        """Stops both loops and cancels active tasks."""
        self._running = False
        for task in self.cricket_active_tasks.values():
            task.cancel()


# Alias for backward compatibility
CricketHubService = UnifiedSportsHubService


async def main():
    hub = UnifiedSportsHubService()
    try:
        await hub.start()
    except (KeyboardInterrupt, asyncio.CancelledError):
        hub.stop()
        logger.info("Unified Sports Hub Service stopped.")


if __name__ == "__main__":
    asyncio.run(main())
