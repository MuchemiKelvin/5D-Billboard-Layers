import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, Sun, Eye, RotateCcw, Sliders } from 'lucide-react';
import { BaseModal } from './BaseModal';
import { useLayerContext } from '../../contexts/LayerContext';

interface HologramControlModalProps {
  data: any;
  onClose: () => void;
}

export const HologramControlModal: React.FC<HologramControlModalProps> = ({ data, onClose }) => {
  const { layers, updateLayerSettings, setLayerIntensity, globalSettings, updateGlobalSettings } = useLayerContext();
  const [localSettings, setLocalSettings] = useState({
    intensity: globalSettings.hologramIntensity,
    particles: globalSettings.particleEffects,
    lightRays: globalSettings.lightRays,
    depthField: true,
    scanningLines: true,
    colorScheme: 'default'
  });

  const hologramLayer = layers['layer-2-hologram'] || {};

  const handleIntensityChange = (value: number) => {
    setLocalSettings(prev => ({ ...prev, intensity: value }));
    setLayerIntensity('layer-2-hologram', value);
    updateGlobalSettings({ hologramIntensity: value });
  };

  const handleToggleSetting = (setting: keyof typeof localSettings) => {
    setLocalSettings(prev => {
      const newValue = !prev[setting];
      
      // Update global settings for particles and light rays
      if (setting === 'particles') {
        updateGlobalSettings({ particleEffects: newValue });
      } else if (setting === 'lightRays') {
        updateGlobalSettings({ lightRays: newValue });
      }
      
      // Update layer settings
      updateLayerSettings('layer-2-hologram', { [setting]: newValue });
      
      return { ...prev, [setting]: newValue };
    });
  };

  const handleColorSchemeChange = (scheme: string) => {
    setLocalSettings(prev => ({ ...prev, colorScheme: scheme }));
    updateLayerSettings('layer-2-hologram', { colorScheme: scheme });
  };

  const resetToDefaults = () => {
    const defaults = {
      intensity: 1,
      particles: true,
      lightRays: true,
      depthField: true,
      scanningLines: true,
      colorScheme: 'default'
    };
    
    setLocalSettings(defaults);
    setLayerIntensity('layer-2-hologram', defaults.intensity);
    updateGlobalSettings({
      hologramIntensity: defaults.intensity,
      particleEffects: defaults.particles,
      lightRays: defaults.lightRays
    });
    updateLayerSettings('layer-2-hologram', defaults);
  };

  const colorSchemes = [
    { id: 'default', name: 'Electric Cyan', colors: ['#40E0FF', '#8A2BE2', '#FF1493'] },
    { id: 'warm', name: 'Warm Neon', colors: ['#FF6B35', '#F7931E', '#FFD700'] },
    { id: 'cool', name: 'Cool Blue', colors: ['#00BFFF', '#1E90FF', '#4169E1'] },
    { id: 'nature', name: 'Bio Glow', colors: ['#00FF7F', '#32CD32', '#98FB98'] },
    { id: 'royal', name: 'Royal Purple', colors: ['#9370DB', '#8A2BE2', '#9400D3'] }
  ];

  return (
    <BaseModal title="BeamerShow Layer 2: Hologram Effects" onClose={onClose} size="lg">
      <div className="p-6 space-y-6">
        {/* Layer Status */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Hologram FX Layer</h3>
              <p className="text-gray-400 text-sm">
                Status: {hologramLayer.isVisible ? 'Active' : 'Inactive'} • 
                Intensity: {Math.round((localSettings.intensity) * 100)}%
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${hologramLayer.isVisible ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          </div>
        </div>

        {/* Intensity Control */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Hologram Intensity
          </h3>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={localSettings.intensity}
              onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Off</span>
              <span>Normal</span>
              <span>Maximum</span>
            </div>
          </div>
        </div>

        {/* Effect Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              localSettings.particles 
                ? 'bg-purple-900/30 border-purple-500/50' 
                : 'bg-gray-800/30 border-gray-600'
            }`}
            onClick={() => handleToggleSetting('particles')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Star className={`w-5 h-5 ${localSettings.particles ? 'text-purple-400' : 'text-gray-400'}`} />
              <div>
                <h4 className="text-white font-medium">Particles</h4>
                <p className="text-xs text-gray-400">Floating particle effects</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              localSettings.lightRays 
                ? 'bg-yellow-900/30 border-yellow-500/50' 
                : 'bg-gray-800/30 border-gray-600'
            }`}
            onClick={() => handleToggleSetting('lightRays')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Sun className={`w-5 h-5 ${localSettings.lightRays ? 'text-yellow-400' : 'text-gray-400'}`} />
              <div>
                <h4 className="text-white font-medium">Light Rays</h4>
                <p className="text-xs text-gray-400">Radial light beams</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              localSettings.depthField 
                ? 'bg-blue-900/30 border-blue-500/50' 
                : 'bg-gray-800/30 border-gray-600'
            }`}
            onClick={() => handleToggleSetting('depthField')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Eye className={`w-5 h-5 ${localSettings.depthField ? 'text-blue-400' : 'text-gray-400'}`} />
              <div>
                <h4 className="text-white font-medium">Depth Field</h4>
                <p className="text-xs text-gray-400">3D depth layers</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              localSettings.scanningLines 
                ? 'bg-green-900/30 border-green-500/50' 
                : 'bg-gray-800/30 border-gray-600'
            }`}
            onClick={() => handleToggleSetting('scanningLines')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <Sliders className={`w-5 h-5 ${localSettings.scanningLines ? 'text-green-400' : 'text-gray-400'}`} />
              <div>
                <h4 className="text-white font-medium">Scan Lines</h4>
                <p className="text-xs text-gray-400">Moving scan effect</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Color Schemes */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Color Schemes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {colorSchemes.map((scheme) => (
              <motion.div
                key={scheme.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  localSettings.colorScheme === scheme.id
                    ? 'border-cyan-400 bg-cyan-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => handleColorSchemeChange(scheme.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {scheme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-white text-sm font-medium">{scheme.name}</span>
                </div>
              </motion.div>
            ))}
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply Changes
          </motion.button>
        </div>

        {/* Live Preview */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-semibold mb-3">Live Preview</h4>
          <div className="relative h-32 bg-gray-900 rounded-lg overflow-hidden">
            {/* Simplified hologram preview */}
            <div 
              className="absolute inset-0 rounded-lg"
              style={{
                background: `radial-gradient(circle, ${colorSchemes.find(s => s.id === localSettings.colorScheme)?.colors[0]}20 0%, transparent 70%)`,
                opacity: localSettings.intensity * 0.5
              }}
            />
            {localSettings.particles && (
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            )}
            {localSettings.scanningLines && (
              <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                animate={{ y: [0, 120, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
