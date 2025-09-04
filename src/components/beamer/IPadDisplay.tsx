import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';
import { IPadConfig, DeviceType } from '../../types/device';
import MultiDeviceDisplay from './MultiDeviceDisplay';

interface IPadDisplayProps {
  deviceId: string;
  isPrimary?: boolean;
  onSyncStatusChange?: (status: any) => void;
}

const IPadDisplay: React.FC<IPadDisplayProps> = ({
  deviceId,
  isPrimary = false,
  onSyncStatusChange
}) => {
  const { 
    selectedSlot, 
    layerConfig, 
    globalSettings,
    currentBlock,
    slots 
  } = useLayerContext();

  const [ipadConfig, setIpadConfig] = useState<IPadConfig>({
    orientation: 'portrait',
    brightness: 80,
    autoLock: false,
    batteryOptimization: true,
    touchSensitivity: 'medium',
    hapticFeedback: true
  });

  const [isWalking, setIsWalking] = useState(false);
  const [walkingSpeed, setWalkingSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const accelerometerRef = useRef<number>();
  const locationRef = useRef<number>();
  const batteryRef = useRef<number>();

  useEffect(() => {
    // Initialize iPad-specific features
    initializeIPad();
    
    // Start monitoring sensors
    startSensorMonitoring();
    
    // Set up periodic updates
    setupPeriodicUpdates();

    return () => {
      cleanup();
    };
  }, []);

  const initializeIPad = async () => {
    try {
      // Load iPad configuration from backend
      const response = await fetch(`/api/ipad/config/${deviceId}`);
      if (response.ok) {
        const config = await response.json();
        setIpadConfig(config);
      }

      // Request location permission
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.log('Location permission denied:', error);
          }
        );
      }

      // Check battery status
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          setBatteryLevel(battery.level * 100);
          setIsCharging(battery.charging);
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(battery.level * 100);
          });
          
          battery.addEventListener('chargingchange', () => {
            setIsCharging(battery.charging);
          });
        });
      }
    } catch (error) {
      console.error('Failed to initialize iPad:', error);
    }
  };

  const startSensorMonitoring = () => {
    // Monitor device motion for walking detection
    if ('DeviceMotionEvent' in window) {
      let lastTime = 0;
      let lastX = 0;
      let lastY = 0;
      let lastZ = 0;

      window.addEventListener('devicemotion', (event) => {
        const currentTime = Date.now();
        const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

        if (lastTime !== 0) {
          const deltaTime = currentTime - lastTime;
          const deltaX = Math.abs(x - lastX);
          const deltaY = Math.abs(y - lastY);
          const deltaZ = Math.abs(z - lastZ);

          // Calculate movement intensity
          const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
          const speed = movement / deltaTime;

          setWalkingSpeed(speed);
          setIsWalking(speed > 0.5); // Threshold for walking detection
        }

        lastTime = currentTime;
        lastX = x;
        lastY = y;
        lastZ = z;
      });
    }
  };

  const setupPeriodicUpdates = () => {
    // Update location periodically
    locationRef.current = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });

            // Send location update to backend
            fetch('/api/ipad/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deviceId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
              })
            }).catch(console.error);
          },
          (error) => {
            console.log('Location update failed:', error);
          }
        );
      }
    }, 30000); // Update every 30 seconds

    // Update battery status
    batteryRef.current = setInterval(() => {
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          setBatteryLevel(battery.level * 100);
          setIsCharging(battery.charging);
        });
      }
    }, 60000); // Update every minute
  };

  const cleanup = () => {
    if (locationRef.current) {
      clearInterval(locationRef.current);
    }
    if (batteryRef.current) {
      clearInterval(batteryRef.current);
    }
  };

  const handleConfigUpdate = async (updates: Partial<IPadConfig>) => {
    try {
      const response = await fetch(`/api/ipad/config/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setIpadConfig(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Failed to update iPad config:', error);
    }
  };

  const handleOrientationChange = () => {
    const newOrientation = ipadConfig.orientation === 'portrait' ? 'landscape' : 'portrait';
    handleConfigUpdate({ orientation: newOrientation });
  };

  const handleQRCodeToggle = () => {
    setShowQRCode(!showQRCode);
  };

  const renderIPadControls = () => (
    <motion.div
      className="absolute top-2 left-2 z-50 bg-white/90 text-gray-800 p-4 rounded-lg shadow-lg"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-lg font-bold mb-3">📱 iPad Controls</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Orientation</label>
          <button
            onClick={handleOrientationChange}
            className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            {ipadConfig.orientation === 'portrait' ? 'Portrait' : 'Landscape'}
          </button>
        </div>

        <div>
          <label className="block text-sm mb-1">Brightness: {ipadConfig.brightness}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={ipadConfig.brightness}
            onChange={(e) => handleConfigUpdate({ brightness: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoLock"
            checked={ipadConfig.autoLock}
            onChange={(e) => handleConfigUpdate({ autoLock: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="autoLock" className="text-sm">Auto Lock</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="batteryOptimization"
            checked={ipadConfig.batteryOptimization}
            onChange={(e) => handleConfigUpdate({ batteryOptimization: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="batteryOptimization" className="text-sm">Battery Optimization</label>
        </div>

        <div>
          <label className="block text-sm mb-1">Touch Sensitivity</label>
          <select
            value={ipadConfig.touchSensitivity}
            onChange={(e) => handleConfigUpdate({ touchSensitivity: e.target.value as any })}
            className="w-full bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          onClick={handleQRCodeToggle}
          className={`w-full px-3 py-1 rounded text-sm ${
            showQRCode ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
          }`}
        >
          {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
        </button>
      </div>
    </motion.div>
  );

  const renderStatusBar = () => (
    <motion.div
      className="absolute top-0 left-0 right-0 z-40 bg-black/80 text-white p-2 flex justify-between items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-4">
        <span className="text-sm font-mono">iPad {deviceId}</span>
        <span className="text-sm">{ipadConfig.orientation}</span>
        {isWalking && (
          <span className="text-sm text-green-400">🚶 Walking</span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {location && (
          <span className="text-sm">
            📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        )}
        
        <div className="flex items-center space-x-1">
          <span className="text-sm">{batteryLevel}%</span>
          <div className={`w-4 h-2 rounded-full ${
            batteryLevel > 50 ? 'bg-green-500' : 
            batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          {isCharging && <span className="text-sm">⚡</span>}
        </div>
      </div>
    </motion.div>
  );

  const renderSlotContent = () => {
    if (!selectedSlot || !slots[selectedSlot]) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">📱 iPad Display</h2>
            <p className="text-sm opacity-75">No slot selected</p>
          </div>
        </div>
      );
    }

    const slot = slots[selectedSlot];
    const isPortrait = ipadConfig.orientation === 'portrait';

    return (
      <div className={`w-full h-full p-4 ${isPortrait ? 'flex-col' : 'flex-row'} flex items-center justify-center`}>
        <div className={`${isPortrait ? 'w-full' : 'w-1/2'} text-center`}>
          <h2 className="text-xl font-bold mb-2">Slot {selectedSlot}</h2>
          
          {/* Layer 1: Static Content */}
          {layerConfig['layer-1-static'].active && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Static Logo</h3>
              <div className="w-24 h-24 bg-blue-500 rounded-lg mx-auto flex items-center justify-center text-white font-bold">
                LOGO
              </div>
            </div>
          )}

          {/* Layer 2: Hologram Effect */}
          {layerConfig['layer-2-hologram'].active && (
            <div className="mb-4 p-4 bg-purple-100 rounded-lg">
              <h3 className="font-semibold mb-2">Hologram Effect</h3>
              <div className="w-24 h-24 bg-purple-500 rounded-lg mx-auto flex items-center justify-center text-white font-bold animate-pulse">
                HOLO
              </div>
            </div>
          )}

          {/* Layer 3: AR Content */}
          {layerConfig['layer-3-ar'].active && (
            <div className="mb-4 p-4 bg-green-100 rounded-lg">
              <h3 className="font-semibold mb-2">AR Model</h3>
              <div className="w-24 h-24 bg-green-500 rounded-lg mx-auto flex items-center justify-center text-white font-bold">
                AR
              </div>
            </div>
          )}
        </div>

        {/* QR Code Display */}
        {showQRCode && (
          <div className={`${isPortrait ? 'w-full mt-4' : 'w-1/2'} text-center`}>
            <h3 className="font-semibold mb-2">QR Code</h3>
            <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto flex items-center justify-center">
              <span className="text-gray-500 text-xs">QR Code</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Scan to activate AR</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full relative bg-gray-50">
      {/* Status Bar */}
      {renderStatusBar()}

      {/* iPad-specific controls */}
      {renderIPadControls()}

      {/* Main Content Area */}
      <div className="w-full h-full pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={ipadConfig.orientation}
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {renderSlotContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Multi-device display wrapper */}
      <div className="absolute inset-0 pointer-events-none">
        <MultiDeviceDisplay
          deviceType="ipad"
          deviceId={deviceId}
          isPrimary={isPrimary}
          onSyncStatusChange={onSyncStatusChange}
        />
      </div>
    </div>
  );
};

export default IPadDisplay;
