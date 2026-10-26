/**
 * Deterministic Network Simulation Engine for NetLab
 * Executes rigorous computer networking logic for L2 switching, ARP,
 * L3 routing, default gateway resolution, and L7 application services.
 */

const {
  isValidIpv4,
  isValidSubnetMask,
  calculateSubnetDetails,
  isSameSubnet,
  validateDeviceIpConfig,
  detectDuplicateIps,
  subnetMaskToCidr
} = require('../networking/ipUtils');

/**
 * Builds an adjacency map of active connections from the topology links.
 */
function buildTopologyGraph(devices, links) {
  const adj = new Map();
  const deviceMap = new Map();

  for (const d of devices) {
    adj.set(d.id, []);
    deviceMap.set(d.id, d);
  }

  for (const link of links) {
    if (link.status === 'inactive') continue; // Skip down links
    if (adj.has(link.source_id) && adj.has(link.target_id)) {
      adj.get(link.source_id).push({
        targetId: link.target_id,
        sourcePort: link.source_port,
        targetPort: link.target_port,
        linkId: link.id
      });
      adj.get(link.target_id).push({
        targetId: link.source_id,
        sourcePort: link.target_port,
        targetPort: link.source_port,
        linkId: link.id
      });
    }
  }

  return { adj, deviceMap };
}

/**
 * Finds a Layer 2 path (passing exclusively through Layer 2 switches) between startId and endId.
 */
function findLayer2Path(startId, endId, adj, deviceMap) {
  const queue = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const currId = path[path.length - 1];

    if (currId === endId) {
      return path;
    }

    const neighbors = adj.get(currId) || [];
    for (const edge of neighbors) {
      const neighborId = edge.targetId;
      if (!visited.has(neighborId)) {
        const neighborDev = deviceMap.get(neighborId);
        // Can only traverse intermediate nodes if they are switches
        if (neighborId === endId || (neighborDev && neighborDev.type === 'switch')) {
          visited.add(neighborId);
          queue.push([...path, neighborId]);
        }
      }
    }
  }

  return null;
}

/**
 * Parses router configuration JSON to extract interfaces and routing table.
 */
function getRouterConfig(routerDev) {
  let config = {};
  try {
    if (typeof routerDev.config_json === 'string') {
      config = JSON.parse(routerDev.config_json || '{}');
    } else {
      config = routerDev.config || {};
    }
  } catch {
    config = {};
  }

  const interfaces = config.interfaces || [];
  const routes = config.routes || [];

  return { interfaces, routes };
}

/**
 * Simulates network communication between two virtual devices.
 */
