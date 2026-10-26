import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Filter,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Info,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

export default function EventLogs() {
  const [logs, setLogs] = useState([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (eventTypeFilter) params.event_type = eventTypeFilter;
      if (resultFilter) params.result = resultFilter;
      params.limit = 100;

      const res = await api.getLogs(params);
      if (res.logs) setLogs(res.logs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter, resultFilter]);

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all persistent event logs?')) {
      try {
        await api.clearLogs();
        setLogs([]);
      } catch (err) {
        alert('Failed to clear logs: ' + err.message);
      }
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.description && l.description.toLowerCase().includes(term)) ||
      (l.source && l.source.toLowerCase().includes(term)) ||
      (l.correlation_id && l.correlation_id.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-[#BEDEFF]/15 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="text-gradient-warm font-extrabold">Structured Network Event Logs</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono font-medium">
            SQLite Audit Trail
          </span>
        </h1>
        <p className="text-xs text-[#BEDEFF]/75 mt-1">
          Complete audit trail of physical device connections, message relays, and simulated network diagnostics.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#BEDEFF]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, device, ID..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFA500] shadow-inner"
            />
          </div>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#BEDEFF] focus:outline-none focus:border-[#FFA500]"
          >
            <option value="">All Event Types</option>
            <option value="CLIENT_REGISTERED">CLIENT_REGISTERED</option>
            <option value="CLIENT_DISCONNECTED">CLIENT_DISCONNECTED</option>
            <option value="MESSAGE_SENT">MESSAGE_SENT</option>
            <option value="SIMULATION_EXECUTED">SIMULATION_EXECUTED</option>
            <option value="SYSTEM_INIT">SYSTEM_INIT</option>
          </select>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3.5 py-2 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#BEDEFF] focus:outline-none focus:border-[#FFA500]"
          >
            <option value="">All Results</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="INFO">INFO</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 rounded-xl bg-[#070a12] hover:bg-[#111728] text-[#BEDEFF] hover:text-white border border-[#BEDEFF]/20 transition-all shadow-sm"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FFA500] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 rounded-xl bg-[#930031]/20 hover:bg-[#930031]/30 text-[#FFF2A7] border border-[#930031]/50 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#FFA500]" />
            Clear
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-[#BEDEFF]/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#070a12]/90 border-b border-[#BEDEFF]/15 text-[#BEDEFF]/70 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Result</th>
                <th className="py-3.5 px-4">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BEDEFF]/10 text-slate-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#070a12]/60 transition-colors">
                    <td className="py-3.5 px-4 text-[#BEDEFF]/50 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#FFA500]">
                      {log.event_type}
                    </td>
                    <td className="py-3.5 px-4 text-[#BEDEFF]/80">
                      {log.source || 'SYSTEM'}
                    </td>
                    <td className="py-3.5 px-4 text-white max-w-md truncate font-sans">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        log.result === 'SUCCESS' || log.result === 'DELIVERED'
                          ? 'bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/40'
                          : log.result === 'FAILED'
                          ? 'bg-[#930031]/25 text-[#FFF2A7] border border-[#930031]/50'
                          : 'bg-[#070a12] text-[#BEDEFF]/70 border border-[#BEDEFF]/20'
                      }`}>
                        {log.result || 'INFO'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#BEDEFF]/40 text-[10px]">
                      {log.correlation_id || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#BEDEFF]/50 italic">
                    No matching event logs found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
