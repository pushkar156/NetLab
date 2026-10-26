import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Plus,
  Play,
  RotateCcw,
  Save,
  Download,
  Trash2,
  Monitor,
  Server,
  Network,
  Shield,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

import { PcNode, ServerNode, SwitchNode, RouterNode } from '../features/topology/CustomNodes';
import DeviceConfigModal from '../features/topology/DeviceConfigModal';
import PacketInspector from '../features/topology/PacketInspector';
import { api } from '../services/api';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export default function VirtualLab() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Simulation state
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [testType, setTestType] = useState('ping');
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentHopIndex, setCurrentHopIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simLoading, setSimLoading] = useState(false);

  // Register custom node types
  const nodeTypes = useMemo(() => ({
    pc: PcNode,
    server: ServerNode,
    switch: SwitchNode,
    router: RouterNode
  }), []);

  // Load starter topology from backend
  const loadTopology = useCallback(async () => {
    try {
      const res = await api.getNetwork('default-net');
      if (res.network) {
        const rawDevices = res.network.devices || [];
        const rawLinks = res.network.links || [];

        const flowNodes = rawDevices.map((d) => ({
          id: d.id,
          type: d.type,
          position: { x: d.position_x || 100, y: d.position_y || 100 },
          data: {
            ...d,
            name: d.name,
            ip_address: d.ip_address,
            subnet_mask: d.subnet_mask,
            default_gateway: d.default_gateway,
            services: d.services,
            config: d.config
          }
        }));

        const flowEdges = rawLinks.map((l) => ({
          id: l.id,
          source: l.source_id,
          target: l.target_id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#475569', strokeWidth: 2 },
          data: { ...l }
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);

        // Pre-select source and target for immediate testability
        if (flowNodes.length >= 2) {
          setSourceId(flowNodes[0].id);
          setTargetId(flowNodes[flowNodes.length - 1].id);
        }
      }
    } catch (err) {
      console.error('Failed to load network topology:', err);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    loadTopology();
  }, [loadTopology]);

  // Handle new edge connection by user drag
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      id: `link_${Date.now()}`,
      type: 'smoothstep',
      style: { stroke: '#475569', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  // Handle node selection to open configuration drawer
  const onNodeClick = useCallback((event, node) => {
    setSelectedDevice(node.data);
    setIsConfigOpen(true);
  }, []);

  // Add a new device node
  const handleAddDevice = (type) => {
    const id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    let defaultData = {
      id,
      name: `${type.toUpperCase()}_${nodes.length + 1}`,
      type,
      services: {},
      config: {}
    };

    if (type === 'pc') {
      defaultData.ip_address = '192.168.1.50';
      defaultData.subnet_mask = '255.255.255.0';
      defaultData.default_gateway = '192.168.1.1';
    } else if (type === 'server') {
      defaultData.ip_address = '192.168.1.150';
      defaultData.subnet_mask = '255.255.255.0';
      defaultData.default_gateway = '192.168.1.1';
      defaultData.services = { http: { enabled: true, port: 80, banner: 'New Server Web Daemon' } };
    } else if (type === 'router') {
      defaultData.config = {
        interfaces: [
          { name: 'Gig0/0', ip: '192.168.1.1', mask: '255.255.255.0', status: 'up' },
          { name: 'Gig0/1', ip: '192.168.2.1', mask: '255.255.255.0', status: 'up' }
        ],
        routes: []
      };
    }

    const newNode = {
      id,
      type,
      position: { x: 250 + Math.random() * 80, y: 150 + Math.random() * 80 },
      data: defaultData
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // Save device config from modal
  const handleSaveDeviceConfig = (updatedDevice) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === updatedDevice.id) {
        return {
          ...n,
          data: updatedDevice
        };
      }
      return n;
    }));
  };

  // Delete a device node and cascading edges
  const handleDeleteDevice = (deviceId) => {
    setNodes((nds) => nds.filter((n) => n.id !== deviceId));
    setEdges((eds) => eds.filter((e) => e.source !== deviceId && e.target !== deviceId));
  };

  const { user } = useAuth();

  // Persist topology snapshot to Cloud Firestore & backend SQLite
  const handleSaveTopology = async () => {
    try {
      const payload = {
        id: 'default-net',
        name: 'Dual-Subnet Enterprise Starter',
        description: 'Topology saved from interactive visual canvas',
        devices: nodes.map(n => ({
          ...n.data,
          id: n.id,
          position_x: n.position.x,
          position_y: n.position.y
        })),
        links: edges.map(e => ({
          id: e.id,
          source_id: e.source,
          target_id: e.target,
          status: 'active'
        }))
      };

      // Save to Cloud Firestore
      await firestoreService.saveNetwork(user?.uid || 'guest', payload);
      // Also save to SQLite backend
      await api.saveNetwork(payload);

      alert('Network topology saved successfully to Cloud Firestore & local database!');
    } catch (err) {
      alert(`Failed to save topology: ${err.message}`);
    }
  };

  // Execute deterministic simulation
  const handleRunSimulation = async () => {
    if (!sourceId || !targetId) {
      alert('Please select both a source device and a destination device.');
      return;
    }

    setSimLoading(true);
    setIsPlaying(false);
    setCurrentHopIndex(0);

    try {
      // Build snapshot of current canvas state to send to backend engine
      const customTopology = {
        devices: nodes.map(n => ({
          ...n.data,
          id: n.id
        })),
        links: edges.map(e => ({
          id: e.id,
          source_id: e.source,
          target_id: e.target,
          status: 'active'
        }))
      };

      const result = await api.runSimulation({
        sourceId,
        targetId,
        testType,
        customTopology
      });

      setSimulationResult(result);
      setCurrentHopIndex(0);
      setIsPlaying(true);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  // Animate edges based on current simulation hop
  useEffect(() => {
    if (!simulationResult || !simulationResult.hops || simulationResult.hops.length === 0) {
      // Reset edge styling
      setEdges((eds) => eds.map(e => ({
        ...e,
        animated: false,
        style: { stroke: '#475569', strokeWidth: 2 }
      })));
      return;
    }

    const hops = simulationResult.hops;
    const currentHop = hops[currentHopIndex];
    const prevHop = currentHopIndex > 0 ? hops[currentHopIndex - 1] : null;

    setEdges((eds) => eds.map(e => {
      // Highlight edge if it connects previous hop to current hop
      const isHopEdge = prevHop && (
        (e.source === prevHop.deviceId && e.target === currentHop.deviceId) ||
        (e.target === prevHop.deviceId && e.source === currentHop.deviceId)
      );

      if (isHopEdge) {
        return {
          ...e,
          animated: true,
          style: { stroke: '#FFA500', strokeWidth: 3, filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.7))' }
        };
      }

      return {
        ...e,
        animated: false,
        style: { stroke: '#1e263d', strokeWidth: 2 }
      };
    }));
  }, [currentHopIndex, simulationResult, setEdges]);

  // Auto-play animation timer
  useEffect(() => {
    let timer = null;
    if (isPlaying && simulationResult?.hops) {
      if (currentHopIndex < simulationResult.hops.length - 1) {
        timer = setTimeout(() => {
          setCurrentHopIndex(prev => prev + 1);
        }, 1200);
      } else {
        setIsPlaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentHopIndex, simulationResult]);

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] gap-3">
      {/* Top Controls Toolbar */}
      <div className="p-3 glass-panel rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Device Palette */}
        <div className="flex items-center gap-1.5 border-r border-[#BEDEFF]/15 pr-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#BEDEFF]/60 mr-1 hidden sm:inline font-semibold">
            Add Node:
          </span>
          <button
            onClick={() => handleAddDevice('pc')}
            className="px-3 py-1.5 rounded-xl bg-[#070a12] hover:bg-[#111728] text-[#BEDEFF] border border-[#BEDEFF]/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Monitor className="w-3.5 h-3.5 text-[#BEDEFF]" />
            + PC
          </button>
          <button
            onClick={() => handleAddDevice('server')}
            className="px-3 py-1.5 rounded-xl bg-[#070a12] hover:bg-[#111728] text-[#FFF2A7] border border-[#FFF2A7]/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Server className="w-3.5 h-3.5 text-[#FFF2A7]" />
            + Server
          </button>
          <button
            onClick={() => handleAddDevice('switch')}
            className="px-3 py-1.5 rounded-xl bg-[#070a12] hover:bg-[#111728] text-[#BEDEFF] border border-[#BEDEFF]/20 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Network className="w-3.5 h-3.5 text-[#FFA500]" />
            + Switch
          </button>
          <button
            onClick={() => handleAddDevice('router')}
            className="px-3 py-1.5 rounded-xl bg-[#070a12] hover:bg-[#111728] text-[#FFF2A7] border border-[#930031]/50 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-[#FFA500]" />
            + Router
          </button>
        </div>

        {/* Quick Simulation Trigger Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#BEDEFF]/70">Src:</span>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="bg-[#070a12] border border-[#BEDEFF]/25 rounded-xl text-xs font-mono text-[#BEDEFF] px-2.5 py-1.5 focus:outline-none focus:border-[#FFA500]"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.data.name} ({n.data.ip_address || n.data.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#BEDEFF]/70">Dst:</span>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="bg-[#070a12] border border-[#BEDEFF]/25 rounded-xl text-xs font-mono text-[#FFF2A7] px-2.5 py-1.5 focus:outline-none focus:border-[#FFA500]"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.data.name} ({n.data.ip_address || n.data.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono">
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="bg-[#070a12] border border-[#BEDEFF]/25 rounded-xl text-xs font-mono text-white px-2.5 py-1.5 focus:outline-none focus:border-[#FFA500]"
            >
              <option value="ping">ICMP Ping (L3)</option>
              <option value="http">HTTP Web (L7)</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simLoading}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FFA500] to-[#FFA500]/90 hover:from-[#FFA500]/95 hover:to-[#FFA500] text-[#070a12] font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-md shadow-[#FFA500]/25 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {simLoading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        {/* Persistence Controls */}
        <div className="flex items-center gap-2 border-l border-[#BEDEFF]/15 pl-3">
          <button
            onClick={handleSaveTopology}
            title="Save network to SQLite"
            className="px-3.5 py-1.5 rounded-xl bg-[#070a12] hover:bg-[#111728] text-[#FFF2A7] border border-[#FFA500]/30 text-xs font-mono flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5 text-[#FFA500]" />
            Save
          </button>
          <button
            onClick={loadTopology}
            title="Reset to default starter topology"
            className="p-1.5 rounded-xl bg-[#070a12] hover:bg-[#111728] text-[#BEDEFF] hover:text-white border border-[#BEDEFF]/20 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-[#FFA500]" />
          </button>
        </div>
      </div>

      {/* Main React Flow Canvas Area */}
      <div className="flex-1 bg-[#070a12] border border-[#BEDEFF]/15 rounded-2xl overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#192238" gap={20} size={1} />
          <Controls className="!bg-[#0c101d] !border-[#BEDEFF]/20 !rounded-xl !text-[#BEDEFF]" />
        </ReactFlow>

        {/* Canvas floating quick guide */}
        <div className="absolute top-4 right-4 glass-panel border border-[#BEDEFF]/20 rounded-xl p-3 text-[11px] font-mono text-[#BEDEFF]/75 max-w-xs pointer-events-none space-y-1 shadow-lg">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#FFA500]" />
            Interactive Canvas Tips
          </div>
          <div>• Click any node to configure IP, Gateway, or Services.</div>
          <div>• Drag between node handles to create network links.</div>
        </div>

        {/* Bottom Packet Flow Inspector Drawer */}
        {simulationResult && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <PacketInspector
              simulation={simulationResult}
              currentStep={currentHopIndex}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onReset={() => {
                setIsPlaying(false);
                setCurrentHopIndex(0);
              }}
              onStepForward={() => {
                if (currentHopIndex < simulationResult.hops.length - 1) {
                  setCurrentHopIndex(prev => prev + 1);
                }
              }}
              onStepBackward={() => {
                if (currentHopIndex > 0) {
                  setCurrentHopIndex(prev => prev - 1);
                }
              }}
              onClose={() => setSimulationResult(null)}
            />
          </div>
        )}
      </div>

      {/* Device Configuration Modal */}
      <DeviceConfigModal
        device={selectedDevice}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveDeviceConfig}
        onDelete={handleDeleteDevice}
      />
    </div>
  );
}
