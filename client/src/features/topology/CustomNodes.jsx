import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor, Server, Network, Shield, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export const PcNode = memo(({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-xl bg-slate-900/90 border transition-all duration-200 shadow-lg min-w-[170px] backdrop-blur-sm ${
      selected ? 'border-cyan-400 ring-2 ring-cyan-400/20 shadow-cyan-500/10' : 'border-slate-700/80 hover:border-slate-500'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-900" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-slate-900" />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Monitor className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            {data.name || 'PC'}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Host Client</div>
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-mono border-t border-slate-800/80 pt-2">
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-500">IP:</span>
          <span className="text-cyan-300 font-medium">{data.ip_address || 'Unassigned'}</span>
        </div>
        {data.default_gateway && (
          <div className="flex justify-between text-slate-400">
            <span className="text-slate-500">GW:</span>
            <span>{data.default_gateway}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export const ServerNode = memo(({ data, selected }) => {
  const isHttpEnabled = data.services?.http?.enabled ?? true;

  return (
    <div className={`px-4 py-3 rounded-xl bg-slate-900/90 border transition-all duration-200 shadow-lg min-w-[190px] backdrop-blur-sm ${
      selected ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10' : 'border-slate-700/80 hover:border-slate-500'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-slate-900" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-slate-900" />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            {data.name || 'Server'}
            <span className={`w-1.5 h-1.5 rounded-full ${isHttpEnabled ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
          </div>
          <div className="text-[10px] text-amber-300/80 font-mono uppercase tracking-wider">Web & App Server</div>
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-mono border-t border-slate-800/80 pt-2">
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-500">IP:</span>
          <span className="text-amber-300 font-medium">{data.ip_address || 'Unassigned'}</span>
        </div>
        <div className="flex justify-between items-center pt-0.5">
          <span className="text-slate-500">HTTP :80</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-medium flex items-center gap-1 ${
            isHttpEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {isHttpEnabled ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
});

export const SwitchNode = memo(({ data, selected }) => {
  return (
    <div className={`px-4 py-2.5 rounded-xl bg-slate-900/90 border transition-all duration-200 shadow-lg min-w-[160px] backdrop-blur-sm ${
      selected ? 'border-indigo-400 ring-2 ring-indigo-400/20 shadow-indigo-500/10' : 'border-slate-700/80 hover:border-slate-500'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-slate-900" />

      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100">{data.name || 'Switch'}</div>
          <div className="text-[10px] text-indigo-300 font-mono">Layer 2 Bridge</div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-1.5 flex justify-between">
        <span>Broadcast Domain</span>
        <span className="text-indigo-400 font-medium">VLAN 1</span>
      </div>
    </div>
  );
});

export const RouterNode = memo(({ data, selected }) => {
  const interfaces = data.config?.interfaces || [];

  return (
    <div className={`px-4 py-3 rounded-xl bg-slate-900/90 border transition-all duration-200 shadow-lg min-w-[210px] backdrop-blur-sm ${
      selected ? 'border-purple-400 ring-2 ring-purple-400/20 shadow-purple-500/10' : 'border-slate-700/80 hover:border-slate-500'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-slate-900" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-slate-900" />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            {data.name || 'Router'}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-[10px] text-purple-300 font-mono uppercase tracking-wider">Layer 3 Gateway</div>
        </div>
      </div>

      <div className="space-y-1 text-[10px] font-mono border-t border-slate-800/80 pt-2">
        {interfaces.length > 0 ? (
          interfaces.map((iface, i) => (
            <div key={i} className="flex justify-between items-center text-slate-300">
              <span className="text-purple-400 font-medium">{iface.name}:</span>
              <span>{iface.ip || '0.0.0.0'}</span>
            </div>
          ))
        ) : (
          <div className="text-slate-500 italic">No interfaces configured</div>
        )}
      </div>
    </div>
  );
});
