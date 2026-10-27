import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Network,
  Binary,
  CheckCircle,
  ScrollText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export default function Sidebar({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  clientInfo
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'live-network', label: 'Live Network', shortLabel: 'Live Net', icon: Radio, badge: 'Real' },
    { id: 'virtual-lab', label: 'Virtual Network Lab', shortLabel: 'Virtual Lab', icon: Network, badge: 'Topology' },
    { id: 'addressing', label: 'IP Addressing', shortLabel: 'IP Math', icon: Binary, badge: null },
    { id: 'tests', label: 'Connectivity Tests', shortLabel: 'Tests', icon: CheckCircle, badge: 'Scenarios' },
    { id: 'logs', label: 'Event Logs', shortLabel: 'Logs', icon: ScrollText, badge: null },
    { id: 'docs', label: 'Documentation', shortLabel: 'Docs', icon: BookOpen, badge: 'Viva' }
  ];

  // Primary items for mobile bottom bar
  const bottomBarItems = [
    navItems[0], // Overview
    navItems[1], // Live Network
    navItems[2], // Virtual Lab
    navItems[4], // Tests
  ];

  const handleNavSelect = (id) => {
    setActivePage(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* 1. Desktop Sidebar (Hidden on mobile < md) */}
      <aside
        className={`hidden md:flex h-[calc(100vh-4rem)] border-r border-[#BEDEFF]/10 bg-[#070a12]/90 backdrop-blur-xl flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Navigation Links */}
        <div className="p-3 space-y-1.5 overflow-y-auto">
          <div className={`text-[10px] uppercase tracking-wider font-mono text-[#BEDEFF]/50 px-3 py-2 font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFA500]/15 via-[#BEDEFF]/10 to-transparent text-[#FFF2A7] border border-[#FFA500]/40 shadow-sm shadow-[#FFA500]/10'
                    : 'text-slate-400 hover:text-[#BEDEFF] hover:bg-[#0c101d] border border-transparent hover:border-[#BEDEFF]/15'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#FFA500]' : 'text-slate-400 group-hover:text-[#BEDEFF]'
                }`} />
                
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className={`tracking-wide ${isActive ? 'font-semibold text-[#FFF2A7]' : ''}`}>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-[#930031]/30 text-[#FFF2A7] border border-[#930031]/60'
                          : 'bg-[#0c101d] text-[#BEDEFF]/70 border border-[#BEDEFF]/15'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / Collapse Toggle */}
        <div className="p-3 border-t border-[#BEDEFF]/10">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-[#BEDEFF] hover:bg-[#0c101d] border border-transparent hover:border-[#BEDEFF]/15 transition-all text-xs font-mono"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#FFA500]" /> : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#FFA500]" />
                <span className="text-slate-400 font-medium">Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Modal (Shown on mobile when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#070a12] border-r border-[#BEDEFF]/20 shadow-2xl flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#BEDEFF]/15 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#930031] to-[#FFA500] p-0.5">
                    <div className="w-full h-full rounded-[10px] bg-[#070a12] flex items-center justify-center">
                      <Network className="w-4 h-4 text-[#FFA500]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="text-gradient-warm">NetLab</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#930031]/30 text-[#FFF2A7] border border-[#930031]/60">
                        v1.0
                      </span>
                    </h3>
                    <p className="text-[10px] text-[#BEDEFF]/70 font-mono">Mobile Navigation</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-xl bg-[#0c101d] text-slate-400 hover:text-white border border-[#BEDEFF]/15"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* All Navigation Links */}
              <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#FFA500]/20 via-[#BEDEFF]/10 to-transparent text-[#FFF2A7] border border-[#FFA500]/40 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-[#0c101d] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFA500]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#930031]/30 text-[#FFF2A7] border border-[#930031]/60'
                            : 'bg-[#0c101d] text-[#BEDEFF]/70 border border-[#BEDEFF]/15'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client Status Info in Drawer */}
            <div className="pt-3 border-t border-[#BEDEFF]/15 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0c101d] border border-[#BEDEFF]/15 flex items-center justify-between">
                <span className="text-[#BEDEFF]/70 text-[11px]">Node Name:</span>
                <span className="text-[#FFF2A7] font-semibold text-[11px] truncate max-w-[120px]">
                  {clientInfo?.displayName || 'Unregistered'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar (Fixed at bottom for phones < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070a12]/95 backdrop-blur-xl border-t border-[#BEDEFF]/15 px-2 py-1.5 flex items-center justify-around mobile-safe-bottom shadow-2xl">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavSelect(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] ${
                isActive
                  ? 'text-[#FFA500] font-bold'
                  : 'text-slate-400 hover:text-[#BEDEFF]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#FFA500]' : ''}`} />
                {item.badge === 'Real' && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#FFA500] animate-pulse"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                {item.shortLabel}
              </span>
            </button>
          );
        })}

        {/* More Menu Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] ${
            isMobileOpen || (activePage !== 'overview' && activePage !== 'live-network' && activePage !== 'virtual-lab' && activePage !== 'tests')
              ? 'text-[#FFF2A7] font-bold'
              : 'text-slate-400 hover:text-[#BEDEFF]'
          }`}
        >
          <Menu className="w-5 h-5 text-[#BEDEFF]" />
          <span className="text-[10px] mt-0.5 font-medium tracking-tight">
            More
          </span>
        </button>
      </nav>
    </>
  );
}
