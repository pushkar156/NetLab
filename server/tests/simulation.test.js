const test = require('node:test');
const assert = require('node:assert/strict');
const { runSimulation } = require('../src/simulation/simulationEngine');

// Standard fixture topology
function getFixtureTopology() {
  const devices = [
    {
      id: 'dev-pc1',
      name: 'PC1',
      type: 'pc',
      ip_address: '192.168.1.10',
      subnet_mask: '255.255.255.0',
      default_gateway: '192.168.1.1'
    },
    {
      id: 'dev-pc2',
      name: 'PC2',
      type: 'pc',
      ip_address: '192.168.1.11',
      subnet_mask: '255.255.255.0',
      default_gateway: '192.168.1.1'
    },
    {
      id: 'dev-sw1',
      name: 'Switch1',
      type: 'switch'
    },
    {
      id: 'dev-server1',
      name: 'Server1',
      type: 'server',
      ip_address: '192.168.1.100',
      subnet_mask: '255.255.255.0',
      default_gateway: '192.168.1.1',
      services_json: JSON.stringify({ http: { enabled: true, port: 80, banner: 'Test HTTP Server' } })
    },
    {
      id: 'dev-r1',
      name: 'Router1',
      type: 'router',
      config_json: JSON.stringify({
        interfaces: [
          { name: 'Gig0/0', ip: '192.168.1.1', mask: '255.255.255.0', status: 'up' },
          { name: 'Gig0/1', ip: '192.168.2.1', mask: '255.255.255.0', status: 'up' }
        ],
        routes: [
          { destination: '192.168.1.0', mask: '255.255.255.0', iface: 'Gig0/0', type: 'connected' },
          { destination: '192.168.2.0', mask: '255.255.255.0', iface: 'Gig0/1', type: 'connected' }
        ]
      })
    },
    {
      id: 'dev-sw2',
      name: 'Switch2',
      type: 'switch'
    },
    {
      id: 'dev-pc3',
      name: 'PC3',
      type: 'pc',
      ip_address: '192.168.2.10',
      subnet_mask: '255.255.255.0',
      default_gateway: '192.168.2.1'
    }
  ];

  const links = [
    { id: 'l1', source_id: 'dev-pc1', target_id: 'dev-sw1', status: 'active' },
    { id: 'l2', source_id: 'dev-pc2', target_id: 'dev-sw1', status: 'active' },
    { id: 'l3', source_id: 'dev-server1', target_id: 'dev-sw1', status: 'active' },
    { id: 'l4', source_id: 'dev-sw1', target_id: 'dev-r1', status: 'active' },
    { id: 'l5', source_id: 'dev-r1', target_id: 'dev-sw2', status: 'active' },
    { id: 'l6', source_id: 'dev-sw2', target_id: 'dev-pc3', status: 'active' }
  ];

  return { devices, links };
}

test('Simulation Engine - Scenario 1: Same Subnet Communication', () => {
  const { devices, links } = getFixtureTopology();

  const result = runSimulation({
    devices,
    links,
    sourceId: 'dev-pc1',
    targetId: 'dev-pc2',
    testType: 'ping'
  });

  assert.equal(result.success, true);
  assert.equal(result.result, 'SUCCESS');
  assert.equal(result.hops.length, 3); // PC1 -> Switch1 -> PC2
  assert.match(result.summary, /Same-Subnet Ping Successful/i);
});

test('Simulation Engine - Scenario 2: Cross Subnet Routing (PC1 to PC3)', () => {
  const { devices, links } = getFixtureTopology();

  const result = runSimulation({
    devices,
    links,
    sourceId: 'dev-pc1',
    targetId: 'dev-pc3',
    testType: 'ping'
  });

  assert.equal(result.success, true);
  assert.equal(result.result, 'SUCCESS');
  // PC1 -> Switch1 -> Router1 -> Switch2 -> PC3
  assert.equal(result.hops.length, 5);
  assert.match(result.summary, /Cross-Subnet Ping Successful/i);
});

test('Simulation Engine - Scenario 3: Incorrect Default Gateway on Cross-Subnet Target', () => {
  const { devices, links } = getFixtureTopology();

  // Sabotage PC3's gateway (e.g. points to wrong router interface or missing)
  const pc3 = devices.find(d => d.id === 'dev-pc3');
  pc3.default_gateway = '192.168.1.1'; // Invalid for 192.168.2.0/24 subnet!

  const result = runSimulation({
    devices,
    links,
    sourceId: 'dev-pc1',
    targetId: 'dev-pc3',
    testType: 'ping'
  });

  assert.equal(result.success, false);
  assert.equal(result.result, 'FAILED');
  assert.match(result.summary, /Target IP Configuration Error/i);
});

test('Simulation Engine - Scenario 4: Broken/Missing Link in Subnet', () => {
  const { devices, links } = getFixtureTopology();

  // Inactivate PC1 link
  links.find(l => l.id === 'l1').status = 'inactive';

  const result = runSimulation({
    devices,
    links,
    sourceId: 'dev-pc1',
    targetId: 'dev-pc2',
    testType: 'ping'
  });

  assert.equal(result.success, false);
  assert.equal(result.result, 'FAILED');
  assert.match(result.summary, /Network Cable Disconnected/i);
});

test('Simulation Engine - Scenario 5: HTTP Service Availability vs Network Reachability', () => {
  const { devices, links } = getFixtureTopology();

  // 1. HTTP service enabled -> should succeed
  const httpSuccess = runSimulation({
    devices,
    links,
    sourceId: 'dev-pc1',
    targetId: 'dev-server1',
    testType: 'http'
  });
  assert.equal(httpSuccess.success, true);
  assert.equal(httpSuccess.metrics.httpStatus, 200);

  // 2. Disable HTTP service daemon on Server1
  const server = devices.find(d => d.id === 'dev-server1');
  server.services_json = JSON.stringify({ http: { enabled: false, port: 80 } });

  const httpFail = runSimulation({
    devices,
    links,
    sourceId: 'dev-pc1',
    targetId: 'dev-server1',
    testType: 'http'
  });

  // L3 Ping is reachable, but L7 HTTP service is disabled!
  assert.equal(httpFail.success, false);
  assert.match(httpFail.summary, /HTTP Service Unavailable/i);
  // Verify that L3 reachability step passed in diagnostics!
  const l3Diag = httpFail.diagnostics.find(d => d.step === 'L3 Network Reachability');
  assert.equal(l3Diag.passed, true);
});
