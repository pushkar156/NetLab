# Cisco Packet Tracer Implementation Guide
## NetLab: Dual-Subnet Client-Server Topology

> **Note**: This Cisco Packet Tracer network is an independent, practical demonstration of the exact same network architecture implemented virtually in NetLab. Packet Tracer runs separately as Cisco's proprietary network simulation software.

---

### 1. Network Topology Overview
The topology consists of two distinct Local Area Networks (LANs) interconnected through an IP Router:
- **LAN 1 (Engineering / Server LAN)**: `192.168.1.0/24`
- **LAN 2 (Sales / Remote Client LAN)**: `192.168.2.0/24`

```
 [PC1: .10] ----\
                 [Switch 1] ----- [Router 1: Gig0/0 (.1) | Gig0/1 (.1)] ----- [Switch 2] ----- [PC3: .10]
 [PC2: .11] ----/     |
                      |
              [Server 1: .100]
```

---

### 2. Complete IPv4 Addressing Table

| Device | Interface | IPv4 Address | Subnet Mask | Default Gateway | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PC1** | FastEthernet0 | `192.168.1.10` | `255.255.255.0` | `192.168.1.1` | LAN 1 Client Host |
| **PC2** | FastEthernet0 | `192.168.1.11` | `255.255.255.0` | `192.168.1.1` | LAN 1 Client Host |
| **Server1** | FastEthernet0 | `192.168.1.100` | `255.255.255.0` | `192.168.1.1` | HTTP Web Server |
| **Router1** | GigabitEthernet0/0 | `192.168.1.1` | `255.255.255.0` | N/A | LAN 1 Default Gateway |
| **Router1** | GigabitEthernet0/1 | `192.168.2.1` | `255.255.255.0` | N/A | LAN 2 Default Gateway |
| **PC3** | FastEthernet0 | `192.168.2.10` | `255.255.255.0` | `192.168.2.1` | LAN 2 Remote Host |

*Switch 1 and Switch 2 are unmanaged Layer 2 switches (e.g. Cisco Catalyst 2960) and operate transparently without needing IP addresses for data forwarding.*

---

### 3. Step-by-Step Device Placement & Cabling

1. **Place Devices in Packet Tracer**:
   - 3x End Devices -> **PC-PT** (`PC1`, `PC2`, `PC3`)
   - 1x End Devices -> **Server-PT** (`Server1`)
   - 2x Switches -> **2960-24TT** (`Switch1`, `Switch2`)
   - 1x Router -> **1941** or **2911** or **4321** (`Router1`)

2. **Cable Connections (Copper Straight-Through)**:
   - `PC1` [FastEthernet0] -> `Switch1` [FastEthernet0/1]
   - `PC2` [FastEthernet0] -> `Switch1` [FastEthernet0/2]
   - `Server1` [FastEthernet0] -> `Switch1` [FastEthernet0/3]
   - `Switch1` [GigabitEthernet0/1] -> `Router1` [GigabitEthernet0/0]
   - `Router1` [GigabitEthernet0/1] -> `Switch2` [GigabitEthernet0/1]
   - `Switch2` [FastEthernet0/1] -> `PC3` [FastEthernet0/1]

---

### 4. Router CLI Configuration Commands

Click on **Router1** -> Open the **CLI** tab -> If prompted `Continue with configuration dialog? [yes/no]:`, type `no` and press Enter.

Run the following Cisco IOS commands:

```cisco
Router> enable
Router# configure terminal
Router(config)# hostname Router1

! Configure Interface GigabitEthernet0/0 (LAN 1 Gateway)
Router1(config)# interface GigabitEthernet0/0
Router1(config-if)# description Gateway to LAN 1 (192.168.1.0/24)
Router1(config-if)# ip address 192.168.1.1 255.255.255.0
Router1(config-if)# no shutdown
Router1(config-if)# exit

! Configure Interface GigabitEthernet0/1 (LAN 2 Gateway)
Router1(config)# interface GigabitEthernet0/1
Router1(config-if)# description Gateway to LAN 2 (192.168.2.0/24)
Router1(config-if)# ip address 192.168.2.1 255.255.255.0
Router1(config-if)# no shutdown
Router1(config-if)# exit

! Save configuration to NVRAM
Router1(config)# end
Router1# copy running-config startup-config
Destination filename [startup-config]? [Press ENTER]
[OK]
```

