import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

export const HologramControls: React.FC = () => {
  const { layers, updateLayerSettings, toggleLayer } = useLayerContext();
  const [selectedEffect, setSelectedEffect] = useState<'glow' | 'spin' | 'lightReflection' | 'combined' | 'video'>('glow');
  const [effectIntensity, setEffectIntensity] = useState(0.8);
  const [effectDuration, setEffectDuration] = useState(12);
  const [autoCycle, setAutoCycle] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const isActive = layers['layer-2-hologram']?.isActive;

  const hologramEffects = [
    {
      id: 'glow',
      name: 'Glow Pulse',
      icon: '✨',
      description: 'Pulsing glow with transparent background',
      duration: 12,
      intensity: 0.8
    },
    {
      id: 'spin',
      name: 'Energy Spin',
      icon: '🌀',
      description: 'Spinning energy rings with alpha overlay',
      duration: 14,
      intensity: 0.9
    },
    {
      id: 'lightReflection',
      name: 'Light Reflection',
      icon: '💫',
      description: 'Moving light reflection sweep',
      duration: 10,
      intensity: 0.7
    },
    {
      id: 'combined',
      name: 'Combined Effects',
      icon: '🌟',
      description: 'All effects combined with transparency',
      duration: 15,
      intensity: 1.0
    },
    {
      id: 'video',
      name: 'Alpha Channel Video',
      icon: '🎬',
      description: 'MP4/WebM with transparent background',
      duration: 12,
      intensity: 0.85
    }
  ];

  const handleEffectChange = (effect: 'glow' | 'spin' | 'lightReflection' | 'combined' | 'video') => {
    setSelectedEffect(effect);
    updateLayerSettings('layer-2-hologram', {
      ...layers['layer-2-hologram']?.settings,
      selectedEffect: effect,
      effectIntensity,
      effectDuration,
      autoCycle,
      videoEnabled
    });
  };

  const handleIntensityChange = (intensity: number) => {
    setEffectIntensity(intensity);
    updateLayerSettings('layer-2-hologram', {
      ...layers['layer-2-hologram']?.settings,
      selectedEffect,
      effectIntensity: intensity,
      effectDuration,
      autoCycle,
      videoEnabled
    });
  };

  const handleDurationChange = (duration: number) => {
    setEffectDuration(duration);
    updateLayerSettings('layer-2-hologram', {
      ...layers['layer-2-hologram']?.settings,
      selectedEffect,
      effectIntensity,
      effectDuration: duration,
      autoCycle,
      videoEnabled
    });
  };

  const handleAutoCycleToggle = () => {
    setAutoCycle(!autoCycle);
    updateLayerSettings('layer-2-hologram', {
      ...layers['layer-2-hologram']?.settings,
      selectedEffect,
      effectIntensity,
      effectDuration,
      autoCycle: !autoCycle,
      videoEnabled
    });
  };

  const handleVideoToggle = () => {
    setVideoEnabled(!videoEnabled);
    updateLayerSettings('layer-2-hologram', {
      ...layers['layer-2-hologram']?.settings,
      selectedEffect,
      effectIntensity,
      effectDuration,
      autoCycle,
      videoEnabled: !videoEnabled
    });
  };

  const handleToggleLayer = () => {
    toggleLayer('layer-2-hologram');
  };

  return (
    <motion.div 
      className="bg-gray-900/95 border border-cyan-500/30 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-cyan-400">
            Layer 2: Hologram Effects
          </h3>
          <p className="text-sm text-gray-400">
            Alpha Channel Videos • CSS Effects • WebGL Rendering
          </p>
        </div>
        
        <button
          onClick={handleToggleLayer}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isActive 
              ? 'bg-cyan-500/30 border border-cyan-400/50 text-cyan-400' 
              : 'bg-gray-500/20 border border-gray-400/50 text-gray-400'
          }`}
        >
          {isActive ? '● ACTIVE' : '○ INACTIVE'}
        </button>
      </div>

      {/* Effect Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Hologram Effect Types
        </label>
        <div className="grid grid-cols-1 gap-3">
          {hologramEffects.map((effect) => (
            <button
              key={effect.id}
              onClick={() => handleEffectChange(effect.id as any)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedEffect === effect.id
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400'
                  : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-cyan-400/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{effect.icon}</div>
                <div>
                  <div className="font-semibold">{effect.name}</div>
                  <div className="text-xs text-gray-400">{effect.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Duration: {effect.duration}s • Intensity: {(effect.intensity * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Effect Intensity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Effect Intensity
        </label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={effectIntensity}
          onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Subtle</span>
          <span>{(effectIntensity * 100).toFixed(0)}%</span>
          <span>Intense</span>
        </div>
      </div>

      {/* Effect Duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Effect Duration (seconds)
        </label>
        <input
          type="range"
          min="5"
          max="20"
          step="1"
          value={effectDuration}
          onChange={(e) => handleDurationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5s</span>
          <span>{effectDuration}s</span>
          <span>20s</span>
        </div>
      </div>

      {/* Auto Cycle Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoCycle}
            onChange={handleAutoCycleToggle}
            className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-300">
            Auto-cycle effects until slot ends
          </span>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-7">
          Effects will automatically cycle through different hologram types during the slot duration
        </p>
      </div>

      {/* Video Support Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={videoEnabled}
            onChange={handleVideoToggle}
            className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-300">
            Enable alpha channel video support
          </span>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-7">
          Support for MP4/WebM files with transparent backgrounds (with CSS fallbacks)
        </p>
      </div>

      {/* Current Effect Preview */}
      <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-600/50">
        <h4 className="text-cyan-400 font-semibold mb-2">Current Effect Preview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Selected Effect:</span>
            <span className="text-cyan-300">
              {hologramEffects.find(e => e.id === selectedEffect)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Intensity:</span>
            <span className="text-cyan-300">{(effectIntensity * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Duration:</span>
            <span className="text-cyan-300">{effectDuration} seconds</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Auto-cycle:</span>
            <span className={autoCycle ? 'text-green-400' : 'text-red-400'}>
              {autoCycle ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Video Support:</span>
            <span className={videoEnabled ? 'text-green-400' : 'text-red-400'}>
              {videoEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div>Format: MP4/WebM with alpha channel + CSS fallbacks</div>
          <div>Effects: Glow, spin, light reflection, combined, video</div>
          <div>Performance: Hardware accelerated with WebGL support</div>
          <div>Compatibility: All devices with graceful degradation</div>
        </div>
      </div>
    </motion.div>
  );
};
