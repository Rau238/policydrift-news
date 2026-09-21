# NewsFree365 — Sports Intelligence & Telemetry Hub

The Sports Hub is an autonomous Python service located in `cricbuzz_scraper/` that runs as a dedicated daemon process (`newsfree365-sports`) under PM2.

---

## 🏏 1. Cricket Intelligence (Cricbuzz Scraper)

- **Entrypoint**: `cricbuzz_scraper/scraper.py`
- **Capabilities**:
  - Headless Chromium scraping via Playwright.
  - Fetches live matches overview, ball-by-ball commentary, mini scorecards, full team scorecards, and player partnership charts.
  - Automatically translates match IDs and caches telemetry payloads.
- **Adaptive Polling Intervals**:
  - **Live Match Active**: Sync every 5–10 seconds for real-time score updates.
  - **Innings Break / Weather Delay**: Sync every 30 seconds.
  - **No Live Matches**: Idle poll every 60 seconds.

---

## ⚽ 2. Football Intelligence (Tribuna Scraper)

- **Entrypoint**: `cricbuzz_scraper/football_scraper.py`
- **Capabilities**:
  - Scrapes international and European league matches (Premier League, La Liga, Champions League, ISL, etc.).
  - Extracts live match minutes, scores, goal scorers, red/yellow cards, and scheduled match times.
  - Normalizes club names and logos into local Next.js cache.

---

## 🔄 3. Multi-Sport Orchestrator (`hub.py`)

- **Entrypoint**: `cricbuzz_scraper/hub.py`
- **Architecture**:
  - Uses `asyncio.gather` to concurrently execute independent cricket and football event loops.
  - Formats and delivers normalized JSON payloads to the Express backend memory cache at `http://127.0.0.1:4050/api/cricket/telemetry` and `/api/football/telemetry`.
  - Implements resilient retry backoffs and automatic process recovery.

---

## 🛠️ Running the Sports Hub Standalone

```bash
# Install Python dependencies
pip install -r cricbuzz_scraper/requirements.txt
playwright install chromium

# Run the hub
python cricbuzz_scraper/hub.py
```
