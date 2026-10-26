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
      className={`h-[calc(100vh-4rem)] border-r border-slate-800/80 bg-slate-950/90 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-3 space-y-1.5 overflow-y-auto">
        <div className={`text-[10px] uppercase tracking-wider font-mono text-slate-500 px-3 py-2 ${isCollapsed ? 'hidden' : 'block'}`}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-400 border border-slate-800'
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
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors text-xs font-mono"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