function runSimulation({ devices, links, sourceId, targetId, testType = 'ping' }) {
  const diagnostics = [];
  const hops = [];

  // 1. Basic entity validation
  const source = devices.find(d => d.id === sourceId);
  const target = devices.find(d => d.id === targetId);

  if (!source) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Source device not found',
      explanation: `The selected source device ID (${sourceId}) does not exist in the active topology.`,
      hops: [],
      networkLayer: 'Physical (L1)',
      diagnostics: [{ step: 'Source Existence', passed: false, detail: 'Source node missing.' }]
    };
  }

  if (!target) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Target device not found',
      explanation: `The selected destination device ID (${targetId}) does not exist in the active topology.`,
      hops: [],
      networkLayer: 'Physical (L1)',
      diagnostics: [
        { step: 'Source Existence', passed: true, detail: `Found source ${source.name}` },
        { step: 'Destination Existence', passed: false, detail: 'Destination node missing.' }
      ]
    };
  }

  diagnostics.push({ step: 'Device Existence', passed: true, detail: `Source: ${source.name}, Target: ${target.name}` });

  if (source.id === target.id) {
    return {
      success: true,
      result: 'SUCCESS',
      summary: 'Local Loopback (127.0.0.1 / Local Host)',
      explanation: 'Communication to self traverses the local loopback interface without sending frames out onto the network link.',
      hops: [{
        deviceId: source.id,
        deviceName: source.name,
        type: source.type,
        ip: source.ip_address || '127.0.0.1',
        action: 'Packet processed internally by local loopback interface',
        status: 'success',
        step: 1
      }],
      networkLayer: 'Host Internal',
      metrics: { latencyMs: 0.1, ttl: 128, packetLossPercent: 0, packetsTransmitted: 4, packetsReceived: 4 },
      diagnostics
    };
  }

  // 2. IP configuration validation
  const sourceIpCheck = validateDeviceIpConfig(source);
  if (!sourceIpCheck.valid) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Source IP Configuration Error',
      explanation: `Source device "${source.name}" has invalid network configuration: ${sourceIpCheck.errors.join(' ')}`,
      hops: [{
        deviceId: source.id,
        deviceName: source.name,
        type: source.type,
        ip: source.ip_address,
        action: 'IP stack rejected packet due to invalid host configuration',
        status: 'failed',
        step: 1
      }],
      networkLayer: 'Network (L3)',
      diagnostics: [
        ...diagnostics,
        { step: 'Source IP Configuration', passed: false, detail: sourceIpCheck.errors.join(', ') }
      ]
    };
  }
  diagnostics.push({ step: 'Source IP Configuration', passed: true, detail: `${source.ip_address}/${source.subnet_mask}` });

  const targetIpCheck = validateDeviceIpConfig(target);
  if (!targetIpCheck.valid) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Target IP Configuration Error',
      explanation: `Destination device "${target.name}" has invalid network configuration: ${targetIpCheck.errors.join(' ')}`,
      hops: [],
      networkLayer: 'Network (L3)',
      diagnostics: [
        ...diagnostics,
        { step: 'Target IP Configuration', passed: false, detail: targetIpCheck.errors.join(', ') }
      ]
    };
  }
  diagnostics.push({ step: 'Target IP Configuration', passed: true, detail: `${target.ip_address}/${target.subnet_mask}` });

  // 3. Duplicate IP detection check
  const duplicateConflicts = detectDuplicateIps(devices);
  const sourceConflict = duplicateConflicts.find(c => c.ip === source.ip_address);
  const targetConflict = duplicateConflicts.find(c => c.ip === target.ip_address);

  if (sourceConflict || targetConflict) {
    const conflict = sourceConflict || targetConflict;
    return {
      success: false,
      result: 'FAILED',
      summary: 'IP Address Conflict Detected (ARP Collision)',
      explanation: `Duplicate IP address detected on the network: ${conflict.ip} is assigned to both "${conflict.deviceA}" and "${conflict.deviceB}". In an Ethernet LAN, ARP replies will collide, resulting in non-deterministic packet loss or connectivity failure.`,
      hops: [{
        deviceId: source.id,
        deviceName: source.name,
        type: source.type,
        ip: source.ip_address,
        action: 'ARP collision / duplicate IP conflict detected on network segment',
        status: 'failed',
        step: 1
      }],
      networkLayer: 'Data Link (L2 - ARP)',
      diagnostics: [
        ...diagnostics,
        { step: 'IP Uniqueness', passed: false, detail: `Duplicate IP: ${conflict.ip}` }
      ]
    };
  }
  diagnostics.push({ step: 'IP Uniqueness', passed: true, detail: 'No duplicate IP conflicts found.' });

  // 4. Build graph & verify topology connections
  const { adj, deviceMap } = buildTopologyGraph(devices, links);

  // Check if source has any active link
  const sourceLinks = adj.get(source.id) || [];
  if (sourceLinks.length === 0) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Network Cable Disconnected (Link Down)',
      explanation: `Source device "${source.name}" has no active physical/logical link connected. Interface is DOWN.`,
      hops: [{
        deviceId: source.id,
        deviceName: source.name,
        type: source.type,
        ip: source.ip_address,
        action: 'NIC interface is disconnected or link is down',
        status: 'failed',
        step: 1
      }],
      networkLayer: 'Physical (L1)',
      diagnostics: [
        ...diagnostics,
        { step: 'Source Physical Link', passed: false, detail: 'No active cable/link found on source interface.' }
      ]
    };
  }

  // 5. Check if source and destination are in the same subnet
  const sameSubnet = isSameSubnet(source.ip_address, target.ip_address, source.subnet_mask);
  diagnostics.push({
    step: 'Subnet Comparison',
    passed: true,
    detail: sameSubnet ? 'Source and destination are in the SAME subnet.' : 'Source and destination are in DIFFERENT subnets.'
  });

  // ==========================================
  // CASE A: SAME SUBNET (Layer 2 Switching)
  // ==========================================
  if (sameSubnet) {
    // Both hosts are in the same broadcast domain, direct Layer 2 switching is expected.
    const l2Path = findLayer2Path(source.id, target.id, adj, deviceMap);

    if (!l2Path) {
      return {
        success: false,
        result: 'FAILED',
        summary: 'No Layer 2 Link Path (Same Subnet Unreachable)',
        explanation: `Both "${source.name}" and "${target.name}" belong to the same IP subnet (${calculateSubnetDetails(source.ip_address, source.subnet_mask).networkAddress}/${subnetMaskToCidr(source.subnet_mask)}), but there is no active Layer 2 switch path connecting them. Ensure both devices are plugged into the same switch or linked switches.`,
        hops: [{
          deviceId: source.id,
          deviceName: source.name,
          type: source.type,
          ip: source.ip_address,
          action: 'Host broadcasted ARP request for destination IP, but received no response (L2 partitioned)',
          status: 'failed',
          step: 1
        }],
        networkLayer: 'Data Link (L2)',
        diagnostics: [
          ...diagnostics,
          { step: 'Layer 2 Switch Path', passed: false, detail: 'No path found between devices through switches.' }
        ]
      };
    }

    // Build hop-by-hop sequence
    for (let i = 0; i < l2Path.length; i++) {
      const dev = deviceMap.get(l2Path[i]);
      let action = '';
      if (i === 0) {
        action = `Originates packet addressed to local IP ${target.ip_address}`;
      } else if (i === l2Path.length - 1) {
        action = `Receives Ethernet frame and processes IP packet payload`;
      } else {
        action = `Inspects frame MAC address and forwards out relevant switch port`;
      }
      hops.push({
        deviceId: dev.id,
        deviceName: dev.name,
        type: dev.type,
        ip: dev.ip_address || null,
        action,
        status: 'success',
        step: i + 1
      });
    }

    // Evaluate application layer if HTTP test
    if (testType === 'http') {
      return evaluateApplicationService(source, target, hops, diagnostics, 3.2);
    }

    return {
      success: true,
      result: 'SUCCESS',
      summary: 'Same-Subnet Ping Successful (L2 Switched)',
      explanation: `Communication succeeded directly at Layer 2. Since both devices share the subnet ${calculateSubnetDetails(source.ip_address, source.subnet_mask).networkAddress}/${subnetMaskToCidr(source.subnet_mask)}, no router was needed. Traffic was forwarded efficiently across switch ports.`,
      hops,
      networkLayer: 'Data Link (L2) & Network (L3)',
      metrics: { latencyMs: 2.4, ttl: 64, packetLossPercent: 0, packetsTransmitted: 4, packetsReceived: 4 },
      diagnostics
    };
  }

  // ==========================================
  // CASE B: DIFFERENT SUBNET (Layer 3 Routing)
  // ==========================================
  // When destination is in a different subnet, host MUST forward to its Default Gateway.
  if (!source.default_gateway) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Missing Default Gateway',
      explanation: `Destination IP ${target.ip_address} is outside source's local subnet (${source.ip_address}/${subnetMaskToCidr(source.subnet_mask)}). A host cannot send packets outside its local network without a configured Default Gateway.`,
      hops: [{
        deviceId: source.id,
        deviceName: source.name,
        type: source.type,
        ip: source.ip_address,
        action: 'Host routing table lookup failed: Network is unreachable (no default gateway)',
        status: 'failed',
        step: 1
      }],
      networkLayer: 'Network (L3)',
      diagnostics: [
        ...diagnostics,
        { step: 'Default Gateway Configured', passed: false, detail: 'Source has no default gateway set.' }
      ]
    };
  }

  // Find router that owns the source's default gateway IP
  let routerNode = null;
  let routerIngressIface = null;

  for (const dev of devices) {
    if (dev.type === 'router') {
      const { interfaces } = getRouterConfig(dev);
      const matchedIface = interfaces.find(iface => iface.ip === source.default_gateway);
      if (matchedIface) {
        routerNode = dev;
        routerIngressIface = matchedIface;
        break;
      }
    }
  }

  if (!routerNode) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Default Gateway Unreachable (No Matching Router Interface)',
      explanation: `Source default gateway is configured as "${source.default_gateway}", but no router in the topology has an interface with that IP address. Ensure your router interface is configured with this gateway IP.`,
      hops: [{
        deviceId: source.id,
        deviceName: source.name,
        type: source.type,
        ip: source.ip_address,
        action: `ARP request for default gateway ${source.default_gateway} timed out`,
        status: 'failed',
        step: 1
      }],
      networkLayer: 'Network (L3)',
      diagnostics: [
        ...diagnostics,
        { step: 'Gateway Router Interface', passed: false, detail: `No router has interface ${source.default_gateway}` }
      ]
    };
  }

  // Check if router interface is up
  if (routerIngressIface.status === 'down') {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Router Gateway Interface is DOWN',
      explanation: `Router "${routerNode.name}" interface ${routerIngressIface.name} (${routerIngressIface.ip}) is administratively shut down. Packets dropped at gateway.`,
      hops: [{
        deviceId: routerNode.id,
        deviceName: routerNode.name,
        type: 'router',
        ip: routerIngressIface.ip,
        action: `Interface ${routerIngressIface.name} is down; cannot receive ingress frames`,
        status: 'failed',
        step: 2
      }],
      networkLayer: 'Physical (L1)',
      diagnostics: [
        ...diagnostics,
        { step: 'Router Ingress Interface State', passed: false, detail: `${routerIngressIface.name} is down` }
      ]
    };
  }

  // Check Layer 2 path from source to router gateway interface
  const sourceToRouterPath = findLayer2Path(source.id, routerNode.id, adj, deviceMap);
  if (!sourceToRouterPath) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'No Path to Default Gateway',
      explanation: `Source device "${source.name}" cannot reach its default gateway "${routerNode.name}" (${source.default_gateway}). Check the link between switch and router.`,
      hops: [{
        deviceId: source.id,
        deviceName: source.name,
        type: source.type,
        ip: source.ip_address,
        action: 'Host unable to deliver frames to router gateway (link severed)',
        status: 'failed',
        step: 1
      }],
      networkLayer: 'Data Link (L2)',
      diagnostics: [
        ...diagnostics,
        { step: 'Source to Gateway L2 Path', passed: false, detail: 'No path to router found.' }
      ]
    };
  }

  // Add source to router hops
  for (let i = 0; i < sourceToRouterPath.length - 1; i++) {
    const dev = deviceMap.get(sourceToRouterPath[i]);
    hops.push({
      deviceId: dev.id,
      deviceName: dev.name,
      type: dev.type,
      ip: dev.ip_address || null,
      action: i === 0 ? `Sends packet to Default Gateway (${source.default_gateway}) via L2 switch` : 'Forwards frame toward router',
      status: 'success',
      step: hops.length + 1
    });
  }

  // 6. Router Routing Decision (L3 Routing Table Lookup)
  const { interfaces: routerIfaces, routes: routerRoutes } = getRouterConfig(routerNode);

  // Check if target subnet is directly connected or in routing table
  let egressIface = null;
  let routeMatched = null;

  for (const iface of routerIfaces) {
    if (iface.ip && iface.mask && isSameSubnet(target.ip_address, iface.ip, iface.mask)) {
      egressIface = iface;
      routeMatched = {
        type: 'directly-connected',
        network: calculateSubnetDetails(iface.ip, iface.mask).networkAddress,
        mask: iface.mask,
        iface: iface.name
      };
      break;
    }
  }

  // Check static/dynamic routes if not directly connected
  if (!egressIface) {
    for (const r of routerRoutes) {
      if (r.destination && r.mask && isSameSubnet(target.ip_address, r.destination, r.mask)) {
        routeMatched = r;
        egressIface = routerIfaces.find(i => i.name === r.iface) || { name: r.iface, ip: 'N/A', status: 'up' };
        break;
      }
    }
  }

  if (!egressIface || !routeMatched) {
    hops.push({
      deviceId: routerNode.id,
      deviceName: routerNode.name,
      type: 'router',
      ip: routerIngressIface.ip,
      action: `Routing table lookup failed: No route to destination IP ${target.ip_address}`,
      status: 'failed',
      step: hops.length + 1
    });

    return {
      success: false,
      result: 'FAILED',
      summary: 'Destination Network Unreachable (No Matching Route)',
      explanation: `Router "${routerNode.name}" received the packet on ${routerIngressIface.name}, but its routing table has no entry for destination ${target.ip_address}. Router drops packet and responds with ICMP Destination Unreachable (Type 3, Code 0).`,
      hops,
      networkLayer: 'Network (L3)',
      diagnostics: [
        ...diagnostics,
        { step: 'Router Route Lookup', passed: false, detail: `No route to ${target.ip_address} on router ${routerNode.name}.` }
      ]
    };
  }

  // Check egress interface status
  if (egressIface.status === 'down') {
    hops.push({
      deviceId: routerNode.id,
      deviceName: routerNode.name,
      type: 'router',
      ip: egressIface.ip,
      action: `Route matched out ${egressIface.name}, but interface is administratively DOWN`,
      status: 'failed',
      step: hops.length + 1
    });

    return {
      success: false,
      result: 'FAILED',
      summary: 'Router Egress Interface is DOWN',
      explanation: `Router found a route to destination subnet via ${egressIface.name}, but this interface is currently DOWN. Packet dropped.`,
      hops,
      networkLayer: 'Physical (L1)',
      diagnostics: [
        ...diagnostics,
        { step: 'Router Egress Interface State', passed: false, detail: `${egressIface.name} is down` }
      ]
    };
  }

  hops.push({
    deviceId: routerNode.id,
    deviceName: routerNode.name,
    type: 'router',
    ip: `${routerIngressIface.ip} -> ${egressIface.ip}`,
    action: `Decrements TTL (TTL=63), rewrites Layer 2 Ethernet headers, forwards packet out ${egressIface.name}`,
    status: 'success',
    step: hops.length + 1
  });

  // 7. Router Egress to Destination Host Delivery
  const routerToTargetPath = findLayer2Path(routerNode.id, target.id, adj, deviceMap);
  if (!routerToTargetPath) {
    hops.push({
      deviceId: routerNode.id,
      deviceName: routerNode.name,
      type: 'router',
      ip: egressIface.ip,
      action: `ARP request for host ${target.ip_address} timed out on ${egressIface.name} (no link path to destination host)`,
      status: 'failed',
      step: hops.length + 1
    });

    return {
      success: false,
      result: 'FAILED',
      summary: 'Destination Host Unreachable (L2 Path Missing on Target Subnet)',
      explanation: `Router successfully routed packet to egress interface ${egressIface.name}, but cannot deliver to "${target.name}". Check the switch and cabling on the destination LAN.`,
      hops,
      networkLayer: 'Data Link (L2)',
      diagnostics: [
        ...diagnostics,
        { step: 'Router to Destination L2 Path', passed: false, detail: 'No path from router to destination host.' }
      ]
    };
  }

  for (let i = 1; i < routerToTargetPath.length; i++) {
    const dev = deviceMap.get(routerToTargetPath[i]);
    const isLast = (i === routerToTargetPath.length - 1);
    hops.push({
      deviceId: dev.id,
      deviceName: dev.name,
      type: dev.type,
      ip: dev.ip_address || null,
      action: isLast ? `Receives routed packet addressed to ${target.ip_address}` : 'Forwards packet toward destination host',
      status: 'success',
      step: hops.length + 1
    });
  }

  // 8. Symmetric Return Path Validation (Default Gateway on Destination Host)
  // Crucial networking rule: If destination host needs to send reply back to source in another subnet,
  // target MUST also have a valid default gateway pointing to the router's interface in its subnet!
  if (!target.default_gateway) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Asymmetric Return Routing Failure (Target Has No Default Gateway)',
      explanation: `The request successfully reached destination host "${target.name}", but the host cannot send the reply back! Because source "${source.name}" (${source.ip_address}) is in a remote subnet, target needs its own Default Gateway configured (${egressIface.ip}) to route responses back.`,
      hops,
      networkLayer: 'Network (L3)',
      diagnostics: [
        ...diagnostics,
        { step: 'Target Return Default Gateway', passed: false, detail: `Target ${target.name} has no default gateway set.` }
      ]
    };
  }

  if (target.default_gateway !== egressIface.ip) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'Incorrect Destination Default Gateway',
      explanation: `Destination host "${target.name}" received the request, but its configured Default Gateway (${target.default_gateway}) does not match the router's interface on this subnet (${egressIface.ip}). Return reply could not be routed.`,
      hops,
      networkLayer: 'Network (L3)',
      diagnostics: [
        ...diagnostics,
        { step: 'Target Return Default Gateway', passed: false, detail: `Expected ${egressIface.ip}, got ${target.default_gateway}` }
      ]
    };
  }

  // 9. If HTTP test, evaluate server service availability
  if (testType === 'http') {
    return evaluateApplicationService(source, target, hops, diagnostics, 11.8);
  }

  return {
    success: true,
    result: 'SUCCESS',
    summary: 'Cross-Subnet Ping Successful (Routed across L3 Router)',
    explanation: `Successfully communicated across subnets via Router "${routerNode.name}". The source forwarded to default gateway ${source.default_gateway}, the router performed routing table lookup and TTL decrement, transmitted through interface ${egressIface.name}, and destination host verified return gateway route symmetry.`,
    hops,
    networkLayer: 'Network (L3) & Data Link (L2)',
    metrics: { latencyMs: 11.2, ttl: 63, packetLossPercent: 0, packetsTransmitted: 4, packetsReceived: 4 },
    diagnostics
  };
}

