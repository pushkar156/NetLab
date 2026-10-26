const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidIpv4,
  isValidSubnetMask,
  cidrToSubnetMask,
  subnetMaskToCidr,
  calculateSubnetDetails,
  isSameSubnet,
  validateDeviceIpConfig,
  detectDuplicateIps
} = require('../src/networking/ipUtils');

test('IPv4 Validation', async (t) => {
  await t.test('accepts valid IPv4 addresses', () => {
    assert.equal(isValidIpv4('192.168.1.1'), true);
    assert.equal(isValidIpv4('10.0.0.1'), true);
    assert.equal(isValidIpv4('172.16.254.1'), true);
    assert.equal(isValidIpv4('0.0.0.0'), true);
    assert.equal(isValidIpv4('255.255.255.255'), true);
  });

  await t.test('rejects out of range octets', () => {
    assert.equal(isValidIpv4('256.168.1.1'), false);
    assert.equal(isValidIpv4('192.168.1.999'), false);
    assert.equal(isValidIpv4('192.168.-1.1'), false);
  });

  await t.test('rejects malformed strings and leading zero octets', () => {
    assert.equal(isValidIpv4('192.168.1'), false);
    assert.equal(isValidIpv4('192.168.1.1.1'), false);
    assert.equal(isValidIpv4('192.168.01.1'), false);
    assert.equal(isValidIpv4('abc.def.ghi.jkl'), false);
    assert.equal(isValidIpv4(''), false);
  });
});

test('Subnet Mask Validation', async (t) => {
  await t.test('accepts standard contiguous subnet masks', () => {
    assert.equal(isValidSubnetMask('255.255.255.0'), true);
    assert.equal(isValidSubnetMask('255.255.0.0'), true);
    assert.equal(isValidSubnetMask('255.0.0.0'), true);
    assert.equal(isValidSubnetMask('255.255.255.252'), true); // /30
    assert.equal(isValidSubnetMask('255.255.255.254'), true); // /31
    assert.equal(isValidSubnetMask('255.255.255.255'), true); // /32
  });

  await t.test('rejects non-contiguous subnet masks', () => {
    assert.equal(isValidSubnetMask('255.255.0.255'), false);
    assert.equal(isValidSubnetMask('255.254.255.0'), false);
    assert.equal(isValidSubnetMask('255.255.255.1'), false);
  });

  await t.test('converts accurately between CIDR and Dotted Decimal', () => {
    assert.equal(cidrToSubnetMask(24), '255.255.255.0');
    assert.equal(cidrToSubnetMask(16), '255.255.0.0');
    assert.equal(cidrToSubnetMask(8), '255.0.0.0');
    assert.equal(cidrToSubnetMask(30), '255.255.255.252');

    assert.equal(subnetMaskToCidr('255.255.255.0'), 24);
    assert.equal(subnetMaskToCidr('255.255.0.0'), 16);
    assert.equal(subnetMaskToCidr('255.255.255.252'), 30);
  });
});

test('Subnet Calculations and Edge Cases', async (t) => {
  await t.test('calculates standard /24 network details correctly', () => {
    const res = calculateSubnetDetails('192.168.1.50', '255.255.255.0');
    assert.equal(res.valid, true);
    assert.equal(res.networkAddress, '192.168.1.0');
    assert.equal(res.broadcastAddress, '192.168.1.255');
    assert.equal(res.firstUsableHost, '192.168.1.1');
    assert.equal(res.lastUsableHost, '192.168.1.254');
    assert.equal(res.usableHosts, 254);
    assert.equal(res.totalAddresses, 256);
    assert.equal(res.cidrPrefix, 24);
    assert.equal(res.isPrivate, true);
  });

  await t.test('handles /31 point-to-point link RFC 3021 edge case', () => {
    const res = calculateSubnetDetails('10.0.0.0', 31);
    assert.equal(res.valid, true);
    assert.equal(res.networkAddress, '10.0.0.0');
    assert.equal(res.broadcastAddress, '10.0.0.1');
    assert.equal(res.usableHosts, 2);
    assert.equal(res.firstUsableHost, '10.0.0.0');
    assert.equal(res.lastUsableHost, '10.0.0.1');
  });

  await t.test('handles /32 host route edge case', () => {
    const res = calculateSubnetDetails('192.168.1.100', 32);
    assert.equal(res.valid, true);
    assert.equal(res.usableHosts, 1);
    assert.equal(res.networkAddress, '192.168.1.100');
    assert.equal(res.broadcastAddress, '192.168.1.100');
  });
});

test('Same Subnet Determination', async (t) => {
  await t.test('detects hosts in same /24 subnet', () => {
    assert.equal(isSameSubnet('192.168.1.10', '192.168.1.200', '255.255.255.0'), true);
  });

  await t.test('detects hosts in different /24 subnets', () => {
    assert.equal(isSameSubnet('192.168.1.10', '192.168.2.10', '255.255.255.0'), false);
  });

  await t.test('handles CIDR masks like /16 properly', () => {
    assert.equal(isSameSubnet('172.16.1.1', '172.16.50.2', 16), true);
    assert.equal(isSameSubnet('172.16.1.1', '172.17.1.1', 16), false);
  });
});

test('Device Configuration and Duplicate IP Verification', async (t) => {
  await t.test('validates valid host configuration with in-subnet gateway', () => {
    const dev = {
      name: 'PC1',
      type: 'pc',
      ip_address: '192.168.1.10',
      subnet_mask: '255.255.255.0',
      default_gateway: '192.168.1.1'
    };
    const check = validateDeviceIpConfig(dev);
    assert.equal(check.valid, true);
    assert.equal(check.errors.length, 0);
  });

  await t.test('flags gateway outside the host subnet', () => {
    const dev = {
      name: 'PC3',
      type: 'pc',
      ip_address: '192.168.2.10',
      subnet_mask: '255.255.255.0',
      default_gateway: '192.168.1.1' // Wrong gateway! Belongs to 192.168.1.0/24, not 192.168.2.0/24
    };
    const check = validateDeviceIpConfig(dev);
    assert.equal(check.valid, false);
    assert.match(check.errors[0], /outside the host's configured subnet/i);
  });

  await t.test('flags duplicate IP assignments', () => {
    const devs = [
      { id: '1', name: 'PC1', ip_address: '192.168.1.10' },
      { id: '2', name: 'PC2', ip_address: '192.168.1.10' }
    ];
    const dups = detectDuplicateIps(devs);
    assert.equal(dups.length, 1);
    assert.equal(dups[0].ip, '192.168.1.10');
  });
});
