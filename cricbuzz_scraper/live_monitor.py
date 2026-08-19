"""Real-time Live Cricket Score Monitoring and Streaming Engine."""

import asyncio
import json
from pathlib import Path
from typing import Callable, Optional, List, Dict, Any
from datetime import datetime, timezone

from .config import DEFAULT_OUTPUT_DIR, DEFAULT_POLL_INTERVAL_SECONDS, MAX_CONSECUTIVE_FAILURES
from .logger import get_logger
from .models import DetailedLiveMatch, MatchState
from .scraper import AsyncCricbuzzScraper

logger = get_logger("cricbuzz.monitor")


class LiveScoreMonitor:
    """Continuously monitors live cricket matches and streams score updates."""

    def __init__(
        self,
        match_id: str,
        poll_interval: float = DEFAULT_POLL_INTERVAL_SECONDS,
        output_dir: Optional[Path] = None,
        on_update: Optional[Callable[[DetailedLiveMatch, Optional[DetailedLiveMatch]], Any]] = None,
    ):
        self.match_id = str(match_id)
        self.poll_interval = max(3.0, poll_interval)
        self.output_dir = output_dir or DEFAULT_OUTPUT_DIR
        self.output_dir.mkdir(exist_ok=True)
        self.on_update = on_update
        self._is_running = False
        self._previous_snapshot: Optional[DetailedLiveMatch] = None

    def _save_snapshot_to_json(self, match_data: DetailedLiveMatch) -> Path:
        """Saves current match snapshot to JSON file."""
        file_path = self.output_dir / f"live_match_{self.match_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(match_data.model_dump_json(indent=2))
        return file_path

    async def start(self) -> None:
        """Starts real-time live monitoring loop."""
        self._is_running = True
        consecutive_failures = 0
        logger.info(
            f"Starting live monitoring for Match ID: {self.match_id} "
            f"(Interval: {self.poll_interval}s)"
        )

        async with AsyncCricbuzzScraper(headless=True) as scraper:
            while self._is_running:
                start_time = asyncio.get_event_loop().time()
                try:
                    current_snapshot = await scraper.get_match_details(self.match_id)
                    consecutive_failures = 0

                    # Detect score changes
                    has_changed = self._detect_changes(self._previous_snapshot, current_snapshot)
                    if has_changed or self._previous_snapshot is None:
                        json_path = self._save_snapshot_to_json(current_snapshot)
                        logger.info(
                            f"Live Score Update [{current_snapshot.title}]: "
                            f"{current_snapshot.status_text} | Saved to {json_path.name}"
                        )
                        if self.on_update:
                            try:
                                if asyncio.iscoroutinefunction(self.on_update):
                                    await self.on_update(current_snapshot, self._previous_snapshot)
                                else:
                                    self.on_update(current_snapshot, self._previous_snapshot)
                            except Exception as cb_err:
                                logger.error(f"Error in on_update callback: {cb_err}")

                    self._previous_snapshot = current_snapshot

                    # Stop monitoring if match completed or abandoned
                    if current_snapshot.state in [MatchState.COMPLETED, MatchState.ABANDONED]:
                        logger.info(
                            f"Match has finished ({current_snapshot.state.value}): {current_snapshot.status_text}. Stopping monitor."
                        )
                        break

                except Exception as e:
                    consecutive_failures += 1
                    logger.warning(
                        f"Failed to fetch live score (Failure {consecutive_failures}/{MAX_CONSECUTIVE_FAILURES}): {e}"
                    )
                    if consecutive_failures >= MAX_CONSECUTIVE_FAILURES:
                        logger.error("Max consecutive failures reached. Aborting live monitor.")
                        break

                # Precise interval sleep
                elapsed = asyncio.get_event_loop().time() - start_time
                sleep_time = max(1.0, self.poll_interval - elapsed)
                await asyncio.sleep(sleep_time)

    def stop(self) -> None:
        """Stops the monitoring loop."""
        logger.info(f"Stopping live score monitor for match {self.match_id}...")
        self._is_running = False

    def _detect_changes(
        self, prev: Optional[DetailedLiveMatch], curr: DetailedLiveMatch
    ) -> bool:
        """Compares previous and current match snapshots for changes."""
        if prev is None:
            return True

        if prev.status_text != curr.status_text:
            return True
        if prev.state != curr.state:
            return True
        if len(prev.innings) != len(curr.innings):
            return True

        for p_inn, c_inn in zip(prev.innings, curr.innings):
            if p_inn.score_str != c_inn.score_str:
                return True

        if prev.recent_overs != curr.recent_overs:
            return True

        return False
