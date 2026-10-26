# NetLab: Automated & Manual Testing Specification

---

## 1. Automated Unit Test Suite

The test suite runs using Node.js's native test runner (`node --test tests/**/*.test.js`) without external test runner bloat.

### Run Automated Tests
```powershell
npm run test:server
```

### Test Coverage Overview (25 Automated Tests)

| Test Module | Scenarios Covered | Verification Criteria | Status |
| :--- | :--- | :--- | :--- |
| **IPv4 Address Validation** | Standard IPs, Out of range octets, Missing octets, Leading zeros | Strict 4-octet 0–255 boundaries, decimal format | `PASS` (3/3) |
| **Subnet Mask Validation** | Contiguous masks, Non-contiguous masks, CIDR conversion | Binary contiguity verification (`255.255.0.255` rejected) | `PASS` (3/3) |
| **Subnet & Edge Case Math** | Standard /24, Point-to-point /31 (RFC 3021), Host route /32 | Accurate usable host counts, broadcast addresses | `PASS` (3/3) |
| **Same-Subnet Detection** | Same /24 subnet, Different /24 subnets, Class B /16 | Bitwise AND comparison between host IP and netmask | `PASS` (3/3) |
| **Host IP & Gateway Validation** | In-subnet gateway, Out-of-subnet gateway, Duplicate IP | Default gateway must belong to host local subnet | `PASS` (3/3) |
| **Simulation Scenario 1** | Same-Subnet Communication (PC1 -> PC2) | Direct Layer 2 switching across Switch1 without router | `PASS` (1/1) |
| **Simulation Scenario 2** | Cross-Subnet IP Routing (PC1 -> PC3) | Routed hop across Router1 (`PC1 -> Sw1 -> R1 -> Sw2 -> PC3`) | `PASS` (1/1) |
| **Simulation Scenario 3** | Invalid Target Default Gateway (PC3) | Asymmetric return route failure diagnostics | `PASS` (1/1) |
| **Simulation Scenario 4** | Inactive / Severed Physical Cable Link | Layer 1 Physical link-down diagnostic | `PASS` (1/1) |
| **Simulation Scenario 5** | HTTP Service Daemon Status Evaluation | L3 Ping succeeds, while L7 HTTP Port 80 is disabled | `PASS` (1/1) |

---

## 2. Multi-Device Manual Testing Checklist (Demonstration Verification)

Follow this checklist to demonstrate live client-server communication across at least 3 physical devices:

| Step | Action | Expected Physical Result | Verified? |
| :--- | :--- | :--- | :--- |
| **1** | Start backend server on laptop (`npm run dev:server`). | Server logs show LAN IP address (e.g. `http://192.168.1.3:5000`). | [x] |
| **2** | Open `http://localhost:5173` on laptop. | Overview dashboard loads with Online backend status. | [x] |
| **3** | Register laptop display name as **"Pushkar Laptop"**. | Status changes to Active Online; client ID generated. | [x] |
| **4** | On a smartphone connected to the same Wi-Fi, open `http://192.168.1.3:5173`. | NetLab loads on mobile browser. | [x] |
| **5** | Register phone display name as **"Ayush Phone"**. | Phone appears instantly in Active Physical Nodes on laptop. | [x] |
| **6** | Send a Broadcast message from phone. | Message appears on both laptop and phone with server delivery badge. | [x] |
| **7** | Send a Private message from laptop addressed specifically to **"Ayush Phone"**. | Message is routed privately through server; only recipient receives it. | [x] |
| **8** | Disconnect phone Wi-Fi. | Phone is marked inactive in SQLite database and removed from active list. | [x] |
