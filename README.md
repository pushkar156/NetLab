# NetLab: Hybrid Client-Server Network Design & Communication Simulator

NetLab is a full-stack, educational Computer Networks platform designed for computer science engineering students and networking demonstrations. It uniquely unifies **authentic multi-device physical communication** with an **interactive virtual network simulator** and a corresponding **Cisco Packet Tracer practical design**.

---

## 🌟 Key Features

1. **Real Multi-Device Physical Communication**:
   - Host the backend on your laptop; connect phones, tablets, or other laptops on the same Wi-Fi.
   - Dynamic client registry with unique client IDs.
   - Real-time private and broadcast messaging via Socket.IO with delivery confirmations.
   - Live HTTP Layer 7 request-response demonstration displaying observed client IP and server metadata.

2. **Interactive Virtual Network Designer (React Flow)**:
   - Create, drag, configure, and connect PCs, Servers, Layer 2 Switches, and Routers.
   - Configure IPv4 addresses, subnet masks, default gateways, and server services.
   - Save and load virtual network topologies to persistent SQLite database.

3. **Deterministic Simulation Engine**:
   - Rigorous Layer 2 switching logic (broadcast domains, ARP resolution).
   - Layer 3 routing logic (default gateway validation, routing table lookup, symmetric return routing).
   - Layer 7 service evaluation (distinguishing network reachability from service daemon availability).
   - Interactive animated packet flow along evaluated hop paths.

4. **IP Addressing & Subnet Calculator**:
   - Validates IPv4 format and binary contiguous subnet masks.
   - Computes network, broadcast, first/last usable host addresses, and CIDR prefix.
   - Supports RFC 3021 point-to-point links (/31) and host routes (/32).

5. **Cisco Packet Tracer Implementation**:
   - Comprehensive configuration guide, addressing table, and Cisco IOS commands in [`docs/packet-tracer-guide.md`](docs/packet-tracer-guide.md).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v22+)
- npm

### 1. Install Dependencies
```powershell
npm run install:all
```

### 2. Start the Backend Server
```powershell
npm run dev:server
```
*The server will automatically display your laptop's LAN IP address (e.g. `http://192.168.1.3:5000`).*

### 3. Start the Frontend Client
In a separate terminal:
```powershell
npm run dev:client
```
*The client dev server binds to `0.0.0.0:5173`, making it accessible to any device on your Wi-Fi!*

### 4. Connect from Other Physical Devices (Phones / Laptops)
- Ensure both devices are on the same Wi-Fi network.
- On your phone or second laptop, open:
  ```
  http://<YOUR_LAPTOP_IP>:5173
  ```
- Register your display name (e.g., "Pushkar's Phone") and start testing real-time client-server communication!

---

## 🧪 Running Automated Tests
```powershell
npm run test:server
```
Runs 25 automated unit tests verifying IPv4 calculations, subnetting edge cases, and deterministic simulation rules.

---

## 📁 Repository Structure
```
netlab/
├── client/          # React 19 + Vite + Tailwind CSS + React Flow frontend
├── server/          # Node.js + Express + Socket.IO + SQLite backend
│   ├── src/
│   │   ├── database/     # SQLite schema & persistence
│   │   ├── networking/   # IPv4 and subnet math engine
│   │   ├── simulation/   # Deterministic network simulation engine
│   │   ├── sockets/      # Real-time WebSocket communication
│   │   ├── routes/       # REST API endpoints
│   │   └── server.js     # Entry point with LAN interface discovery
│   └── tests/            # Automated test suite (25 tests)
├── docs/            # Comprehensive technical documentation & Packet Tracer guide
└── package.json     # Root orchestration scripts
```
