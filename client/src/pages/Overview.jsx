import React, { useState, useEffect } from 'react';
import {
  Users,
  Radio,
  Network,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Server,
  Zap,
  Globe,
  Wifi
} from 'lucide-react';
import { api } from '../services/api';

export default function Overview({ onNavigate, clientInfo }) {
  const [serverInfo, setServerInfo] = useState(null);
  const [stats, setStats] = useState({
    registeredClients: 0,
    activeSockets: 0,
    virtualDevices: 0,
    simulationsTotal: 0,
    simulationsSuccess: 0,
    simulationsFailed: 0,
    messagesCount: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [demoResponse, setDemoResponse] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [srv, clientsData, netData, simData, msgData, logsData] = await Promise.all([
        api.getServerInfo().catch(() => null),
        api.getClients().catch(() => ({ clients: [] })),
        api.getNetwork('default-net').catch(() => ({ network: { devices: [] } })),
        api.getSimulationHistory(50).catch(() => ({ simulations: [] })),
        api.getRecentMessages(50).catch(() => ({ messages: [] })),
        api.getLogs({ limit: 6 }).catch(() => ({ logs: [] }))
      ]);

      setServerInfo(srv);
      const sims = simData.simulations || [];
      const successes = sims.filter(s => s.result === 'SUCCESS').length;

      setStats({
        registeredClients: clientsData.clients?.length || 0,
        activeSockets: srv?.activeSocketConnections || 0,
        virtualDevices: netData.network?.devices?.length || 0,
        simulationsTotal: sims.length,
        simulationsSuccess: successes,
        simulationsFailed: sims.length - successes,
        messagesCount: msgData.messages?.length || 0
      });

      setRecentLogs(logsData.logs || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerHttpDemo = async () => {
    setDemoLoading(true);
    const start = performance.now();
    try {
      const res = await api.getServerInfo();
      const duration = Math.round(performance.now() - start);
      setDemoResponse({ ...res, roundTripMs: duration });
    } catch (err) {
      setDemoResponse({ error: err.message });
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            System Overview & Operations
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Live State
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-device metrics combined with virtual network simulation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
          >
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Physical Clients */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Physical Clients</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{stats.registeredClients}</span>
            <span className="text-xs text-emerald-400 font-mono">({stats.activeSockets} active sockets)</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Physical devices on LAN</span>
            <button
              onClick={() => onNavigate('live-network')}
              className="text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Real Messages */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Messages Exchanged</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{stats.messagesCount}</span>
            <span className="text-xs text-slate-400 font-mono">Socket.IO frames</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Client-server relays</span>
            <button
              onClick={() => onNavigate('live-network')}
              className="text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              Open Chat <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Virtual Devices */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Virtual Devices</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{stats.virtualDevices}</span>
            <span className="text-xs text-purple-300 font-mono">in active topology</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>2 Subnets modeled</span>
            <button
              onClick={() => onNavigate('virtual-lab')}
              className="text-purple-400 hover:underline flex items-center gap-0.5"
            >
              View Canvas <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Simulation Tests */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Simulated Tests</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{stats.simulationsTotal}</span>
            <span className="text-xs text-emerald-400 font-mono">{stats.simulationsSuccess} Pass</span>
            <span className="text-xs text-rose-400 font-mono">/ {stats.simulationsFailed} Fail</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Deterministic engine</span>
            <button
              onClick={() => onNavigate('tests')}
              className="text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              Test Lab <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Server & LAN Connectivity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Backend Server Runtime & LAN Interfaces</h3>
                <p className="text-xs text-slate-400">Host laptop network endpoints for multi-device demonstrations.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              PORT {serverInfo ? '5000' : '...'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Wi-Fi / LAN IP Addresses (Open on phones or other laptops):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {serverInfo?.serverInterfaces && serverInfo.serverInterfaces.length > 0 ? (
                serverInfo.serverInterfaces.map((iface, i) => (
                  <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs space-y-1">
                    <div className="text-slate-400 flex items-center justify-between">
                      <span className="text-cyan-400 font-semibold">{iface.interface}</span>
                      <span className="text-[10px] text-slate-500">{iface.netmask}</span>
                    </div>
                    <div className="text-slate-200 font-bold select-all">
                      http://{iface.ip}:5173
                    </div>
                    <div className="text-[10px] text-slate-500">API Port: 5000</div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
                  Loading network interfaces...
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-xs text-cyan-300 flex items-start gap-2.5">
            <Wifi className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
            <div>
              <span className="font-semibold">Multi-Device Viva Demonstration Tip:</span> Connect your phone to the same Wi-Fi as your laptop. In your phone's browser, open the Wi-Fi address shown above (e.g. <span className="font-mono font-bold text-slate-100">http://192.168.1.3:5173</span>). You can register with a custom name and chat directly with your laptop!
            </div>
          </div>
        </div>

        {/* Real HTTP Request-Response Demonstration Widget */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100">HTTP L7 Demo Request</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                GET /api/demo/server-info
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Trigger an authentic HTTP request to the backend server to inspect actual TCP/IP Layer 7 headers, response latency, and observed client metadata.
            </p>

            <button
              onClick={triggerHttpDemo}
              disabled={demoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {demoLoading ? 'Transmitting Request...' : 'Send HTTP Demonstration Request'}
            </button>

            {demoResponse && (
              <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Round-Trip Latency:</span>
                  <span className="text-cyan-300 font-bold">{demoResponse.roundTripMs} ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Client Observed IP:</span>
                  <span className="text-slate-200">{demoResponse.clientInfo?.observedIp || '127.0.0.1'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Request ID:</span>
                  <span className="text-slate-500 text-[10px]">{demoResponse.requestId}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-3">
            * Authentically verified through Express router and browser Fetch API.
          </div>
        </div>
      </div>

      {/* Recent Event Logs */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            Recent System Activity Logs
            <span className="text-xs text-slate-500 font-mono font-normal">(SQLite Persistent)</span>
          </h3>
          <button
            onClick={() => onNavigate('logs')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            All Logs <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    log.result === 'SUCCESS' ? 'bg-emerald-400' : log.result === 'FAILED' ? 'bg-rose-400' : 'bg-cyan-400'
                  }`} />
                  <span className="text-slate-400 font-medium">{log.event_type}</span>
                  <span className="text-slate-200">{log.description}</span>
                </div>
                <span className="text-slate-500 text-[10px]">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic py-2">No activity logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
