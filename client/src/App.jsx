import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import LiveNetwork from './pages/LiveNetwork';
import VirtualLab from './pages/VirtualLab';
import IpAddressing from './pages/IpAddressing';
import ConnectivityTests from './pages/ConnectivityTests';
import EventLogs from './pages/EventLogs';
import Documentation from './pages/Documentation';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './services/api';
import { getSocket } from './services/socket';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [serverStatus, setServerStatus] = useState('connecting');
  const [clientInfo, setClientInfo] = useState(null);

  // Check backend server health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        if (res.status === 'healthy') {
          setServerStatus('online');
        } else {
          setServerStatus('degraded');
        }
      } catch {
        setServerStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen to socket connection status
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setServerStatus('online');
      // If client info saved in localStorage, re-register automatically
      const savedName = localStorage.getItem('netlab_display_name');
      if (savedName) {
        socket.emit('register_client', { displayName: savedName }, (res) => {
          if (res?.success && res?.client) {
            setClientInfo(res.client);
          }
        });
      }
    };

    const onDisconnect = () => {
      setServerStatus('offline');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen app-container bg-[#070a12] text-slate-100 flex flex-col font-sans transition-colors duration-200">
          {/* Top Navigation */}
          <Navbar
            activePage={activePage}
            serverStatus={serverStatus}
            clientInfo={clientInfo}
          />

          <div className="flex-1 flex overflow-hidden">
            {/* Collapsible Sidebar */}
            <Sidebar
              activePage={activePage}
              setActivePage={setActivePage}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Central Content Area */}
            <main className="flex-1 overflow-y-auto p-6 app-main bg-[#070a12] transition-colors duration-200">
              {activePage === 'overview' && (
                <Overview onNavigate={setActivePage} clientInfo={clientInfo} />
              )}
              {activePage === 'live-network' && (
                <LiveNetwork clientInfo={clientInfo} setClientInfo={setClientInfo} />
              )}
              {activePage === 'virtual-lab' && (
                <VirtualLab />
              )}
              {activePage === 'addressing' && (
                <IpAddressing />
              )}
              {activePage === 'tests' && (
                <ConnectivityTests />
              )}
              {activePage === 'logs' && (
                <EventLogs />
              )}
              {activePage === 'docs' && (
                <Documentation />
              )}
            </main>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
