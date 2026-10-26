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
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          IPv4 Addressing & Subnetting Engine
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            Bitwise Arithmetic
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform strict 32-bit binary calculations, validate contiguous masks, and verify same-subnet membership.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-cyan-400" />
          Subnet Calculator & Binary Engine
        </button>
        <button
          onClick={() => setActiveTab('comparator')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'comparator'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          Same-Subnet Comparator
        </button>
      </div>

      {/* Tab 1: Subnet Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 border-b border-slate-800/80 pb-2 flex items-center gap-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              Subnet Parameters
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">IPv4 Host Address</label>
              <input
                type="text"
                value={calcIp}
                onChange={(e) => setCalcIp(e.target.value)}
                placeholder="192.168.1.50"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subnet Mask</label>
              <input
                type="text"
                value={calcMask}
                onChange={(e) => setCalcMask(e.target.value)}
                placeholder="255.255.255.0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Or CIDR Prefix (/{calcCidr})</label>
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
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
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
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition-colors shadow-lg shadow-cyan-600/20"
            >
              {calcLoading ? 'Calculating...' : 'Calculate Subnet Metrics'}
            </button>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">RFC Special Cases Handled:</div>
              <div>• <span className="text-cyan-400">/31</span>: RFC 3021 Point-to-Point (2 usable hosts)</div>
              <div>• <span className="text-cyan-400">/32</span>: Host route (1 address, no broadcast)</div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100 border-b border-slate-800/80 pb-2 flex items-center justify-between">
              <span>Calculated Network Metrics</span>
              {calcResult?.valid && (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {calcResult.ipClass} • {calcResult.isPrivate ? 'RFC 1918 Private' : 'Public Routable'}
                </span>
              )}
            </h3>

            {calcResult?.valid ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">Network ID Address</span>
                    <div className="text-base font-bold text-cyan-300">{calcResult.networkAddress}/{calcResult.cidrPrefix}</div>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">Directed Broadcast Address</span>
                    <div className="text-base font-bold text-amber-300">{calcResult.broadcastAddress}</div>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">Usable Host Range</span>
                    <div className="text-sm font-bold text-slate-200">
                      {calcResult.firstUsableHost} — {calcResult.lastUsableHost}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase">Capacity</span>
                    <div className="text-sm font-bold text-emerald-400">
                      {calcResult.usableHosts.toLocaleString()} Usable Hosts
                      <span className="text-slate-500 font-normal text-xs ml-1">
                        ({calcResult.totalAddresses.toLocaleString()} total)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Binary Bitwise Representation */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="text-slate-400 text-[11px] font-semibold border-b border-slate-800 pb-1">
                    32-Bit Binary Bitwise Breakdown:
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Host IP:</span>
                    <span className="text-cyan-300 select-all">{calcResult.binaryIp}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">Netmask:</span>
                    <span className="text-slate-400 select-all">{calcResult.binaryMask}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-rose-400 text-xs font-mono bg-slate-950 rounded-xl border border-rose-500/20">
                {calcResult?.error || 'Invalid IP or Subnet Mask provided.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Same-Subnet Comparator */}
      {activeTab === 'comparator' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Subnet Membership Comparator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Determines whether two devices can communicate directly over Layer 2 switching or whether they must forward packets to a Default Gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Device 1 IP</label>
              <input
                type="text"
                value={compIp1}
                onChange={(e) => setCompIp1(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Device 2 IP</label>
              <input
                type="text"
                value={compIp2}
                onChange={(e) => setCompIp2(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subnet Mask</label>
              <input
                type="text"
                value={compMask}
                onChange={(e) => setCompMask(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={compLoading}
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold text-xs font-mono transition-colors shadow-lg shadow-indigo-600/20"
          >
            {compLoading ? 'Comparing...' : 'Compare Subnet Membership'}
          </button>

          {compResult && (
            <div className={`p-5 rounded-2xl border font-mono text-xs space-y-3 ${
              compResult.sameSubnet
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                {compResult.sameSubnet ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>SAME SUBNET: Direct Layer 2 Switching Supported</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>DIFFERENT SUBNETS: Layer 3 Default Gateway Routing Required</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Host {compResult.ip1} Network ID:</span>
                  <div className="font-bold text-cyan-300">{compResult.networkAddress1}/{compResult.cidrPrefix}</div>
                </div>
                <div>
                  <span className="text-slate-400">Host {compResult.ip2} Network ID:</span>
                  <div className="font-bold text-amber-300">{compResult.networkAddress2}/{compResult.cidrPrefix}</div>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {compResult.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
