import * as PollModel from '../models/poll.model.js';

/**
 * GET /api/polls/active
 * Retrieve the current active poll with vote percentages.
 */
export async function getActivePoll(req, res) {
  try {
    const poll = await PollModel.getActivePoll();
    if (!poll) {
      return res.status(404).json({ error: 'No active poll found' });
    }
    return res.json({ success: true, poll });
  } catch (err) {
    console.error('[poll.controller] Error fetching active poll:', err);
    return res.status(500).json({ error: 'Failed to retrieve active poll' });
  }
}

/**
 * POST /api/polls/:id/vote
 * Submit a vote for a poll option.
 */
export async function submitVote(req, res) {
  try {
    const pollId = parseInt(req.params.id, 10);
    const { optionId } = req.body || {};

    if (!pollId || !optionId) {
      return res.status(400).json({ error: 'pollId and optionId are required' });
    }

    // Capture voter IP or fingerprint
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown-ua';
    const voterIdentifier = `${clientIp}-${userAgent}`;

    const result = await PollModel.votePoll({
      pollId,
      optionId,
      voterIdentifier,
    });

    return res.json(result);
  } catch (err) {
    console.error('[poll.controller] Error submitting vote:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit vote' });
  }
}
