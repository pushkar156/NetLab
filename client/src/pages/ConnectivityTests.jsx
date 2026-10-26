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
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          Connectivity Testing & Troubleshooting Lab
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            Deterministic Scenarios
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Test end-to-end network reachability, verify default gateways, and simulate real-world networking errors.
        </p>
      </div>

      {/* Pre-Built Viva Demonstration Scenarios */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">Standard Computer Networks Demonstration Scenarios</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Viva Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Scenario 1 */}
          <button
            onClick={() => runScenario(1)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 1
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/20'
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">1. Same-Subnet Direct (L2)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Pass</span>
            </div>
            <p className="text-[11px] text-slate-400">
              PC1 (192.168.1.10) to PC2 (192.168.1.11) via Switch1. No router required.
            </p>
          </button>

          {/* Scenario 2 */}
          <button
            onClick={() => runScenario(2)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 2
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/20'
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">2. Cross-Subnet Routed (L3)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">Pass</span>
            </div>
            <p className="text-[11px] text-slate-400">
              PC1 (.1.10) to PC3 (.2.10) routed across Router1 with TTL decrement.
            </p>
          </button>

          {/* Scenario 3 */}
          <button
            onClick={() => runScenario(3)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 3
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/20'
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">3. Invalid Default Gateway</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono">Fail</span>
            </div>
            <p className="text-[11px] text-slate-400">
              PC3 configured with gateway outside its local subnet. Host unreachable.
            </p>
          </button>

          {/* Scenario 4 */}
          <button
            onClick={() => runScenario(4)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 4
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/20'
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">4. Duplicate IP Conflict</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono">Fail</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Duplicate IP on same LAN segment triggers ARP collision warning.
            </p>
          </button>

          {/* Scenario 5 */}
          <button
            onClick={() => runScenario(5)}
            className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
              activeScenario === 5
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/20'
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">5. HTTP Service Stopped</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">L7 Error</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Network Layer 3 is reachable, but Server Port 80 HTTP daemon is disabled.
            </p>
          </button>
        </div>
      </div>

      {/* Manual Test Execution & Result Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Test Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 border-b border-slate-800/80 pb-2">
            Manual Test Configuration
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Source Host</label>
            <select
              value={sourceId}
              onChange={(e) => {
                setSourceId(e.target.value);
                setActiveScenario(null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none"
            >
              {topology.devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip_address || d.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Destination Host</label>
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                setActiveScenario(null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none"
            >
              {topology.devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip_address || d.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Protocol / Layer</label>
            <select
              value={testType}
              onChange={(e) => {
                setTestType(e.target.value);
                setActiveScenario(null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="ping">ICMP Echo Ping (Network Layer 3)</option>
              <option value="http">HTTP Web Request (Application Layer 7)</option>
            </select>
          </div>

          <button
            onClick={() => runTest()}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition-colors shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            {loading ? 'Evaluating...' : 'Execute Connectivity Test'}
          </button>
        </div>

        {/* Detailed Results & Diagnostics */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 border-b border-slate-800/80 pb-2 flex items-center justify-between">
            <span>Diagnostic Execution Output</span>
            {testResult && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase font-bold ${
                testResult.result === 'SUCCESS'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {testResult.result}
              </span>
            )}
          </h3>

          {testResult ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-100 text-sm">{testResult.summary}</div>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">{testResult.explanation}</p>
                <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1 border-t border-slate-850">
                  <span>Layer: {testResult.networkLayer}</span>
                  <span>Latency: {testResult.metrics?.latencyMs}ms (modeled)</span>
                  <span>TTL: {testResult.metrics?.ttl}</span>
                </div>
              </div>

              {/* Step-by-Step Diagnostic Checkpoints */}
              <div className="space-y-1.5">
                <div className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  Underlying Network Diagnostic Verification:
                </div>
                {testResult.diagnostics?.map((diag, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      diag.passed
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {diag.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-semibold">{diag.step}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{diag.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 font-mono italic">
              Select a viva demonstration scenario above or run a custom test to observe diagnostic output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
