import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Settings, Smartphone, Monitor, Video } from 'lucide-react';
import { BaseModal } from './BaseModal';
import { useLayerContext } from '../../contexts/LayerContext';

interface SpinningSlotModalProps {
  data: any;
  onClose: () => void;
}

export const SpinningSlotModal: React.FC<SpinningSlotModalProps> = ({ data, onClose }) => {
  const { layers, updateLayerSettings, setLayerIntensity } = useLayerContext();
  const spinningLayer = layers['spinning-slots'] || {};
  
  const [localSettings, setLocalSettings] = useState({
    spinSpeed: spinningLayer.settings?.spinSpeed || 0.3,
    horizontalMovement: spinningLayer.settings?.horizontalMovement || true,
    rotationAngle: spinningLayer.settings?.rotationAngle || 5,
    movementRange: spinningLayer.settings?.movementRange || 10,
    animationDuration: spinningLayer.settings?.animationDuration || 8000,
    performance: spinningLayer.settings?.performance || 'optimized'
  });

  const handleSettingChange = (setting: string, value: any) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev, [setting]: value };
      updateLayerSettings('spinning-slots', newSettings);
      return newSettings;
    });
  };

  const resetToDefaults = () => {
    const defaults = {
      spinSpeed: 0.3,
      horizontalMovement: true,
      rotationAngle: 5,
      movementRange: 10,
      animationDuration: 8000,
      performance: 'optimized'
    };
    
    setLocalSettings(defaults);
    updateLayerSettings('spinning-slots', defaults);
    setLayerIntensity('spinning-slots', 1);
  };

  const platformPresets = [
    {
      id: 'tablet',
      name: 'Tablet Optimized',
      icon: <Smartphone className="w-5 h-5" />,
      settings: {
        spinSpeed: 0.2,
        rotationAngle: 3,
        movementRange: 8,
        animationDuration: 10000,
        performance: 'optimized'
      }
    },
    {
      id: 'billboard',
      name: 'Walking Billboard',
      icon: <Monitor className="w-5 h-5" />,
      settings: {
        spinSpeed: 0.4,
        rotationAngle: 6,
        movementRange: 12,
        animationDuration: 6000,
        performance: 'full'
      }
    },
    {
      id: 'beamer',
      name: '5D Beamer System',
      icon: <Video className="w-5 h-5" />,
      settings: {
        spinSpeed: 0.5,
        rotationAngle: 8,
        movementRange: 15,
        animationDuration: 5000,
        performance: 'full'
      }
    }
  ];

  const applyPreset = (preset: typeof platformPresets[0]) => {
    setLocalSettings(prev => ({ ...prev, ...preset.settings }));
    updateLayerSettings('spinning-slots', { ...localSettings, ...preset.settings });
  };

  return (
    <BaseModal title="Spinning Slots Animation Control" onClose={onClose} size="lg">
      <div className="p-6 space-y-6">
        {/* Layer Status */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Layer 4: Spinning Slots</h3>
              <p className="text-gray-400 text-sm">
                Status: {spinningLayer.isVisible ? 'Active' : 'Inactive'} • 
                Performance: {localSettings.performance}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${spinningLayer.isVisible ? 'bg-orange-400' : 'bg-red-400'} animate-pulse`} />
          </div>
        </div>

        {/* Platform Presets */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            Platform Optimization Presets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {platformPresets.map((preset) => (
              <motion.div
                key={preset.id}
                className="p-4 rounded-lg border border-gray-600 hover:border-orange-500/50 cursor-pointer transition-all bg-gray-800/30 hover:bg-orange-900/20"
                onClick={() => applyPreset(preset)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-orange-400">{preset.icon}</div>
                  <h4 className="text-white font-medium">{preset.name}</h4>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Speed: {preset.settings.spinSpeed}</div>
                  <div>Angle: {preset.settings.rotationAngle}°</div>
                  <div>Range: {preset.settings.movementRange}px</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Manual Controls */}
        <div className="space-y-6">
          <h3 className="text-white font-semibold">Manual Animation Controls</h3>
          
          {/* Spin Speed */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Spin Speed</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={localSettings.spinSpeed}
              onChange={(e) => handleSettingChange('spinSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Slow (0.1)</span>
              <span className="text-orange-400">{localSettings.spinSpeed}</span>
              <span>Fast (1.0)</span>
            </div>
          </div>

          {/* Rotation Angle */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Rotation Angle (degrees)</label>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={localSettings.rotationAngle}
              onChange={(e) => handleSettingChange('rotationAngle', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Subtle (1°)</span>
              <span className="text-orange-400">{localSettings.rotationAngle}°</span>
              <span>Dramatic (15°)</span>
            </div>
          </div>

          {/* Movement Range */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Horizontal Movement Range (pixels)</label>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={localSettings.movementRange}
              onChange={(e) => handleSettingChange('movementRange', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Minimal (5px)</span>
              <span className="text-orange-400">{localSettings.movementRange}px</span>
              <span>Wide (25px)</span>
            </div>
          </div>

          {/* Animation Duration */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Animation Duration (seconds)</label>
            <input
              type="range"
              min="3000"
              max="15000"
              step="1000"
              value={localSettings.animationDuration}
              onChange={(e) => handleSettingChange('animationDuration', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Fast (3s)</span>
              <span className="text-orange-400">{localSettings.animationDuration / 1000}s</span>
              <span>Slow (15s)</span>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                localSettings.horizontalMovement 
                  ? 'bg-orange-900/30 border-orange-500/50' 
                  : 'bg-gray-800/30 border-gray-600'
              }`}
              onClick={() => handleSettingChange('horizontalMovement', !localSettings.horizontalMovement)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4 className="text-white font-medium mb-2">Horizontal Movement</h4>
              <p className="text-xs text-gray-400">
                Allow slots to move left and right during animation
              </p>
            </motion.div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Performance Mode</label>
              <select
                value={localSettings.performance}
                onChange={(e) => handleSettingChange('performance', e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                <option value="optimized">Optimized (Recommended)</option>
                <option value="full">Full Performance</option>
                <option value="reduced">Reduced (Low-end devices)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-semibold mb-3">Live Preview</h4>
          <div className="relative h-32 bg-gray-900 rounded-lg overflow-hidden">
            {/* Simplified spinning preview */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-16 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg"
              style={{ transform: 'translate(-50%, -50%)' }}
              animate={{
                x: localSettings.horizontalMovement ? [0, localSettings.movementRange, -localSettings.movementRange * 0.5, 0] : 0,
                y: [0, -5, 5, 0],
                rotate: [0, localSettings.rotationAngle, -localSettings.rotationAngle * 0.7, 0]
              }}
              transition={{
                duration: localSettings.animationDuration / 1000,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              Performance: {localSettings.performance}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            onClick={resetToDefaults}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </motion.button>

          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply Changes
          </motion.button>
        </div>

        {/* Technical Specifications */}
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/50">
          <h4 className="text-white font-semibold mb-3">Technical Specifications</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Framework Integration:</p>
              <p className="text-white">24-slot compatible</p>
            </div>
            <div>
              <p className="text-gray-400">Cross-platform:</p>
              <p className="text-white">Android/iOS/Beamer</p>
            </div>
            <div>
              <p className="text-gray-400">Animation Type:</p>
              <p className="text-white">Non-intrusive, optimized</p>
            </div>
            <div>
              <p className="text-gray-400">Performance:</p>
              <p className="text-white">GPU accelerated</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
