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



  // Grid layout configuration - Layer 4: 24 individual slots (6x4 grid)
  const gridLayout: GridSlot[] = [
    // Row 1: Slots 1-6
    { slotNumber: 1, type: 'standard', row: 1, col: 1 },
    { slotNumber: 2, type: 'standard', row: 1, col: 2 },
    { slotNumber: 3, type: 'standard', row: 1, col: 3 },
    { slotNumber: 4, type: 'standard', row: 1, col: 4 },
    { slotNumber: 5, type: 'standard', row: 1, col: 5 },
    { slotNumber: 6, type: 'standard', row: 1, col: 6 },
    
    // Row 2: Slots 7-12 (slot 8 is featured spinning)
    { slotNumber: 7, type: 'standard', row: 2, col: 1 },
    { slotNumber: 8, type: 'live-bidding', row: 2, col: 2 },  // Featured spinning slot
    { slotNumber: 9, type: 'standard', row: 2, col: 3 },
    { slotNumber: 10, type: 'standard', row: 2, col: 4 },
    { slotNumber: 11, type: 'standard', row: 2, col: 5 },
    { slotNumber: 12, type: 'standard', row: 2, col: 6 },
    
    // Row 3: Slots 13-18
    { slotNumber: 13, type: 'standard', row: 3, col: 1 },
    { slotNumber: 14, type: 'standard', row: 3, col: 2 },
    { slotNumber: 15, type: 'main-sponsor', row: 3, col: 3 }, // Center main sponsor (single slot)
    { slotNumber: 16, type: 'standard', row: 3, col: 4 },
    { slotNumber: 17, type: 'standard', row: 3, col: 5 },
    { slotNumber: 18, type: 'standard', row: 3, col: 6 },
    
    // Row 4: Slots 19-24 (slot 24 is featured spinning)
    { slotNumber: 19, type: 'standard', row: 4, col: 1 },
    { slotNumber: 20, type: 'standard', row: 4, col: 2 },
    { slotNumber: 21, type: 'standard', row: 4, col: 3 },
    { slotNumber: 22, type: 'standard', row: 4, col: 4 },
    { slotNumber: 23, type: 'standard', row: 4, col: 5 },
    { slotNumber: 24, type: 'live-bidding', row: 4, col: 6 }  // Featured spinning slot
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
    return `relative`; // All slots are individual now
  };

  // Verify we have exactly 24 slots
  const verifySlotCount = () => {
    const slotNumbers = gridLayout.map(slot => slot.slotNumber).sort((a, b) => a - b);
    console.log('Layer 4 - Total slots:', gridLayout.length);
    console.log('Slot numbers:', slotNumbers);
    console.log('Featured spinning slots:', slotNumbers.filter(n => n === 8 || n === 24));
    return gridLayout.length === 24 && slotNumbers.length === 24;
  };

  // Run verification on component mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      verifySlotCount();
    }
  }, []);





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