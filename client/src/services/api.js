/**
 * NetLab API Client
 * Automatically resolves the backend server URL based on the current browser host,
 * enabling seamless LAN multi-device testing (laptops, smartphones) without hardcoding localhost.
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:5000`;
};

export const API_BASE_URL = getApiBaseUrl();

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error(`API Request Failed [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Health & Demonstration
  getHealth: () => request('/api/health'),
  getServerInfo: () => request('/api/demo/server-info'),

  // Physical Clients & Messaging
  getClients: () => request('/api/clients'),
  getClient: (id) => request(`/api/clients/${id}`),
  getRecentMessages: (limit = 50) => request(`/api/clients/messages/recent?limit=${limit}`),

  // Virtual Networks & Topology
  getNetworks: () => request('/api/networks'),
  getNetwork: (id = 'default-net') => request(`/api/networks/${id}`),
  saveNetwork: (networkData) => request('/api/networks', {
    method: 'POST',
    body: JSON.stringify(networkData)
  }),
  updateDevice: (netId, devId, config) => request(`/api/networks/${netId}/devices/${devId}`, {
    method: 'PUT',
    body: JSON.stringify(config)
  }),
  deleteDevice: (netId, devId) => request(`/api/networks/${netId}/devices/${devId}`, {
    method: 'DELETE'
  }),
  createLink: (netId, linkData) => request(`/api/networks/${netId}/links`, {
    method: 'POST',
    body: JSON.stringify(linkData)
  }),
  deleteLink: (netId, linkId) => request(`/api/networks/${netId}/links/${linkId}`, {
    method: 'DELETE'
  }),

  // IP Addressing Tools
  validateIp: (ip) => request('/api/network-tools/validate-ip', {
    method: 'POST',
    body: JSON.stringify({ ip })
  }),
  calculateSubnet: (ip, subnetMask, cidr) => request('/api/network-tools/calculate-subnet', {
    method: 'POST',
    body: JSON.stringify({ ip, subnetMask, cidr })
  }),
  checkSameSubnet: (ip1, ip2, subnetMask) => request('/api/network-tools/check-same-subnet', {
    method: 'POST',
    body: JSON.stringify({ ip1, ip2, subnetMask })
  }),
  validateDeviceConfig: (device, topologyDevices = []) => request('/api/network-tools/validate-device', {
    method: 'POST',
    body: JSON.stringify({ device, topologyDevices })
  }),

  // Simulations
  runSimulation: (simParams) => request('/api/simulations/run', {
    method: 'POST',
    body: JSON.stringify(simParams)
  }),
  getSimulationHistory: (limit = 20) => request(`/api/simulations/history?limit=${limit}`),

  // Event Logs
  getLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/logs${q ? `?${q}` : ''}`);
  },
  clearLogs: () => request('/api/logs', { method: 'DELETE' })
};
