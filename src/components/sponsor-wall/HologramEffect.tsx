import React from 'react';
import { motion } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

interface HologramEffectProps {
  intensity?: number;
  showParticles?: boolean;
  showLightRays?: boolean;
  showDepthField?: boolean;
  className?: string;
}

export const HologramEffect: React.FC<HologramEffectProps> = ({
  intensity = 1,
  showParticles = true,
  showLightRays = true,
  showDepthField = true,
  className = ''
}) => {
  const { openModal, updateLayerSettings, updateGlobalSettings } = useLayerContext();
  // Enhanced holographic color palette with more dynamic colors
  const hologramColors = [
    'rgba(64, 224, 255, 0.9)',   // Electric Cyan
    'rgba(138, 43, 226, 0.9)',   // Deep Purple
    'rgba(255, 20, 147, 0.9)',   // Neon Pink
    'rgba(0, 255, 127, 0.9)',    // Electric Green
    'rgba(255, 215, 0, 0.9)',    // Gold
    'rgba(255, 105, 180, 0.8)',  // Hot Pink
    'rgba(0, 191, 255, 0.8)',    // Deep Sky Blue
    'rgba(50, 205, 50, 0.8)',    // Lime Green
    'rgba(255, 69, 0, 0.8)',     // Red Orange
    'rgba(147, 0, 211, 0.8)'     // Dark Violet
  ];



  // Particle animation variants
  const particleVariants = {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, 0],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  // Light ray animation variants
  const lightRayVariants = {
    animate: {
      rotate: [0, 360],
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.2, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "linear" as const
      }
    }
  };

  // Depth field animation variants
  const depthFieldVariants = {
    animate: {
      y: [0, -10, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.1, 1],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Enhanced Holographic Background Glow with Dynamic Colors */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          opacity: 0.15 * intensity,
          filter: 'blur(25px)',
          mixBlendMode: 'screen'
        }}
        animate={{
          background: [
            `conic-gradient(from 0deg at 50% 50%, ${hologramColors[0]} 0deg, ${hologramColors[1]} 60deg, ${hologramColors[2]} 120deg, ${hologramColors[3]} 180deg, ${hologramColors[4]} 240deg, ${hologramColors[5]} 300deg, ${hologramColors[0]} 360deg)`,
            `conic-gradient(from 45deg at 30% 70%, ${hologramColors[2]} 0deg, ${hologramColors[3]} 60deg, ${hologramColors[4]} 120deg, ${hologramColors[5]} 180deg, ${hologramColors[6]} 240deg, ${hologramColors[7]} 300deg, ${hologramColors[2]} 360deg)`,
            `conic-gradient(from 90deg at 70% 30%, ${hologramColors[4]} 0deg, ${hologramColors[5]} 60deg, ${hologramColors[6]} 120deg, ${hologramColors[7]} 180deg, ${hologramColors[8]} 240deg, ${hologramColors[9]} 300deg, ${hologramColors[4]} 360deg)`,
            `conic-gradient(from 135deg at 50% 50%, ${hologramColors[6]} 0deg, ${hologramColors[7]} 60deg, ${hologramColors[8]} 120deg, ${hologramColors[9]} 180deg, ${hologramColors[0]} 240deg, ${hologramColors[1]} 300deg, ${hologramColors[6]} 360deg)`
          ],
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Secondary Gradient Layer for Depth */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          opacity: 0.08 * intensity,
          filter: 'blur(40px)',
          mixBlendMode: 'overlay'
        }}
        animate={{
          background: [
            `radial-gradient(ellipse 80% 60% at 20% 30%, ${hologramColors[1]} 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, ${hologramColors[3]} 0%, transparent 50%)`,
            `radial-gradient(ellipse 60% 80% at 70% 20%, ${hologramColors[5]} 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 30% 80%, ${hologramColors[7]} 0%, transparent 50%)`,
            `radial-gradient(ellipse 80% 60% at 80% 80%, ${hologramColors[9]} 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 20% 20%, ${hologramColors[2]} 0%, transparent 50%)`,
            `radial-gradient(ellipse 60% 80% at 30% 70%, ${hologramColors[4]} 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 70% 30%, ${hologramColors[6]} 0%, transparent 50%)`
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Light Rays */}
      {showLightRays && (
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.div
              key={`ray-${index}`}
              className="absolute top-1/2 left-1/2 w-px h-full origin-bottom"
              style={{
                background: `linear-gradient(to top, ${hologramColors[index % hologramColors.length]}, transparent)`,
                transform: `rotate(${index * 45}deg) translateY(-50%)`,
                opacity: 0.3 * intensity
              }}
              variants={lightRayVariants}
              animate="animate"
              transition={{
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced Floating Particles */}
      {showParticles && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, index) => {
            const size = 1 + (index % 3) * 0.5; // Variable particle sizes
            const isLargeParticle = index % 4 === 0;
            const xPos = 5 + (index * 4.5) % 90;
            const yPos = 10 + (index * 7) % 80;
            
            return (
              <motion.div
                key={`particle-${index}`}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                  background: isLargeParticle 
                    ? `radial-gradient(circle, ${hologramColors[index % hologramColors.length]} 0%, transparent 70%)`
                    : hologramColors[index % hologramColors.length],
                  opacity: (0.4 + (index % 3) * 0.2) * intensity,
                  boxShadow: isLargeParticle ? `0 0 ${size * 4}px ${hologramColors[index % hologramColors.length]}` : 'none',
                  filter: 'blur(0.5px)'
                }}
                variants={particleVariants}
                animate="animate"
                transition={{
                  delay: index * 0.15,
                  duration: 2 + (index % 4),
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            );
          })}
          
          {/* Special floating orbs for extra visual appeal */}
          {Array.from({ length: 5 }).map((_, index) => (
            <motion.div
              key={`orb-${index}`}
              className="absolute rounded-full"
              style={{
                width: '4px',
                height: '4px',
                left: `${20 + index * 15}%`,
                top: `${30 + index * 10}%`,
                background: `radial-gradient(circle, ${hologramColors[index * 2 % hologramColors.length]} 0%, transparent 100%)`,
                opacity: 0.8 * intensity,
                filter: `blur(0.5px)`,
                boxShadow: `0 0 12px ${hologramColors[index * 2 % hologramColors.length]}`
              }}
              animate={{
                x: [0, 20, -10, 15, 0],
                y: [0, -15, 25, -5, 0],
                scale: [1, 1.5, 0.8, 1.2, 1],
                opacity: [0.3, 0.8, 0.4, 0.9, 0.3]
              }}
              transition={{
                duration: 8 + index * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 1.5
              }}
            />
          ))}
        </div>
      )}

      {/* Depth Field Effect */}
      {showDepthField && (
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={`depth-${index}`}
              className="absolute inset-0 rounded-lg border"
              style={{
                borderColor: hologramColors[index % hologramColors.length],
                borderWidth: '1px',
                opacity: 0.1 * intensity,
                transform: `scale(${1 + index * 0.05})`
              }}
              variants={depthFieldVariants}
              animate="animate"
              transition={{
                delay: index * 0.4
              }}
            />
          ))}
        </div>
      )}

      {/* Scanning Line Effect */}
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, 
            transparent 0%, 
            ${hologramColors[0]} 45%, 
            ${hologramColors[0]} 55%, 
            transparent 100%)`,
          opacity: 0.2 * intensity
        }}
        animate={{
          y: ['-100%', '200%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Interactive Control Buttons */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300 z-50">
        <button
          className="p-2 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg border border-cyan-400/30 transition-all duration-200 hover:scale-110"
          title="Toggle Hologram Intensity"
          onClick={(e) => {
            e.stopPropagation();
            openModal('hologram-control', { layerId: 'hologram-fx' });
          }}
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
        
        <button
          className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-400/30 transition-all duration-200 hover:scale-110"
          title="Adjust Particle Effects"
          onClick={(e) => {
            e.stopPropagation();
            updateGlobalSettings({ particleEffects: !showParticles });
            updateLayerSettings('hologram-fx', { particles: !showParticles });
          }}
        >
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        <button
          className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg border border-green-400/30 transition-all duration-200 hover:scale-110"
          title="Toggle Light Rays"
          onClick={(e) => {
            e.stopPropagation();
            updateGlobalSettings({ lightRays: !showLightRays });
            updateLayerSettings('hologram-fx', { lightRays: !showLightRays });
          }}
        >
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>

      {/* Corner Holographic Accents - REMOVED */}
    </div>
  );
}; 