import { pool } from '../db/pool.js';
import crypto from 'crypto';

let tableEnsured = false;

export async function ensurePollTablesExist() {
  if (tableEnsured) return;

  const createPollsSql = `
    CREATE TABLE IF NOT EXISTS news_polls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(500) NOT NULL,
      category VARCHAR(64) NOT NULL DEFAULT 'General',
      options JSON NOT NULL,
      total_votes INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_active_created (is_active, created_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createVotesSql = `
    CREATE TABLE IF NOT EXISTS news_poll_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      poll_id INT NOT NULL,
      option_id VARCHAR(64) NOT NULL,
      voter_hash VARCHAR(64) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_poll_voter (poll_id, voter_hash),
      INDEX idx_poll_id (poll_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createPollsSql);
    await pool.query(createVotesSql);

    // Seed default poll if none exist
    const [existing] = await pool.query('SELECT COUNT(*) AS count FROM news_polls');
    if ((existing[0]?.count ?? 0) === 0) {
      const initialOptions = JSON.stringify([
        { id: 'opt_1', text: 'Yes, strong stimulus is essential', votes: 142 },
        { id: 'opt_2', text: 'No, focus strictly on fiscal deficit control', votes: 89 },
        { id: 'opt_3', text: 'Wait for next quarter global inflation cues', votes: 34 },
      ]);
      await pool.query(
        `INSERT INTO news_polls (question, category, options, total_votes, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [
          'Should global central banks accelerate interest rate cuts to safeguard employment growth in 2026?',
          'Economy',
          initialOptions,
          265,
        ]
      );
    }

    tableEnsured = true;
  } catch (err) {
    console.warn('[poll.model] Table initialization notice:', err.message);
  }
}

/**
 * Get the latest active poll.
 */
export async function getActivePoll() {
  await ensurePollTablesExist();
  const [rows] = await pool.query(
    `SELECT id, question, category, options, total_votes, is_active, created_at
     FROM news_polls
     WHERE is_active = 1
     ORDER BY id DESC
     LIMIT 1`
  );

  if (rows.length === 0) return null;
  const poll = rows[0];
  if (typeof poll.options === 'string') {
    try {
      poll.options = JSON.parse(poll.options);
    } catch {
      poll.options = [];
    }
  }
  return poll;
}

/**
 * Record a vote for a poll option.
 */
export async function votePoll({ pollId, optionId, voterIdentifier }) {
  await ensurePollTablesExist();
  const voterHash = crypto.createHash('sha256').update(voterIdentifier || 'anon').digest('hex');

  // Check if voter already voted
  const [existingVote] = await pool.query(
    'SELECT id FROM news_poll_votes WHERE poll_id = ? AND voter_hash = ? LIMIT 1',
    [pollId, voterHash]
  );

  if (existingVote.length > 0) {
    // Already voted; return updated poll without incrementing
    const currentPoll = await getPollById(pollId);
    return { success: false, alreadyVoted: true, poll: currentPoll };
  }

  // Insert vote record
  await pool.query(
    'INSERT INTO news_poll_votes (poll_id, option_id, voter_hash) VALUES (?, ?, ?)',
    [pollId, optionId, voterHash]
  );

  // Fetch current options & update count atomically
  const [pollRows] = await pool.query('SELECT options, total_votes FROM news_polls WHERE id = ?', [pollId]);
  if (pollRows.length === 0) {
    throw new Error('Poll not found');
  }

  let options = pollRows[0].options;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch {
      options = [];
    }
  } else if (!Array.isArray(options)) {
    options = [];
  }

  let found = false;
  options = options.map((opt) => {
    if (opt.id === optionId) {
      found = true;
      return { ...opt, votes: Number(opt.votes || 0) + 1 };
    }
    return { ...opt, votes: Number(opt.votes || 0) };
  });

  if (!found) {
    throw new Error('Invalid option selected');
  }

  const newTotal = Number(pollRows[0].total_votes || 0) + 1;

  await pool.query(
    'UPDATE news_polls SET options = ?, total_votes = ? WHERE id = ?',
    [JSON.stringify(options), newTotal, pollId]
  );

  const updatedPoll = await getPollById(pollId);
  return { success: true, alreadyVoted: false, poll: updatedPoll };
}

/**
 * Get poll by ID.
 */
export async function getPollById(id) {
  await ensurePollTablesExist();
  const [rows] = await pool.query(
    `SELECT id, question, category, options, total_votes, is_active, created_at
     FROM news_polls
     WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return null;
  const poll = rows[0];
  if (typeof poll.options === 'string') {
    try {
      poll.options = JSON.parse(poll.options);
    } catch {
      poll.options = [];
    }
  }
  return poll;
}
