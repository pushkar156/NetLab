const express = require('express');
const { run, all, get } = require('../database/db');
const { runSimulation } = require('../simulation/simulationEngine');

const router = express.Router();

/**
 * POST /api/simulations/run - Execute a deterministic network test
 */
router.post('/run', async (req, res, next) => {
  try {
    const { networkId, sourceId, targetId, testType = 'ping', customTopology } = req.body;

    if (!sourceId || !targetId) {
      return res.status(400).json({ success: false, error: 'Both sourceId and targetId are required.' });
    }

    let devices = [];
    let links = [];

    // Use submitted custom topology if provided, otherwise fetch from database
    if (customTopology && Array.isArray(customTopology.devices)) {
      devices = customTopology.devices;
      links = customTopology.links || [];
    } else {
      const netId = networkId || 'default-net';
      const dbDevices = await all(`SELECT * FROM devices WHERE network_id = ?`, [netId]);
      links = await all(`SELECT * FROM links WHERE network_id = ?`, [netId]);

      devices = dbDevices.map(d => ({
        ...d,
        services: d.services_json ? JSON.parse(d.services_json) : {},
        config: d.config_json ? JSON.parse(d.config_json) : {}
      }));
    }

    // Run deterministic simulation engine
    const simulationResult = runSimulation({
      devices,
      links,
      sourceId,
      targetId,
      testType
    });

    const simId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date().toISOString();

    // Persist simulation run in database
    await run(
      `INSERT INTO simulations (id, network_id, source_id, target_id, test_type, result, details_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [simId, networkId || 'default-net', sourceId, targetId, testType, simulationResult.result, JSON.stringify(simulationResult), now]
    );

    // Record in event logs
    await run(
      `INSERT INTO event_logs (id, event_type, source, description, result, correlation_id, created_at)
       VALUES (?, 'SIMULATION_EXECUTED', 'SIMULATOR', ?, ?, ?, ?)`,
      [
        `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        `${testType.toUpperCase()} test from "${sourceId}" to "${targetId}": ${simulationResult.summary}`,
        simulationResult.result,
        simId,
        now
      ]
    );

    res.json({
      simulationId: simId,
      timestamp: now,
      ...simulationResult
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/simulations/history - Retrieve past simulation runs
 */
router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const runs = await all(
      `SELECT * FROM simulations ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    const parsed = runs.map(r => ({
      ...r,
      details: JSON.parse(r.details_json)
    }));

    res.json({ success: true, count: parsed.length, simulations: parsed });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
