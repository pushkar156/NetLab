const express = require('express');
const { run, get, all } = require('../database/db');

const router = express.Router();

/**
 * GET /api/networks - List all saved networks
 */
router.get('/', async (req, res, next) => {
  try {
    const networks = await all(`SELECT * FROM networks ORDER BY updated_at DESC`);
    res.json({ success: true, count: networks.length, networks });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/networks/:id - Retrieve full network with devices and links
 */
router.get('/:id', async (req, res, next) => {
  try {
    const network = await get(`SELECT * FROM networks WHERE id = ?`, [req.params.id]);
    if (!network) {
      return res.status(404).json({ success: false, error: 'Network not found.' });
    }

    const devices = await all(`SELECT * FROM devices WHERE network_id = ?`, [req.params.id]);
    const links = await all(`SELECT * FROM links WHERE network_id = ?`, [req.params.id]);

    // Parse JSON config fields
    const parsedDevices = devices.map(d => ({
      ...d,
      services: d.services_json ? JSON.parse(d.services_json) : {},
      config: d.config_json ? JSON.parse(d.config_json) : {}
    }));

    res.json({
      success: true,
      network: {
        ...network,
        devices: parsedDevices,
        links
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/networks - Save a complete network topology
 */
router.post('/', async (req, res, next) => {
  try {
    const { id, name, description, devices = [], links = [] } = req.body;
    const netId = id || `net_${Date.now()}`;
    const netName = (name || 'Untitled Network').trim();
    const now = new Date().toISOString();

    const existing = await get(`SELECT id FROM networks WHERE id = ?`, [netId]);
    if (existing) {
      await run(
        `UPDATE networks SET name = ?, description = ?, updated_at = ? WHERE id = ?`,
        [netName, description || '', now, netId]
      );
      // Clean old devices and links to replace with new snapshot
      await run(`DELETE FROM devices WHERE network_id = ?`, [netId]);
      await run(`DELETE FROM links WHERE network_id = ?`, [netId]);
    } else {
      await run(
        `INSERT INTO networks (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
        [netId, netName, description || '', now, now]
      );
    }

    // Insert devices
    for (const d of devices) {
      const devId = d.id || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      await run(
        `INSERT INTO devices (id, network_id, name, type, ip_address, subnet_mask, default_gateway, services_json, config_json, position_x, position_y)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          devId,
          netId,
          d.name || 'Unnamed Device',
          d.type || 'pc',
          d.ip_address || null,
          d.subnet_mask || null,
          d.default_gateway || null,
          JSON.stringify(d.services || {}),
          JSON.stringify(d.config || {}),
          d.position_x || 0,
          d.position_y || 0
        ]
      );
    }

    // Insert links
    for (const l of links) {
      const linkId = l.id || `link_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      await run(
        `INSERT INTO links (id, network_id, source_id, target_id, source_port, target_port, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          linkId,
          netId,
          l.source_id,
          l.target_id,
          l.source_port || null,
          l.target_port || null,
          l.status || 'active'
        ]
      );
    }

    res.json({
      success: true,
      message: 'Network topology persisted successfully.',
      networkId: netId
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/networks/:id/devices/:deviceId - Update specific device configuration
 */
router.put('/:id/devices/:deviceId', async (req, res, next) => {
  try {
    const { name, ip_address, subnet_mask, default_gateway, services, config, position_x, position_y } = req.body;
    const { id: networkId, deviceId } = req.params;

    const existing = await get(`SELECT id FROM devices WHERE id = ? AND network_id = ?`, [deviceId, networkId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Device not found in specified network.' });
    }

    await run(
      `UPDATE devices SET 
        name = COALESCE(?, name),
        ip_address = ?,
        subnet_mask = ?,
        default_gateway = ?,
        services_json = COALESCE(?, services_json),
        config_json = COALESCE(?, config_json),
        position_x = COALESCE(?, position_x),
        position_y = COALESCE(?, position_y)
       WHERE id = ? AND network_id = ?`,
      [
        name,
        ip_address !== undefined ? ip_address : null,
        subnet_mask !== undefined ? subnet_mask : null,
        default_gateway !== undefined ? default_gateway : null,
        services ? JSON.stringify(services) : null,
        config ? JSON.stringify(config) : null,
        position_x,
        position_y,
        deviceId,
        networkId
      ]
    );

    res.json({ success: true, message: 'Device updated successfully.' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/networks/:id/devices/:deviceId - Delete a device and cascading links
 */
router.delete('/:id/devices/:deviceId', async (req, res, next) => {
  try {
    const { id: networkId, deviceId } = req.params;
    await run(`DELETE FROM links WHERE network_id = ? AND (source_id = ? OR target_id = ?)`, [networkId, deviceId, deviceId]);
    await run(`DELETE FROM devices WHERE network_id = ? AND id = ?`, [networkId, deviceId]);
    res.json({ success: true, message: 'Device and connected links removed.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/networks/:id/links - Connect devices
 */
router.post('/:id/links', async (req, res, next) => {
  try {
    const { id: networkId } = req.params;
    const { source_id, target_id, source_port, target_port, status = 'active' } = req.body;

    if (!source_id || !target_id) {
      return res.status(400).json({ success: false, error: 'Both source_id and target_id are required.' });
    }

    const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    await run(
      `INSERT INTO links (id, network_id, source_id, target_id, source_port, target_port, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [linkId, networkId, source_id, target_id, source_port || 'Port 1', target_port || 'Port 2', status]
    );

    res.json({ success: true, linkId, message: 'Link created.' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/networks/:id/links/:linkId - Disconnect devices
 */
router.delete('/:id/links/:linkId', async (req, res, next) => {
  try {
    const { id: networkId, linkId } = req.params;
    await run(`DELETE FROM links WHERE network_id = ? AND id = ?`, [networkId, linkId]);
    res.json({ success: true, message: 'Link deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
