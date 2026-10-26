import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Server,
  Network,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function ConnectivityTests() {
  const [topology, setTopology] = useState({ devices: [], links: [] });
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [testType, setTestType] = useState('ping');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  // Load default network topology
  useEffect(() => {
    api.getNetwork('default-net').then(res => {
      if (res.network) {
        setTopology(res.network);
        if (res.network.devices?.length >= 2) {
          setSourceId(res.network.devices[0].id);
          setTargetId(res.network.devices[1].id);
        }
      }
    }).catch(console.error);
  }, []);

  const runTest = async (src, dst, type, customTop) => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await api.runSimulation({
        sourceId: src || sourceId,
        targetId: dst || targetId,
        testType: type || testType,
        customTopology: customTop || {
          devices: topology.devices,
          links: topology.links
        }
      });
      setTestResult(res);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Pre-configured viva scenarios
  const runScenario = (num) => {
    setActiveScenario(num);
    const devs = JSON.parse(JSON.stringify(topology.devices));
    const links = JSON.parse(JSON.stringify(topology.links));

    if (num === 1) {
      // Scenario 1: Same Subnet (PC1 -> PC2)
      setSourceId('dev-pc1');
      setTargetId('dev-pc2');
      setTestType('ping');
      runTest('dev-pc1', 'dev-pc2', 'ping', { devices: devs, links });
    } else if (num === 2) {
      // Scenario 2: Cross Subnet (PC1 -> PC3 across Router1)
      setSourceId('dev-pc1');
      setTargetId('dev-pc3');
      setTestType('ping');
      runTest('dev-pc1', 'dev-pc3', 'ping', { devices: devs, links });
    } else if (num === 3) {
      // Scenario 3: Incorrect Gateway on PC3 (Gateway set to 192.168.1.1 which is in LAN 1 instead of LAN 2!)
      const pc3 = devs.find(d => d.id === 'dev-pc3');
      if (pc3) pc3.default_gateway = '192.168.1.1'; // Invalid for 192.168.2.0/24
      setSourceId('dev-pc1');
      setTargetId('dev-pc3');
      setTestType('ping');
      runTest('dev-pc1', 'dev-pc3', 'ping', { devices: devs, links });
    } else if (num === 4) {
      // Scenario 4: Duplicate IP conflict (PC1 & PC2 both set to 192.168.1.10)
      const pc2 = devs.find(d => d.id === 'dev-pc2');
      if (pc2) pc2.ip_address = '192.168.1.10'; // Duplicate!
      setSourceId('dev-pc1');
      setTargetId('dev-pc2');
      setTestType('ping');
      runTest('dev-pc1', 'dev-pc2', 'ping', { devices: devs, links });
    } else if (num === 5) {
      // Scenario 5: HTTP Service disabled on Server1
      const srv = devs.find(d => d.id === 'dev-server1');
      if (srv) {
        srv.services_json = JSON.stringify({ http: { enabled: false, port: 80 } });
        srv.services = { http: { enabled: false, port: 80 } };
      }
      setSourceId('dev-pc1');
      setTargetId('dev-server1');
      setTestType('http');
      runTest('dev-pc1', 'dev-server1', 'http', { devices: devs, links });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-[#BEDEFF]/15 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="text-gradient-warm font-extrabold">Connectivity Testing & Troubleshooting Lab</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono font-medium">
            Deterministic Scenarios
          </span>
        </h1>
        <p className="text-xs text-[#BEDEFF]/75 mt-1">
          Test end-to-end network reachability, verify default gateways, and simulate real-world networking errors.
        </p>
      </div>

      {/* Pre-Built Viva Demonstration Scenarios */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFA500]/15 text-[#FFA500]">
              <Sparkles className="w-4 h-4 text-[#FFA500]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Standard Computer Networks Demonstration Scenarios</h3>
          </div>
          <span className="text-xs text-[#BEDEFF]/70 font-mono">Viva Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Scenario 1 */}
          <button
            onClick={() => runScenario(1)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 1
                ? 'bg-[#FFA500]/15 border-[#FFA500] text-white ring-2 ring-[#FFA500]/25 shadow-lg shadow-[#FFA500]/10'
                : 'bg-[#070a12]/80 hover:bg-[#0c101d] border-[#BEDEFF]/15 text-[#BEDEFF]/80 hover:border-[#BEDEFF]/35'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">1. Same-Subnet Direct (L2)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] font-mono border border-[#FFA500]/30 font-semibold">Pass</span>
            </div>
            <p className="text-[11px] text-[#BEDEFF]/70">
              PC1 (192.168.1.10) to PC2 (192.168.1.11) via Switch1. No router required.
            </p>
          </button>

          {/* Scenario 2 */}
          <button
            onClick={() => runScenario(2)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 2
                ? 'bg-[#FFA500]/15 border-[#FFA500] text-white ring-2 ring-[#FFA500]/25 shadow-lg shadow-[#FFA500]/10'
                : 'bg-[#070a12]/80 hover:bg-[#0c101d] border-[#BEDEFF]/15 text-[#BEDEFF]/80 hover:border-[#BEDEFF]/35'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">2. Cross-Subnet Routed (L3)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] font-mono border border-[#FFA500]/30 font-semibold">Pass</span>
            </div>
            <p className="text-[11px] text-[#BEDEFF]/70">
              PC1 (.1.10) to PC3 (.2.10) routed across Router1 with TTL decrement.
            </p>
          </button>

          {/* Scenario 3 */}
          <button
            onClick={() => runScenario(3)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 3
                ? 'bg-[#930031]/30 border-[#930031] text-white ring-2 ring-[#930031]/35 shadow-lg shadow-[#930031]/15'
                : 'bg-[#070a12]/80 hover:bg-[#0c101d] border-[#BEDEFF]/15 text-[#BEDEFF]/80 hover:border-[#BEDEFF]/35'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">3. Invalid Default Gateway</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#930031]/25 text-[#FFF2A7] font-mono border border-[#930031]/50 font-semibold">Fail</span>
            </div>
            <p className="text-[11px] text-[#BEDEFF]/70">
              PC3 configured with gateway outside its local subnet. Host unreachable.
            </p>
          </button>

          {/* Scenario 4 */}
          <button
            onClick={() => runScenario(4)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 4
                ? 'bg-[#930031]/30 border-[#930031] text-white ring-2 ring-[#930031]/35 shadow-lg shadow-[#930031]/15'
                : 'bg-[#070a12]/80 hover:bg-[#0c101d] border-[#BEDEFF]/15 text-[#BEDEFF]/80 hover:border-[#BEDEFF]/35'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">4. Duplicate IP Conflict</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#930031]/25 text-[#FFF2A7] font-mono border border-[#930031]/50 font-semibold">Fail</span>
            </div>
            <p className="text-[11px] text-[#BEDEFF]/70">
              Duplicate IP on same LAN segment triggers ARP collision warning.
            </p>
          </button>

          {/* Scenario 5 */}
          <button
            onClick={() => runScenario(5)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 5
                ? 'bg-[#FFA500]/15 border-[#FFA500] text-white ring-2 ring-[#FFA500]/25 shadow-lg shadow-[#FFA500]/10'
                : 'bg-[#070a12]/80 hover:bg-[#0c101d] border-[#BEDEFF]/15 text-[#BEDEFF]/80 hover:border-[#BEDEFF]/35'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">5. HTTP Service Stopped</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFA500] font-mono border border-[#FFA500]/30 font-semibold">L7 Error</span>
            </div>
            <p className="text-[11px] text-[#BEDEFF]/70">
              Network Layer 3 is reachable, but Server Port 80 HTTP daemon is disabled.
            </p>
          </button>
        </div>
      </div>

      {/* Manual Test Execution & Result Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Test Controls */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-[#BEDEFF]/15 pb-2">
            Manual Test Configuration
          </h3>

          <div>
            <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Source Host</label>
            <select
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                setActiveScenario(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#BEDEFF] font-semibold focus:outline-none focus:border-[#FFA500]"
            >
              {topology.devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip_address || d.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Destination Host</label>
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                setActiveScenario(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#FFF2A7] font-semibold focus:outline-none focus:border-[#FFA500]"
            >
              {topology.devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip_address || d.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Protocol / Layer</label>
            <select
              value={testType}
              onChange={(e) => {
                setTestType(e.target.value);
                setActiveScenario(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFA500]"
            >
              <option value="ping">ICMP Echo Ping (Network Layer 3)</option>
              <option value="http">HTTP Web Request (Application Layer 7)</option>
            </select>
          </div>

          <button
            onClick={() => runTest()}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs font-mono transition-all shadow-md shadow-[#FFA500]/25 disabled:opacity-50 font-mono"
          >
            {loading ? 'Evaluating...' : 'Execute Connectivity Test'}
          </button>
        </div>

        {/* Detailed Results & Diagnostics */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-white border-b border-[#BEDEFF]/15 pb-2 flex items-center justify-between">
            <span>Diagnostic Execution Output</span>
            {testResult && (
              <span className={`text-xs px-3 py-1 rounded-full font-mono uppercase font-bold ${
                testResult.result === 'SUCCESS'
                  ? 'bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/40'
                  : 'bg-[#930031]/25 text-[#FFF2A7] border border-[#930031]/50'
              }`}>
                {testResult.result}
              </span>
            )}
          </h3>

          {testResult ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#070a12] border border-[#BEDEFF]/20 space-y-2 shadow-inner">
                <div className="font-bold text-white text-sm">{testResult.summary}</div>
                <p className="text-[#BEDEFF]/75 text-xs font-sans leading-relaxed">{testResult.explanation}</p>
                <div className="flex items-center gap-4 text-[#BEDEFF]/60 text-[11px] pt-1.5 border-t border-[#BEDEFF]/10">
                  <span>Layer: <strong className="text-[#FFA500]">{testResult.networkLayer}</strong></span>
                  <span>Latency: <strong className="text-[#FFF2A7]">{testResult.metrics?.latencyMs}ms</strong> (modeled)</span>
                  <span>TTL: <strong className="text-white">{testResult.metrics?.ttl}</strong></span>
                </div>
              </div>

              {/* Step-by-Step Diagnostic Checkpoints */}
              <div className="space-y-2">
                <div className="text-[#BEDEFF]/70 text-[11px] uppercase tracking-wider font-semibold">
                  Underlying Network Diagnostic Verification:
                </div>
                {testResult.diagnostics?.map((diag, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      diag.passed
                        ? 'bg-[#070a12]/90 border-[#BEDEFF]/15 text-white'
                        : 'bg-[#930031]/20 border-[#930031]/40 text-[#FFF2A7]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {diag.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#FFA500] shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#FFA500] shrink-0" />
                      )}
                      <span className="font-semibold">{diag.step}</span>
                    </div>
                    <span className="text-[#BEDEFF]/70 text-[11px]">{diag.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#BEDEFF]/50 font-mono italic">
              Select a viva demonstration scenario above or run a custom test to observe diagnostic output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