#### Routing Table Verification
Because both subnets are directly attached to Router1, the router creates connected routes automatically:
```cisco
Router1# show ip route
Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
Gateway of last resort is not set

C    192.168.1.0/24 is directly connected, GigabitEthernet0/0
C    192.168.2.0/24 is directly connected, GigabitEthernet0/1
```

---

### 5. End Device Configuration

#### Configuring PC1
- Click **PC1** -> **Desktop** tab -> **IP Configuration**
- Choose **Static**
- IP Address: `192.168.1.10`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.1.1`

#### Configuring PC2
- Click **PC2** -> **Desktop** tab -> **IP Configuration**
- Choose **Static**
- IP Address: `192.168.1.11`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.1.1`

#### Configuring Server1 (HTTP Service)
- Click **Server1** -> **Desktop** tab -> **IP Configuration**
  - IP Address: `192.168.1.100`
  - Subnet Mask: `255.255.255.0`
  - Default Gateway: `192.168.1.1`
- Click **Services** tab -> **HTTP**:
  - Ensure **HTTP** is toggled **On**.
  - Edit `index.html` to display:
    ```html
    <html><body><h1>NetLab Web Server</h1><p>Client-Server Communication Successful!</p></body></html>
    ```

#### Configuring PC3
- Click **PC3** -> **Desktop** tab -> **IP Configuration**
- Choose **Static**
- IP Address: `192.168.2.10`
- Subnet Mask: `255.255.255.0`
- Default Gateway: `192.168.2.1`

---

### 6. Verification & Practical Testing Checklist

| Test # | Test Description | Source Device | Target Device | Expected Result in Packet Tracer |
| :--- | :--- | :--- | :--- | :--- |
| **T1** | Same-Subnet Ping | PC1 (`192.168.1.10`) | PC2 (`192.168.1.11`) | `Reply from 192.168.1.11: bytes=32 time<1ms TTL=128` (4/4 packets) |
| **T2** | Server Ping (LAN 1) | PC1 (`192.168.1.10`) | Server1 (`192.168.1.100`) | `Reply from 192.168.1.100: bytes=32 time<1ms TTL=128` |
| **T3** | Cross-Subnet Ping | PC1 (`192.168.1.10`) | PC3 (`192.168.2.10`) | First packet may time out for ARP, followed by `Reply from 192.168.2.10: time<1ms TTL=127` (TTL decremented by 1 at router) |
| **T4** | HTTP Web Request | PC3 (`192.168.2.10`) | `http://192.168.1.100` | Opens **Desktop -> Web Browser**, types `192.168.1.100`. Web page loads successfully across router! |
| **T5** | Misconfigured Gateway | PC3 (`192.168.2.10`) | Server1 (`192.168.1.100`) | Change PC3 gateway to `192.168.1.1` (wrong subnet). Ping returns `Destination host unreachable`. Restore gateway to `192.168.2.1` to recover. |
| **T6** | Packet Tracer Simulation Mode | PC1 | PC3 | Switch to **Simulation Mode** (bottom-right). Filter ICMP and HTTP. Click Auto-Capture to watch packet move hop-by-hop across Switch1 -> Router1 -> Switch2 -> PC3! |

---

### 7. Recommended Screenshots for Final Lab Report & Viva
1. **Full Network Topology Diagram**: Showing all 7 devices with green link lights.
2. **Router CLI**: Output of `show ip interface brief` and `show ip route`.
3. **PC1 Command Prompt**: Successful ping to PC2 and PC3.
4. **PC3 Web Browser**: Loaded `http://192.168.1.100` webpage proving Layer 7 cross-subnet service delivery.
5. **Simulation Mode Event List**: Showing ARP and ICMP Echo Request / Reply packet sequence.
6. **Failure Demonstration**: Command Prompt showing `Destination host unreachable` when default gateway is misconfigured.
