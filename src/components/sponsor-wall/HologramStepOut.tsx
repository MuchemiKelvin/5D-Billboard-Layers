import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, type Company } from '../../data/dataService';

interface HologramStepOutProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  isActive: boolean;
  company: Company | null;
  className?: string;
}

interface HologramProjectionProps {
  company: Company;
  slotType: string;
  isExpanded: boolean;
  onToggle: () => void;
}

interface HologramDepthLayerProps {
  company: Company;
  slotType: string;
  layerIndex: number;
}

export const HologramStepOut: React.FC<HologramStepOutProps> = ({
  slotNumber,
  slotType,
  isActive,
  company,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hologramLayers, setHologramLayers] = useState<{
    base: boolean;
    mid: boolean;
    top: boolean;
    projection: boolean;
  }>({
    base: false,
    mid: false,
    top: false,
    projection: false
  });

  // Initialize hologram layers with staggered timing
  useEffect(() => {
    if (isActive && company) {
      const timer1 = setTimeout(() => setHologramLayers(prev => ({ ...prev, base: true })), 300);
      const timer2 = setTimeout(() => setHologramLayers(prev => ({ ...prev, mid: true })), 600);
      const timer3 = setTimeout(() => setHologramLayers(prev => ({ ...prev, top: true })), 900);
      const timer4 = setTimeout(() => setHologramLayers(prev => ({ ...prev, projection: true })), 1200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      setHologramLayers({ base: false, mid: false, top: false, projection: false });
    }
  }, [isActive, company]);

  // Hologram Projection Component - Steps out from slot
  const HologramProjection: React.FC<HologramProjectionProps> = ({ company, slotType, isExpanded, onToggle }) => {
    const projectionHeight = slotType === 'main-sponsor' ? 200 : slotType === 'live-bidding' ? 160 : 120;
    const projectionWidth = slotType === 'main-sponsor' ? 300 : slotType === 'live-bidding' ? 240 : 200;

    return (
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto cursor-pointer hologram-projection"
        style={{ 
          top: `-${projectionHeight + 50}px`,
          width: `${projectionWidth}px`,
          height: `${projectionHeight}px`
        }}
        initial={{ opacity: 0, scale: 0.5, y: 50, rotateX: -45, rotateY: 0 }}
        animate={hologramLayers.projection ? {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0
        } : {
          opacity: 0,
          scale: 0.5,
          y: 50,
          rotateX: -45,
          rotateY: 0
        }}
        whileHover={{ 
          scale: 1.05,
          rotateY: 15,
          y: -10
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 25,
          duration: 0.8
        }}
        onClick={onToggle}
      >
        {/* 3D Projection Container */}
        <div 
          className="relative h-full rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
              rgba(64, 224, 255, 0.1) 0%, 
              rgba(138, 43, 226, 0.1) 50%, 
              rgba(255, 20, 147, 0.1) 100%)`,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(64, 224, 255, 0.3)',
            boxShadow: `
              0 0 40px rgba(64, 224, 255, 0.3),
              0 20px 60px rgba(0, 0, 0, 0.4),
              inset 0 0 20px rgba(255, 255, 255, 0.05)
            `,
            transform: 'perspective(1000px) rotateX(15deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Company Logo in 3D Space */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl border border-cyan-400/50 flex items-center justify-center"
              style={{
                boxShadow: '0 0 30px rgba(64, 224, 255, 0.4)',
                transform: 'translateZ(20px)'
              }}
            >
              <img 
                src={company.logo} 
                alt={`${company.name} hologram`}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {company.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="absolute top-24 left-4 right-4 text-center">
            <div className="text-white font-bold text-lg mb-2">{company.name}</div>
            <div className="text-cyan-300 text-sm mb-3">{company.category}</div>
            
            {/* Dynamic Content based on slot type */}
            {slotType === 'main-sponsor' && (
              <div className="space-y-2">
                <div className="text-white text-sm">MAIN SPONSOR</div>
                <div className="text-blue-300 text-xs">5D • AR • HOLOGRAM</div>
                <div className="text-gray-300 text-xs">Premium Experience</div>
              </div>
            )}
            
            {slotType === 'live-bidding' && (
              <div className="space-y-2">
                <div className="text-green-400 text-sm font-bold">LIVE BIDDING</div>
                <div className="text-white text-xs">Active Auction</div>
                <div className="text-yellow-400 text-xs">€5,000/day</div>
              </div>
            )}
            
            {slotType === 'standard' && (
              <div className="space-y-2">
                <div className="text-white text-xs">Standard Slot</div>
                <div className="text-gray-300 text-xs">€5,000/day</div>
                <div className="text-blue-300 text-xs">Available</div>
              </div>
            )}
          </div>

          {/* 3D Depth Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`depth-${index}`}
                className="w-2 h-2 rounded-full bg-cyan-400"
                style={{
                  opacity: 0.6 + (index * 0.2),
                  transform: `translateZ(${index * 10}px)`
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
              />
            ))}
          </div>

          {/* Holographic Scan Lines */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                rgba(64, 224, 255, 0.1) 45%, 
                rgba(64, 224, 255, 0.1) 55%, 
                transparent 100%)`,
            }}
            animate={{
              y: ['-100%', '200%']
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Hologram Control Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <button
              className="p-2 bg-cyan-500/30 hover:bg-cyan-500/50 rounded-lg border border-cyan-400/50 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              title="Expand Hologram"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            
            <button
              className="p-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg border border-purple-400/50 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              title="3D Rotate"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Rotate hologram');
              }}
            >
              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              className="p-2 bg-green-500/30 hover:bg-green-500/50 rounded-lg border border-green-400/50 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              title="Company Info"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Show company details');
              }}
            >
              <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 3D Shadow Effect */}
        <div 
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4/5 h-4 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(64, 224, 255, 0.3) 0%, transparent 70%)',
            transform: 'translateZ(-20px) rotateX(90deg)'
          }}
        />
      </motion.div>
    );
  };

  // Hologram Depth Layer Component
  const HologramDepthLayer: React.FC<HologramDepthLayerProps> = ({ company, slotType, layerIndex }) => {
    const layerHeight = slotType === 'main-sponsor' ? 40 + (layerIndex * 20) : 30 + (layerIndex * 15);
    const layerWidth = slotType === 'main-sponsor' ? 120 + (layerIndex * 30) : 100 + (layerIndex * 20);
    const layerOffset = slotType === 'main-sponsor' ? 80 + (layerIndex * 40) : 60 + (layerIndex * 30);

    return (
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
        style={{ 
          top: `-${layerOffset}px`,
          width: `${layerWidth}px`,
          height: `${layerHeight}px`
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={hologramLayers[`base` as keyof typeof hologramLayers] ? {
          opacity: 0.3 - (layerIndex * 0.1),
          scale: 1,
          y: 0
        } : {
          opacity: 0,
          scale: 0.8,
          y: 20
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.6,
          delay: layerIndex * 0.2
        }}
      >
        {/* Depth Layer Container */}
        <div 
          className="h-full rounded-lg border border-cyan-400/30"
          style={{
            background: `linear-gradient(90deg, 
              rgba(64, 224, 255, ${0.1 - layerIndex * 0.02}) 0%, 
              rgba(138, 43, 226, ${0.1 - layerIndex * 0.02}) 100%)`,
            backdropFilter: 'blur(10px)',
            transform: `translateZ(${layerIndex * 10}px)`,
            transformStyle: 'preserve-3d'
          }}
        />
      </motion.div>
    );
  };

  // Only render when slot is active and has a company
  if (!isActive || !company) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <AnimatePresence>
        {/* Hologram Depth Layers - Create 3D depth effect */}
        <HologramDepthLayer company={company} slotType={slotType} layerIndex={0} />
        <HologramDepthLayer company={company} slotType={slotType} layerIndex={1} />
        <HologramDepthLayer company={company} slotType={slotType} layerIndex={2} />

        {/* Main Hologram Projection - Steps out from slot */}
        <HologramProjection 
          company={company} 
          slotType={slotType} 
          isExpanded={isExpanded} 
          onToggle={() => setIsExpanded(!isExpanded)} 
        />
      </AnimatePresence>
    </div>
  );
};
