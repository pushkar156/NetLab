const express = require('express');
const os = require('os');
const { getActiveSocketsCount } = require('../sockets/socketHandler');

const router = express.Router();
const serverStartTime = Date.now();

// Helper to discover all local network interfaces (Wi-Fi, Ethernet)
function getLocalNetworkInterfaces() {
  const nets = os.networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push({
          interface: name,
          ip: net.address,
          netmask: net.netmask,
          mac: net.mac
        });
      }
    }
  }
  return results;
}

/**
 * Basic health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

/**
 * Real request-response demonstration endpoint
 * Demonstrates an authentic HTTP Layer 7 exchange over TCP
 */
router.get('/demo/server-info', (req, res) => {
  const reqStartTime = req._startTime || Date.now();
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const clientIp = rawIp.replace(/^::ffff:/, '');
  const userAgent = req.headers['user-agent'] || 'Unknown Client';
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const localInterfaces = getLocalNetworkInterfaces();

  res.json({
    protocol: 'HTTP/1.1',
    requestMethod: 'GET',
    endpoint: '/api/demo/server-info',
    serverName: 'NetLab Central Application Server',
    serverStatus: 'OPERATIONAL',
    requestId,
    serverTimestamp: now,
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    clientInfo: {
      observedIp: clientIp,
      userAgent,
      hostHeader: req.headers['host'] || 'localhost'
    },
    activeSocketConnections: getActiveSocketsCount(),
    serverInterfaces: localInterfaces,
    explanation: 'This demonstrates a real HTTP GET request-response cycle over the application layer (Layer 7). Your browser initiated a TCP 3-way handshake to the backend server, sent an HTTP GET request with headers, and received this JSON response.'
  });
});

module.exports = { router, getLocalNetworkInterfaces };
