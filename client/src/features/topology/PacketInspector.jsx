import React from 'react';
import { Play, Pause, RotateCcw, StepForward, StepBack, CheckCircle2, XCircle, ArrowRight, Activity, Clock } from 'lucide-react';

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
    <div className="bg-[#0c101d]/95 border border-[#BEDEFF]/15 rounded-2xl shadow-2xl backdrop-blur-xl p-3 sm:p-4 w-full flex flex-col gap-2.5 sm:gap-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#BEDEFF]/10 pb-2.5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${
            isSuccess
              ? 'bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30'
              : 'bg-[#930031]/25 text-[#FFF2A7] border border-[#930031]/50'
          }`}>
            {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#f8fafc] flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="truncate">{simulation.summary}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#070a12] text-[#FFF2A7] border border-[#BEDEFF]/15 shrink-0">
                {simulation.networkLayer}
              </span>
            </h4>
            <p className="text-[11px] text-[#BEDEFF]/70 mt-0.5 line-clamp-2 sm:line-clamp-none">
              {simulation.explanation}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-end gap-1.5 bg-[#070a12] p-1.5 rounded-xl border border-[#BEDEFF]/15 shadow-inner self-end sm:self-auto shrink-0">
          <button
            onClick={onStepBackward}
            disabled={currentStep <= 0}
            title="Step backward"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#BEDEFF] disabled:opacity-30 transition-colors"
          >
            <StepBack className="w-3.5 h-3.5" />
          </button>

          {isPlaying ? (
            <button
              onClick={onPause}
              title="Pause animation"
              className="p-1.5 rounded-lg bg-[#FFA500]/20 text-[#FFA500] hover:bg-[#FFA500]/30 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={isComplete}
              title="Play animation"
              className="p-1.5 rounded-lg bg-[#FFA500] text-[#070a12] font-bold hover:bg-[#FFA500]/90 disabled:opacity-30 transition-colors shadow-sm shadow-[#FFA500]/30"
            >
              <Play className="w-3.5 h-3.5 text-[#070a12]" />
            </button>
          )}

          <button
            onClick={onStepForward}
            disabled={isComplete}
            title="Step forward"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#BEDEFF] disabled:opacity-30 transition-colors"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            title="Reset simulation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#FFF2A7] transition-colors ml-1 border-l border-[#BEDEFF]/15 pl-2"
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
                      ? 'bg-gradient-to-r from-[#FFA500]/20 to-[#930031]/20 border-[#FFA500] text-[#FFF2A7] ring-2 ring-[#FFA500]/30 scale-105'
                      : isPast
                      ? 'bg-[#070a12] border-[#BEDEFF]/30 text-[#BEDEFF]'
                      : 'bg-[#070a12]/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#111728] text-[10px] flex items-center justify-center text-[#FFF2A7] font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold">{hop.deviceName}</div>
                    <div className="text-[9px] text-[#BEDEFF]/50">{hop.type}</div>
                  </div>
                </div>

                {idx < hops.length - 1 && (
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isPast ? 'text-[#BEDEFF]' : 'text-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Modeled Metrics badge */}
        <div className="flex items-center justify-end gap-3 text-[11px] font-mono text-slate-300 bg-[#070a12] px-3 py-1.5 rounded-xl border border-[#BEDEFF]/15">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FFA500]" />
            <span className="text-[#FFF2A7] font-medium">{simulation.metrics?.latencyMs || 0} ms</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-[#BEDEFF]/15 pl-2">
            <Activity className="w-3.5 h-3.5 text-[#BEDEFF]" />
            <span className="text-[#BEDEFF]">TTL: {simulation.metrics?.ttl || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Active Hop Details */}
      {currentHop && (
        <div className="p-3 rounded-xl bg-[#070a12] border border-[#BEDEFF]/10 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#930031]/30 text-[#FFF2A7] border border-[#930031]/50 font-bold">
              Hop {currentStep + 1} of {hops.length}
            </span>
            <span className="font-semibold text-[#f8fafc]">
              {currentHop.deviceName}: <span className="text-[#BEDEFF]/80 font-normal">{currentHop.action}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#FFF2A7]/60">
            IP: {currentHop.ip || 'Layer 2 Transparent'}
          </span>
        </div>
      )}
    </div>
  );
}
