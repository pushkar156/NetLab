const express = require('express');
const { all, get } = require('../database/db');

const router = express.Router();

/**
 * GET /api/clients - List all registered clients
 */
router.get('/', async (req, res, next) => {
  try {
    const clients = await all(
      `SELECT id, display_name, socket_id, ip_address, is_active, connected_at, last_seen 
       FROM clients 
       ORDER BY last_seen DESC`
    );
    res.json({ success: true, count: clients.length, clients });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/clients/:id - Get specific client details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const client = await get(`SELECT * FROM clients WHERE id = ?`, [req.params.id]);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found.' });
    }
    res.json({ success: true, client });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/clients/messages/recent - Get recent chat and broadcast messages
 */
router.get('/messages/recent', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const messages = await all(
      `SELECT * FROM messages ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
