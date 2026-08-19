import asyncio
import sys
from pathlib import Path

# Ensure root package is importable when script is run directly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from cricbuzz_scraper import AsyncCricbuzzScraper, CricbuzzScraper, LiveScoreMonitor, MatchState


def demo_sync_extraction():
    """Demonstrates synchronous score extraction."""
    print("\n--- 1. Synchronous Match Listing Demo ---")
    scraper = CricbuzzScraper(headless=True)
    overview = scraper.get_live_matches()

    print(f"Total Matches Found: {overview.total_count}")
    print(f"Live Matches ({len(overview.live_matches)}):")
    for m in overview.live_matches[:3]:
        print(f"  • [{m.match_id}] {m.title} -> {m.status}")

    # If live matches exist, inspect the first one
    target_match_id = overview.live_matches[0].match_id if overview.live_matches else (
        overview.recent_matches[0].match_id if overview.recent_matches else None
    )

    if target_match_id:
        print(f"\n--- 2. Detailed Scorecard Demo for Match #{target_match_id} ---")
        score = scraper.get_match_score(target_match_id)
        print(f"Title: {score.title}")
        print(f"Status: {score.status_text}")
        print(f"Innings count: {len(score.innings)}")
        for inn in score.innings:
            print(f"  - {inn.team_name}: {inn.score_str}")
        if score.current_batsmen:
            print(f"Batsmen on crease: {[b.name for b in score.current_batsmen]}")


async def demo_async_extraction():
    """Demonstrates asynchronous extraction and streaming monitor."""
    print("\n--- 3. Asynchronous Scraper Context Manager Demo ---")
    async with AsyncCricbuzzScraper(headless=True) as scraper:
        overview = await scraper.get_live_matches_overview()
        print(f"Fetched {len(overview.live_matches)} live matches asynchronously.")


if __name__ == "__main__":
    demo_sync_extraction()
    asyncio.run(demo_async_extraction())
