const express = require('express');
const {
  isValidIpv4,
  isValidSubnetMask,
  calculateSubnetDetails,
  isSameSubnet,
  validateDeviceIpConfig,
  detectDuplicateIps
} = require('../networking/ipUtils');

const router = express.Router();

/**
 * POST /api/network-tools/validate-ip
 */
router.post('/validate-ip', (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ valid: false, error: 'IP address string is required.' });
  }

  const valid = isValidIpv4(ip);
  if (!valid) {
    return res.json({
      valid: false,
      ip,
      error: 'Invalid IPv4 address. Must contain four decimal octets between 0 and 255 separated by dots.'
    });
  }

  const octets = ip.split('.').map(Number);
  const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('.');

  res.json({
    valid: true,
    ip,
    octets,
    binary,
    isLoopback: octets[0] === 127,
    isPrivate: (
      (octets[0] === 10) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168)
    )
  });
});

/**
 * POST /api/network-tools/calculate-subnet
 */
router.post('/calculate-subnet', (req, res) => {
  const { ip, subnetMask, cidr } = req.body;
  const maskInput = cidr !== undefined ? cidr : subnetMask;

  if (!ip || maskInput === undefined) {
    return res.status(400).json({
      valid: false,
      error: 'Both IPv4 address and subnet mask (or CIDR prefix) are required.'
    });
  }

  const result = calculateSubnetDetails(ip, maskInput);
  res.json(result);
});

/**
 * POST /api/network-tools/check-same-subnet
 */
router.post('/check-same-subnet', (req, res) => {
  const { ip1, ip2, subnetMask, cidr } = req.body;
  const maskInput = cidr !== undefined ? cidr : subnetMask;

  if (!ip1 || !ip2 || maskInput === undefined) {
    return res.status(400).json({
      error: 'Both IP addresses (ip1, ip2) and subnet mask/CIDR are required.'
    });
  }

  const same = isSameSubnet(ip1, ip2, maskInput);
  const details1 = calculateSubnetDetails(ip1, maskInput);
  const details2 = calculateSubnetDetails(ip2, maskInput);

  res.json({
    sameSubnet: same,
    ip1,
    ip2,
    networkAddress1: details1.networkAddress,
    networkAddress2: details2.networkAddress,
    cidrPrefix: details1.cidrPrefix,
    explanation: same
      ? `Both ${ip1} and ${ip2} yield identical network ID ${details1.networkAddress}/${details1.cidrPrefix} after bitwise AND operation.`
      : `${ip1} belongs to network ${details1.networkAddress}/${details1.cidrPrefix}, while ${ip2} belongs to network ${details2.networkAddress}/${details2.cidrPrefix}. They are on different subnets and require a router to communicate.`
  });
});

/**
 * POST /api/network-tools/validate-device
 */
router.post('/validate-device', (req, res) => {
  const { device, topologyDevices = [] } = req.body;
  const validation = validateDeviceIpConfig(device);
  const duplicates = detectDuplicateIps([...topologyDevices, device]);

  res.json({
    ...validation,
    duplicates
  });
});

module.exports = router;
