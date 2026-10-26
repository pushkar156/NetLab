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
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, isCollapsed, setIsCollapsed }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'live-network', label: 'Live Network', icon: Radio, badge: 'Real' },
    { id: 'virtual-lab', label: 'Virtual Network Lab', icon: Network, badge: 'Topology' },
    { id: 'addressing', label: 'IP Addressing', icon: Binary, badge: null },
    { id: 'tests', label: 'Connectivity Tests', icon: CheckCircle, badge: 'Scenarios' },
    { id: 'logs', label: 'Event Logs', icon: ScrollText, badge: null },
    { id: 'docs', label: 'Documentation', icon: BookOpen, badge: 'Viva' }
  ];

  return (
    <aside
      className={`h-[calc(100vh-4rem)] border-r border-[#BEDEFF]/10 bg-[#070a12]/90 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
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
              onClick={() => setActivePage(item.id)}
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
  );
}
