# NetLab: IPv4 Addressing & Subnetting Guide

---

## 1. IPv4 Structure & Representation
An IPv4 address consists of 32 binary bits divided into four 8-bit octets:
```
  Octet 1     .   Octet 2     .   Octet 3     .   Octet 4
11000000 (192)  10101000 (168)  00000001 (1)    00001010 (10)
```

### Validation Rules Enforced by NetLab:
1. Exactly four decimal octets separated by dots.
2. Each octet value between `0` and `255` inclusive.
3. No non-numeric characters or negative values.
4. No invalid leading zeros (e.g. `01` is rejected; single `0` is allowed).

---

## 2. Subnet Masks & Binary Contiguity
A valid subnet mask must consist of contiguous binary `1`s (network portion) followed by contiguous binary `0`s (host portion).

### Mathematical Contiguity Check:
In NetLab's [`ipUtils.js`](../server/src/networking/ipUtils.js), a 32-bit mask integer is validated using bitwise arithmetic:
```javascript
const inverted = (~maskInt) >>> 0;
const isContiguous = ((inverted + 1) & inverted) === 0;
```
- `255.255.255.0` -> `11111111.11111111.11111111.00000000` (Valid /24)
- `255.255.0.255` -> `11111111.11111111.00000000.11111111` (**INVALID**; non-contiguous)

---

## 3. Network & Broadcast Calculations

For any given IPv4 address and subnet mask:
1. **Network Address**: `IP & SubnetMask`
2. **Broadcast Address**: `NetworkAddress | (~SubnetMask)`
3. **Total Addresses**: `2^(32 - CIDR)`

### Special RFC Cases Supported:
- **/31 (RFC 3021)**: Used for point-to-point router links. Both addresses are usable as host endpoints (no traditional network or broadcast address consumed).
- **/32**: Host route representing a single unique device. Total usable hosts = 1.
- **/0 to /30**: Standard subnets where `Usable Hosts = Total - 2`.

---

## 4. Same-Subnet Determination
To determine whether Host A (`192.168.1.10`) and Host B (`192.168.2.10`) can communicate directly at Layer 2:
```
Host A: 192.168.1.10 & 255.255.255.0 = 192.168.1.0
Host B: 192.168.2.10 & 255.255.255.0 = 192.168.2.0
```
Because the calculated Network IDs do not match, Host A cannot send an ARP request directly to Host B. Host A **must** transmit the packet to its **Default Gateway** (`192.168.1.1`) to cross into LAN 2.