/**
 * Evaluates Layer 7 Application Service (HTTP Web Server)
 */
function evaluateApplicationService(source, target, hops, diagnostics, baseLatency) {
  if (target.type !== 'server') {
    return {
      success: false,
      result: 'FAILED',
      summary: 'HTTP Connection Refused (Destination is not a Server)',
      explanation: `Network reachability succeeded, but destination "${target.name}" is a client PC, not a server hosting HTTP services. Connection refused on port 80.`,
      hops,
      networkLayer: 'Transport (L4 - TCP Port 80)',
      metrics: { latencyMs: baseLatency, ttl: 64, packetLossPercent: 0, packetsTransmitted: 1, packetsReceived: 0 },
      diagnostics: [
        ...diagnostics,
        { step: 'HTTP Service Verification', passed: false, detail: 'Host is not a configured server.' }
      ]
    };
  }

  let services = {};
  try {
    services = typeof target.services_json === 'string' ? JSON.parse(target.services_json || '{}') : (target.services || {});
  } catch {
    services = {};
  }

  const httpService = services.http;
  if (!httpService || !httpService.enabled) {
    return {
      success: false,
      result: 'FAILED',
      summary: 'HTTP Service Unavailable (Port 80 Inactive)',
      explanation: `Host "${target.name}" (${target.ip_address}) is 100% reachable at Network Layer (L3 Ping succeeds), but its HTTP Web Server service is currently STOPPED/DISABLED. This demonstrates the difference between network reachability and application-level service availability.`,
      hops,
      networkLayer: 'Application (L7 - HTTP)',
      metrics: { latencyMs: baseLatency, ttl: 64, packetLossPercent: 0, packetsTransmitted: 1, packetsReceived: 0 },
      diagnostics: [
        ...diagnostics,
        { step: 'L3 Network Reachability', passed: true, detail: 'IP reachability confirmed.' },
        { step: 'L7 HTTP Web Server Service', passed: false, detail: 'HTTP service daemon is disabled on server.' }
      ]
    };
  }

  return {
    success: true,
    result: 'SUCCESS',
    summary: 'HTTP 200 OK (Web Server Responded)',
    explanation: `HTTP GET request to http://${target.ip_address}:${httpService.port || 80}/ completed successfully. Server banner: "${httpService.banner || 'Welcome to NetLab HTTP Web Server'}". Request and response traveled over full network stack (L2/L3/L4/L7).`,
    hops,
    networkLayer: 'Application (L7 - HTTP / TCP Port 80)',
    metrics: {
      latencyMs: baseLatency + 4.5,
      ttl: 64,
      httpStatus: 200,
      banner: httpService.banner || 'NetLab HTTP Daemon v1.0',
      packetsTransmitted: 4,
      packetsReceived: 4
    },
    diagnostics: [
      ...diagnostics,
      { step: 'L3 Network Reachability', passed: true, detail: 'IP reachability confirmed.' },
      { step: 'L4 TCP 3-Way Handshake', passed: true, detail: 'SYN, SYN-ACK, ACK completed on port 80.' },
      { step: 'L7 HTTP Web Service', passed: true, detail: `HTTP 200 OK: ${httpService.banner || 'OK'}` }
    ]
  };
}

module.exports = {
  runSimulation,
  buildTopologyGraph,
  findLayer2Path
};
