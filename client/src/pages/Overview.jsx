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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#BEDEFF]/15 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="text-gradient-warm font-extrabold">System Overview & Operations</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono font-medium">
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs text-[#BEDEFF]/75 mt-1 font-sans">
            Real-time physical multi-device metrics combined with virtual network simulation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-1.5 rounded-xl bg-[#0c101d] hover:bg-[#111728] text-[#BEDEFF] text-xs font-mono border border-[#BEDEFF]/20 hover:border-[#FFA500]/40 transition-all shadow-sm"
          >
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Physical Clients */}
        <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#BEDEFF]/70 truncate">Clients</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-[#BEDEFF]/15 text-[#BEDEFF] border border-[#BEDEFF]/30 shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.registeredClients}</span>
              <span className="text-[10px] sm:text-xs text-[#FFF2A7] font-mono">({stats.activeSockets} active)</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] text-[#BEDEFF]/60 flex items-center justify-between border-t border-[#BEDEFF]/10 pt-2 sm:pt-2.5">
            <span className="hidden xs:inline truncate">LAN nodes</span>
            <button
              onClick={() => onNavigate('live-network')}
              className="text-[#FFA500] hover:text-[#FFF2A7] transition-colors flex items-center gap-0.5 font-medium ml-auto"
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Real Messages */}
        <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#BEDEFF]/70 truncate">Messages</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30 shrink-0">
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.messagesCount}</span>
              <span className="text-[10px] sm:text-xs text-[#BEDEFF]/80 font-mono">Relays</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] text-[#BEDEFF]/60 flex items-center justify-between border-t border-[#BEDEFF]/10 pt-2 sm:pt-2.5">
            <span className="hidden xs:inline truncate">WebSockets</span>
            <button
              onClick={() => onNavigate('live-network')}
              className="text-[#FFA500] hover:text-[#FFF2A7] transition-colors flex items-center gap-0.5 font-medium ml-auto"
            >
              Chat <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Virtual Devices */}
        <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#BEDEFF]/70 truncate">Virtual Devices</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-[#FFF2A7]/15 text-[#FFF2A7] border border-[#FFF2A7]/30 shrink-0">
                <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.virtualDevices}</span>
              <span className="text-[10px] sm:text-xs text-[#FFF2A7] font-mono">Nodes</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] text-[#BEDEFF]/60 flex items-center justify-between border-t border-[#BEDEFF]/10 pt-2 sm:pt-2.5">
            <span className="hidden xs:inline truncate">Canvas</span>
            <button
              onClick={() => onNavigate('virtual-lab')}
              className="text-[#FFA500] hover:text-[#FFF2A7] transition-colors flex items-center gap-0.5 font-medium ml-auto"
            >
              Canvas <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Simulation Tests */}
        <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#BEDEFF]/70 truncate">Simulations</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-[#930031]/30 text-[#FFF2A7] border border-[#930031]/60 shrink-0">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFA500]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stats.simulationsTotal}</span>
              <span className="text-[10px] sm:text-xs text-[#FFA500] font-mono font-bold">{stats.simulationsSuccess} Pass</span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] text-[#BEDEFF]/60 flex items-center justify-between border-t border-[#BEDEFF]/10 pt-2 sm:pt-2.5">
            <span className="hidden xs:inline truncate">L2/L3 tests</span>
            <button
              onClick={() => onNavigate('tests')}
              className="text-[#FFA500] hover:text-[#FFF2A7] transition-colors flex items-center gap-0.5 font-medium ml-auto"
            >
              Test Lab <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Server & LAN Connectivity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30">
                <Server className="w-5 h-5 text-[#FFA500]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Backend Server Runtime & LAN Interfaces</h3>
                <p className="text-xs text-[#BEDEFF]/70">Host network endpoints for physical multi-device demonstrations.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-[#FFF2A7] bg-[#FFA500]/15 border border-[#FFA500]/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFA500] animate-ping"></span>
              PORT {serverInfo ? '5000' : '...'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono text-[#BEDEFF]/70 uppercase tracking-wider font-semibold">
              Wi-Fi / LAN IP Addresses (Open on phones or other laptops):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {serverInfo?.serverInterfaces && serverInfo.serverInterfaces.length > 0 ? (
                serverInfo.serverInterfaces.map((iface, i) => (
                  <div key={i} className="p-3.5 bg-[#070a12]/90 border border-[#BEDEFF]/20 hover:border-[#FFA500]/40 transition-colors rounded-xl font-mono text-xs space-y-1 shadow-inner">
                    <div className="text-slate-400 flex items-center justify-between">
                      <span className="text-[#BEDEFF] font-bold">{iface.interface}</span>
                      <span className="text-[10px] text-[#BEDEFF]/60 font-mono">{iface.netmask}</span>
                    </div>
                    <div className="text-[#FFF2A7] font-bold select-all text-sm tracking-wide">
                      http://{iface.ip}:5173
                    </div>
                    <div className="text-[10px] text-[#FFA500]/80">API Port: 5000</div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 bg-[#070a12]/90 border border-[#BEDEFF]/20 rounded-xl text-xs text-[#BEDEFF]/60 font-mono">
                  Loading network interfaces...
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#930031]/20 via-[#0c101d] to-[#0c101d] border border-[#930031]/40 text-xs text-[#BEDEFF] flex items-start gap-3">
            <Wifi className="w-4 h-4 shrink-0 mt-0.5 text-[#FFA500]" />
            <div>
              <span className="font-semibold text-[#FFF2A7]">Multi-Device Viva Demonstration:</span> Connect your phone to the same Wi-Fi as your laptop. In your phone's browser, open the address shown above (e.g. <span className="font-mono font-bold text-[#FFA500]">http://192.168.1.3:5173</span>). You can register with a custom name and exchange real packets directly!
            </div>
          </div>
        </div>

        {/* Real HTTP Request-Response Demonstration Widget */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FFA500]" />
                <h3 className="text-sm font-semibold text-white">HTTP L7 Demo Request</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#070a12] text-[#BEDEFF] border border-[#BEDEFF]/20 font-medium">
                GET /api/demo
              </span>
            </div>

            <p className="text-xs text-[#BEDEFF]/75 mb-4 leading-relaxed">
              Trigger an authentic HTTP request to the backend server to inspect actual TCP/IP Layer 7 headers, response latency, and observed client metadata.
            </p>

            <button
              onClick={triggerHttpDemo}
              disabled={demoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FFA500]/25 hover:shadow-lg hover:shadow-[#FFA500]/30 hover:scale-[1.01] disabled:opacity-50 font-mono"
            >
              {demoLoading ? 'Transmitting Request...' : 'Send HTTP Demo Request'}
            </button>

            {demoResponse && (
              <div className="mt-4 p-3.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl space-y-2 text-xs font-mono shadow-inner">
                <div className="flex justify-between items-center text-[#BEDEFF]/80">
                  <span>Status:</span>
                  <span className="text-[#FFF2A7] font-bold bg-[#FFA500]/20 border border-[#FFA500]/40 px-2 py-0.5 rounded">200 OK</span>
                </div>
                <div className="flex justify-between items-center text-[#BEDEFF]/80">
                  <span>Latency:</span>
                  <span className="text-[#FFA500] font-bold">{demoResponse.roundTripMs} ms</span>
                </div>
                <div className="flex justify-between items-center text-[#BEDEFF]/80">
                  <span>Observed IP:</span>
                  <span className="text-white font-semibold">{demoResponse.clientInfo?.observedIp || '127.0.0.1'}</span>
                </div>
                <div className="flex justify-between items-center text-[#BEDEFF]/60 text-[10px] border-t border-[#BEDEFF]/10 pt-1.5">
                  <span>Request ID:</span>
                  <span className="text-[#BEDEFF]/70 truncate max-w-[140px]">{demoResponse.requestId}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-[#BEDEFF]/50 font-mono mt-4 pt-2 border-t border-[#BEDEFF]/10">
            * Verified through Express router and browser Fetch API.
          </div>
        </div>
      </div>

      {/* Recent Event Logs */}
      <div className="glass-panel p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            Recent System Activity Logs
            <span className="text-xs text-[#BEDEFF]/50 font-mono font-normal">(SQLite Persistent)</span>
          </h3>
          <button
            onClick={() => onNavigate('logs')}
            className="text-xs text-[#FFA500] hover:text-[#FFF2A7] transition-colors flex items-center gap-1 font-mono font-medium"
          >
            All Logs <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 sm:p-3 rounded-xl bg-[#070a12]/80 border border-[#BEDEFF]/10 hover:border-[#BEDEFF]/25 transition-colors flex items-center justify-between text-xs font-mono gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                    log.result === 'SUCCESS' ? 'bg-[#FFA500] shadow-sm shadow-[#FFA500]/50' : log.result === 'FAILED' ? 'bg-[#930031] shadow-sm shadow-[#930031]/50' : 'bg-[#BEDEFF]'
                  }`} />
                  <span className="text-[#BEDEFF] font-semibold text-[11px] sm:text-xs shrink-0">{log.event_type}</span>
                  <span className="text-slate-200 text-[11px] sm:text-xs truncate">{log.description}</span>
                </div>
                <span className="text-[#BEDEFF]/50 text-[10px] shrink-0 font-mono">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-[#BEDEFF]/50 italic py-2">No activity logged yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
