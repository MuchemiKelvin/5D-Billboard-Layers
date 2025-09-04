import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, type Company } from '../../data/dataService';
import { useLayerContext } from '../../contexts/LayerContext';

interface AROverlayProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  isActive: boolean;
  company: Company | null;
  className?: string;
}

interface ARLogoHologramProps {
  company: Company;
  isActive: boolean;
  slotType: string;
}

interface ARInfoPanelProps {
  company: Company;
  slotType: string;
  isExpanded: boolean;
  onToggle: () => void;
}

interface ARProductShowcaseProps {
  company: Company;
  isActive: boolean;
}

export const AROverlaySystem: React.FC<AROverlayProps> = ({
  slotNumber,
  slotType,
  isActive,
  company,
  className = ''
}) => {
  const { openModal, updateGlobalSettings } = useLayerContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [arElements, setArElements] = useState<{
    logo: boolean;
    info: boolean;
    product: boolean;
  }>({
    logo: false,
    info: false,
    product: false
  });

  // Initialize AR elements based on slot type and company
  useEffect(() => {
    if (isActive && company) {
      // Stagger the appearance of AR elements
      const timer1 = setTimeout(() => setArElements(prev => ({ ...prev, logo: true })), 200);
      const timer2 = setTimeout(() => setArElements(prev => ({ ...prev, info: true })), 400);
      const timer3 = setTimeout(() => setArElements(prev => ({ ...prev, product: true })), 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setArElements({ logo: false, info: false, product: false });
    }
  }, [isActive, company]);

  // AR Logo Hologram Component
  const ARLogoHologram: React.FC<ARLogoHologramProps> = ({ company, isActive, slotType }) => {
    const logoSize = slotType === 'main-sponsor' ? 80 : slotType === 'live-bidding' ? 60 : 50;
    const floatHeight = slotType === 'main-sponsor' ? 120 : slotType === 'live-bidding' ? 100 : 80;

    return (
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto cursor-pointer ar-logo-hologram ar-element"
        style={{ top: `-${floatHeight}px` }}
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={arElements.logo ? {
          opacity: 1,
          scale: 1,
          y: 0
        } : {
          opacity: 0,
          scale: 0,
          y: 20
        }}
        whileHover={{ 
          scale: 1.1, 
          y: -5,
          filter: "brightness(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.5
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* 3D Logo Container */}
        <div className="relative">
          {/* Holographic Glow */}
          <div 
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, rgba(64, 224, 255, 0.3) 0%, transparent 70%)`,
              transform: 'scale(1.5)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
          
          {/* Main Logo */}
          <div 
            className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-cyan-400/50"
            style={{ 
              width: `${logoSize}px`, 
              height: `${logoSize}px`,
              boxShadow: '0 0 30px rgba(64, 224, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            <img 
              src={company.logo} 
              alt={`${company.name} AR logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Floating Particles around logo */}
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={`logo-particle-${index}`}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${50 + Math.cos(index * 60 * Math.PI / 180) * 40}%`,
                top: `${50 + Math.sin(index * 60 * Math.PI / 180) * 40}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                rotate: [0, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
              }}
            />
          ))}

          {/* AR Control Buttons */}
          <div className="absolute -top-8 -right-8 flex gap-1 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <button
              className="p-1.5 bg-cyan-500/30 hover:bg-cyan-500/50 rounded border border-cyan-400/50 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              title="AR Settings"
              onClick={(e) => {
                e.stopPropagation();
                openModal('ar-settings', { slotNumber, company });
              }}
            >
              <svg className="w-3 h-3 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>

            <button
              className="p-1.5 bg-purple-500/30 hover:bg-purple-500/50 rounded border border-purple-400/50 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              title="Toggle AR Mode"
              onClick={(e) => {
                e.stopPropagation();
                updateGlobalSettings({ arMode: true });
              }}
            >
              <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // AR Info Panel Component
  const ARInfoPanel: React.FC<ARInfoPanelProps> = ({ company, slotType, isExpanded, onToggle }) => {
    const panelWidth = slotType === 'main-sponsor' ? 200 : 160;
    const panelHeight = isExpanded ? 120 : 60;

    return (
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto cursor-pointer ar-info-panel ar-element"
        style={{ 
          top: slotType === 'main-sponsor' ? '-180px' : slotType === 'live-bidding' ? '-160px' : '-140px',
          width: `${panelWidth}px`
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={arElements.info ? {
          opacity: 1,
          scale: 1,
          y: 0
        } : {
          opacity: 0,
          scale: 0.8,
          y: 20
        }}
        whileHover={{ 
          scale: 1.02,
          y: -2
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.5,
          delay: 0.2
        }}
        onClick={onToggle}
      >
        {/* Panel Container */}
        <div 
          className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-cyan-400/50 p-3 text-center"
          style={{
            height: `${panelHeight}px`,
            boxShadow: '0 0 30px rgba(64, 224, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05)'
          }}
        >
          {!isExpanded ? (
            <div className="h-full flex flex-col justify-center">
              <div className="text-white font-semibold text-sm mb-1">{company.name}</div>
              <div className="text-cyan-400 text-xs">{company.category}</div>
              <div className="text-gray-400 text-xs mt-1">Click to expand</div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center space-y-2">
              <div className="text-white font-bold text-sm">{company.name}</div>
              <div className="text-cyan-400 text-xs">{company.category}</div>
              <div className="text-gray-300 text-xs">Industry: {company.industry || 'Technology'}</div>
              <div className="text-gray-400 text-xs">Click to collapse</div>
            </div>
          )}
        </div>

        {/* Panel Glow Effect */}
        <div 
          className="absolute inset-0 rounded-xl blur-xl -z-10"
          style={{
            background: `radial-gradient(ellipse, rgba(64, 224, 255, 0.2) 0%, transparent 70%)`,
            transform: 'scale(1.2)'
          }}
        />
      </motion.div>
    );
  };

  // AR Product Showcase Component
  const ARProductShowcase: React.FC<ARProductShowcaseProps> = ({ company, isActive }) => {
    if (slotType !== 'main-sponsor') return null;

    return (
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto cursor-pointer ar-product-showcase ar-element"
        style={{ top: '-240px' }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={arElements.product ? {
          opacity: 1,
          scale: 1,
          y: 0
        } : {
          opacity: 0,
          scale: 0.8,
          y: 20
        }}
        whileHover={{ 
          scale: 1.05,
          y: -3
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.5,
          delay: 0.4
        }}
      >
        {/* Product Showcase Container */}
        <div 
          className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-md rounded-xl border border-blue-400/50 p-4 text-center"
          style={{
            width: '180px',
            height: '100px',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="text-white font-bold text-sm mb-2">Featured Product</div>
          <div className="text-blue-300 text-xs mb-2">{company.name}</div>
          <div className="text-gray-300 text-xs">5D • AR • HOLOGRAM</div>
          
          {/* Product Icon */}
          <div className="mt-2 w-8 h-8 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">🚀</span>
          </div>
        </div>

        {/* Showcase Glow Effect */}
        <div 
          className="absolute inset-0 rounded-xl blur-xl -z-10"
          style={{
            background: `radial-gradient(ellipse, rgba(59, 130, 246, 0.2) 0%, transparent 70%)`,
            transform: 'scale(1.3)'
          }}
        />
      </motion.div>
    );
  };

  // Only render AR elements when slot is active and has a company
  if (!isActive || !company) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <AnimatePresence>
        {/* AR Logo Hologram */}
        <ARLogoHologram 
          company={company} 
          isActive={isActive} 
          slotType={slotType} 
        />

        {/* AR Info Panel */}
        <ARInfoPanel 
          company={company} 
          slotType={slotType} 
          isExpanded={isExpanded} 
          onToggle={() => setIsExpanded(!isExpanded)} 
        />

        {/* AR Product Showcase (Main Sponsor Only) */}
        <ARProductShowcase 
          company={company} 
          isActive={isActive} 
        />
      </AnimatePresence>
    </div>
  );
};
