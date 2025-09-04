import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'beamer' | 'ipad' | 'tablet' | 'billboard';
  status: 'connected' | 'syncing' | 'disconnected' | 'error';
  lastPing: Date;
  latency: number; // milliseconds
  version: string;
  location?: string;
  batteryLevel?: number; // for mobile devices
  signalStrength?: number; // WiFi signal strength
}

interface SyncEvent {
  id: string;
  timestamp: Date;
  eventType: 'slot_change' | 'layer_toggle' | 'system_pause' | 'error' | 'device_connect';
  deviceId: string;
  details: string;
  success: boolean;
}

interface SyncStats {
  totalDevices: number;
  connectedDevices: number;
  averageLatency: number;
  syncSuccessRate: number;
  lastSyncTime: Date;
  dataTransferred: number; // in KB
}

export const SyncManager: React.FC = () => {
  const { layers } = useLayerContext();
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [stats, setStats] = useState<SyncStats>({
    totalDevices: 0,
    connectedDevices: 0,
    averageLatency: 0,
    syncSuccessRate: 100,
    lastSyncTime: new Date(),
    dataTransferred: 0
  });
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(1000); // ms
  const [showEventLog, setShowEventLog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Initialize mock devices for demo
  const initializeDevices = useCallback(() => {
    const mockDevices: ConnectedDevice[] = [
      {
        id: 'beamer-main-001',
        name: 'Main Beamer Projector',
        type: 'beamer',
        status: 'connected',
        lastPing: new Date(),
        latency: Math.floor(Math.random() * 10) + 5,
        version: 'v2.1.3',
        location: 'Central Display Unit'
      },
      {
        id: 'ipad-walking-001',
        name: 'Walking Billboard iPad #1',
        type: 'ipad',
        status: 'connected',
        lastPing: new Date(),
        latency: Math.floor(Math.random() * 20) + 10,
        version: 'v2.1.3',
        location: 'Street Level - North',
        batteryLevel: Math.floor(Math.random() * 30) + 70,
        signalStrength: Math.floor(Math.random() * 20) + 80
      },
      {
        id: 'ipad-walking-002',
        name: 'Walking Billboard iPad #2',
        type: 'ipad',
        status: 'syncing',
        lastPing: new Date(Date.now() - 2000),
        latency: Math.floor(Math.random() * 25) + 15,
        version: 'v2.1.2',
        location: 'Street Level - South',
        batteryLevel: Math.floor(Math.random() * 40) + 60,
        signalStrength: Math.floor(Math.random() * 15) + 75
      },
      {
        id: 'tablet-display-001',
        name: 'Fixed Display Tablet #1',
        type: 'tablet',
        status: 'connected',
        lastPing: new Date(),
        latency: Math.floor(Math.random() * 15) + 8,
        version: 'v2.1.3',
        location: 'Lobby Display',
        batteryLevel: 100, // Plugged in
        signalStrength: Math.floor(Math.random() * 10) + 90
      },
      {
        id: 'billboard-outdoor-001',
        name: 'Outdoor Digital Billboard',
        type: 'billboard',
        status: Math.random() > 0.8 ? 'error' : 'connected',
        lastPing: new Date(Date.now() - Math.floor(Math.random() * 5000)),
        latency: Math.floor(Math.random() * 40) + 20,
        version: 'v2.0.8',
        location: 'Main Street Intersection'
      }
    ];

    setDevices(mockDevices);
  }, []);

  // Simulate real-time sync events
  const generateSyncEvent = useCallback((device: ConnectedDevice, eventType: SyncEvent['eventType']) => {
    const event: SyncEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType,
      deviceId: device.id,
      details: `${eventType.replace('_', ' ')} on ${device.name}`,
      success: Math.random() > 0.05 // 95% success rate
    };

    setSyncEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    return event;
  }, []);

  // Update device status and latency
  const updateDeviceStatus = useCallback(() => {
    setDevices(prev => prev.map(device => {
      // Simulate some devices going offline occasionally
      const isOnline = Math.random() > 0.02; // 98% uptime
      const newLatency = device.status === 'connected' ? 
        Math.floor(Math.random() * 20) + (device.type === 'beamer' ? 5 : 10) : 
        device.latency;

      // Update battery for mobile devices
      const batteryDelta = Math.random() * 2 - 1; // -1 to +1
      const newBattery = device.batteryLevel ? 
        Math.max(0, Math.min(100, device.batteryLevel + batteryDelta)) : 
        undefined;

      const updatedDevice = {
        ...device,
        status: !isOnline ? 'error' as const : 
                device.status === 'error' && Math.random() > 0.7 ? 'connected' as const :
                device.status,
        lastPing: isOnline ? new Date() : device.lastPing,
        latency: newLatency,
        batteryLevel: newBattery,
        signalStrength: device.signalStrength ? 
          Math.max(50, Math.min(100, device.signalStrength + (Math.random() * 4 - 2))) : 
          undefined
      };

      // Generate sync events occasionally
      if (Math.random() < 0.1) { // 10% chance per update
        generateSyncEvent(updatedDevice, 'slot_change');
      }

      return updatedDevice;
    }));
  }, [generateSyncEvent]);

  // Calculate sync statistics
  const updateStats = useCallback(() => {
    const connectedCount = devices.filter(d => d.status === 'connected').length;
    const totalLatency = devices.reduce((sum, d) => sum + d.latency, 0);
    const avgLatency = devices.length > 0 ? Math.round(totalLatency / devices.length) : 0;
    
    const recentEvents = syncEvents.filter(e => 
      Date.now() - e.timestamp.getTime() < 60000 // Last minute
    );
    const successRate = recentEvents.length > 0 ? 
      Math.round((recentEvents.filter(e => e.success).length / recentEvents.length) * 100) : 100;

    setStats({
      totalDevices: devices.length,
      connectedDevices: connectedCount,
      averageLatency: avgLatency,
      syncSuccessRate: successRate,
      lastSyncTime: new Date(),
      dataTransferred: stats.dataTransferred + Math.floor(Math.random() * 50) + 10
    });
  }, [devices, syncEvents, stats.dataTransferred]);

  // Auto-sync loop
  useEffect(() => {
    if (!isAutoSync) return;

    const interval = setInterval(() => {
      updateDeviceStatus();
      updateStats();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [isAutoSync, syncInterval, updateDeviceStatus, updateStats]);

  // Initialize
  useEffect(() => {
    initializeDevices();
  }, [initializeDevices]);

  // Manual sync function
  const triggerManualSync = () => {
    setDevices(prev => prev.map(device => ({
      ...device,
      status: device.status === 'error' ? 'syncing' : device.status,
      lastPing: new Date()
    })));

    // Simulate sync completion
    setTimeout(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        status: device.status === 'syncing' ? 'connected' : device.status
      })));
      
      generateSyncEvent(devices[0], 'system_pause');
    }, 2000);
  };

  const getDeviceStatusColor = (status: ConnectedDevice['status']) => {
    switch (status) {
      case 'connected': return 'text-green-400 bg-green-500/20 border-green-400/50';
      case 'syncing': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50';
      case 'disconnected': return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-400/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
    }
  };

  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'beamer': return '📽️';
      case 'ipad': return '📱';
      case 'tablet': return '📲';
      case 'billboard': return '🖥️';
      default: return '📱';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 10) return 'text-green-400';
    if (latency < 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900/95 border border-green-500/30 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-400">
            BeamerShow Sync Manager
          </h2>
          <p className="text-sm text-gray-400">
            Real-time Device Synchronization • WebSocket/WiFi • Kardiverse Tech
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-lg border text-sm font-semibold ${
            stats.syncSuccessRate > 95 
              ? 'text-green-400 bg-green-500/20 border-green-400/50'
              : stats.syncSuccessRate > 85
              ? 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50'
              : 'text-red-400 bg-red-500/20 border-red-400/50'
          }`}>
            {stats.syncSuccessRate}% Success Rate
          </div>
          
          <button
            onClick={() => setIsAutoSync(!isAutoSync)}
            className={`px-3 py-1 rounded-lg border text-sm font-semibold ${
              isAutoSync
                ? 'text-green-400 bg-green-500/20 border-green-400/50'
                : 'text-gray-400 bg-gray-500/20 border-gray-400/50'
            }`}
          >
            {isAutoSync ? '🔄 Auto-Sync ON' : '⏸️ Auto-Sync OFF'}
          </button>
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats.connectedDevices}/{stats.totalDevices}
          </div>
          <div className="text-xs text-gray-400">Connected</div>
        </div>
        
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getLatencyColor(stats.averageLatency)}`}>
            {stats.averageLatency}ms
          </div>
          <div className="text-xs text-gray-400">Avg Latency</div>
        </div>
        
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {stats.syncSuccessRate}%
          </div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {(stats.dataTransferred / 1024).toFixed(1)}MB
          </div>
          <div className="text-xs text-gray-400">Data Sync'd</div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {stats.lastSyncTime.toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-400">Last Sync</div>
        </div>
      </div>

      {/* Device Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-300">Connected Devices</h3>
          <div className="flex gap-2">
            <button
              onClick={triggerManualSync}
              className="px-3 py-1 rounded-lg text-sm font-semibold bg-blue-500/20 border border-blue-400/50 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
            >
              🔄 Force Sync
            </button>
            <button
              onClick={() => setShowEventLog(!showEventLog)}
              className="px-3 py-1 rounded-lg text-sm font-semibold bg-gray-500/20 border border-gray-400/50 text-gray-400 hover:bg-gray-500/30 transition-all duration-200"
            >
              📋 Event Log
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedDevice === device.id 
                  ? 'border-blue-400/70 bg-blue-900/30' 
                  : 'border-gray-600/50 bg-gray-800/30 hover:border-gray-500/70'
              }`}
              onClick={() => setSelectedDevice(selectedDevice === device.id ? null : device.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Device Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getDeviceIcon(device.type)}</span>
                  <span className="font-semibold text-gray-300 text-sm">{device.name}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${getDeviceStatusColor(device.status)}`}>
                  {device.status.toUpperCase()}
                </div>
              </div>

              {/* Device Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Latency:</span>
                  <span className={getLatencyColor(device.latency)}>{device.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-gray-300">{device.version}</span>
                </div>
                {device.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-gray-300 truncate ml-2">{device.location}</span>
                  </div>
                )}
                {device.batteryLevel !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Battery:</span>
                    <span className={getBatteryColor(device.batteryLevel)}>{device.batteryLevel}%</span>
                  </div>
                )}
                {device.signalStrength !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Signal:</span>
                    <span className="text-gray-300">{device.signalStrength}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Ping:</span>
                  <span className="text-gray-300">{device.lastPing.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'connected' ? 'bg-green-400' :
                    device.status === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                    device.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-gray-400">
                    {device.status === 'connected' ? 'Live sync active' :
                     device.status === 'syncing' ? 'Synchronizing...' :
                     device.status === 'error' ? 'Connection error' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Event Log */}
      <AnimatePresence>
        {showEventLog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <h4 className="text-lg font-semibold text-gray-300 mb-3">Recent Sync Events</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {syncEvents.slice(0, 20).map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 px-3 bg-gray-700/30 rounded text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${event.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-gray-300">{event.details}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sync Interval: {syncInterval}ms
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={syncInterval}
              onChange={(e) => setSyncInterval(parseInt(e.target.value))}
              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-green"
            />
          </div>
          
          <div className="text-xs text-gray-500 text-right">
            <div>Protocol: WebSocket + WiFi Direct • Security: TLS 1.3</div>
            <div>Target: &lt;1s latency • Range: 100m radius • Backup: 4G/5G cellular</div>
          </div>
        </div>
      </div>
    </div>
  );
};

