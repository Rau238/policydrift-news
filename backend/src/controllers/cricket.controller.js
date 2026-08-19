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
const CRICKET_DATA_DIR = path.resolve(__dirname, '../../data/cricket');
const MATCHES_DIR = path.join(CRICKET_DATA_DIR, 'matches');
const OVERVIEW_FILE = path.join(CRICKET_DATA_DIR, 'overview.json');
const RECENT_FILE = path.join(CRICKET_DATA_DIR, 'recent.json');

if (!fs.existsSync(MATCHES_DIR)) {
  fs.mkdirSync(MATCHES_DIR, { recursive: true });
}

// Global Event Emitter for real-time live match broadcasting
export const cricketEvents = new EventEmitter();
cricketEvents.setMaxListeners(100);

// In-flight fetch deduplication map
const inFlightFetches = new Map();

function readJsonFile(filePath, defaultValue = null) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[CricketController] Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

/**
 * On-demand fast scrape for any match that is missing from cache or needs fresh data.
 */
async function fetchMatchOnDemand(matchId) {
  if (inFlightFetches.has(matchId)) {
    return inFlightFetches.get(matchId);
  }

  const promise = (async () => {
    const outFile = path.join(MATCHES_DIR, `${matchId}.json`);
    const cmd = `python -m cricbuzz_scraper.cli score "${matchId}" --output "${outFile}"`;
    try {
      console.log(`[CricketController] On-demand scraping match #${matchId}...`);
      await execAsync(cmd, { cwd: REPO_ROOT, timeout: 25000 });
      const data = readJsonFile(outFile);
      if (data) {
        cricketEvents.emit(`match:${matchId}`, data);
        cricketEvents.emit('overview_update', data);
      }
      return data;
    } catch (err) {
      console.error(`[CricketController] On-demand scrape failed for #${matchId}:`, err.message);
      return null;
    } finally {
      inFlightFetches.delete(matchId);
    }
  })();

  inFlightFetches.set(matchId, promise);
  return promise;
}

/**
 * GET /api/cricket/overview
 */
export async function getOverview(_req, res) {
  let data = readJsonFile(OVERVIEW_FILE);

  if (!data) {
    data = {
      live_matches: [],
      recent_matches: [],
      upcoming_matches: [],
      timestamp: new Date().toISOString(),
    };
  }

  res.setHeader('Cache-Control', 'public, max-age=3, stale-while-revalidate=6');
  return res.json({
    ok: true,
    data,
  });
}

/**
 * GET /api/cricket/recent
 */
export async function getRecentMatches(_req, res) {
  const data = readJsonFile(RECENT_FILE, { matches: [] });

  res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
  return res.json({
    ok: true,
    data: data.matches || [],
  });
}

function extractNumericMatchId(param) {
  if (!param) return '';
  const str = String(param).trim();
  const match = str.match(/(\d+)$/);
  return match ? match[1] : str;
}

/**
 * GET /api/cricket/match/:id
 * Returns detailed live score or complete multi-innings scorecard with auto-scraping fallback.
 */
export async function getMatchDetails(req, res) {
  const rawParam = req.params.id;
  const matchId = extractNumericMatchId(rawParam);

  if (!matchId || !/^[a-zA-Z0-9_-]+$/.test(matchId)) {
    return res.status(400).json({ ok: false, error: 'Invalid match ID' });
  }

  const matchFilePath = path.join(MATCHES_DIR, `${matchId}.json`);
  let matchData = readJsonFile(matchFilePath);

  // If not cached yet, immediately scrape on-demand
  if (!matchData) {
    matchData = await fetchMatchOnDemand(matchId);
  }

  if (!matchData) {
    return res.status(404).json({
      ok: false,
      error: `Scorecard for match #${matchId} could not be loaded. Please verify the match ID.`,
    });
  }

  const isCompleted = matchData.state === 'COMPLETED';
  res.setHeader(
    'Cache-Control',
    isCompleted
      ? 'public, max-age=30, stale-while-revalidate=60'
      : 'public, max-age=2, stale-while-revalidate=4'
  );

  return res.json({
    ok: true,
    data: matchData,
  });
}

/**
 * GET /api/cricket/stream/:id?
 * Real-time Server-Sent Events (SSE) stream for live sub-second ball updates.
 */
export function streamLiveScores(req, res) {
  const rawParam = req.params.id;
  const matchId = rawParam ? extractNumericMatchId(rawParam) : undefined;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send initial ping
  res.write(': connected\n\n');

  // Send initial data immediately
  if (matchId) {
    const matchFilePath = path.join(MATCHES_DIR, `${matchId}.json`);
    const initialData = readJsonFile(matchFilePath);
    if (initialData) {
      res.write(`data: ${JSON.stringify(initialData)}\n\n`);
    } else {
      // Trigger background scrape if not cached
      fetchMatchOnDemand(matchId);
    }
  } else {
    const overviewData = readJsonFile(OVERVIEW_FILE);
    if (overviewData) {
      res.write(`data: ${JSON.stringify(overviewData)}\n\n`);
    }
  }

  const listener = (data) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      // connection closed
    }
  };

  const eventName = matchId ? `match:${matchId}` : 'overview_update';
  cricketEvents.on(eventName, listener);

  // Keep-alive heartbeat every 15s
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      // ignore
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    cricketEvents.off(eventName, listener);
  });
}

