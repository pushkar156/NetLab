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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel border border-[#BEDEFF]/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#BEDEFF]/15 flex items-center justify-between bg-[#070a12]/80">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <span>Configure</span>
              <span className="text-[#FFF2A7] font-mono">{device.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                device.type === 'pc' ? 'bg-[#BEDEFF]/20 text-[#BEDEFF] border border-[#BEDEFF]/40' :
                device.type === 'server' ? 'bg-[#FFF2A7]/20 text-[#FFF2A7] border border-[#FFF2A7]/40' :
                device.type === 'router' ? 'bg-[#930031]/30 text-[#FFF2A7] border border-[#930031]/60' :
                'bg-[#BEDEFF]/15 text-[#BEDEFF] border border-[#BEDEFF]/30'
              }`}>
                {device.type}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#BEDEFF]/70 mt-0.5">Modify device IP addressing, gateway, and service parameters.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#111728] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {validationError && (
            <div className="p-3 rounded-xl bg-[#930031]/25 border border-[#930031]/50 text-[#FFF2A7] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#FFA500]" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Device Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA500] font-mono shadow-inner"
              placeholder="e.g. PC1, Server1"
            />
          </div>

          {(device.type === 'pc' || device.type === 'server') && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">IPv4 Address</label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#FFF2A7] font-semibold focus:outline-none focus:border-[#FFA500] shadow-inner"
                  placeholder="e.g. 192.168.1.10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Subnet Mask</label>
                <input
                  type="text"
                  value={subnetMask}
                  onChange={(e) => setSubnetMask(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFA500] shadow-inner"
                  placeholder="255.255.255.0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Default Gateway</label>
                <input
                  type="text"
                  value={defaultGateway}
                  onChange={(e) => setDefaultGateway(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFA500] shadow-inner"
                  placeholder="e.g. 192.168.1.1"
                />
                <p className="text-[11px] text-[#BEDEFF]/60 mt-1.5">
                  Must be in the same local subnet as the device IP to reach remote subnets.
                </p>
              </div>
            </>
          )}

          {device.type === 'server' && (
            <div className="p-4 rounded-xl bg-[#070a12]/90 border border-[#BEDEFF]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#FFF2A7] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#FFA500]" />
                    HTTP Web Server Daemon (Port 80)
                  </h4>
                  <p className="text-[11px] text-[#BEDEFF]/70">Toggle whether the HTTP daemon responds to web requests.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHttpEnabled(!httpEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    httpEnabled ? 'bg-[#FFA500]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-[#070a12] transition-transform ${
                      httpEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {httpEnabled && (
                <div>
                  <label className="block text-[11px] font-medium text-[#BEDEFF] mb-1">Server Banner</label>
                  <input
                    type="text"
                    value={httpBanner}
                    onChange={(e) => setHttpBanner(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c101d] border border-[#BEDEFF]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA500]"
                  />
                </div>
              )}
            </div>
          )}

          {device.type === 'router' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#FFF2A7] uppercase tracking-wider">
                Router Interfaces (Gateway Endpoints)
              </h4>
              {routerInterfaces.map((iface, idx) => (
                <div key={idx} className="p-3.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FFA500]">{iface.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono">
                      {iface.status || 'up'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#BEDEFF]/70">Interface IP</label>
                      <input
                        type="text"
                        value={iface.ip}
                        onChange={(e) => handleInterfaceChange(idx, 'ip', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#0c101d] border border-[#BEDEFF]/20 rounded-lg text-xs font-mono text-white focus:border-[#FFA500]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#BEDEFF]/70">Subnet Mask</label>
                      <input
                        type="text"
                        value={iface.mask}
                        onChange={(e) => handleInterfaceChange(idx, 'mask', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#0c101d] border border-[#BEDEFF]/20 rounded-lg text-xs font-mono text-white focus:border-[#FFA500]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {device.type === 'switch' && (
            <div className="p-4 rounded-xl bg-[#070a12] border border-[#BEDEFF]/20 text-xs text-[#BEDEFF]/80 space-y-1.5">
              <p>Layer 2 switches forward Ethernet frames based on destination MAC addresses without inspecting IP headers.</p>
              <p className="text-[#FFA500] font-mono">Default VLAN: 1 (Management untagged)</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#BEDEFF]/15 bg-[#070a12]/80 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${device.name}?`)) {
                onDelete(device.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#930031]/20 hover:bg-[#930031]/30 text-[#FFF2A7] text-xs font-medium border border-[#930031]/50 flex items-center gap-1.5 transition-colors font-mono"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#FFA500]" />
            <span className="text-[11px] sm:text-xs">Delete</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[#BEDEFF] hover:text-white hover:bg-[#111728] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#FFA500]/25 font-mono"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
