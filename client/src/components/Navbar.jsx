import React, { useState } from 'react';
import { Network, Wifi, WifiOff, LogIn, LogOut, Flame, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar({ activePage, serverStatus, clientInfo }) {
  const { user, logout, isFirebaseConfigured } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-[#BEDEFF]/10 bg-[#070a12]/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
        {/* Brand & Page Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#930031] via-[#FFA500]/80 to-[#FFA500] p-0.5 shadow-lg shadow-[#FFA500]/10">
              <div className="w-full h-full rounded-[14px] bg-[#070a12] flex items-center justify-center text-[#FFF2A7]">
                <Network className="w-5 h-5 text-[#FFA500]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#f8fafc] flex items-center gap-2">
                <span className="text-gradient-warm font-extrabold text-base tracking-wide">NetLab</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#930031]/25 text-[#FFF2A7] border border-[#930031]/50 font-medium">
                  v1.0 (CN)
                </span>
                {isFirebaseConfigured && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30 font-medium hidden sm:inline-flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5 text-[#FFA500]" />
                    Firestore
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#BEDEFF]/70 font-mono hidden sm:block">
                Hybrid Network Design & Communication Simulator
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status Badges & Auth Controls */}
        <div className="flex items-center gap-3">
          {/* Physical Client Identity */}
          {clientInfo?.displayName ? (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0c101d] border border-[#BEDEFF]/20 text-xs font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FFA500] animate-pulse"></span>
              <span className="text-[#BEDEFF]/60">Node:</span>
              <span className="text-[#FFF2A7] font-semibold">{clientInfo.displayName}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c101d] border border-slate-800 text-xs font-mono text-slate-400">
              <span>Unregistered Node</span>
            </div>
          )}

          {/* Backend Connectivity Status */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            serverStatus === 'online'
              ? 'bg-[#BEDEFF]/10 border-[#BEDEFF]/30 text-[#BEDEFF]'
              : 'bg-[#930031]/20 border-[#930031]/40 text-[#FFF2A7]'
          }`}>
            {serverStatus === 'online' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#BEDEFF]" />
                <span className="hidden sm:inline font-medium">Backend Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#FFA500]" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* User Authentication Status */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#BEDEFF]/15">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0c101d] border border-[#BEDEFF]/20 text-xs font-mono">
                <div className="w-5 h-5 rounded-full bg-[#FFA500]/20 border border-[#FFA500]/50 flex items-center justify-center text-[#FFF2A7] text-[10px] font-bold">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-[#f8fafc] font-medium max-w-[120px] truncate">
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl bg-[#0c101d] hover:bg-[#930031]/25 hover:text-[#FFF2A7] text-slate-400 border border-slate-800 hover:border-[#930031]/50 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFA500] hover:bg-[#FFA500]/90 text-[#070a12] font-bold text-xs font-mono transition-all shadow-md shadow-[#FFA500]/25 hover:shadow-lg hover:shadow-[#FFA500]/30 hover:scale-[1.02]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#070a12]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
