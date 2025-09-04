import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';
import { DeviceType, DisplayMode, SyncStatus } from '../../types/device';

interface MultiDeviceDisplayProps {
  deviceType: DeviceType;
  deviceId: string;
  isPrimary?: boolean;
  onSyncStatusChange?: (status: SyncStatus) => void;
}

const MultiDeviceDisplay: React.FC<MultiDeviceDisplayProps> = ({
  deviceType,
  deviceId,
  isPrimary = false,
  onSyncStatusChange
}) => {
  const { 
    selectedSlot, 
    layerConfig, 
    globalSettings,
    currentBlock,
    syncStatus 
  } = useLayerContext();
  
  const [displayMode, setDisplayMode] = useState<DisplayMode>('normal');
  const [syncLatency, setSyncLatency] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [deviceStatus, setDeviceStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    networkLatency: 0
  });

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const performanceMonitorRef = useRef<NodeJS.Timeout>();

  // Device-specific configurations
  const deviceConfigs = {
    beamer: {
      refreshRate: 60,
      resolution: { width: 1920, height: 1080 },
      syncPriority: 'high',
      displayModes: ['normal', 'fullscreen', 'presentation'] as DisplayMode[]
    },
    ipad: {
      refreshRate: 120,
      resolution: { width: 1024, height: 1366 },
      syncPriority: 'medium',
      displayModes: ['normal', 'portrait', 'landscape'] as DisplayMode[]
    },
    billboard: {
      refreshRate: 30,
      resolution: { width: 1920, height: 1080 },
      syncPriority: 'medium',
      displayModes: ['normal', 'billboard', 'advertising'] as DisplayMode[]
    }
  };

  const config = deviceConfigs[deviceType];

  useEffect(() => {
    // Initialize device synchronization
    initializeDeviceSync();
    
    // Start performance monitoring
    startPerformanceMonitoring();
    
    // Set up periodic sync
    setupPeriodicSync();

    return () => {
      cleanup();
    };
  }, [deviceType, deviceId]);

  const initializeDeviceSync = async () => {
    try {
      setDeviceStatus('syncing');
      
      // Register device with the sync system
      const response = await fetch('/api/sync/device/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          deviceType,
          capabilities: config,
          isPrimary
        })
      });

      if (response.ok) {
        setDeviceStatus('online');
        onSyncStatusChange?.('connected');
      } else {
        throw new Error('Failed to register device');
      }
    } catch (error) {
      console.error('Device sync initialization failed:', error);
      setDeviceStatus('offline');
      onSyncStatusChange?.('disconnected');
    }
  };

  const setupPeriodicSync = () => {
    syncIntervalRef.current = setInterval(async () => {
      await performSync();
    }, 1000 / config.refreshRate); // Sync at device refresh rate
  };

  const performSync = async () => {
    try {
      const startTime = performance.now();
      
      // Request latest slot data
      const response = await fetch(`/api/sync/device/${deviceId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const syncData = await response.json();
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        setSyncLatency(latency);
        setLastSyncTime(new Date());
        
        // Update local state with synced data
        updateLocalState(syncData);
        
        // Log sync performance
        logSyncPerformance(latency, syncData);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setDeviceStatus('offline');
    }
  };

  const updateLocalState = (syncData: any) => {
    // Update slot information, layer states, and global settings
    // This would typically update the context or local state
    if (syncData.slots) {
      // Update slot data
    }
    if (syncData.layerConfig) {
      // Update layer configuration
    }
    if (syncData.globalSettings) {
      // Update global settings
    }
  };

  const startPerformanceMonitoring = () => {
    performanceMonitorRef.current = setInterval(() => {
      // Monitor FPS
      const fps = calculateFPS();
      
      // Monitor memory usage (if available)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Monitor network latency
      const networkLatency = syncLatency;
      
      setPerformanceMetrics({
        fps,
        memoryUsage,
        networkLatency
      });
    }, 1000);
  };

  const calculateFPS = () => {
    // Simple FPS calculation based on sync frequency
    return Math.round(1000 / Math.max(syncLatency, 1));
  };

  const logSyncPerformance = (latency: number, data: any) => {
    // Log sync performance for analytics
    fetch('/api/analytics/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        deviceType,
        latency,
        dataSize: JSON.stringify(data).length,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  };

  const cleanup = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    if (performanceMonitorRef.current) {
      clearInterval(performanceMonitorRef.current);
    }
  };

  const handleDisplayModeChange = (newMode: DisplayMode) => {
    setDisplayMode(newMode);
    
    // Notify other devices of display mode change
    fetch('/api/sync/device/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        deviceType,
        displayMode: newMode,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  };

  const getDeviceSpecificStyles = () => {
    const baseStyles = {
      width: '100%',
      height: '100%',
      position: 'relative' as const,
      overflow: 'hidden'
    };

    switch (deviceType) {
      case 'beamer':
        return {
          ...baseStyles,
          aspectRatio: '16/9',
          backgroundColor: '#000',
          color: '#fff'
        };
      case 'ipad':
        return {
          ...baseStyles,
          aspectRatio: '3/4',
          backgroundColor: '#f5f5f5',
          color: '#333'
        };
      case 'billboard':
        return {
          ...baseStyles,
          aspectRatio: '16/9',
          backgroundColor: '#1a1a1a',
          color: '#fff'
        };
      default:
        return baseStyles;
    }
  };

  const renderDeviceStatus = () => (
    <motion.div
      className="absolute top-2 right-2 z-50 flex items-center space-x-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`w-3 h-3 rounded-full ${
        deviceStatus === 'online' ? 'bg-green-500' :
        deviceStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      <span className="text-xs font-mono">
        {deviceType.toUpperCase()}
      </span>
      <span className="text-xs text-gray-400">
        {syncLatency.toFixed(0)}ms
      </span>
    </motion.div>
  );

  const renderPerformanceMetrics = () => (
    <motion.div
      className="absolute bottom-2 left-2 z-50 bg-black/50 text-white p-2 rounded text-xs"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div>FPS: {performanceMetrics.fps}</div>
      <div>Memory: {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
      <div>Latency: {performanceMetrics.networkLatency.toFixed(0)}ms</div>
    </motion.div>
  );

  const renderDisplayControls = () => (
    <motion.div
      className="absolute top-2 left-2 z-50 flex space-x-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {config.displayModes.map((mode) => (
        <button
          key={mode}
          onClick={() => handleDisplayModeChange(mode)}
          className={`px-3 py-1 text-xs rounded ${
            displayMode === mode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          {mode}
        </button>
      ))}
    </motion.div>
  );

  return (
    <div style={getDeviceSpecificStyles()} className="multi-device-display">
      {/* Device Status Indicator */}
      {renderDeviceStatus()}
      
      {/* Display Mode Controls */}
      {renderDisplayControls()}
      
      {/* Performance Metrics */}
      {globalSettings.showPerformanceMetrics && renderPerformanceMetrics()}
      
      {/* Main Content Area */}
      <div className="w-full h-full relative">
        <AnimatePresence mode="wait">
          {deviceStatus === 'online' ? (
            <motion.div
              key="content"
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Slot content will be rendered here based on device type */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    {deviceType === 'beamer' ? '🎬 Beamer Display' : 
                     deviceType === 'ipad' ? '📱 iPad Display' : '🖥️ Billboard Display'}
                  </h2>
                  <p className="text-sm opacity-75">
                    Device ID: {deviceId}
                  </p>
                  <p className="text-sm opacity-75">
                    Mode: {displayMode}
                  </p>
                  <p className="text-sm opacity-75">
                    Sync: {deviceStatus}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="offline"
              className="w-full h-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold mb-2">Device Offline</h3>
                <p className="text-sm opacity-75">
                  Attempting to reconnect...
                </p>
                <button
                  onClick={initializeDeviceSync}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry Connection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultiDeviceDisplay;
