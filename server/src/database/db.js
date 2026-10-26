const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/netlab.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Helper functions for Promise-based queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize tables and seed default topology
async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      socket_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      is_active INTEGER DEFAULT 1,
      connected_at TEXT NOT NULL,
      last_seen TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      recipient_id TEXT,
      recipient_name TEXT,
      message TEXT NOT NULL,
      is_broadcast INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      delivery_status TEXT DEFAULT 'delivered'
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS networks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      network_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      ip_address TEXT,
      subnet_mask TEXT,
      default_gateway TEXT,
      services_json TEXT,
      config_json TEXT,
      position_x REAL DEFAULT 0,
      position_y REAL DEFAULT 0,
      FOREIGN KEY(network_id) REFERENCES networks(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      network_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      source_port TEXT,
      target_port TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(network_id) REFERENCES networks(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS simulations (
      id TEXT PRIMARY KEY,
      network_id TEXT,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      test_type TEXT NOT NULL,
      result TEXT NOT NULL,
      details_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS event_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      source TEXT,
      description TEXT NOT NULL,
      result TEXT,
      correlation_id TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Seed default network if empty
  const existingNetwork = await get(`SELECT id FROM networks WHERE id = 'default-net'`);
  if (!existingNetwork) {
    const now = new Date().toISOString();
    await run(
      `INSERT INTO networks (id, name, description, created_at, updated_at) 
       VALUES ('default-net', 'Dual-Subnet Enterprise Starter', 'Starter topology featuring 2 subnets (192.168.1.0/24 & 192.168.2.0/24) connected by Router1', ?, ?)`,
      [now, now]
    );

    // Seed devices
    const devices = [
      {
        id: 'dev-pc1',
        network_id: 'default-net',
        name: 'PC1',
        type: 'pc',
        ip_address: '192.168.1.10',
        subnet_mask: '255.255.255.0',
        default_gateway: '192.168.1.1',
        services_json: JSON.stringify({}),
        config_json: JSON.stringify({ dns: '192.168.1.1' }),
        position_x: 100,
        position_y: 120
      },
      {
        id: 'dev-pc2',
        network_id: 'default-net',
        name: 'PC2',
        type: 'pc',
        ip_address: '192.168.1.11',
        subnet_mask: '255.255.255.0',
        default_gateway: '192.168.1.1',
        services_json: JSON.stringify({}),
        config_json: JSON.stringify({ dns: '192.168.1.1' }),
        position_x: 100,
        position_y: 280
      },
      {
        id: 'dev-sw1',
        network_id: 'default-net',
        name: 'Switch1',
        type: 'switch',
        ip_address: null,
        subnet_mask: null,
        default_gateway: null,
        services_json: JSON.stringify({}),
        config_json: JSON.stringify({ ports: 8, vlan: 1 }),
        position_x: 320,
        position_y: 200
      },
      {
        id: 'dev-server1',
        network_id: 'default-net',
        name: 'Server1',
        type: 'server',
        ip_address: '192.168.1.100',
        subnet_mask: '255.255.255.0',
        default_gateway: '192.168.1.1',
        services_json: JSON.stringify({ http: { enabled: true, port: 80, banner: 'Welcome to NetLab HTTP Web Server' } }),
        config_json: JSON.stringify({ domain: 'server1.local' }),
        position_x: 320,
        position_y: 360
      },
      {
        id: 'dev-r1',
        network_id: 'default-net',
        name: 'Router1',
        type: 'router',
        ip_address: null,
        subnet_mask: null,
        default_gateway: null,
        services_json: JSON.stringify({}),
        config_json: JSON.stringify({
          interfaces: [
            { name: 'Gig0/0', ip: '192.168.1.1', mask: '255.255.255.0', status: 'up' },
            { name: 'Gig0/1', ip: '192.168.2.1', mask: '255.255.255.0', status: 'up' }
          ],
          routes: [
            { destination: '192.168.1.0', mask: '255.255.255.0', nextHop: 'Directly Connected', iface: 'Gig0/0', type: 'connected' },
            { destination: '192.168.2.0', mask: '255.255.255.0', nextHop: 'Directly Connected', iface: 'Gig0/1', type: 'connected' }
          ]
        }),
        position_x: 540,
        position_y: 200
      },
      {
        id: 'dev-sw2',
        network_id: 'default-net',
        name: 'Switch2',
        type: 'switch',
        ip_address: null,
        subnet_mask: null,
        default_gateway: null,
        services_json: JSON.stringify({}),
        config_json: JSON.stringify({ ports: 8, vlan: 1 }),
        position_x: 760,
        position_y: 200
      },
      {
        id: 'dev-pc3',
        network_id: 'default-net',
        name: 'PC3',
        type: 'pc',
        ip_address: '192.168.2.10',
        subnet_mask: '255.255.255.0',
        default_gateway: '192.168.2.1',
        services_json: JSON.stringify({}),
        config_json: JSON.stringify({ dns: '192.168.2.1' }),
        position_x: 960,
        position_y: 200
      }
    ];

    for (const d of devices) {
      await run(
        `INSERT INTO devices (id, network_id, name, type, ip_address, subnet_mask, default_gateway, services_json, config_json, position_x, position_y)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.id, d.network_id, d.name, d.type, d.ip_address, d.subnet_mask, d.default_gateway, d.services_json, d.config_json, d.position_x, d.position_y]
      );
    }

    // Seed links
    const links = [
      { id: 'link-1', network_id: 'default-net', source_id: 'dev-pc1', target_id: 'dev-sw1', source_port: 'Eth0', target_port: 'Fa0/1' },
      { id: 'link-2', network_id: 'default-net', source_id: 'dev-pc2', target_id: 'dev-sw1', source_port: 'Eth0', target_port: 'Fa0/2' },
      { id: 'link-3', network_id: 'default-net', source_id: 'dev-server1', target_id: 'dev-sw1', source_port: 'Eth0', target_port: 'Fa0/3' },
      { id: 'link-4', network_id: 'default-net', source_id: 'dev-sw1', target_id: 'dev-r1', source_port: 'Fa0/24', target_port: 'Gig0/0' },
      { id: 'link-5', network_id: 'default-net', source_id: 'dev-r1', target_id: 'dev-sw2', source_port: 'Gig0/1', target_port: 'Fa0/24' },
      { id: 'link-6', network_id: 'default-net', source_id: 'dev-sw2', target_id: 'dev-pc3', source_port: 'Fa0/1', target_port: 'Eth0' }
    ];

    for (const l of links) {
      await run(
        `INSERT INTO links (id, network_id, source_id, target_id, source_port, target_port, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [l.id, l.network_id, l.source_id, l.target_id, l.source_port, l.target_port]
      );
    }

    // Log seed event
    await run(
      `INSERT INTO event_logs (id, event_type, source, description, result, created_at)
       VALUES (?, 'SYSTEM_INIT', 'DATABASE', 'Default dual-subnet virtual network initialized successfully', 'SUCCESS', ?)`,
      ['log-init-1', now]
    );

    console.log('Seeded default virtual network topology (LAN 1 and LAN 2).');
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initDatabase
};
