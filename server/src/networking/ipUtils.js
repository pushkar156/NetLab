/**
 * Accurate IPv4 and Subnet calculation engine for NetLab
 * Implements strict bitwise and octet-level arithmetic,
 * correctly handling CIDR notation, binary contiguity, and RFC edge cases (/31, /32).
 */

/**
 * Validates an IPv4 address string.
 * Must consist of four decimal octets (0-255), separated by dots.
 */
function isValidIpv4(ip) {
  if (typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    // Disallow leading zeros unless the octet is single '0'
    if (part.length > 1 && part.startsWith('0')) return false;
    const num = Number(part);
    if (num < 0 || num > 255) return false;
  }
  return true;
}

/**
 * Converts an IPv4 string to a 32-bit unsigned integer.
 */
function ipToInt(ip) {
  if (!isValidIpv4(ip)) return null;
  const octets = ip.trim().split('.').map(Number);
  return ((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
}

/**
 * Converts a 32-bit unsigned integer to an IPv4 string.
 */
function intToIp(intVal) {
  const uInt = intVal >>> 0;
  const byte1 = (uInt >>> 24) & 255;
  const byte2 = (uInt >>> 16) & 255;
  const byte3 = (uInt >>> 8) & 255;
  const byte4 = uInt & 255;
  return `${byte1}.${byte2}.${byte3}.${byte4}`;
}

/**
 * Validates whether a subnet mask is valid and contiguous in binary.
 * E.g., 255.255.255.0 is valid (11111111.11111111.11111111.00000000)
 * 255.255.0.255 is INVALID (non-contiguous 1s and 0s).
 */
function isValidSubnetMask(mask) {
  if (!isValidIpv4(mask)) return false;
  const maskInt = ipToInt(mask);
  if (maskInt === null) return false;

  // In binary, a valid subnet mask consists of N ones followed by (32 - N) zeros.
  // Inverting mask gives (32 - N) ones at the end.
  // Adding 1 to inverted mask gives a power of 2: ((~maskInt >>> 0) + 1)
  const inverted = (~maskInt) >>> 0;
  return ((inverted + 1) & inverted) === 0;
}

/**
 * Converts prefix length (0-32) to dotted-decimal subnet mask.
 */
function cidrToSubnetMask(cidr) {
  const prefix = Number(cidr);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  if (prefix === 0) return '0.0.0.0';
  const maskInt = ((0xFFFFFFFF << (32 - prefix)) >>> 0);
  return intToIp(maskInt);
}

/**
 * Converts dotted-decimal subnet mask to prefix length (0-32).
 */
function subnetMaskToCidr(mask) {
  if (!isValidSubnetMask(mask)) return null;
  const maskInt = ipToInt(mask);
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    if ((maskInt & (1 << i)) !== 0) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Resolves mask input which could be either a dotted decimal mask ("255.255.255.0")
 * or a CIDR string/number ("24" or "/24").
 */
function normalizeSubnetInput(maskOrCidr) {
  if (maskOrCidr === undefined || maskOrCidr === null) return null;
  let str = String(maskOrCidr).trim();
  if (str.startsWith('/')) {
    str = str.substring(1);
  }

  // If numeric CIDR
  if (/^\d+$/.test(str)) {
    const prefix = Number(str);
    if (prefix >= 0 && prefix <= 32) {
      return {
        cidr: prefix,
        mask: cidrToSubnetMask(prefix)
      };
    }
    return null;
  }

  // Dotted decimal
  if (isValidSubnetMask(str)) {
    return {
      cidr: subnetMaskToCidr(str),
      mask: str
    };
  }

  return null;
}

/**
 * Comprehensive subnet calculations for a given IPv4 address and subnet mask.
 * Accurately handles standard subnets, point-to-point /31 (RFC 3021), and host route /32.
 */
function calculateSubnetDetails(ip, maskOrCidr) {
  if (!isValidIpv4(ip)) {
    return { valid: false, error: 'Invalid IPv4 address format.' };
  }

  const maskInfo = normalizeSubnetInput(maskOrCidr);
  if (!maskInfo) {
    return { valid: false, error: 'Invalid subnet mask or CIDR prefix length.' };
  }

  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(maskInfo.mask);
  const cidr = maskInfo.cidr;

  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | ((~maskInt) >>> 0)) >>> 0;

  const networkAddress = intToIp(networkInt);
  const broadcastAddress = intToIp(broadcastInt);

  const totalAddresses = Math.pow(2, 32 - cidr);
  let usableHosts = 0;
  let firstUsableHost = null;
  let lastUsableHost = null;

  if (cidr === 32) {
    // Single host route
    usableHosts = 1;
    firstUsableHost = networkAddress;
    lastUsableHost = networkAddress;
  } else if (cidr === 31) {
    // RFC 3021 Point-to-Point link: both addresses are usable hosts, no broadcast
    usableHosts = 2;
    firstUsableHost = networkAddress;
    lastUsableHost = broadcastAddress;
  } else {
    // Standard subnet /0 to /30
    usableHosts = totalAddresses >= 2 ? totalAddresses - 2 : 0;
    firstUsableHost = intToIp(networkInt + 1);
    lastUsableHost = intToIp(broadcastInt - 1);
  }

  // Determine IP classification (A, B, C, D, E or Private)
  const firstOctet = Number(ip.split('.')[0]);
  let ipClass = 'Unknown';
  if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'Class A';
  else if (firstOctet === 127) ipClass = 'Loopback';
  else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'Class B';
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'Class C';
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'Class D (Multicast)';
  else if (firstOctet >= 240 && firstOctet <= 255) ipClass = 'Class E (Experimental)';

  // Private address check (RFC 1918)
  const isPrivate = (
    (firstOctet === 10) ||
    (firstOctet === 172 && Number(ip.split('.')[1]) >= 16 && Number(ip.split('.')[1]) <= 31) ||
    (firstOctet === 192 && Number(ip.split('.')[1]) === 168)
  );

  return {
    valid: true,
    ip,
    subnetMask: maskInfo.mask,
    cidrPrefix: cidr,
    networkAddress,
    broadcastAddress,
    firstUsableHost,
    lastUsableHost,
    totalAddresses,
    usableHosts,
    ipClass,
    isPrivate,
    binaryMask: maskInt.toString(2).padStart(32, '0').match(/.{8}/g).join('.'),
    binaryIp: ipInt.toString(2).padStart(32, '0').match(/.{8}/g).join('.')
  };
}

/**
 * Checks if two IPv4 addresses belong to the same subnet under a given mask.
 */
function isSameSubnet(ip1, ip2, maskOrCidr) {
  if (!isValidIpv4(ip1) || !isValidIpv4(ip2)) return false;
  const maskInfo = normalizeSubnetInput(maskOrCidr);
  if (!maskInfo) return false;

  const int1 = ipToInt(ip1);
  const int2 = ipToInt(ip2);
  const maskInt = ipToInt(maskInfo.mask);

  return ((int1 & maskInt) >>> 0) === ((int2 & maskInt) >>> 0);
}

/**
 * Validates a virtual device's IP configuration, including default gateway check.
 */
function validateDeviceIpConfig(device) {
  const errors = [];
  const warnings = [];

  if (!device) {
    return { valid: false, errors: ['Device object is missing.'], warnings: [] };
  }

  // Switches do not require IP by default
  if (device.type === 'switch') {
    return { valid: true, errors: [], warnings: [] };
  }

  // Routers have multi-interface config
  if (device.type === 'router') {
    let ifaces = [];
    try {
      const cfg = typeof device.config_json === 'string' ? JSON.parse(device.config_json) : (device.config || {});
      ifaces = cfg.interfaces || [];
    } catch {
      errors.push('Malformed router configuration JSON.');
    }

    if (ifaces.length === 0) {
      warnings.push('Router has no configured network interfaces.');
    }

    const seenIps = new Set();
    for (const iface of ifaces) {
      if (iface.ip) {
        if (!isValidIpv4(iface.ip)) {
          errors.push(`Interface ${iface.name}: Invalid IPv4 address "${iface.ip}".`);
        } else if (seenIps.has(iface.ip)) {
          errors.push(`Interface ${iface.name}: Duplicate IP assigned across router interfaces (${iface.ip}).`);
        } else {
          seenIps.add(iface.ip);
        }
      }
      if (iface.mask && !isValidSubnetMask(iface.mask)) {
        errors.push(`Interface ${iface.name}: Invalid subnet mask "${iface.mask}".`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // PC / Server validation
  if (!device.ip_address) {
    errors.push('IPv4 address is not configured.');
  } else if (!isValidIpv4(device.ip_address)) {
    errors.push(`Invalid IPv4 address format: "${device.ip_address}".`);
  }

  if (!device.subnet_mask) {
    errors.push('Subnet mask is not configured.');
  } else if (!isValidSubnetMask(device.subnet_mask)) {
    errors.push(`Invalid subnet mask: "${device.subnet_mask}".`);
  }

  // Default gateway checks
  if (device.default_gateway) {
    if (!isValidIpv4(device.default_gateway)) {
      errors.push(`Invalid default gateway address: "${device.default_gateway}".`);
    } else if (device.ip_address && device.subnet_mask && isValidIpv4(device.ip_address) && isValidSubnetMask(device.subnet_mask)) {
      if (device.ip_address === device.default_gateway) {
        errors.push(`Device IP and Default Gateway cannot be the same address (${device.ip_address}).`);
      } else if (!isSameSubnet(device.ip_address, device.default_gateway, device.subnet_mask)) {
        errors.push(
          `Default Gateway (${device.default_gateway}) is outside the host's configured subnet (${calculateSubnetDetails(device.ip_address, device.subnet_mask).networkAddress}/${subnetMaskToCidr(device.subnet_mask)}). A host cannot reach a gateway that is not in its local subnet!`
        );
      }
    }
  } else {
    warnings.push('No default gateway configured. Device will only be able to reach local subnet hosts.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Detects duplicate IP addresses configured in a list of devices.
 */
function detectDuplicateIps(devices) {
  const ipMap = new Map();
  const duplicates = [];

  for (const dev of devices) {
    if (!dev) continue;

    // Direct IP (PCs, servers)
    if (dev.ip_address && isValidIpv4(dev.ip_address)) {
      const existing = ipMap.get(dev.ip_address);
      if (existing) {
        duplicates.push({
          ip: dev.ip_address,
          deviceA: existing,
          deviceB: dev.name || dev.id
        });
      } else {
        ipMap.set(dev.ip_address, dev.name || dev.id);
      }
    }

    // Router interfaces
    if (dev.type === 'router') {
      try {
        const cfg = typeof device.config_json === 'string' ? JSON.parse(device.config_json) : (device.config || {});
        for (const iface of (cfg.interfaces || [])) {
          if (iface.ip && isValidIpv4(iface.ip)) {
            const existing = ipMap.get(iface.ip);
            if (existing) {
              duplicates.push({
                ip: iface.ip,
                deviceA: existing,
                deviceB: `${dev.name || dev.id} (${iface.name})`
              });
            } else {
              ipMap.set(iface.ip, `${dev.name || dev.id} (${iface.name})`);
            }
          }
        }
      } catch {
        // ignore parse errors here
      }
    }
  }

  return duplicates;
}

module.exports = {
  isValidIpv4,
  ipToInt,
  intToIp,
  isValidSubnetMask,
  cidrToSubnetMask,
  subnetMaskToCidr,
  normalizeSubnetInput,
  calculateSubnetDetails,
  isSameSubnet,
  validateDeviceIpConfig,
  detectDuplicateIps
};
