import React from 'react';
import { Play, Pause, RotateCcw, StepForward, StepBack, CheckCircle2, XCircle, ArrowRight, Activity, Clock, ShieldCheck } from 'lucide-react';

export default function PacketInspector({
  simulation,
  currentStep,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onClose
}) {
  if (!simulation) return null;

  const hops = simulation.hops || [];
  const currentHop = hops[currentStep] || hops[hops.length - 1] || null;
  const isComplete = currentStep >= hops.length - 1;
  const isSuccess = simulation.result === 'SUCCESS';

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md p-4 w-full flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-2">
              {simulation.summary}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {simulation.networkLayer}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {simulation.explanation}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={onStepBackward}
            disabled={currentStep <= 0}
            title="Step backward"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <StepBack className="w-3.5 h-3.5" />
          </button>

          {isPlaying ? (
            <button
              onClick={onPause}
              title="Pause animation"
              className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={isComplete}
              title="Play animation"
              className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-30 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onStepForward}
            disabled={isComplete}
            title="Step forward"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            title="Reset simulation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors ml-1 border-l border-slate-800 pl-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hop Sequence Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1">
        <div className="md:col-span-3 flex items-center gap-1.5 overflow-x-auto py-1">
          {hops.map((hop, idx) => {
            const isCurrent = idx === currentStep;
            const isPast = idx < currentStep;
            return (
              <React.Fragment key={idx}>
                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-200 shrink-0 flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/20 scale-105'
                      : isPast
                      ? 'bg-slate-950 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-slate-300">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold">{hop.deviceName}</div>
                    <div className="text-[9px] text-slate-400">{hop.type}</div>
                  </div>
                </div>

                {idx < hops.length - 1 && (
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isPast ? 'text-emerald-500' : 'text-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Modeled Metrics badge */}
        <div className="flex items-center justify-end gap-3 text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{simulation.metrics?.latencyMs || 0} ms (modeled)</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>TTL: {simulation.metrics?.ttl || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Active Hop Details */}
      {currentHop && (
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Hop {currentStep + 1} of {hops.length}
            </span>
            <span className="font-medium text-slate-200">
              {currentHop.deviceName}: <span className="text-slate-400 font-normal">{currentHop.action}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            IP: {currentHop.ip || 'Layer 2 Transparent'}
          </span>
        </div>
      )}
    </div>
  );
}
