import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';
import { QRCodeSVG } from 'qrcode.react';

interface AROverlay {
  id: string;
  name: string;
  type: 'mascot' | 'product' | 'interactive' | '3d-model';
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  description: string;
  modelUrl?: string;
  animationData?: any;
  triggerType: 'qr' | 'nfc' | 'both';
}

interface ARLayerProps {
  slotNumber: number;
  isActive: boolean;
  sponsorLogo?: string;
  className?: string;
  slotDuration?: number;
}

export const ARLayer: React.FC<ARLayerProps> = ({
  slotNumber,
  isActive,
  sponsorLogo,
  className = '',
  slotDuration = 30000
}) => {
  const { layers } = useLayerContext();
  const [currentAROverlay, setCurrentAROverlay] = useState<AROverlay | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showNFC, setShowNFC] = useState(false);
  const [arTriggered, setArTriggered] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  
  const layer3Settings = layers['layer-3-ar']?.settings;
  const isLayer3Active = layers['layer-3-ar']?.isActive;
  const shouldShowAR = isActive && isLayer3Active;

  // AR Overlays Library - 4x daily rotation
  const arOverlays: AROverlay[] = [
    // Morning (6:00 AM - 12:00 PM)
    {
      id: 'morning-mascot',
      name: 'Morning Energy Mascot',
      type: 'mascot',
      timeSlot: 'morning',
      startTime: '06:00',
      endTime: '12:00',
      description: 'Energetic morning mascot with coffee and sunrise effects',
      triggerType: 'both',
      animationData: {
        type: 'mascot',
        mood: 'energetic',
        props: ['coffee', 'sunrise', 'energy']
      }
    },
    {
      id: 'morning-product',
      name: 'Breakfast Product Demo',
      type: 'product',
      timeSlot: 'morning',
      startTime: '06:00',
      endTime: '12:00',
      description: 'Interactive breakfast product showcase with 3D models',
      triggerType: 'qr',
      modelUrl: '/ar-models/breakfast-products.glb'
    },

    // Afternoon (12:00 PM - 6:00 PM)
    {
      id: 'afternoon-mascot',
      name: 'Afternoon Work Mascot',
      type: 'mascot',
      timeSlot: 'afternoon',
      startTime: '12:00',
      endTime: '18:00',
      description: 'Professional work mascot with office and productivity themes',
      triggerType: 'both',
      animationData: {
        type: 'mascot',
        mood: 'professional',
        props: ['laptop', 'office', 'productivity']
      }
    },
    {
      id: 'afternoon-product',
      name: 'Lunch & Snack Demo',
      type: 'product',
      timeSlot: 'afternoon',
      startTime: '12:00',
      endTime: '18:00',
      description: '3D lunch and snack product demonstrations',
      triggerType: 'nfc',
      modelUrl: '/ar-models/lunch-products.glb'
    },

    // Evening (6:00 PM - 12:00 AM)
    {
      id: 'evening-mascot',
      name: 'Evening Relaxation Mascot',
      type: 'mascot',
      timeSlot: 'evening',
      startTime: '18:00',
      endTime: '00:00',
      description: 'Relaxed evening mascot with sunset and relaxation effects',
      triggerType: 'both',
      animationData: {
        type: 'mascot',
        mood: 'relaxed',
        props: ['sunset', 'relaxation', 'evening']
      }
    },
    {
      id: 'evening-product',
      name: 'Dinner & Entertainment',
      type: 'product',
      timeSlot: 'evening',
      startTime: '18:00',
      endTime: '00:00',
      description: 'Interactive dinner and entertainment product showcase',
      triggerType: 'qr',
      modelUrl: '/ar-models/dinner-products.glb'
    },

    // Night (12:00 AM - 6:00 AM)
    {
      id: 'night-mascot',
      name: 'Night Owl Mascot',
      type: 'mascot',
      timeSlot: 'night',
      startTime: '00:00',
      endTime: '06:00',
      description: 'Night owl mascot with moon and stars effects',
      triggerType: 'both',
      animationData: {
        type: 'mascot',
        mood: 'mysterious',
        props: ['moon', 'stars', 'night']
      }
    },
    {
      id: 'night-product',
      name: 'Late Night Products',
      type: 'product',
      timeSlot: 'night',
      startTime: '00:00',
      endTime: '06:00',
      description: '3D late night product demonstrations',
      triggerType: 'nfc',
      modelUrl: '/ar-models/night-products.glb'
    }
  ];

  // Determine current time slot
  useEffect(() => {
    const updateTimeSlot = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 6 && hour < 12) {
        setCurrentTimeSlot('morning');
      } else if (hour >= 12 && hour < 18) {
        setCurrentTimeSlot('afternoon');
      } else if (hour >= 18 && hour < 24) {
        setCurrentTimeSlot('evening');
      } else {
        setCurrentTimeSlot('night');
      }
    };

    updateTimeSlot();
    const interval = setInterval(updateTimeSlot, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Get current AR overlay based on time slot
  useEffect(() => {
    if (shouldShowAR) {
      const availableOverlays = arOverlays.filter(overlay => overlay.timeSlot === currentTimeSlot);
      const randomOverlay = availableOverlays[Math.floor(Math.random() * availableOverlays.length)];
      setCurrentAROverlay(randomOverlay);
    }
  }, [shouldShowAR, currentTimeSlot, arOverlays]);

  // Generate QR code data
  const generateQRData = useCallback(() => {
    if (!currentAROverlay) return '';
    
    return JSON.stringify({
      type: 'ar-trigger',
      overlayId: currentAROverlay.id,
      slotNumber,
      timestamp: Date.now(),
      triggerType: 'qr',
      data: {
        name: currentAROverlay.name,
        description: currentAROverlay.description,
        timeSlot: currentAROverlay.timeSlot,
        modelUrl: currentAROverlay.modelUrl
      }
    });
  }, [currentAROverlay, slotNumber]);

  // Simulate NFC trigger
  const simulateNFCTrigger = useCallback(() => {
    if (!currentAROverlay || currentAROverlay.triggerType === 'qr') return;
    
    setArTriggered(true);
    setIsARActive(true);
    
    // Auto-hide AR after 10 seconds
    setTimeout(() => {
      setIsARActive(false);
      setArTriggered(false);
    }, 10000);
  }, [currentAROverlay]);

  // Handle QR code scan simulation
  const handleQRScan = useCallback(() => {
    if (!currentAROverlay || currentAROverlay.triggerType === 'nfc') return;
    
    setArTriggered(true);
    setIsARActive(true);
    
    // Auto-hide AR after 10 seconds
    setTimeout(() => {
      setIsARActive(false);
      setArTriggered(false);
    }, 10000);
  }, [currentAROverlay]);

  // Performance optimization - only render when needed
  if (!shouldShowAR || !currentAROverlay) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`ar-layer-container ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* AR Trigger Indicators */}
        <div className="absolute top-0 left-0 text-xs text-green-400 bg-black/50 px-2 py-1 rounded dev-ar-info">
          L3: {currentAROverlay.name} • {currentTimeSlot} • {currentAROverlay.triggerType}
        </div>

        {/* Time Slot Indicator */}
        <div className="absolute top-0 right-0 text-xs text-green-400 bg-black/30 px-2 py-1 rounded">
          {currentTimeSlot.charAt(0).toUpperCase() + currentTimeSlot.slice(1)}
        </div>

        {/* AR Trigger Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {/* QR Code Trigger */}
          {currentAROverlay.triggerType !== 'nfc' && (
            <motion.button
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
              onClick={() => setShowQRCode(!showQRCode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📱 QR Code
            </motion.button>
          )}

          {/* NFC Trigger */}
          {currentAROverlay.triggerType !== 'qr' && (
            <motion.button
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
              onClick={simulateNFCTrigger}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔗 NFC Tag
            </motion.button>
          )}

          {/* Test AR Overlay */}
          <motion.button
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
            onClick={() => setIsARActive(!isARActive)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🥽 Test AR
          </motion.button>
        </div>

        {/* QR Code Display */}
        <AnimatePresence>
          {showQRCode && (
            <motion.div
              className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white p-6 rounded-lg text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Scan QR Code to Activate AR
                </h3>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <QRCodeSVG
                    value={generateQRData()}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {currentAROverlay.description}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500">
                    Time Slot: {currentTimeSlot}
                  </div>
                  <div className="text-xs text-gray-500">
                    Trigger Type: {currentAROverlay.triggerType}
                  </div>
                </div>
                <motion.button
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={handleQRScan}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎯 Simulate Scan
                </motion.button>
                <motion.button
                  className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 block w-full"
                  onClick={() => setShowQRCode(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✕ Close
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AR Overlay Display */}
        <AnimatePresence>
          {isARActive && (
            <motion.div
              className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🥽</div>
                <h2 className="text-2xl font-bold mb-2">
                  AR Overlay Active
                </h2>
                <p className="text-lg mb-4">
                  {currentAROverlay.name}
                </p>
                <div className="bg-white/10 p-4 rounded-lg mb-4">
                  <p className="text-sm">
                    {currentAROverlay.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-300">
                    Time Slot: {currentTimeSlot}
                  </div>
                  <div className="text-xs text-gray-300">
                    Type: {currentAROverlay.type}
                  </div>
                </div>
                
                {/* AR Content Simulation */}
                <div className="mb-4">
                  {currentAROverlay.type === 'mascot' && (
                    <div className="text-4xl animate-bounce">🎭</div>
                  )}
                  {currentAROverlay.type === 'product' && (
                    <div className="text-4xl animate-pulse">📦</div>
                  )}
                  {currentAROverlay.type === 'interactive' && (
                    <div className="text-4xl animate-spin">🎮</div>
                  )}
                  {currentAROverlay.type === '3d-model' && (
                    <div className="text-4xl animate-pulse">🎨</div>
                  )}
                </div>

                <motion.button
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  onClick={() => setIsARActive(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✕ Close AR
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AR Frame Effect */}
        <div className="absolute inset-0 border-2 border-green-400/50 rounded-lg pointer-events-none">
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-green-400/70 ar-frame-corner"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-green-400/70 ar-frame-corner"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-green-400/70 ar-frame-corner"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-green-400/70 ar-frame-corner"></div>
        </div>

        {/* AR Status Indicator */}
        <div className="absolute bottom-2 right-2">
          <div className={`w-3 h-3 rounded-full ${arTriggered ? 'bg-green-400' : 'bg-gray-400'}`}></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// AR Controls Component
export const ARControls: React.FC = () => {
  const { layers, updateLayerSettings, toggleLayer } = useLayerContext();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [triggerType, setTriggerType] = useState<'qr' | 'nfc' | 'both'>('both');
  const [arIntensity, setArIntensity] = useState(0.8);

  const isActive = layers['layer-3-ar']?.isActive;

  const timeSlots = [
    { id: 'morning', name: 'Morning', time: '6:00 AM - 12:00 PM', icon: '🌅' },
    { id: 'afternoon', name: 'Afternoon', time: '12:00 PM - 6:00 PM', icon: '☀️' },
    { id: 'evening', name: 'Evening', time: '6:00 PM - 12:00 AM', icon: '🌆' },
    { id: 'night', name: 'Night', time: '12:00 AM - 6:00 AM', icon: '🌙' }
  ];

  const triggerTypes = [
    { id: 'qr', name: 'QR Code Only', description: 'Trigger via QR code scanning' },
    { id: 'nfc', name: 'NFC Only', description: 'Trigger via NFC tag proximity' },
    { id: 'both', name: 'Both QR & NFC', description: 'Support both trigger methods' }
  ];

  const handleTimeSlotChange = (slot: 'morning' | 'afternoon' | 'evening' | 'night') => {
    setSelectedTimeSlot(slot);
    updateLayerSettings('layer-3-ar', {
      ...layers['layer-3-ar']?.settings,
      selectedTimeSlot,
      triggerType,
      arIntensity
    });
  };

  const handleTriggerTypeChange = (type: 'qr' | 'nfc' | 'both') => {
    setTriggerType(type);
    updateLayerSettings('layer-3-ar', {
      ...layers['layer-3-ar']?.settings,
      selectedTimeSlot,
      triggerType: type,
      arIntensity
    });
  };

  const handleToggleLayer = () => {
    toggleLayer('layer-3-ar');
  };

  return (
    <motion.div 
      className="bg-gray-900/95 border border-green-500/30 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-green-400">
            Layer 3: AR Effects
          </h3>
          <p className="text-sm text-gray-400">
            QR/NFC Triggers • 4x Daily Rotation • AR Overlays
          </p>
        </div>
        
        <button
          onClick={handleToggleLayer}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isActive 
              ? 'bg-green-500/30 border border-green-400/50 text-green-400' 
              : 'bg-gray-500/20 border border-gray-400/50 text-gray-400'
          }`}
        >
          {isActive ? '● ACTIVE' : '○ INACTIVE'}
        </button>
      </div>

      {/* Time Slot Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Daily Time Rotation (4x per day)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleTimeSlotChange(slot.id as any)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedTimeSlot === slot.id
                  ? 'bg-green-500/20 border-green-400/50 text-green-400'
                  : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-green-400/30'
              }`}
            >
              <div className="text-lg mb-1">{slot.icon}</div>
              <div className="font-semibold">{slot.name}</div>
              <div className="text-xs text-gray-400">{slot.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Trigger Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Trigger Method
        </label>
        <div className="grid grid-cols-1 gap-3">
          {triggerTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTriggerTypeChange(type.id as any)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                triggerType === type.id
                  ? 'bg-green-500/20 border-green-400/50 text-green-400'
                  : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-green-400/30'
              }`}
            >
              <div className="font-semibold">{type.name}</div>
              <div className="text-xs text-gray-400">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AR Intensity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          AR Effect Intensity
        </label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={arIntensity}
          onChange={(e) => setArIntensity(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-green"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Subtle</span>
          <span>{(arIntensity * 100).toFixed(0)}%</span>
          <span>Intense</span>
        </div>
      </div>

      {/* Technical Specs */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div>Trigger: QR Code scanning + NFC tag proximity</div>
          <div>Rotation: 4x daily (morning, afternoon, evening, night)</div>
          <div>Overlays: Mascots, product demos, 3D models, interactive content</div>
        </div>
      </div>
    </motion.div>
  );
};

