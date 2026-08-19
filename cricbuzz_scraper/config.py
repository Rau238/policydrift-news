"""Configuration settings for Cricbuzz Playwright Live Score Scraper."""

from pathlib import Path
from typing import Dict, Any

# Paths
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT_DIR = BASE_DIR / "output"
DEFAULT_OUTPUT_DIR.mkdir(exist_ok=True)
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# URLs
BASE_URL = "https://www.cricbuzz.com"
LIVE_SCORES_URL = f"{BASE_URL}/cricket-match/live-scores"
LIVE_SCORES_RECENT_URL = f"{BASE_URL}/cricket-match/live-scores/recent-matches"
LIVE_SCORES_UPCOMING_URL = f"{BASE_URL}/cricket-match/live-scores/upcoming-matches"

# Playwright Browser Config
DEFAULT_BROWSER_CONFIG: Dict[str, Any] = {
    "headless": True,
    "args": [
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-site-isolation-trials",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
    ],
}

# Browser Context Config (Anti-bot stealth)
DEFAULT_CONTEXT_CONFIG: Dict[str, Any] = {
    "viewport": {"width": 1366, "height": 768},
    "user_agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "extra_http_headers": {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    },
    "locale": "en-US",
    "timezone_id": "Asia/Kolkata",
    "permissions": ["geolocation"],
    "geolocation": {"latitude": 28.6139, "longitude": 77.2090}, # Delhi, India
    "ignore_https_errors": True,
}

# Operational Timeouts (in milliseconds)
PAGE_TIMEOUT_MS = 25000
NAVIGATION_TIMEOUT_MS = 30000
ELEMENT_TIMEOUT_MS = 8000

# Live Monitoring Config
DEFAULT_POLL_INTERVAL_SECONDS = 6.0
MAX_CONSECUTIVE_FAILURES = 5

# Common Selectors (with resilient fallbacks)
SELECTORS = {
    # Match listings on /cricket-match/live-scores
    "match_card": "div.cb-col.cb-col-100.cb-lv-main, div.cb-mtch-lst, div.cb-ltst-wgt-hdr, div.cb-match-card",
    "match_card_header": "h2.cb-lv-grvr-hdr, div.cb-lv-grvr-hdr, .cb-lv-scr-mtch-hdr",
    "match_card_title": "a.cb-lv-scrs-well, a.text-hvr-underline, h3 a, .cb-mat-mnu-itm",
    "match_card_status": "div.cb-text-live, div.cb-text-complete, div.cb-text-preview, div.cb-lv-scrs-col span",
    "match_card_score": "div.cb-lv-scrs-col, div.cb-scr-wgt-itm",
    
    # Match detail page / Live score commentary
    "live_score_header": "div.cb-min-bat-rw, div.cb-col-67.cb-scrs-wrp, div.cb-nav-main",
    "live_status_text": "div.cb-text-live, div.cb-text-complete, div.cb-text-inprogress, div.cb-min-stts",
    "team_scores": "div.cb-min-bat-rw, div.cb-scrs-tbl, div.cb-col-100.cb-min-itm-rw",
    "mini_scorecard": "div.cb-col-67.cb-scrs-wrp, div.cb-min-scrd",
    "batsman_table": "div.cb-min-inf",
    "bowler_table": "div.cb-min-inf",
    "recent_balls": "span.cb-font-12.cb-text-gray, div.cb-min-rcnt",
}
