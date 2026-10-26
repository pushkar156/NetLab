import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertTriangle, Check, Globe } from 'lucide-react';
import { api } from '../../services/api';

export default function DeviceConfigModal({ device, isOpen, onClose, onSave, onDelete }) {
  if (!isOpen || !device) return null;

  const [name, setName] = useState(device.name || '');
  const [ipAddress, setIpAddress] = useState(device.ip_address || '');
  const [subnetMask, setSubnetMask] = useState(device.subnet_mask || '255.255.255.0');
  const [defaultGateway, setDefaultGateway] = useState(device.default_gateway || '');
  const [httpEnabled, setHttpEnabled] = useState(device.services?.http?.enabled ?? true);
  const [httpBanner, setHttpBanner] = useState(device.services?.http?.banner || 'Welcome to NetLab HTTP Web Server');
  const [routerInterfaces, setRouterInterfaces] = useState(device.config?.interfaces || []);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setName(device.name || '');
    setIpAddress(device.ip_address || '');
    setSubnetMask(device.subnet_mask || '255.255.255.0');
    setDefaultGateway(device.default_gateway || '');
    setHttpEnabled(device.services?.http?.enabled ?? true);
    setHttpBanner(device.services?.http?.banner || 'Welcome to NetLab HTTP Web Server');
    setRouterInterfaces(device.config?.interfaces || []);
    setValidationError('');
  }, [device]);

  const handleInterfaceChange = (index, field, val) => {
    const updated = [...routerInterfaces];
    updated[index] = { ...updated[index], [field]: val };
    setRouterInterfaces(updated);
  };

  const handleSave = () => {
    // Basic frontend validation
    if (!name.trim()) {
      setValidationError('Device name is required.');
      return;
    }

    const updatedDevice = {
      ...device,
      name: name.trim(),
      ip_address: (device.type === 'pc' || device.type === 'server') ? ipAddress.trim() : null,
      subnet_mask: (device.type === 'pc' || device.type === 'server') ? subnetMask.trim() : null,
      default_gateway: (device.type === 'pc' || device.type === 'server') ? defaultGateway.trim() || null : null,
      services: device.type === 'server' ? {
        http: {
          enabled: httpEnabled,
          port: 80,
          banner: httpBanner
        }
      } : (device.services || {}),
      config: device.type === 'router' ? {
        ...(device.config || {}),
        interfaces: routerInterfaces
      } : (device.config || {})
    };

    onSave(updatedDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Configure {device.name}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono uppercase">
                {device.type}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Modify device IP addressing, gateway, and service parameters.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Device Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g. PC1, Server1"
            />
          </div>

          {(device.type === 'pc' || device.type === 'server') && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">IPv4 Address</label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="e.g. 192.168.1.10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subnet Mask</label>
                <input
                  type="text"
                  value={subnetMask}
                  onChange={(e) => setSubnetMask(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="255.255.255.0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Gateway</label>
                <input
                  type="text"
                  value={defaultGateway}
                  onChange={(e) => setDefaultGateway(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. 192.168.1.1"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be in the same local subnet as the device IP to reach remote subnets.
                </p>
              </div>
            </>
          )}

          {device.type === 'server' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    HTTP Web Server Daemon (Port 80)
                  </h4>
                  <p className="text-[11px] text-slate-400">Toggle whether the HTTP daemon responds to web requests.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHttpEnabled(!httpEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    httpEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      httpEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {httpEnabled && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Server Banner</label>
                  <input
                    type="text"
                    value={httpBanner}
                    onChange={(e) => setHttpBanner(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>
          )}

          {device.type === 'router' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Router Interfaces (Gateway Endpoints)
              </h4>
              {routerInterfaces.map((iface, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-purple-400">{iface.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {iface.status || 'up'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400">Interface IP</label>
                      <input
                        type="text"
                        value={iface.ip}
                        onChange={(e) => handleInterfaceChange(idx, 'ip', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Subnet Mask</label>
                      <input
                        type="text"
                        value={iface.mask}
                        onChange={(e) => handleInterfaceChange(idx, 'mask', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {device.type === 'switch' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>Layer 2 switches forward Ethernet frames based on destination MAC addresses without inspecting IP headers.</p>
              <p className="text-indigo-400 font-mono">Default VLAN: 1 (Management untagged)</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${device.name}?`)) {
                onDelete(device.id);
                onClose();
              }
            }}
            className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Device
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-600/20"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
