import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeviceManager from './DeviceManager';
import { DeviceType } from '../../types/device';

const DeviceDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<'demo' | 'manager'>('demo');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('beamer');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');

  const handleDeviceChange = (deviceType: DeviceType) => {
    setSelectedDevice(deviceType);
  };

  const handleSyncStatusChange = (status: any) => {
    setSyncStatus(status);
  };

  const renderDemoView = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🎬 Multi-Device Display System</h1>
            <p className="text-blue-200">Beamer + iPad + Billboard Synchronization</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                syncStatus === 'connected' ? 'bg-green-500' :
                syncStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm capitalize">{syncStatus}</span>
            </div>
            
            <button
              onClick={() => setCurrentView('manager')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Device Manager
            </button>
          </div>
        </div>
      </div>

      {/* Device Selection */}
      <div className="absolute top-24 left-4 z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Select Device Type</h3>
          
          <div className="space-y-2">
            {(['beamer', 'ipad', 'billboard'] as DeviceType[]).map((deviceType) => (
              <button
                key={deviceType}
                onClick={() => handleDeviceChange(deviceType)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedDevice === deviceType
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {deviceType === 'beamer' ? '🎬' : 
                     deviceType === 'ipad' ? '📱' : '🖥️'}
                  </span>
                  <div>
                    <div className="font-medium capitalize">{deviceType}</div>
                    <div className="text-xs opacity-75">
                      {deviceType === 'beamer' ? 'Projector Display' :
                       deviceType === 'ipad' ? 'Walking Billboard' : 'Static Billboard'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device Information */}
      <div className="absolute top-24 right-4 z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-sm">
          <h3 className="text-lg font-semibold mb-3">Device Information</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-blue-300">Current Device:</span>
              <span className="ml-2 font-medium capitalize">{selectedDevice}</span>
            </div>
            
            <div>
              <span className="text-blue-300">Sync Status:</span>
              <span className={`ml-2 font-medium capitalize ${
                syncStatus === 'connected' ? 'text-green-400' :
                syncStatus === 'syncing' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {syncStatus}
              </span>
            </div>
            
            <div>
              <span className="text-blue-300">Device ID:</span>
              <span className="ml-2 font-mono text-xs">
                {selectedDevice === 'beamer' ? 'beamer-001' :
                 selectedDevice === 'ipad' ? 'ipad-001' : 'billboard-001'}
              </span>
            </div>
            
            <div>
              <span className="text-blue-300">Location:</span>
              <span className="ml-2">
                {selectedDevice === 'beamer' ? 'Main Hall' :
                 selectedDevice === 'ipad' ? 'Walking Billboard 1' : 'Outdoor Display'}
              </span>
            </div>
            
            <div>
              <span className="text-blue-300">Capabilities:</span>
              <div className="ml-2 mt-1">
                {selectedDevice === 'beamer' ? (
                  <div className="text-xs space-y-1">
                    <div>• 1920x1080 Resolution</div>
                    <div>• 60Hz Refresh Rate</div>
                    <div>• Auto-calibration</div>
                    <div>• Keystone Correction</div>
                  </div>
                ) : selectedDevice === 'ipad' ? (
                  <div className="text-xs space-y-1">
                    <div>• 1024x1366 Resolution</div>
                    <div>• 120Hz Refresh Rate</div>
                    <div>• GPS & Motion Sensors</div>
                    <div>• Touch & Haptic Feedback</div>
                  </div>
                ) : (
                  <div className="text-xs space-y-1">
                    <div>• 1920x1080 Resolution</div>
                    <div>• 30Hz Refresh Rate</div>
                    <div>• Weather Protection</div>
                    <div>• Power Management</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="w-full h-full pt-32 px-4">
        <div className="w-full h-full bg-black rounded-lg overflow-hidden border-2 border-white/20">
          <DeviceManager
            onDeviceChange={handleDeviceChange}
            onSyncStatusChange={handleSyncStatusChange}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <span>🎬 BeamerShow 24-Slot System</span>
            <span>•</span>
            <span>Kardiverse Technologies Ltd.</span>
            <span>•</span>
            <span>Multi-Device Synchronization</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>API Status: <span className="text-green-400">Online</span></span>
            <span>WebSocket: <span className="text-green-400">Connected</span></span>
            <span>Database: <span className="text-green-400">Healthy</span></span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderManagerView = () => (
    <div className="w-full h-full bg-gray-50">
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setCurrentView('demo')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Back to Demo
        </button>
      </div>
      
      <DeviceManager
        onDeviceChange={handleDeviceChange}
        onSyncStatusChange={handleSyncStatusChange}
      />
    </div>
  );

  return (
    <div className="w-full h-full relative">
      <AnimatePresence mode="wait">
        {currentView === 'demo' ? (
          <motion.div
            key="demo"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderDemoView()}
          </motion.div>
        ) : (
          <motion.div
            key="manager"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderManagerView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceDemo;
