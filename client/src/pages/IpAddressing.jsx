import React, { useState, useEffect } from 'react';
import {
  Binary,
  Calculator,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function IpAddressing() {
  // Tab selector: 'calculator' | 'comparator' | 'validator'
  const [activeTab, setActiveTab] = useState('calculator');

  // Calculator State
  const [calcIp, setCalcIp] = useState('192.168.1.50');
  const [calcMask, setCalcMask] = useState('255.255.255.0');
  const [calcCidr, setCalcCidr] = useState('24');
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Comparator State
  const [compIp1, setCompIp1] = useState('192.168.1.10');
  const [compIp2, setCompIp2] = useState('192.168.2.10');
  const [compMask, setCompMask] = useState('255.255.255.0');
  const [compResult, setCompResult] = useState(null);
  const [compLoading, setCompLoading] = useState(false);

  // Initial Calculation
  useEffect(() => {
    handleCalculate();
    handleCompare();
  }, []);

  const handleCalculate = async () => {
    setCalcLoading(true);
    try {
      const res = await api.calculateSubnet(calcIp, calcMask, calcCidr);
      setCalcResult(res);
    } catch (err) {
      setCalcResult({ valid: false, error: err.message });
    } finally {
      setCalcLoading(false);
    }
  };

  const handleCompare = async () => {
    setCompLoading(true);
    try {
      const res = await api.checkSameSubnet(compIp1, compIp2, compMask);
      setCompResult(res);
    } catch (err) {
      setCompResult({ error: err.message });
    } finally {
      setCompLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-[#BEDEFF]/15 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="text-gradient-warm font-extrabold">IPv4 Addressing & Subnetting Engine</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono font-medium">
            Bitwise Arithmetic
          </span>
        </h1>
        <p className="text-xs text-[#BEDEFF]/75 mt-1">
          Perform strict 32-bit binary calculations, validate contiguous masks, and verify same-subnet membership.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#BEDEFF]/15 pb-3">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/40 shadow-sm shadow-[#FFA500]/10 font-bold'
              : 'text-[#BEDEFF]/70 hover:text-white hover:bg-[#0c101d]'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#FFA500]" />
          Subnet Calculator & Binary Engine
        </button>
        <button
          onClick={() => setActiveTab('comparator')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 ${
            activeTab === 'comparator'
              ? 'bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/40 shadow-sm shadow-[#FFA500]/10 font-bold'
              : 'text-[#BEDEFF]/70 hover:text-white hover:bg-[#0c101d]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#FFA500]" />
          Same-Subnet Comparator
        </button>
      </div>

      {/* Tab 1: Subnet Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-[#BEDEFF]/15 pb-2 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#BEDEFF]/15 text-[#BEDEFF]">
                <Binary className="w-4 h-4 text-[#BEDEFF]" />
              </div>
              Subnet Parameters
            </h3>

            <div>
              <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">IPv4 Host Address</label>
              <input
                type="text"
                value={calcIp}
                onChange={(e) => setCalcIp(e.target.value)}
                placeholder="192.168.1.50"
                className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#FFF2A7] font-semibold focus:outline-none focus:border-[#FFA500] shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Subnet Mask</label>
              <input
                type="text"
                value={calcMask}
                onChange={(e) => setCalcMask(e.target.value)}
                placeholder="255.255.255.0"
                className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFA500] shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Or CIDR Prefix (/{calcCidr})</label>
              <select
                value={calcCidr}
                onChange={(e) => {
                  setCalcCidr(e.target.value);
                  // Auto-update dotted decimal mask
                  const cidr = Number(e.target.value);
                  if (cidr === 24) setCalcMask('255.255.255.0');
                  else if (cidr === 16) setCalcMask('255.255.0.0');
                  else if (cidr === 8) setCalcMask('255.0.0.0');
                  else if (cidr === 30) setCalcMask('255.255.255.252');
                  else if (cidr === 31) setCalcMask('255.255.255.254');
                  else if (cidr === 32) setCalcMask('255.255.255.255');
                }}
                className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFA500]"
              >
                {[...Array(33).keys()].map((p) => (
                  <option key={p} value={p}>
                    /{p} ({Math.pow(2, 32 - p).toLocaleString()} total addresses)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={calcLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs font-mono transition-all shadow-md shadow-[#FFA500]/25 font-mono"
            >
              {calcLoading ? 'Calculating...' : 'Calculate Subnet Metrics'}
            </button>

            <div className="p-3.5 bg-[#070a12] border border-[#BEDEFF]/15 rounded-xl text-[11px] font-mono text-[#BEDEFF]/75 space-y-1">
              <div className="font-semibold text-[#FFF2A7]">RFC Special Cases Handled:</div>
              <div>• <span className="text-[#FFA500]">/31</span>: RFC 3021 Point-to-Point (2 usable hosts)</div>
              <div>• <span className="text-[#FFA500]">/32</span>: Host route (1 address, no broadcast)</div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-[#BEDEFF]/15 pb-2 flex items-center justify-between">
              <span>Calculated Network Metrics</span>
              {calcResult?.valid && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono font-medium">
                  {calcResult.ipClass} • {calcResult.isPrivate ? 'RFC 1918 Private' : 'Public Routable'}
                </span>
              )}
            </h3>

            {calcResult?.valid ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl space-y-1 shadow-inner">
                    <span className="text-[#BEDEFF]/60 text-[10px] uppercase">Network ID Address</span>
                    <div className="text-lg font-bold text-[#FFF2A7]">{calcResult.networkAddress}/{calcResult.cidrPrefix}</div>
                  </div>

                  <div className="p-3.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl space-y-1 shadow-inner">
                    <span className="text-[#BEDEFF]/60 text-[10px] uppercase">Directed Broadcast Address</span>
                    <div className="text-lg font-bold text-[#FFA500]">{calcResult.broadcastAddress}</div>
                  </div>

                  <div className="p-3.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl space-y-1 shadow-inner">
                    <span className="text-[#BEDEFF]/60 text-[10px] uppercase">Usable Host Range</span>
                    <div className="text-sm font-bold text-white">
                      {calcResult.firstUsableHost} — {calcResult.lastUsableHost}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl space-y-1 shadow-inner">
                    <span className="text-[#BEDEFF]/60 text-[10px] uppercase">Capacity</span>
                    <div className="text-sm font-bold text-[#FFF2A7]">
                      {calcResult.usableHosts.toLocaleString()} Usable Hosts
                      <span className="text-[#BEDEFF]/60 font-normal text-xs ml-1">
                        ({calcResult.totalAddresses.toLocaleString()} total)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Binary Bitwise Representation */}
                <div className="p-3.5 sm:p-4 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl space-y-2 font-mono text-xs shadow-inner overflow-hidden">
                  <div className="text-[#FFF2A7] text-[11px] font-semibold border-b border-[#BEDEFF]/15 pb-1">
                    32-Bit Binary Bitwise Breakdown:
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white gap-0.5 sm:gap-2">
                    <span className="text-[#BEDEFF]/70 text-[11px]">Host IP:</span>
                    <span className="text-[#BEDEFF] select-all font-semibold text-[11px] sm:text-xs break-all">{calcResult.binaryIp}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white gap-0.5 sm:gap-2">
                    <span className="text-[#BEDEFF]/70 text-[11px]">Netmask:</span>
                    <span className="text-[#FFA500] select-all font-semibold text-[11px] sm:text-xs break-all">{calcResult.binaryMask}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#FFF2A7] text-xs font-mono bg-[#930031]/20 rounded-xl border border-[#930031]/40">
                {calcResult?.error || 'Invalid IP or Subnet Mask provided.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Same-Subnet Comparator */}
      {activeTab === 'comparator' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FFA500]/15 text-[#FFA500]">
                <Layers className="w-4 h-4 text-[#FFA500]" />
              </div>
              Subnet Membership Comparator
            </h3>
            <p className="text-xs text-[#BEDEFF]/75 mt-1">
              Determines whether two devices can communicate directly over Layer 2 switching or whether they must forward packets to a Default Gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Device 1 IP</label>
              <input
                type="text"
                value={compIp1}
                onChange={(e) => setCompIp1(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#BEDEFF] font-semibold focus:outline-none focus:border-[#FFA500] shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Device 2 IP</label>
              <input
                type="text"
                value={compIp2}
                onChange={(e) => setCompIp2(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#FFF2A7] font-semibold focus:outline-none focus:border-[#FFA500] shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#BEDEFF] mb-1.5">Subnet Mask</label>
              <input
                type="text"
                value={compMask}
                onChange={(e) => setCompMask(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#FFA500] shadow-inner"
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={compLoading}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs font-mono transition-all shadow-md shadow-[#FFA500]/25 font-mono"
          >
            {compLoading ? 'Comparing...' : 'Compare Subnet Membership'}
          </button>

          {compResult && (
            <div className={`p-5 rounded-2xl border font-mono text-xs space-y-3 ${
              compResult.sameSubnet
                ? 'bg-[#FFA500]/10 border-[#FFA500]/40 text-[#FFF2A7]'
                : 'bg-[#930031]/20 border-[#930031]/50 text-[#FFF2A7]'
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                {compResult.sameSubnet ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#FFA500]" />
                    <span className="text-[#FFF2A7]">SAME SUBNET: Direct Layer 2 Switching Supported</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-[#FFA500]" />
                    <span className="text-[#FFF2A7]">DIFFERENT SUBNETS: Layer 3 Default Gateway Routing Required</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#070a12] p-3.5 rounded-xl border border-[#BEDEFF]/15">
                <div>
                  <span className="text-[#BEDEFF]/70">Host {compResult.ip1} Network ID:</span>
                  <div className="font-bold text-[#BEDEFF] text-sm">{compResult.networkAddress1}/{compResult.cidrPrefix}</div>
                </div>
                <div>
                  <span className="text-[#BEDEFF]/70">Host {compResult.ip2} Network ID:</span>
                  <div className="font-bold text-[#FFF2A7] text-sm">{compResult.networkAddress2}/{compResult.cidrPrefix}</div>
                </div>
              </div>

              <p className="text-white leading-relaxed font-sans text-xs">
                {compResult.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
