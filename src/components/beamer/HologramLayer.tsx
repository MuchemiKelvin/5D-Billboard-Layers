import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

interface HologramEffect {
  id: string;
  name: string;
  type: 'glow' | 'spin' | 'lightReflection' | 'combined' | 'video';
  duration: number; // 10-15s per spec
  intensity: number;
  videoSrc?: string; // MP4/WebM with alpha channel
  cssAnimation?: string;
  description: string;
}

interface HologramLayerProps {
  slotNumber: number;
  isActive: boolean;
  sponsorLogo?: string;
  className?: string;
  slotDuration?: number; // How long this slot is active
}

export const HologramLayer: React.FC<HologramLayerProps> = ({
  slotNumber,
  isActive,
  sponsorLogo,
  className = '',
  slotDuration = 30000 // Default 30 seconds
}) => {
  const { layers } = useLayerContext();
  const [currentEffect, setCurrentEffect] = useState<HologramEffect | null>(null);
  const [effectCycle, setEffectCycle] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const effectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const layer2Settings = layers['layer-2-hologram']?.settings;
  const isLayer2Active = layers['layer-2-hologram']?.isActive;
  const shouldShowHologram = isActive && isLayer2Active;

  // Enhanced BeamerShow hologram effects library with alpha channel support
  const hologramEffects: HologramEffect[] = [
    {
      id: 'glow-pulse',
      name: 'Glow Pulse',
      type: 'glow',
      duration: 12, // 10-15s range
      intensity: 0.8,
      cssAnimation: 'glow-pulse-animation',
      description: 'Pulsing glow with transparent background'
    },
    {
      id: 'energy-spin',
      name: 'Energy Spin', 
      type: 'spin',
      duration: 14,
      intensity: 0.9,
      cssAnimation: 'energy-spin-animation',
      description: 'Spinning energy rings with alpha overlay'
    },
    {
      id: 'light-sweep',
      name: 'Light Reflection',
      type: 'lightReflection', 
      duration: 10,
      intensity: 0.7,
      cssAnimation: 'light-sweep-animation',
      description: 'Moving light reflection sweep'
    },
    {
      id: 'hologram-combo',
      name: 'Combined Effects',
      type: 'combined',
      duration: 15,
      intensity: 1.0,
      cssAnimation: 'hologram-combo-animation',
      description: 'All effects combined with transparency'
    },
    {
      id: 'alpha-video',
      name: 'Alpha Channel Video',
      type: 'video',
      duration: 12,
      intensity: 0.85,
      videoSrc: '/hologram-effects/hologram-alpha.mp4', // MP4 with alpha channel
      description: 'MP4/WebM with transparent background'
    }
  ];

  // Enhanced effect cycling with slot duration awareness
  useEffect(() => {
    if (!shouldShowHologram) {
      setCurrentEffect(null);
      if (effectTimerRef.current) {
        clearTimeout(effectTimerRef.current);
        effectTimerRef.current = null;
      }
      return;
    }

    const startEffectCycle = () => {
      const effectIndex = effectCycle % hologramEffects.length;
      const effect = hologramEffects[effectIndex];
      setCurrentEffect(effect);

      // Calculate time until slot ends
      const timeUntilSlotEnd = slotDuration - (effectCycle * effect.duration * 1000);
      
      if (timeUntilSlotEnd <= 0) {
        // Slot has ended, stop cycling
        return;
      }

      // Auto-cycle to next effect after duration, but respect slot end
      const nextEffectDelay = Math.min(effect.duration * 1000, timeUntilSlotEnd);
      
      effectTimerRef.current = setTimeout(() => {
        if (shouldShowHologram) {
          setEffectCycle(prev => prev + 1);
        }
      }, nextEffectDelay);

      return effectTimerRef.current;
    };

    const timer = startEffectCycle();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [shouldShowHologram, effectCycle, hologramEffects, slotDuration]);

  // Enhanced video playback for MP4/WebM with alpha channel
  useEffect(() => {
    if (currentEffect?.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      
      // Set video properties for alpha channel support
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.mixBlendMode = 'screen'; // For transparent overlay effect
      
      // Handle video loading and playback
      const handleVideoLoad = () => {
        setIsVideoPlaying(true);
        video.play().catch(console.warn);
      };

      const handleVideoError = (error: Event) => {
        console.warn('Hologram video failed to load:', error);
        // Fallback to CSS effects if video fails
        setCurrentEffect(hologramEffects.find(e => e.type === 'glow') || null);
      };

      video.addEventListener('loadeddata', handleVideoLoad);
      video.addEventListener('error', handleVideoError);

      return () => {
        video.removeEventListener('loadeddata', handleVideoLoad);
        video.removeEventListener('error', handleVideoError);
      };
    }
  }, [currentEffect, hologramEffects]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (effectTimerRef.current) {
        clearTimeout(effectTimerRef.current);
      }
    };
  }, []);

  // Get enhanced hologram styling based on effect type
  const getHologramStyling = () => {
    if (!currentEffect) return '';
    
    const baseStyles = 'absolute inset-0 pointer-events-none z-10';
    const effectStyles = {
      glow: 'hologram-glow',
      spin: 'hologram-spin',
      lightReflection: 'hologram-light-reflection',
      combined: 'hologram-combined',
      video: 'hologram-video'
    };
    
    return `${baseStyles} ${effectStyles[currentEffect.type]} ${currentEffect.cssAnimation || ''}`;
  };

  // Performance optimization - only render when needed
  if (!shouldShowHologram || !currentEffect) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`hologram-layer-container ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: currentEffect.intensity }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        key={`hologram-${slotNumber}-${currentEffect.id}`}
      >
        {/* Enhanced Video-based hologram effect with alpha channel support */}
        {currentEffect.type === 'video' && currentEffect.videoSrc && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className={getHologramStyling()}
              style={{
                mixBlendMode: 'screen', // For transparent overlay effect
                opacity: currentEffect.intensity,
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
            >
              <source src={currentEffect.videoSrc} type="video/mp4" />
              <source src={currentEffect.videoSrc.replace('.mp4', '.webm')} type="video/webm" />
              {/* Fallback for browsers that don't support video */}
              <div className="hologram-video-fallback">
                <div className="bg-gradient-radial from-blue-400/30 via-cyan-300/20 to-transparent animate-pulse" />
              </div>
            </video>
            
            {/* Video overlay effects for enhanced hologram look */}
            <div className="absolute inset-0 bg-gradient-radial from-cyan-400/10 via-transparent to-blue-400/10" />
          </div>
        )}

        {/* Enhanced CSS-based hologram effects */}
        {currentEffect.type !== 'video' && (
          <motion.div 
            className={getHologramStyling()}
            animate={{
              scale: currentEffect.type === 'glow' ? [1, 1.05, 1] : 1,
              rotate: currentEffect.type === 'spin' ? [0, 360] : 0,
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: currentEffect.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Enhanced Glow Effect with transparency */}
            {currentEffect.type === 'glow' && (
              <>
                <div className="absolute inset-0 bg-gradient-radial from-blue-400/30 via-cyan-300/20 to-transparent animate-pulse" />
                <div className="absolute inset-0 bg-gradient-radial from-cyan-400/20 via-transparent to-blue-400/20 animate-pulse" 
                     style={{ animationDelay: '0.5s' }} />
              </>
            )}

            {/* Enhanced Spinning Energy Ring with alpha */}
            {currentEffect.type === 'spin' && (
              <>
                <div className="absolute inset-0 border-2 border-blue-400/50 rounded-full animate-spin" 
                     style={{ animationDuration: `${currentEffect.duration}s` }} />
                <div className="absolute inset-2 border border-cyan-300/30 rounded-full animate-spin" 
                     style={{ animationDuration: `${currentEffect.duration * 0.7}s`, animationDirection: 'reverse' }} />
                <div className="absolute inset-4 border border-blue-300/20 rounded-full animate-spin" 
                     style={{ animationDuration: `${currentEffect.duration * 1.3}s` }} />
              </>
            )}

            {/* Enhanced Light Reflection Sweep */}
            {currentEffect.type === 'lightReflection' && (
              <>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: currentEffect.duration,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: 'skewX(-20deg)'
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-l from-transparent via-cyan-300/15 to-transparent"
                  animate={{
                    x: ['100%', '-100%']
                  }}
                  transition={{
                    duration: currentEffect.duration * 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    background: 'linear-gradient(-45deg, transparent, rgba(0,255,255,0.2), transparent)',
                    transform: 'skewX(20deg)'
                  }}
                />
              </>
            )}

            {/* Enhanced Combined Effects */}
            {currentEffect.type === 'combined' && (
              <>
                {/* Enhanced glow base */}
                <div className="absolute inset-0 bg-gradient-radial from-blue-400/20 via-cyan-300/10 to-transparent animate-pulse" />
                <div className="absolute inset-0 bg-gradient-radial from-cyan-400/15 via-transparent to-blue-400/15 animate-pulse" 
                     style={{ animationDelay: '1s' }} />
                
                {/* Enhanced spinning rings */}
                <div className="absolute inset-0 border border-blue-400/40 rounded-full animate-spin" 
                     style={{ animationDuration: `${currentEffect.duration}s` }} />
                <div className="absolute inset-2 border border-cyan-300/30 rounded-full animate-spin" 
                     style={{ animationDuration: `${currentEffect.duration * 0.8}s`, animationDirection: 'reverse' }} />
                
                {/* Enhanced light sweep */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'linear-gradient(0deg, transparent, rgba(0,255,255,0.2), transparent)',
                      'linear-gradient(90deg, transparent, rgba(0,255,255,0.2), transparent)',
                      'linear-gradient(180deg, transparent, rgba(0,255,255,0.2), transparent)',
                      'linear-gradient(270deg, transparent, rgba(0,255,255,0.2), transparent)'
                    ]
                  }}
                  transition={{
                    duration: currentEffect.duration,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </>
            )}
          </motion.div>
        )}

        {/* Enhanced Effect Info Overlay (Development Mode) */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="absolute top-0 left-0 text-xs text-cyan-400 bg-black/50 px-2 py-1 rounded dev-hologram-info">
            L2: {currentEffect.name} • {currentEffect.duration}s • Alpha: {currentEffect.type === 'video' ? 'MP4/WebM' : 'CSS'}
          </div>
        )}

        {/* Enhanced Hologram frame effect with transparency */}
        <div className="absolute inset-0 border border-cyan-400/30 rounded-lg pointer-events-none">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 hologram-frame-corner"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 hologram-frame-corner"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 hologram-frame-corner"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 hologram-frame-corner"></div>
        </div>

        {/* Slot duration indicator */}
        <div className="absolute bottom-0 right-0 text-xs text-cyan-400 bg-black/30 px-2 py-1 rounded">
          Slot: {Math.ceil(slotDuration / 1000)}s
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Hologram Controls Component
export const HologramControls: React.FC = () => {
  const { layers, updateLayerSettings, toggleLayer } = useLayerContext();
  const [selectedEffect, setSelectedEffect] = useState('glow');
  const [intensity, setIntensity] = useState(0.8);
  const [loopDuration, setLoopDuration] = useState(12);
  const [videoEnabled, setVideoEnabled] = useState(false);

  const isActive = layers['layer-2-hologram']?.isActive;

  const effectTypes = [
    { id: 'glow', name: 'Glow Pulse', description: 'Pulsing glow with transparency' },
    { id: 'spin', name: 'Energy Spin', description: 'Spinning energy rings with alpha' },
    { id: 'lightReflection', name: 'Light Sweep', description: 'Moving light reflection' },
    { id: 'combined', name: 'Combined FX', description: 'All effects with transparency' },
    { id: 'video', name: 'Alpha Video', description: 'MP4/WebM with alpha channel' }
  ];

  const handleEffectChange = (effectType: string) => {
    setSelectedEffect(effectType);
    setVideoEnabled(effectType === 'video');
    updateLayerSettings('layer-2-hologram', {
      ...layers['layer-2-hologram']?.settings,
      animationType: effectType,
      intensity,
      loopDuration,
      videoEnabled: effectType === 'video'
    });
  };

  const handleToggleLayer = () => {
    toggleLayer('layer-2-hologram');
  };

  return (
    <motion.div 
      className="bg-gray-900/95 border border-blue-500/30 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-blue-400">
            Layer 2: Hologram Effects
          </h3>
          <p className="text-sm text-gray-400">
            Maya's Design Templates • 10-15s Loops • Alpha Channel Support
          </p>
        </div>
        
        <button
          onClick={handleToggleLayer}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isActive 
              ? 'bg-blue-500/30 border border-blue-400/50 text-blue-400' 
              : 'bg-gray-500/20 border border-gray-400/50 text-gray-400'
          }`}
        >
          {isActive ? '● ACTIVE' : '○ INACTIVE'}
        </button>
      </div>

      {/* Effect Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Hologram Effect Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {effectTypes.map((effect) => (
            <button
              key={effect.id}
              onClick={() => handleEffectChange(effect.id)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedEffect === effect.id
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                  : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-blue-400/30'
              }`}
            >
              <div className="font-semibold">{effect.name}</div>
              <div className="text-xs text-gray-400">{effect.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Effect Intensity
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Subtle</span>
            <span>{(intensity * 100).toFixed(0)}%</span>
            <span>Intense</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Loop Duration (seconds)
          </label>
          <input
            type="range"
            min="10"
            max="15"
            step="0.5"
            value={loopDuration}
            onChange={(e) => setLoopDuration(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10s</span>
            <span>{loopDuration}s</span>
            <span>15s</span>
          </div>
        </div>
      </div>

      {/* Video Settings */}
      {videoEnabled && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-400/30 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Alpha Channel Video Settings</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Format: MP4/WebM with alpha channel</div>
            <div>• Transparent background overlay</div>
            <div>• Hardware accelerated playback</div>
            <div>• Automatic fallback to CSS effects</div>
          </div>
        </div>
      )}

      {/* Technical Specs */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div>Format: MP4/WebM with alpha channel • Transparent overlay on Layer 1</div>
          <div>Performance: Hardware accelerated • Beamer + iPad sync ready</div>
          <div>Looping: Continuous until slot ends • 10-15s effect cycles</div>
        </div>
      </div>
    </motion.div>
  );
};
