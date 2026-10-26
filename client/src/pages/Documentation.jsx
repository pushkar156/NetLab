import React from 'react';
import {
  BookOpen,
  Network,
  HelpCircle,
  Shield,
  Layers,
  Radio,
  Globe,
  Terminal,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Documentation() {
  const vivaQuestions = [
    {
      q: 'What is the fundamental difference between actual physical communication and simulated virtual networking in NetLab?',
      a: 'Actual physical communication occurs between real devices (your laptop, phones) using real TCP/IP and WebSocket sockets, validated by the Node.js backend. In contrast, simulated virtual networking runs inside a mathematical graph engine that evaluates virtual IPv4 addresses, subnet masks, routing tables, and modeled link hops deterministically.'
    },
    {
      q: 'Why does a host need a Default Gateway to communicate with a host in another subnet?',
      a: 'A host performs a bitwise AND between its subnet mask and destination IP. If the resulting network ID differs from its own local network ID, the packet cannot be delivered directly over Layer 2 ARP/switching. The host must wrap the packet in an Ethernet frame addressed to the MAC address of its Default Gateway (the local router interface), which routes it to the target subnet.'
    },
    {
      q: 'Why can a server be reachable via Ping (ICMP) while an HTTP request to it fails?',
      a: 'Ping operates at Network Layer 3 (ICMP Echo Request/Reply). An HTTP request operates at Transport Layer 4 (TCP Port 80) and Application Layer 7. If the server host is online and routed properly, ICMP responds; however, if the web server daemon (e.g. Apache, Nginx, or NetLab HTTP service) is disabled or port 80 is closed, the TCP connection is refused (RST) or dropped.'
    },
    {
      q: 'What is the role of an unmanaged Layer 2 Switch vs a Layer 3 Router?',
      a: 'A Layer 2 Switch operates within a single broadcast domain, inspecting Ethernet frame MAC addresses to forward traffic between local ports without inspecting IP headers. A Layer 3 Router connects disparate subnets/broadcast domains, decrements IP Time-To-Live (TTL), and consults a routing table to forward packets across networks.'
    },
    {
      q: 'How does Cisco Packet Tracer relate to this project?',
      a: 'Cisco Packet Tracer is a separately configured, standalone Cisco simulator used in computer networking curricula. NetLab mirrors the exact same dual-subnet architecture (LAN 1: 192.168.1.0/24 and LAN 2: 192.168.2.0/24) in Packet Tracer, allowing students to verify Cisco IOS router commands (e.g. `interface Gig0/0`, `ip address 192.168.1.1 255.255.255.0`, `no shutdown`) alongside the web platform.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="border-b border-[#BEDEFF]/15 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="text-gradient-warm font-extrabold">Computer Networks Theory & Viva Defense Guide</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono font-medium">
            Academic Reference
          </span>
        </h1>
        <p className="text-xs text-[#BEDEFF]/75 mt-1">
          Concise, student-friendly explanations of core client-server networking principles and defense questions.
        </p>
      </div>

      {/* Core Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Concept 1 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-[#BEDEFF] font-semibold text-sm">
            <div className="p-1.5 rounded-lg bg-[#BEDEFF]/15 text-[#BEDEFF]">
              <Globe className="w-4 h-4" />
            </div>
            Client-Server Architecture
          </div>
          <p className="text-xs text-[#BEDEFF]/75 leading-relaxed">
            A distributed computing structure where service providers (<strong className="text-[#FFF2A7]">Servers</strong>) listen for requests on designated ports, and service requesters (<strong className="text-[#FFA500]">Clients</strong>) initiate communication over standard protocols (HTTP, WebSockets).
          </p>
        </div>

        {/* Concept 2 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-[#FFF2A7] font-semibold text-sm">
            <div className="p-1.5 rounded-lg bg-[#FFF2A7]/15 text-[#FFF2A7]">
              <Layers className="w-4 h-4" />
            </div>
            IPv4 & Subnet Masks
          </div>
          <p className="text-xs text-[#BEDEFF]/75 leading-relaxed">
            An IPv4 address is a 32-bit identifier represented as 4 decimal octets. The Subnet Mask demarcates the network prefix from the host identifier through bitwise AND, allowing hosts to determine whether destinations are local or remote.
          </p>
        </div>

        {/* Concept 3 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-[#FFA500] font-semibold text-sm">
            <div className="p-1.5 rounded-lg bg-[#FFA500]/15 text-[#FFA500]">
              <Shield className="w-4 h-4" />
            </div>
            Default Gateway & Routing
          </div>
          <p className="text-xs text-[#BEDEFF]/75 leading-relaxed">
            The Default Gateway is the IP address of the local router interface on the host's subnet. It acts as the exit node for all packets addressed to external networks.
          </p>
        </div>

        {/* Concept 4 */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-[#BEDEFF] font-semibold text-sm">
            <div className="p-1.5 rounded-lg bg-[#930031]/30 text-[#FFF2A7]">
              <Radio className="w-4 h-4 text-[#FFA500]" />
            </div>
            WebSockets (Full Duplex) vs HTTP
          </div>
          <p className="text-xs text-[#BEDEFF]/75 leading-relaxed">
            HTTP follows a strict half-duplex request-response cycle. WebSockets establish an open, persistent TCP connection enabling simultaneous bidirectional streaming without HTTP header polling overhead.
          </p>
        </div>
      </div>

      {/* Packet Tracer Guide Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFA500]/15 text-[#FFA500]">
              <Terminal className="w-5 h-5 text-[#FFA500]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Cisco Packet Tracer Independent Configuration</h3>
          </div>
          <span className="text-xs text-[#FFF2A7] font-mono bg-[#930031]/25 border border-[#930031]/50 px-2.5 py-0.5 rounded-full font-medium">Module M Guide</span>
        </div>

        <p className="text-xs text-[#BEDEFF]/75 leading-relaxed">
          The corresponding Packet Tracer network demonstrates the same architecture with 3 PCs, 1 Server, 2 Switches, and 1 Router. Detailed Cisco IOS configuration commands and verification steps are documented in <code className="text-[#FFF2A7] bg-[#070a12] px-2 py-0.5 rounded font-mono border border-[#BEDEFF]/20">docs/packet-tracer-guide.md</code>.
        </p>

        <div className="p-4 rounded-xl bg-[#070a12] border border-[#BEDEFF]/20 font-mono text-xs space-y-1.5 text-slate-300 shadow-inner">
          <div className="text-[#BEDEFF]/70 font-semibold">Router1 Cisco IOS Quick Configuration:</div>
          <div className="text-[#FFA500]">Router1(config)# interface GigabitEthernet0/0</div>
          <div className="text-[#FFF2A7]">Router1(config-if)# ip address 192.168.1.1 255.255.255.0</div>
          <div className="text-[#BEDEFF]">Router1(config-if)# no shutdown</div>
          <div className="text-[#FFA500]">Router1(config)# interface GigabitEthernet0/1</div>
          <div className="text-[#FFF2A7]">Router1(config-if)# ip address 192.168.2.1 255.255.255.0</div>
          <div className="text-[#BEDEFF]">Router1(config-if)# no shutdown</div>
        </div>
      </div>

      {/* Frequently Asked Viva Questions */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-[#BEDEFF]/15 pb-3 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FFA500]/15 text-[#FFA500]">
            <HelpCircle className="w-5 h-5 text-[#FFA500]" />
          </div>
          Viva & Lab Defense Questions & Answers
        </h3>

        <div className="space-y-4">
          {vivaQuestions.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#070a12]/90 border border-[#BEDEFF]/15 space-y-2 hover:border-[#FFA500]/30 transition-colors">
              <div className="text-xs font-bold text-[#FFF2A7] flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#FFA500]/20 border border-[#FFA500]/40 text-[10px] flex items-center justify-center shrink-0 mt-0.5 text-[#FFA500] font-mono font-bold">
                  Q{i + 1}
                </span>
                <span className="leading-snug">{item.q}</span>
              </div>
              <p className="text-xs text-[#BEDEFF]/80 leading-relaxed pl-8 font-sans">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
