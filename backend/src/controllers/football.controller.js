import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '../../../');
const FOOTBALL_DATA_DIR = path.resolve(__dirname, '../../data/football');
const MATCHES_DIR = path.join(FOOTBALL_DATA_DIR, 'matches');
const OVERVIEW_FILE = path.join(FOOTBALL_DATA_DIR, 'overview.json');
const RECENT_FILE = path.join(FOOTBALL_DATA_DIR, 'recent.json');

if (!fs.existsSync(MATCHES_DIR)) {
  fs.mkdirSync(MATCHES_DIR, { recursive: true });
}

export const footballEvents = new EventEmitter();
footballEvents.setMaxListeners(100);

const inFlightFetches = new Map();

function readJsonFile(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[FootballController] Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

/**
 * On-demand fast scrape for football matches.
 */
async function fetchFootballOnDemand(matchId) {
  if (inFlightFetches.has(matchId)) {
    return inFlightFetches.get(matchId);
  }

  const promise = (async () => {
    const outFile = path.join(MATCHES_DIR, `${matchId}.json`);
    const cmd = `python -m cricbuzz_scraper.cli football-match "${matchId}" --output "${outFile}"`;
    try {
      console.log(`[FootballController] On-demand scraping football match #${matchId}...`);
      await execAsync(cmd, { cwd: REPO_ROOT, timeout: 35000 });
      const data = readJsonFile(outFile);
      if (data) {
        footballEvents.emit(`match:${matchId}`, data);
      }
      return data;
    } catch (err) {
      console.error(`[FootballController] On-demand scrape failed for #${matchId}:`, err.message);
      return readJsonFile(outFile);
    } finally {
      inFlightFetches.delete(matchId);
    }
  })();

  inFlightFetches.set(matchId, promise);
  return promise;
}

/**
 * GET /api/football/overview
 */
export async function getFootballOverview(_req, res) {
  let overviewData = readJsonFile(OVERVIEW_FILE);

  if (!overviewData || !overviewData.live_matches) {
    try {
      console.log('[FootballController] overview.json missing, triggering background sync...');
      await execAsync(`python -m cricbuzz_scraper.cli football --output "${OVERVIEW_FILE}"`, {
        cwd: REPO_ROOT,
        timeout: 45000,
      });
      overviewData = readJsonFile(OVERVIEW_FILE, {
        live_matches: [],
        recent_matches: [],
        upcoming_matches: [],
        leagues: [],
      });
    } catch (err) {
      console.error('[FootballController] Initial sync failed:', err.message);
    }
  }

  res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=10');
  return res.json({
    ok: true,
    data: overviewData || {
      live_matches: [],
      recent_matches: [],
      upcoming_matches: [],
      leagues: [],
    },
  });
}

/**
 * GET /api/football/recent
 */
export function getFootballRecent(_req, res) {
  const data = readJsonFile(RECENT_FILE, { matches: [] });

  res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  return res.json({
    ok: true,
    data: data.matches || [],
  });
}

/**
 * GET /api/football/match/:id
 */
export async function getFootballMatchDetails(req, res) {
  const matchId = req.params.id;
  if (!matchId || !/^[a-zA-Z0-9_\-]+$/.test(matchId)) {
    return res.status(400).json({ ok: false, error: 'Invalid match ID' });
  }

  const matchFilePath = path.join(MATCHES_DIR, `${matchId}.json`);
  let matchData = readJsonFile(matchFilePath);

  if (!matchData) {
    matchData = await fetchFootballOnDemand(matchId);
  }

  if (!matchData) {
    return res.status(404).json({
      ok: false,
      error: `Football match details for #${matchId} could not be loaded.`,
    });
  }

  const isCompleted = matchData.state === 'COMPLETED';
  res.setHeader(
    'Cache-Control',
    isCompleted
      ? 'public, max-age=30, stale-while-revalidate=60'
      : 'public, max-age=3, stale-while-revalidate=6'
  );

  return res.json({
    ok: true,
    data: matchData,
  });
}

/**
 * GET /api/football/stream/:id?
 */
export function streamFootballLiveScores(req, res) {
  const matchId = req.params.id;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(': connected\n\n');

  if (matchId) {
    const singleData = readJsonFile(path.join(MATCHES_DIR, `${matchId}.json`));
    if (singleData) {
      res.write(`data: ${JSON.stringify(singleData)}\n\n`);
    }
  } else {
    const overviewData = readJsonFile(OVERVIEW_FILE);
    if (overviewData) {
      res.write(`data: ${JSON.stringify(overviewData)}\n\n`);
    }
  }

  const onMatchUpdate = (data) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      // client disconnected
    }
  };

  const eventName = matchId ? `match:${matchId}` : 'overview_update';
  footballEvents.on(eventName, onMatchUpdate);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    footballEvents.off(eventName, onMatchUpdate);
  });
}
