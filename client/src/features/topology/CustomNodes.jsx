import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Monitor, Server, Network, Shield } from 'lucide-react';

export const PcNode = memo(({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-2xl bg-[#0c101d]/95 border transition-all duration-250 shadow-xl min-w-[175px] backdrop-blur-md ${
      selected
        ? 'border-[#FFA500] ring-2 ring-[#FFA500]/30 shadow-[#FFA500]/15'
        : 'border-[#BEDEFF]/20 hover:border-[#BEDEFF]/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />

      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-2 rounded-xl bg-[#BEDEFF]/10 text-[#BEDEFF] border border-[#BEDEFF]/20 shadow-sm">
          <Monitor className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#f8fafc] flex items-center gap-1.5">
            {data.name || 'PC'}
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFA500] animate-pulse"></span>
          </div>
          <div className="text-[10px] text-[#BEDEFF]/60 font-mono uppercase tracking-wider">Host Client</div>
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-mono border-t border-[#BEDEFF]/10 pt-2">
        <div className="flex justify-between text-slate-300">
          <span className="text-[#BEDEFF]/50">IP:</span>
          <span className="text-[#BEDEFF] font-medium">{data.ip_address || 'Unassigned'}</span>
        </div>
        {data.default_gateway && (
          <div className="flex justify-between text-slate-400">
            <span className="text-[#BEDEFF]/50">GW:</span>
            <span className="text-[#FFF2A7]">{data.default_gateway}</span>
          </div>
        )}
      </div>
    </div>
  );
});

export const ServerNode = memo(({ data, selected }) => {
  const isHttpEnabled = data.services?.http?.enabled ?? true;

  return (
    <div className={`px-4 py-3 rounded-2xl bg-[#0c101d]/95 border transition-all duration-250 shadow-xl min-w-[195px] backdrop-blur-md ${
      selected
        ? 'border-[#FFA500] ring-2 ring-[#FFA500]/30 shadow-[#FFA500]/15'
        : 'border-[#FFF2A7]/25 hover:border-[#FFA500]/50'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />

      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-2 rounded-xl bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/25 shadow-sm">
          <Server className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#f8fafc] flex items-center gap-1.5">
            {data.name || 'Server'}
            <span className={`w-1.5 h-1.5 rounded-full ${isHttpEnabled ? 'bg-[#FFA500]' : 'bg-[#930031]'}`}></span>
          </div>
          <div className="text-[10px] text-[#FFF2A7]/70 font-mono uppercase tracking-wider">Web & App Server</div>
        </div>
      </div>

      <div className="space-y-1 text-[11px] font-mono border-t border-[#BEDEFF]/10 pt-2">
        <div className="flex justify-between text-slate-300">
          <span className="text-[#BEDEFF]/50">IP:</span>
          <span className="text-[#FFF2A7] font-medium">{data.ip_address || 'Unassigned'}</span>
        </div>
        <div className="flex justify-between items-center pt-0.5">
          <span className="text-[#BEDEFF]/50">HTTP :80</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-medium flex items-center gap-1 ${
            isHttpEnabled
              ? 'bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30'
              : 'bg-[#930031]/25 text-[#FFF2A7] border border-[#930031]/50'
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
    <div className={`px-4 py-2.5 rounded-2xl bg-[#0c101d]/95 border transition-all duration-250 shadow-xl min-w-[165px] backdrop-blur-md ${
      selected
        ? 'border-[#BEDEFF] ring-2 ring-[#BEDEFF]/30 shadow-[#BEDEFF]/15'
        : 'border-[#BEDEFF]/15 hover:border-[#BEDEFF]/40'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#BEDEFF] !border-2 !border-[#070a12]" />

      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-[#BEDEFF]/10 text-[#BEDEFF] border border-[#BEDEFF]/20 shadow-sm">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#f8fafc]">{data.name || 'Switch'}</div>
          <div className="text-[10px] text-[#BEDEFF]/60 font-mono">Layer 2 Bridge</div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-slate-400 font-mono border-t border-[#BEDEFF]/10 pt-1.5 flex justify-between">
        <span className="text-[#BEDEFF]/50">Broadcast</span>
        <span className="text-[#FFF2A7] font-medium">VLAN 1</span>
      </div>
    </div>
  );
});

export const RouterNode = memo(({ data, selected }) => {
  const interfaces = data.config?.interfaces || [];

  return (
    <div className={`px-4 py-3 rounded-2xl bg-[#0c101d]/95 border transition-all duration-250 shadow-xl min-w-[215px] backdrop-blur-md ${
      selected
        ? 'border-[#FFA500] ring-2 ring-[#FFA500]/30 shadow-[#FFA500]/15'
        : 'border-[#930031]/40 hover:border-[#FFA500]/40'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#FFA500] !border-2 !border-[#070a12]" />

      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[#930031]/30 to-[#FFA500]/20 text-[#FFA500] border border-[#930031]/50 shadow-sm">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#f8fafc] flex items-center gap-1.5">
            {data.name || 'Router'}
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFA500]"></span>
          </div>
          <div className="text-[10px] text-[#FFA500]/80 font-mono uppercase tracking-wider">Layer 3 Gateway</div>
        </div>
      </div>

      <div className="space-y-1 text-[10px] font-mono border-t border-[#BEDEFF]/10 pt-2">
        {interfaces.length > 0 ? (
          interfaces.map((iface, i) => (
            <div key={i} className="flex justify-between items-center text-slate-300">
              <span className="text-[#FFA500] font-medium">{iface.name}:</span>
              <span className="text-[#BEDEFF]">{iface.ip || '0.0.0.0'}</span>
            </div>
          ))
        ) : (
          <div className="text-slate-500 italic">No interfaces configured</div>
        )}
      </div>
    </div>
  );
});
