import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceType, DeviceInfo, SyncStatus } from '../../types/device';
import BeamerDisplay from './BeamerDisplay';
import IPadDisplay from './IPadDisplay';
import MultiDeviceDisplay from './MultiDeviceDisplay';

interface DeviceManagerProps {
  onDeviceChange?: (deviceType: DeviceType) => void;
  onSyncStatusChange?: (status: SyncStatus) => void;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({
  onDeviceChange,
  onSyncStatusChange
}) => {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('beamer');
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [isDeviceListOpen, setIsDeviceListOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [deviceHealth, setDeviceHealth] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load available devices
    loadDevices();
    
    // Start health monitoring
    startHealthMonitoring();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/sync/devices');
      if (response.ok) {
        const deviceList = await response.json();
        setDevices(deviceList);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const startHealthMonitoring = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync/health');
        if (response.ok) {
          const health = await response.json();
          setDeviceHealth(health);
        }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  };

  const handleDeviceChange = (deviceType: DeviceType) => {
    setCurrentDevice(deviceType);
    setIsDeviceListOpen(false);
    onDeviceChange?.(deviceType);
  };

  const handleSyncStatusChange = (status: SyncStatus) => {
    setSyncStatus(status);
    onSyncStatusChange?.(status);
  };

  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'beamer':
        return '🎬';
      case 'ipad':
        return '📱';
      case 'billboard':
        return '🖥️';
      default:
        return '📱';
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'syncing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderDeviceList = () => (
    <motion.div
      className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-80"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3">Available Devices</h3>
        
        <div className="space-y-2">
          {devices.map((device) => (
            <div
              key={device.deviceId}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                currentDevice === device.deviceType
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleDeviceChange(device.deviceType)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getDeviceIcon(device.deviceType)}</span>
                  <div>
                    <div className="font-medium">{device.deviceType.toUpperCase()}</div>
                    <div className="text-sm text-gray-500">{device.deviceId}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getDeviceStatusColor(device.status)}`} />
                  <span className="text-xs text-gray-500">
                    {device.syncLatency}ms
                  </span>
                </div>
              </div>
              
              {deviceHealth[device.deviceId] && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Health: {deviceHealth[device.deviceId].status}</span>
                    <span>FPS: {deviceHealth[device.deviceId].metrics?.fps || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => setIsDeviceListOpen(false)}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderCurrentDevice = () => {
    const deviceId = devices.find(d => d.deviceType === currentDevice)?.deviceId || 'default';

    switch (currentDevice) {
      case 'beamer':
        return (
          <BeamerDisplay
            deviceId={deviceId}
            isPrimary={true}
            onSyncStatusChange={handleSyncStatusChange}
          />
        );
      case 'ipad':
        return (
          <IPadDisplay
            deviceId={deviceId}
            isPrimary={false}
            onSyncStatusChange={handleSyncStatusChange}
          />
        );
      case 'billboard':
        return (
          <MultiDeviceDisplay
            deviceType="billboard"
            deviceId={deviceId}
            isPrimary={false}
            onSyncStatusChange={handleSyncStatusChange}
          />
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Device Not Found</h2>
              <p className="text-gray-600">Please select a valid device type</p>
            </div>
          </div>
        );
    }
  };

  const renderDeviceSelector = () => (
    <motion.div
      className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">{getDeviceIcon(currentDevice)}</span>
          <div>
            <h3 className="font-semibold">Current Device</h3>
            <p className="text-sm text-gray-500">{currentDevice.toUpperCase()}</p>
          </div>
        </div>

        <button
          onClick={() => setIsDeviceListOpen(!isDeviceListOpen)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Change Device
        </button>

        {/* Sync Status */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sync Status:</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'connected' ? 'bg-green-500' :
                syncStatus === 'syncing' ? 'bg-yellow-500' :
                syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <span className="text-xs text-gray-500 capitalize">{syncStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device List Dropdown */}
      <AnimatePresence>
        {isDeviceListOpen && renderDeviceList()}
      </AnimatePresence>
    </motion.div>
  );

  const renderGlobalControls = () => (
    <motion.div
      className="absolute top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="font-semibold mb-3">Global Controls</h3>
      
      <div className="space-y-3">
        <button
          onClick={loadDevices}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
        >
          🔄 Refresh Devices
        </button>

        <button
          onClick={() => window.open('/api/sync/status', '_blank')}
          className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
        >
          📊 Sync Status
        </button>

        <button
          onClick={() => window.open('/api/analytics/overview', '_blank')}
          className="w-full px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
        >
          📈 Analytics
        </button>
      </div>

      {/* Connected Devices Summary */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <h4 className="text-sm font-medium mb-2">Connected Devices</h4>
        <div className="space-y-1">
          {devices.filter(d => d.status === 'online').map(device => (
            <div key={device.deviceId} className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1">
                <span>{getDeviceIcon(device.deviceType)}</span>
                <span>{device.deviceType}</span>
              </span>
              <span className="text-green-600">●</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full relative">
      {/* Device Selector */}
      {renderDeviceSelector()}

      {/* Global Controls */}
      {renderGlobalControls()}

      {/* Current Device Display */}
      <div className="w-full h-full">
        {renderCurrentDevice()}
      </div>
    </div>
  );
};

export default DeviceManager;
