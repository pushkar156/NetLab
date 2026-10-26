const express = require('express');
const { run, all } = require('../database/db');

const router = express.Router();

/**
 * GET /api/logs - Structured application and network event logs
 */
router.get('/', async (req, res, next) => {
  try {
    const { event_type, result, limit = 50 } = req.query;
    let query = `SELECT * FROM event_logs`;
    const params = [];
    const conditions = [];

    if (event_type) {
      conditions.push(`event_type = ?`);
      params.push(event_type);
    }

    if (result) {
      conditions.push(`result = ?`);
      params.push(result);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(Math.min(Number(limit) || 50, 200));

    const logs = await all(query, params);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/logs - Clear logs with explicit safety
 */
router.delete('/', async (req, res, next) => {
  try {
    await run(`DELETE FROM event_logs`);
    res.json({ success: true, message: 'All event logs cleared.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
