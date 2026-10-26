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
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          Computer Networks Theory & Viva Defense Guide
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            Academic Reference
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Concise, student-friendly explanations of core client-server networking principles and defense questions.
        </p>
      </div>

      {/* Core Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Concept 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Globe className="w-4 h-4" />
            Client-Server Architecture
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A distributed computing structure where service providers (<strong className="text-slate-200">Servers</strong>) listen for requests on designated ports, and service requesters (<strong className="text-slate-200">Clients</strong>) initiate communication over standard protocols (HTTP, WebSockets).
          </p>
        </div>

        {/* Concept 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            IPv4 & Subnet Masks
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            An IPv4 address is a 32-bit identifier represented as 4 decimal octets. The Subnet Mask demarcates the network prefix from the host identifier through bitwise AND, allowing hosts to determine whether destinations are local or remote.
          </p>
        </div>

        {/* Concept 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Shield className="w-4 h-4" />
            Default Gateway & Routing
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Default Gateway is the IP address of the local router interface on the host's subnet. It acts as the exit node for all packets addressed to external networks.
          </p>
        </div>

        {/* Concept 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Radio className="w-4 h-4" />
            WebSockets (Full Duplex) vs HTTP
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            HTTP follows a strict half-duplex request-response cycle. WebSockets establish an open, persistent TCP connection enabling simultaneous bidirectional streaming without HTTP header polling overhead.
          </p>
        </div>
      </div>

      {/* Packet Tracer Guide Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-100">Cisco Packet Tracer Independent Configuration</h3>
          </div>
          <span className="text-xs text-purple-400 font-mono">Module M Guide</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The corresponding Packet Tracer network demonstrates the same architecture with 3 PCs, 1 Server, 2 Switches, and 1 Router. Detailed Cisco IOS configuration commands and verification steps are documented in <code className="text-cyan-300 font-mono">docs/packet-tracer-guide.md</code>.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
          <div className="text-slate-500 font-semibold">Router1 Cisco IOS Quick Configuration:</div>
          <div className="text-purple-300">Router1(config)# interface GigabitEthernet0/0</div>
          <div className="text-purple-300">Router1(config-if)# ip address 192.168.1.1 255.255.255.0</div>
          <div className="text-purple-300">Router1(config-if)# no shutdown</div>
          <div className="text-purple-300">Router1(config)# interface GigabitEthernet0/1</div>
          <div className="text-purple-300">Router1(config-if)# ip address 192.168.2.1 255.255.255.0</div>
          <div className="text-purple-300">Router1(config-if)# no shutdown</div>
        </div>
      </div>

      {/* Frequently Asked Viva Questions */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 border-b border-slate-800/80 pb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          Viva & Lab Defense Questions & Answers
        </h3>

        <div className="space-y-4">
          {vivaQuestions.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-cyan-300 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] flex items-center justify-center shrink-0 mt-0.5 text-cyan-400 font-mono">
                  Q{i + 1}
                </span>
                <span>{item.q}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-7">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
