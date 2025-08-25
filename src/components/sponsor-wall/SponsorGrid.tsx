import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SponsorSlot } from './SponsorSlot';
import { DemoControls } from './DemoControls';


interface GridSlot {
  slotNumber: number;
  type: 'standard' | 'main-sponsor' | 'live-bidding';
  row: number;
  col: number;
  colSpan?: number;
  rowSpan?: number;
}

export const SponsorGrid: React.FC = () => {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeUntilNextCycle, setTimeUntilNextCycle] = useState(45);
  const [activeSlots, setActiveSlots] = useState<number[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [cycleTiming, setCycleTiming] = useState(45);



  // Grid layout configuration - Main sponsor as ONE large prominent card spanning 4 slots
  const gridLayout: GridSlot[] = [
    // Row 1: Standard slots 1-6
    { slotNumber: 1, type: 'standard', row: 1, col: 1 },
    { slotNumber: 2, type: 'standard', row: 1, col: 2 },
    { slotNumber: 3, type: 'standard', row: 1, col: 3 },
    { slotNumber: 4, type: 'standard', row: 1, col: 4 },
    { slotNumber: 5, type: 'standard', row: 1, col: 5 },
    { slotNumber: 6, type: 'standard', row: 1, col: 6 },
    
    // Row 2: Standard slots 7-8 + Main Sponsor (2x2) + Standard slots 13-14
    { slotNumber: 7, type: 'standard', row: 2, col: 1 },
    { slotNumber: 8, type: 'live-bidding', row: 2, col: 2 },
    { slotNumber: 9, type: 'main-sponsor', row: 2, col: 3, colSpan: 2, rowSpan: 2 }, // ONE large card spanning 4 slots
    { slotNumber: 13, type: 'standard', row: 2, col: 5 },
    { slotNumber: 14, type: 'standard', row: 2, col: 6 },
    
    // Row 3: Standard slots 15-16 + Main Sponsor continues (2x2) + Standard slots 17-18
    { slotNumber: 15, type: 'standard', row: 3, col: 1 },
    { slotNumber: 16, type: 'standard', row: 3, col: 2 },
    // Main sponsor continues from row 2 (no new slot needed - spans rows 2-3, cols 3-4)
    { slotNumber: 17, type: 'standard', row: 3, col: 5 },
    { slotNumber: 18, type: 'standard', row: 3, col: 6 },
    
    // Row 4: Standard slots 19-24
    { slotNumber: 19, type: 'standard', row: 4, col: 1 },
    { slotNumber: 20, type: 'standard', row: 4, col: 2 },
    { slotNumber: 21, type: 'standard', row: 4, col: 3 },
    { slotNumber: 22, type: 'standard', row: 4, col: 4 },
    { slotNumber: 23, type: 'standard', row: 4, col: 5 },
    { slotNumber: 24, type: 'standard', row: 4, col: 6 }
  ];

  // Auto-rotation logic
  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setTimeUntilNextCycle(prev => {
        if (prev <= 1) {
          // Cycle complete, move to next cycle
          setCurrentCycle(prevCycle => prevCycle === 4 ? 1 : prevCycle + 1);
          return cycleTiming; // Use dynamic timing
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRotating, cycleTiming]);

  // Cinematic entrance animation - trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Simple entrance animation like Live Auction Feed
  const getEntranceAnimation = (slot: GridSlot, index: number) => {
    const { type } = slot;
    
    // Main sponsor - appears first with gentle scale
    if (type === 'main-sponsor') {
      return {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.2 }
      };
    }

    // Regular slots - staggered entrance with simple motion
    return {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.4 + (index * 0.05) }
    };
  };

  // Simple container animation
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Update active slots based on current cycle
  useEffect(() => {
    let newActiveSlots: number[] = [];
    
    switch (currentCycle) {
      case 1:
        // Top and middle sections
        newActiveSlots = [1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18];
        break;
      case 2:
        // Middle and bottom sections
        newActiveSlots = [7, 8, 9, 19, 20, 21, 22, 23, 24];
        break;
      case 3:
        // Odd-numbered slots
        newActiveSlots = [1, 3, 5, 7, 9, 13, 15, 17, 19, 21, 23];
        break;
      case 4:
        // Even-numbered slots
        newActiveSlots = [2, 4, 6, 8, 14, 16, 18, 20, 22, 24];
        break;
    }

    // Handle transitions
    setTimeout(() => {
      setActiveSlots(newActiveSlots);
    }, 300);

  }, [currentCycle, activeSlots]);

  const toggleAutoRotation = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  // Demo control functions
  const handleSetCycle = (cycle: number) => {
    setCurrentCycle(cycle);
    setTimeUntilNextCycle(cycleTiming);
  };

  const handleSetTiming = (seconds: number) => {
    setCycleTiming(seconds);
    setTimeUntilNextCycle(seconds);
  };

  const getSlotPosition = (slot: GridSlot) => {
    const baseClasses = `relative`;
    
    if (slot.colSpan && slot.rowSpan) {
      return `${baseClasses} col-span-2 row-span-2`;
    }
    
    return baseClasses;
  };





  return (
    <motion.div 
      className="w-full max-w-7xl mx-auto p-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Demo Controls */}
      <DemoControls
        isAutoRotating={isAutoRotating}
        onToggleAutoRotation={toggleAutoRotation}
        currentCycle={currentCycle}
        timeUntilNextCycle={timeUntilNextCycle}
        onSetCycle={handleSetCycle}
        onSetTiming={handleSetTiming}
      />

      {/* Sponsor Grid */}
      <motion.div 
        className="grid grid-cols-6 gap-4 auto-rows-[140px] grid-flow-row"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {gridLayout.map((slot, index) => {
          const animationProps = getEntranceAnimation(slot, index);
          
          return (
            <motion.div 
              key={slot.slotNumber} 
              className={getSlotPosition(slot)}
              initial={animationProps.initial}
              animate={hasAnimated ? animationProps.animate : animationProps.initial}
              transition={animationProps.transition}
              style={{ willChange: 'transform, opacity' }}
            >
              <SponsorSlot
                slotNumber={slot.slotNumber}
                slotType={slot.type}
                isActive={activeSlots.includes(slot.slotNumber)}
                className="h-full"
              />
              
              
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer Stats */}
      <motion.div 
        className="mt-8 text-center text-gray-400"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }} // After all slots have appeared
      >
        <p className="text-sm">
          Kardiverse™ 5D/24D • Add-on: Hologram +€10K • Live Bidding +€15k • NFC/QR enabled
        </p>
      </motion.div>
    </motion.div>
  );
}; 