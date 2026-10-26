# NetLab REST API Specification

Base URL: `http://<SERVER_HOST>:5000/api`

---

## 1. Health & Demonstration Endpoints

### `GET /api/health`
Returns backend health, process uptime, and system timestamp.
- **Response**:
  ```json
  {
    "status": "healthy",
    "uptimeSeconds": 142,
    "timestamp": "2026-10-24T09:20:00.000Z",
    "nodeVersion": "v22.14.0"
  }
  ```

### `GET /api/demo/server-info`
Demonstrates an authentic HTTP request-response cycle over the application layer (Layer 7). Returns observed client IP, user agent, active socket connections, and server LAN interfaces.

---

## 2. Physical Clients & Messaging Endpoints

### `GET /api/clients`
Lists all registered clients in the SQLite database with their active connection status and last-seen timestamps.

### `GET /api/clients/:id`
Returns details of a specific client.

### `GET /api/clients/messages/recent?limit=50`
Retrieves recent messages from persistent SQLite history.

---

## 3. Network Topology Management Endpoints

### `GET /api/networks`
Lists all saved virtual networks.

### `GET /api/networks/:id`
Retrieves a complete network topology, including its devices and links.

### `POST /api/networks`
Saves or overwrites a network topology snapshot.
- **Payload**:
  ```json
  {
    "id": "custom-net-1",
    "name": "My Custom Topology",
    "description": "Custom subnetting experiment",
    "devices": [...],
    "links": [...]
  }
  ```

### `PUT /api/networks/:id/devices/:deviceId`
Updates configuration for a specific device (IP address, subnet mask, default gateway, services, position).

### `DELETE /api/networks/:id/devices/:deviceId`
Deletes a device and automatically removes any connected links.

### `POST /api/networks/:id/links`
Connects two devices.
- **Payload**: `{ "source_id": "dev-pc1", "target_id": "dev-sw1", "source_port": "Eth0", "target_port": "Fa0/1" }`

### `DELETE /api/networks/:id/links/:linkId`
Deletes a link between devices.

---

## 4. IP Addressing & Subnetting Tools

### `POST /api/network-tools/validate-ip`
Validates IPv4 string and returns binary octet breakdown.
- **Payload**: `{ "ip": "192.168.1.10" }`

### `POST /api/network-tools/calculate-subnet`
Calculates network address, broadcast address, first/last usable host, and total/usable counts.
- **Payload**: `{ "ip": "192.168.1.50", "subnetMask": "255.255.255.0" }`

### `POST /api/network-tools/check-same-subnet`
Determines if two IPv4 addresses share the same network ID under a given mask.
- **Payload**: `{ "ip1": "192.168.1.10", "ip2": "192.168.2.10", "subnetMask": "255.255.255.0" }`

---

## 5. Network Simulation Endpoints

### `POST /api/simulations/run`
Runs the deterministic simulation engine and records results.
- **Payload**:
  ```json
  {
    "networkId": "default-net",
    "sourceId": "dev-pc1",
    "targetId": "dev-pc3",
    "testType": "ping"
  }
  ```
- **Response**: Returns `success`, `result` (`SUCCESS` | `FAILED`), `summary`, `explanation`, `networkLayer`, `hops`, `metrics`, and `diagnostics`.

### `GET /api/simulations/history`
Returns historical simulation records.

---

## 6. Event Logs Endpoints

### `GET /api/logs?limit=50&event_type=...&result=...`
Returns persistent application and simulation logs with optional filters.

### `DELETE /api/logs`
Clears event logs.
