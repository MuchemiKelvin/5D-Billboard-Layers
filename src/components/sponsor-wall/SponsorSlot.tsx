import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HologramEffect } from './HologramEffect';
import { AROverlaySystem } from './AROverlaySystem';
import { HologramStepOut } from './HologramStepOut';
import { HologramLayer } from '../beamer/HologramLayer';
import { ARLayer } from '../beamer/ARLayer';
// Spinning slot layer removed (Layer 4 disabled)
// import { SpinningSlotLayer } from './SpinningSlotLayer';
import { dataService, type Company } from '../../data/dataService';
import { useLayerContext } from '../../contexts/LayerContext';

interface SlotData {
  currentBid?: number;
  reservePrice?: number;
}

interface SponsorSlotProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  className?: string;
  isActive?: boolean;
}

export const SponsorSlot: React.FC<SponsorSlotProps> = ({ 
  slotNumber, 
  slotType, 
  isActive, 
  className = '' 
}) => {
  const { openModal, selectSlot, toggleFavorite, shareSlot, favorites } = useLayerContext();
  const [company, setCompany] = useState<Company | null>(null);
  const [slotData, setSlotData] = useState<SlotData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(3); // 3 seconds per cycle
  const [nextCompany, setNextCompany] = useState<Company | null>(null);
  const [showNextCompanyPreview, setShowNextCompanyPreview] = useState(false);
  const [liveBidAmount, setLiveBidAmount] = useState(0);
  const [totalBids, setTotalBids] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [emptySlotGlow, setEmptySlotGlow] = useState<string>('slot-glow-empty');

  // Convert KES to EUR (approximate rate: 1 EUR = 150 KES)
  const convertToEUR = (kes: number) => (kes / 150).toFixed(0);

  useEffect(() => {
    // Get slot data from the data service
    const slot = dataService.getSlotByNumber(slotNumber);
    if (slot) {
      setSlotData({
        currentBid: slot.currentBid,
        reservePrice: slot.reservePrice
      });
    } else {
      setSlotData(null);
    }

    // Get company data if slot has a current sponsor
    if (slot?.currentSponsor) {
      const companyData = dataService.getCompanyById(slot.currentSponsor);
      setCompany(companyData || null);
    } else {
      setCompany(null);
    }

    // Simulate next company for preview
    const nextCompanyId = slot?.currentSponsor === 'COMP-001' ? 'COMP-002' : 'COMP-001';
    const nextCompanyData = dataService.getCompanyById(nextCompanyId);
    setNextCompany(nextCompanyData || null);

    // Set random gradient glow for empty slots
    if (!slot?.currentSponsor) {
      const glowVariants = [
        'slot-glow-empty-cyan',
        'slot-glow-empty-purple', 
        'slot-glow-empty-pink',
        'slot-glow-empty-green',
        'slot-glow-empty-gold'
      ];
      const randomGlow = glowVariants[Math.floor(Math.random() * glowVariants.length)];
      setEmptySlotGlow(randomGlow);
    }
  }, [slotNumber]);

  // Countdown timer effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 3; // Reset to 3 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  // Real-time bid updates effect
  useEffect(() => {
    if (!isActive || !slotData) return;

    // Simulate live bid updates
    const bidTimer = setInterval(() => {
      if (slotType === 'live-bidding') {
        setLiveBidAmount(prev => prev + Math.floor(Math.random() * 1000));
        setTotalBids(prev => prev + 1);
      }
    }, 3000);

    return () => clearInterval(bidTimer);
  }, [isActive, slotData, slotType]);

  // Auction countdown effect - REMOVED

  // Determine hologram settings based on slot type and state
  const hologramSettings = {
    intensity: slotType === 'main-sponsor' ? 1.5 : 
               slotType === 'live-bidding' ? 1.2 : 0.4,
    enableParticles: slotType === 'main-sponsor' || slotType === 'live-bidding',
    enableLightRays: slotType === 'main-sponsor' || slotType === 'live-bidding',
    enableDepthField: slotType === 'main-sponsor' || slotType === 'live-bidding',
    enableScanningLines: slotType === 'main-sponsor',
    enableCornerAccents: false // Corner accents completely disabled
  };

  // Enhanced animation variants with sophisticated hover effects and heartbeat
  const slotVariants = {
    initial: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      rotateX: 0
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut" as const
      }
    },
    hover: { 
      scale: slotType === 'main-sponsor' ? 1.01 : 1.03,
      rotateY: slotType === 'main-sponsor' ? 1 : 2,
      rotateX: slotType === 'main-sponsor' ? 0.5 : 1,
      y: -2,
      transition: { 
        duration: 0.2,
        ease: "easeOut" as const,
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    },
    tap: {
      scale: slotType === 'main-sponsor' ? 0.99 : 0.97,
      transition: { 
        duration: 0.1,
        ease: "easeInOut" as const
      }
    }
  };

  // Heartbeat animation variants for living sponsor effect
  const heartbeatVariants = {
    initial: { 
      scale: 1,
      opacity: 1,
      filter: "brightness(1)"
    },
    heartbeat: {
      scale: [1, 1.02, 1, 1.01, 1],
      opacity: [1, 0.95, 1, 0.98, 1],
      filter: ["brightness(1)", "brightness(1.1)", "brightness(1)", "brightness(1.05)", "brightness(1)"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
        times: [0, 0.2, 0.4, 0.6, 1]
      }
    },
    pulse: {
      scale: [1, 1.01, 1],
      opacity: [1, 0.9, 1],
      filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
        times: [0, 0.5, 1]
      }
    }
  };

  // Blinking effect for active slots
  const blinkVariants = {
    initial: { opacity: 1 },
    blink: {
      opacity: [1, 0.3, 1, 0.7, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const,
        times: [0, 0.1, 0.2, 0.3, 1]
      }
    }
  };

  // Content animation variants - Simplified
  const contentVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  // Get slot content based on type and company data - Updated to match mockup
  const getSlotContent = () => {
    if (slotType === 'main-sponsor') {
      return (
        <div className="text-center h-full flex flex-col justify-center">
          {/* Main Sponsor Tag */}
          <div className="absolute top-3 left-3">
            <span className="text-sm font-bold text-blue-400 bg-blue-900/50 px-3 py-2 rounded-lg">
              MAIN SPONSOR
            </span>
          </div>

          {company && isActive ? (
            <motion.div
              key={`${company.id}-${Date.now()}`}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center h-full px-2"
            >
              {/* Logo Container - 85% of slot height */}
              <div className="mb-1 flex-shrink-0 sponsor-logo-container" style={{ height: '85%', width: '100%' }}>
                <div className="h-full w-full flex items-center justify-center">
                  <img 
                    src={company.logo} 
                    alt={`${company.name} logo`}
                    className="sponsor-logo"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Company Name */}
              <div className="text-lg font-bold text-white mb-2 text-center leading-tight">
                {company.name}
              </div>
              
              {/* Features */}
              <div className="text-sm text-blue-300 font-semibold text-center">
                5D • AR • HOLOGRAM
              </div>
            </motion.div>
          ) : (
            <div className="text-center flex flex-col items-center justify-center h-full px-2">
              <div className="text-xl font-bold text-white mb-3">
                MAIN SPONSOR
              </div>
              <div className="text-sm text-blue-300 mb-3 font-semibold">
                5D • AR • HOLOGRAM
              </div>
              {slotData && (
                <div className="text-sm text-gray-400 font-mono">
                  Reserve: EUR {convertToEUR(slotData.reservePrice || 0)}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (slotType === 'live-bidding') {
      return (
        <div className="text-center h-full flex flex-col justify-center">
          {company && isActive ? (
            <motion.div
              key={`${company.id}-${Date.now()}`}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center h-full px-2"
            >
              {/* Logo Container - 85% of slot height */}
              <div className="mb-1 flex-shrink-0 sponsor-logo-container" style={{ height: '85%', width: '100%' }}>
                <div className="h-full w-full flex items-center justify-center">
                  <img 
                    src={company.logo} 
                    alt={`${company.name} logo`}
                    className="sponsor-logo"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Company Name */}
              <div className="text-xs font-medium text-gray-300 mb-1 text-center leading-tight">
                {company.name}
              </div>
              
              {/* Live Bidding Badge */}
              <div className="text-xs text-green-400 font-bold mb-1">
                LIVE BIDDING
              </div>
              
              {/* Bid Amount */}
              {liveBidAmount > 0 && (
                <div className="text-sm font-bold text-green-400 mb-1">
                  €{liveBidAmount.toLocaleString()}
                </div>
              )}
              
              {/* Total Bids */}
              {totalBids > 0 && (
                <div className="text-xs text-orange-400">
                  {totalBids} bids
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center flex flex-col items-center justify-center h-full px-2">
              <div className="text-sm font-bold text-green-400 mb-2">
                LIVE BIDDING
              </div>
              <div className="text-sm font-bold text-white mb-1">
                €5,000/day
              </div>
              <div className="text-xs text-gray-400">
                Weekend €12.5k
              </div>
              <div className="text-xs text-gray-400">
                Week €25k
              </div>
            </div>
          )}
        </div>
      );
    }

    // Standard slot content - Enhanced logo display
    return (
      <div className="text-center h-full flex flex-col justify-center">
        {company && isActive ? (
          <motion.div
            key={`${company.id}-${Date.now()}`}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center h-full px-2"
          >
            {/* Logo Container - 85% of slot height */}
            <div className="mb-2 flex-shrink-0 sponsor-logo-container" style={{ height: '85%', width: '100%' }}>
              <div className="h-full w-full flex items-center justify-center">
                <motion.img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="sponsor-logo"
                  animate={isActive ? {
                    scale: [1, 1.03, 1, 1.02, 1],
                    filter: [
                      "brightness(1)",
                      "brightness(1.08)",
                      "brightness(1)",
                      "brightness(1.04)",
                      "brightness(1)"
                    ]
                  } : {}}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.4, 0.6, 1]
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <motion.div 
                  className="hidden w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  animate={isActive ? {
                    scale: [1, 1.03, 1, 1.02, 1],
                    filter: [
                      "brightness(1)",
                      "brightness(1.08)",
                      "brightness(1)",
                      "brightness(1.04)",
                      "brightness(1)"
                    ]
                  } : {}}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.4, 0.6, 1]
                  }}
                >
                  {company.name.substring(0, 2).toUpperCase()}
                </motion.div>
              </div>
            </div>
            
            {/* Company Name */}
            <div className="text-xs font-medium text-gray-300 text-center leading-tight truncate w-full">
              {company.name}
            </div>
          </motion.div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full px-2">
            <div className="text-sm font-medium text-gray-400 mb-2">
              SLOT {slotNumber}
            </div>
            <div className="text-sm font-bold text-white mb-1">
              €5,000/day
            </div>
            <div className="text-xs text-gray-400">
              Weekend €12.5k
            </div>
            <div className="text-xs text-gray-400">
              Week €25k
            </div>
          </div>
        )}
      </div>
    );
  };

  // Next Company Preview Component
  const NextCompanyPreview = () => {
    if (!nextCompany || !isActive || !showNextCompanyPreview) return null;
    
    return (
      <motion.div
        className="absolute inset-0 bg-black/80 rounded-xl flex flex-col items-center justify-center z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center">
          <div className="text-xs text-blue-400 mb-2">Next Company</div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto mb-2">
            {nextCompany.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-xs text-white font-medium">{nextCompany.name}</div>
          <div className="text-xs text-gray-400 mt-1">Starting in {timeRemaining}s</div>
        </div>
      </motion.div>
    );
  };

  // Company Change Notification Component - REMOVED

  // Company Details Overlay Component
  const CompanyDetailsOverlay = () => {
    if (!company || !isActive || !showNextCompanyPreview) return null;
    
    return (
      <motion.div
        className="absolute inset-0 bg-black/90 rounded-xl flex flex-col items-center justify-center z-30 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {company.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-lg font-bold text-white">{company.name}</div>
          <div className="text-sm text-blue-300">{company.category}</div>
          
          {slotData && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Bid:</span>
                <span className="text-green-400 font-semibold">
                  EUR {convertToEUR(slotData.currentBid || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reserve:</span>
                <span className="text-gray-300">
                  EUR {convertToEUR(slotData.reservePrice || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Left:</span>
                <span className="text-yellow-400 font-semibold">
                  {timeRemaining}s
                </span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-400 mt-4">
            Click for more details
          </div>
        </div>
      </motion.div>
    );
  };

  // Performance Metrics Component
  const PerformanceMetrics = () => {
    if (!isActive || !isExpanded) return null;
    
    const utilization = ((timeRemaining / 3) * 100).toFixed(1); // Changed from 45 to 3 seconds
    const revenue = slotData ? convertToEUR(slotData.currentBid || 0) : '0';
    
    return (
      <motion.div
        className="absolute -bottom-20 left-0 right-0 bg-gray-800/95 rounded-lg p-3 z-50 border border-gray-600"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-green-400 font-bold">{utilization}%</div>
            <div className="text-gray-400">Utilization</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">€{revenue}</div>
            <div className="text-gray-400">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">{totalBids}</div>
            <div className="text-gray-400">Bids</div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Get slot styling based on type and state - Cards always visible
  const getSlotStyling = () => {
    let baseClasses = "relative overflow-hidden rounded-xl border transition-all duration-300";
    
    if (slotType === 'main-sponsor') {
      baseClasses += " bg-gradient-to-br from-blue-900/70 to-purple-900/70 border-blue-400/50";
    } else if (slotType === 'live-bidding') {
      baseClasses += " bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30 border-orange-400/50";
    } else {
      baseClasses += " bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30";
    }

    // Enhanced full-slot glow effects for occupied slots
    if (isActive && company) {
      if (slotType === 'main-sponsor') {
        baseClasses += " border-blue-300/80 ring-2 ring-blue-400/30 slot-glow-main";
      } else if (slotType === 'live-bidding') {
        baseClasses += " border-green-300/70 ring-2 ring-green-400/30 slot-glow-live";
      } else {
        baseClasses += " border-gray-400/60 ring-2 ring-gray-400/20 slot-glow-standard";
      }
         } else if (!company) {
       // Enhanced gradient glow for empty slots with dynamic colors
       baseClasses += " opacity-70 border-gray-500/30 " + emptySlotGlow;
     }

    return baseClasses;
  };

  return (
    <motion.div
        className={`${getSlotStyling()} ${className}`}
        variants={slotVariants}
        initial="initial"
        animate={isActive && company ? "heartbeat" : "initial"}
        whileHover="hover"
        whileTap="tap"
        style={{ 
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
        layout
        onHoverStart={() => setShowNextCompanyPreview(true)}
        onHoverEnd={() => setShowNextCompanyPreview(false)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
      {/* Heartbeat Animation Overlay */}
      {isActive && company && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          variants={heartbeatVariants}
          initial="initial"
          animate="heartbeat"
          style={{
            background: slotType === 'main-sponsor' 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
              : slotType === 'live-bidding'
              ? 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(156, 163, 175, 0.1) 0%, transparent 70%)'
          }}
        />
      )}

      {/* Blinking Effect for Active Slots */}
      {isActive && company && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          variants={blinkVariants}
          initial="initial"
          animate="blink"
          style={{
            background: slotType === 'main-sponsor' 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 60%)'
              : slotType === 'live-bidding'
              ? 'radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 60%)'
              : 'radial-gradient(circle, rgba(156, 163, 175, 0.05) 0%, transparent 60%)'
          }}
        />
      )}

      {/* Holographic Effects Layer */}
      <HologramEffect {...hologramSettings} />

      {/* AR Overlay System */}
      <AROverlaySystem
        slotNumber={slotNumber}
        slotType={slotType}
        isActive={isActive || false}
        company={company}
      />

      {/* Hologram Step-Out System */}
      <HologramStepOut
        slotNumber={slotNumber}
        slotType={slotType}
        isActive={isActive || false}
        company={company}
      />

      {/* Slot Number - Top Left with Rotation Indicator */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <span className="text-xs font-bold text-gray-300">
          S{slotNumber.toString().padStart(2, '0')}
        </span>
        {slotType !== 'main-sponsor' && company && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
            animate={{
              scale: [1, 1.5, 1, 1.3, 1],
              opacity: [0.6, 1, 0.6, 0.9, 0.6],
              boxShadow: [
                "0 0 0 0 rgba(34, 211, 238, 0)",
                "0 0 0 4px rgba(34, 211, 238, 0.3)",
                "0 0 0 0 rgba(34, 211, 238, 0)",
                "0 0 0 2px rgba(34, 211, 238, 0.2)",
                "0 0 0 0 rgba(34, 211, 238, 0)"
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 1]
            }}
          />
        )}
      </div>

      {/* Control Buttons - Top Right */}
      <div className="absolute top-2 right-2 flex gap-1">
        {/* QR Code Button */}
        <button
          className="p-1.5 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg border border-blue-400/30 transition-all duration-200 hover:scale-110"
          title="QR Code"
          onClick={(e) => {
            e.stopPropagation();
            selectSlot(slotNumber, company);
            openModal('qr-code', { slotNumber, slotType, company });
          }}
        >
          <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm8 2h6v6h-6v-6zm2 2v2h2v-2h-2z"/>
            <path d="M7 7h2v2H7V7zm8 0h2v2h-2V7z"/>
          </svg>
        </button>

        {/* Settings Button */}
        <button
          className="p-1.5 bg-gray-500/20 hover:bg-gray-500/40 rounded-lg border border-gray-400/30 transition-all duration-200 hover:scale-110"
          title="Slot Settings"
          onClick={(e) => {
            e.stopPropagation();
            selectSlot(slotNumber, company);
            openModal('slot-settings', { slotNumber, slotType, company });
          }}
        >
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Bid/Action Button (conditional) */}
        {slotType === 'live-bidding' && (
          <button
            className="p-1.5 bg-green-500/20 hover:bg-green-500/40 rounded-lg border border-green-400/30 transition-all duration-200 hover:scale-110"
            title="Place Bid"
            onClick={(e) => {
              e.stopPropagation();
              selectSlot(slotNumber, company);
              openModal('bid-panel', { slotNumber, slotType, company });
            }}
          >
            <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}

        {/* Favorite Button */}
        <button
          className={`p-1.5 rounded-lg border transition-all duration-200 hover:scale-110 ${
            favorites.has(slotNumber) 
              ? 'bg-red-500/40 border-red-400/50' 
              : 'bg-red-500/20 border-red-400/30'
          }`}
          title={favorites.has(slotNumber) ? "Remove from Favorites" : "Add to Favorites"}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(slotNumber);
          }}
        >
          <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 p-2 h-full flex items-center justify-center">
        {getSlotContent()}
      </div>



      {/* Status Indicators - Only show when company is active */}
      {isActive && company && (
        <div className="absolute top-2 left-8 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      )}

      {/* Bottom Action Buttons */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
        {/* Left Action Buttons */}
        <div className="flex gap-1">
          <button
            className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 rounded border border-cyan-400/30 transition-all duration-200 hover:scale-110"
            title="View Details"
            onClick={(e) => {
              e.stopPropagation();
              selectSlot(slotNumber, company);
              openModal('company-details', { slotNumber, company });
            }}
          >
            <svg className="w-3 h-3 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            className="p-1.5 bg-purple-500/20 hover:bg-purple-500/40 rounded border border-purple-400/30 transition-all duration-200 hover:scale-110"
            title="Share Slot"
            onClick={(e) => {
              e.stopPropagation();
              shareSlot(slotNumber);
            }}
          >
            <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex gap-1">
          {slotType === 'live-bidding' && (
            <button
              className="p-1.5 bg-orange-500/20 hover:bg-orange-500/40 rounded border border-orange-400/30 transition-all duration-200 hover:scale-110"
              title="Quick Bid"
              onClick={(e) => {
                e.stopPropagation();
                openModal('bid-panel', { slotNumber, slotType, company, quickBid: true });
              }}
            >
              <svg className="w-3 h-3 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </button>
          )}

          <button
            className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 rounded border border-yellow-400/30 transition-all duration-200 hover:scale-110"
            title="Analytics"
            onClick={(e) => {
              e.stopPropagation();
              selectSlot(slotNumber, company);
              openModal('analytics', { slotNumber, company });
            }}
          >
            <svg className="w-3 h-3 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

             {/* Next Company Preview */}
       <NextCompanyPreview />

       {/* Company Details Overlay */}
       <CompanyDetailsOverlay />

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* Layer 2: Hologram Effects - Maya's Design Templates */}
      <HologramLayer
        slotNumber={slotNumber}
        isActive={isActive}
        sponsorLogo={company?.logo}
      />

      {/* Layer 3: AR Effects - QR/NFC Triggered */}
      <ARLayer
        slotNumber={slotNumber}
        isActive={isActive}
        sponsorLogo={company?.logo}
      />
      </motion.div>
  );
};