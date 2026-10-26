import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Send,
  Radio,
  UserCheck,
  Globe,
  Wifi,
  Clock,
  Shield,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getSocket } from '../services/socket';
import { api } from '../services/api';

export default function LiveNetwork({ clientInfo, setClientInfo }) {
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [activeClients, setActiveClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [httpDemoResult, setHttpDemoResult] = useState(null);
  const [httpDemoLoading, setHttpDemoLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const socket = getSocket();

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch initial persistent message history and clients
    api.getRecentMessages(50).then(res => {
      if (res.messages) setMessages(res.messages);
    }).catch(console.error);

    api.getClients().then(res => {
      if (res.clients) {
        // filter active clients
        setActiveClients(res.clients.filter(c => c.is_active));
      }
    }).catch(console.error);

    // Socket event listeners
    const handleActiveClients = (list) => {
      setActiveClients(list);
    };

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(scrollToBottom, 50);
    };

    const handleRegistered = (data) => {
      if (data.success && data.client) {
        setClientInfo(data.client);
        localStorage.setItem('netlab_client_id', data.client.id);
        localStorage.setItem('netlab_display_name', data.client.displayName);
      }
    };

    socket.on('active_clients_updated', handleActiveClients);
    socket.on('new_message', handleNewMessage);
    socket.on('registered', handleRegistered);

    // Auto-register if saved in localStorage
    const savedName = localStorage.getItem('netlab_display_name');
    if (savedName && !clientInfo?.id) {
      socket.emit('register_client', { displayName: savedName });
    }

    return () => {
      socket.off('active_clients_updated', handleActiveClients);
      socket.off('new_message', handleNewMessage);
      socket.off('registered', handleRegistered);
    };
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!displayNameInput.trim()) return;

    socket.emit('register_client', { displayName: displayNameInput.trim() }, (res) => {
      if (res.success && res.client) {
        setClientInfo(res.client);
        localStorage.setItem('netlab_client_id', res.client.id);
        localStorage.setItem('netlab_display_name', res.client.displayName);
      }
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setSending(true);
    const isBroadcast = selectedRecipient === 'all';

    socket.emit('send_message', {
      recipientId: isBroadcast ? null : selectedRecipient,
      isBroadcast,
      message: messageInput.trim()
    }, (ack) => {
      setSending(false);
      if (ack && ack.success) {
        setMessageInput('');
      } else {
        alert(ack?.error || 'Failed to send message.');
      }
    });
  };

  const executeHttpDemo = async () => {
    setHttpDemoLoading(true);
    const start = performance.now();
    try {
      const res = await api.getServerInfo();
      const duration = Math.round(performance.now() - start);
      setHttpDemoResult({ ...res, roundTripDuration: duration });
    } catch (err) {
      setHttpDemoResult({ error: err.message });
    } finally {
      setHttpDemoLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-[#BEDEFF]/15 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="text-gradient-warm font-extrabold">Real Multi-Device Client-Server Network</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-mono font-medium">
            Physical Communication
          </span>
        </h1>
        <p className="text-xs text-[#BEDEFF]/75 mt-1">
          Demonstrates genuine application-layer communication between physical phones, laptops, and the Node.js server via WebSockets and HTTP.
        </p>
      </div>

      {/* Top Row: Device Registration & Active Peers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Registration Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#BEDEFF]/15 pb-3">
            <div className="p-2 rounded-xl bg-[#BEDEFF]/15 text-[#BEDEFF] border border-[#BEDEFF]/30">
              <UserCheck className="w-5 h-5 text-[#BEDEFF]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Physical Device Identity</h3>
              <p className="text-xs text-[#BEDEFF]/70">Register this browser as a named networking client.</p>
            </div>
          </div>

          {clientInfo?.displayName ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#070a12]/90 border border-[#BEDEFF]/20 space-y-2 font-mono text-xs shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[#BEDEFF]/70">Display Name:</span>
                  <span className="text-[#FFF2A7] font-bold">{clientInfo.displayName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#BEDEFF]/70">Unique Client ID:</span>
                  <span className="text-[#BEDEFF] text-[11px] select-all truncate max-w-[150px]">{clientInfo.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#BEDEFF]/70">Observed IP:</span>
                  <span className="text-white font-medium">{clientInfo.ipAddress || '127.0.0.1'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#BEDEFF]/70">Connection Status:</span>
                  <span className="text-[#FFA500] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFA500] animate-pulse"></span>
                    Active Online
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setClientInfo(null);
                  localStorage.removeItem('netlab_client_id');
                  localStorage.removeItem('netlab_display_name');
                }}
                className="w-full py-2 px-3 rounded-xl border border-[#BEDEFF]/20 text-[#BEDEFF] hover:text-[#FFF2A7] hover:border-[#FFA500]/40 text-xs font-mono transition-all bg-[#0c101d]"
              >
                Change Identity
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#BEDEFF] mb-1">
                  Enter Device Name:
                </label>
                <input
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="e.g. Pushkar's Laptop, Ayush's Phone"
                  className="w-full px-3.5 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA500] font-mono shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs transition-all shadow-md shadow-[#FFA500]/25 font-mono"
              >
                Register Device with Backend
              </button>
            </form>
          )}

          <div className="text-[11px] text-[#BEDEFF]/50 border-t border-[#BEDEFF]/10 pt-2 font-mono">
            * Backend assigns unique UUIDs to prevent identity collisions or impersonation.
          </div>
        </div>

        {/* Connected Clients Registry */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFA500]/15 text-[#FFA500] border border-[#FFA500]/30">
                <Users className="w-5 h-5 text-[#FFA500]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Active Physical Nodes Registry</h3>
                <p className="text-xs text-[#BEDEFF]/70">All phones, laptops, and tablets currently connected via WebSocket.</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FFA500]/15 text-[#FFF2A7] border border-[#FFA500]/30 font-semibold">
              {activeClients.length} Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {activeClients.length > 0 ? (
              activeClients.map((client) => {
                const isSelf = client.id === clientInfo?.id;
                return (
                  <div
                    key={client.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs font-mono space-y-1 ${
                      isSelf
                        ? 'bg-gradient-to-r from-[#BEDEFF]/10 to-[#0c101d] border-[#BEDEFF]/40 text-white'
                        : 'bg-[#070a12]/80 border-[#BEDEFF]/15 text-[#BEDEFF]/80 hover:border-[#BEDEFF]/35'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {client.displayName}
                        {isSelf && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FFA500]/25 text-[#FFF2A7] border border-[#FFA500]/40 font-semibold">
                            You
                          </span>
                        )}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFA500] shadow-sm shadow-[#FFA500]/60"></span>
                    </div>
                    <div className="text-[10px] text-[#BEDEFF]/50 truncate">
                      ID: {client.id}
                    </div>
                    <div className="text-[10px] text-[#BEDEFF]/70 flex justify-between">
                      <span>IP: {client.ipAddress || '127.0.0.1'}</span>
                      <span className="text-[#FFF2A7]">Connected</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-xs text-[#BEDEFF]/50 italic py-6 text-center">
                No other physical devices connected yet. Open this URL on another phone or laptop on the same Wi-Fi!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Messaging & HTTP Demonstration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Socket.IO Messaging Panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#BEDEFF]/15 text-[#BEDEFF] border border-[#BEDEFF]/30">
                <MessageSquare className="w-5 h-5 text-[#BEDEFF]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Live Client-Server Messaging Relay</h3>
                <p className="text-xs text-[#BEDEFF]/70">Point-to-Point and Broadcast messaging via Socket.IO WebSocket protocol.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#070a12] text-[#BEDEFF] border border-[#BEDEFF]/20 font-medium">
              WebSocket (Full Duplex)
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 mb-4">
            {messages.length > 0 ? (
              messages.map((m) => {
                const isSender = m.senderId === clientInfo?.id;
                return (
                  <div
                    key={m.id || Math.random()}
                    className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-mono space-y-1.5 ${
                      isSender
                        ? 'ml-auto bg-gradient-to-br from-[#930031]/30 via-[#0c101d] to-[#0c101d] border border-[#FFA500]/40 text-[#f8fafc] shadow-md shadow-[#FFA500]/5'
                        : 'mr-auto bg-[#070a12]/95 border border-[#BEDEFF]/20 text-[#BEDEFF]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px]">
                      <span className="font-bold text-[#FFF2A7]">
                        {m.senderName} {m.is_broadcast || m.isBroadcast ? '(Broadcast to All)' : `-> Private to ${m.recipientName}`}
                      </span>
                      <span className="text-[#BEDEFF]/50">{new Date(m.created_at || m.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-white break-words text-sm font-sans">{m.message}</div>
                    <div className="text-[9px] text-[#FFA500]/90 flex items-center justify-end gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-[#FFA500]" />
                      <span>Delivered via NetLab Server Relay</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#BEDEFF]/50 italic">
                No messages sent yet. Choose a mode and send a message below!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="space-y-2.5 pt-3 border-t border-[#BEDEFF]/15">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#BEDEFF]/70 whitespace-nowrap">Recipient:</span>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs font-mono text-[#FFF2A7] px-3.5 py-1.5 focus:outline-none focus:border-[#FFA500]"
              >
                <option value="all">📢 Broadcast (All Connected Devices)</option>
                {activeClients
                  .filter(c => c.id !== clientInfo?.id)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      🔒 Private to {c.displayName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2.5">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={clientInfo?.displayName ? "Type a real network message..." : "Please register your device name above first..."}
                disabled={!clientInfo?.displayName || sending}
                className="flex-1 px-4 py-2.5 bg-[#070a12] border border-[#BEDEFF]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#FFA500] font-mono disabled:opacity-50 shadow-inner"
              />
              <button
                type="submit"
                disabled={!clientInfo?.displayName || sending || !messageInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40 shadow-md shadow-[#FFA500]/25 font-mono"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Real HTTP Request-Response Demonstration */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#BEDEFF]/15 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FFF2A7]/15 text-[#FFF2A7] border border-[#FFF2A7]/30">
                  <Globe className="w-5 h-5 text-[#FFF2A7]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Real HTTP Request-Response</h3>
                  <p className="text-xs text-[#BEDEFF]/70">Layer 7 Client-Server over TCP</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#BEDEFF]/75 mb-4 leading-relaxed">
              In classical client-server networking, the client initiates a request over HTTP/TCP, and the server validates, processes, and returns a response packet.
            </p>

            <button
              onClick={executeHttpDemo}
              disabled={httpDemoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0c101d] hover:bg-[#111728] text-[#FFF2A7] border border-[#FFA500]/40 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-4 shadow-sm"
            >
              {httpDemoLoading ? 'Transmitting Request...' : 'Trigger GET /api/demo/server-info'}
            </button>

            {httpDemoResult && (
              <div className="p-3.5 rounded-xl bg-[#070a12] border border-[#BEDEFF]/20 space-y-2 text-xs font-mono overflow-x-auto shadow-inner">
                <div className="text-[11px] text-[#FFA500] font-bold border-b border-[#BEDEFF]/10 pb-1.5">
                  HTTP/1.1 200 OK (Round-Trip: {httpDemoResult.roundTripDuration}ms)
                </div>
                <div className="text-[#BEDEFF]/80">
                  <span className="text-[#BEDEFF]/60">Observed Client IP: </span>
                  <span className="text-[#FFF2A7] font-bold">{httpDemoResult.clientInfo?.observedIp}</span>
                </div>
                <div className="text-[#BEDEFF]/80">
                  <span className="text-[#BEDEFF]/60">Server Host Header: </span>
                  <span className="text-white">{httpDemoResult.clientInfo?.hostHeader}</span>
                </div>
                <div className="text-[#BEDEFF]/80">
                  <span className="text-[#BEDEFF]/60">Request ID: </span>
                  <span className="text-[#BEDEFF]/60 text-[10px]">{httpDemoResult.requestId}</span>
                </div>
                <div className="text-[#BEDEFF]/80">
                  <span className="text-[#BEDEFF]/60">Server Uptime: </span>
                  <span className="text-[#FFF2A7]">{httpDemoResult.uptimeSeconds} seconds</span>
                </div>
                <div className="text-[11px] text-[#BEDEFF]/60 pt-1 italic border-t border-[#BEDEFF]/10">
                  {httpDemoResult.explanation}
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-[#070a12]/80 border border-[#BEDEFF]/15 text-[11px] text-[#BEDEFF]/70 font-mono mt-4">
            <span className="text-[#FFA500] font-semibold">Viva Tip:</span> This tests authentic HTTP over the network, contrasting with the simulated virtual network packets in Module D.
          </div>
        </div>
      </div>
    </div>
  );
}
