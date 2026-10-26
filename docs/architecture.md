# NetLab: System Architecture & Design

## 1. High-Level Architectural Model

NetLab enforces a clean architectural separation between **actual physical communication** and **simulated virtual networking**:

```
                       PHYSICAL NETWORK DOMAIN
               +--------------------------------------+
               | Multiple Physical Devices / Browsers |
               | (Host Laptop, Smartphones, Tablets)  |
               +--------------------------------------+
                                  |
                                  | HTTP REST / WebSocket (Socket.IO)
                                  v
+------------------------------------------------------------------------+
|                          EXPRESS BACKEND SERVER                        |
|                                                                        |
|  +--------------------------------+  +-------------------------------+ |
|  |    Real Communication Core     |  |   Virtual Simulation Engine   | |
|  | - Unique Client Registry       |  | - Deterministic L2 Switching  | |
|  | - Session-Bound Socket Router  |  | - Deterministic L3 IP Routing | |
|  | - Real-time Message Broker     |  | - Default Gateway Validator   | |
|  | - HTTP Layer 7 Demo Endpoint   |  | - Port/Service (HTTP L7) Eval | |
|  +--------------------------------+  +-------------------------------+ |
|                                   |                                    |
|  +------------------------------------------------------------------+  |
|  |                  Persistent Storage Layer (SQLite)               |  |
|  |  - clients  - messages  - networks  - devices  - links  - logs   |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
                                  |
                                  | Conceptual Demonstration Baseline
                                  v
               +--------------------------------------+
               |    Cisco Packet Tracer (Separate)    |
               | Independent network design & testing |
               +--------------------------------------+
```

---

## 2. Core Modules and Responsibilities

### Module A: Physical Multi-Device Communication Service
- **Purpose**: Authentically connects browsers across the local Wi-Fi/LAN network.
- **Client Registry**: Binds connected physical sockets to unique system identifiers (`client_timestamp_rand`).
- **Security & Non-Impersonation**: The sender identity is derived exclusively from the authenticated socket session, preventing sender spoofing.
- **Message Broker**: Delivers private messages point-to-point and broadcast messages to all connected peers with delivery confirmations.

### Module B: Virtual Network Simulation Engine
- **Purpose**: Models network forwarding decisions mathematically and deterministically.
- **Graph Representation**: Devices and links form an active network graph with stateful port assignments.
- **Layer 2 (Ethernet Switching)**: Identifies broadcast domains and traverses switches to deliver same-subnet frames.
- **Layer 3 (IP Routing & Gateways)**: Evaluates whether destination IP is outside local subnet. Enforces source default gateway resolution, router interface ingress, route table longest-prefix lookup, router interface egress, destination L2 delivery, and destination symmetric return default gateway route.
- **Layer 7 (Application Services)**: Distinguishes between network reachability (ICMP/Ping) and service availability (TCP Port 80 HTTP Daemon).

### Module C: IP Addressing & Subnet Calculator Engine
- **Bitwise Logic**: Computes network IDs, broadcast addresses, usable host ranges, and binary representations via 32-bit unsigned bitwise manipulation.
- **Binary Contiguity Validation**: Rejects non-contiguous masks (e.g. `255.255.0.255`).
- **RFC Edge Cases**: Accurately computes `/31` point-to-point links (RFC 3021) and `/32` host routes.

### Module D: Interactive UI & Packet Visualizer
- **React Flow Canvas**: Visual network design with drag-and-drop, port linking, and status badges.
- **Dynamic Packet Flow**: Visual markers animate along the exact evaluated hop sequence calculated by the backend simulation engine.
