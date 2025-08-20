import React, { useState, useEffect } from 'react';
import { SponsorSlot } from './SponsorSlot';


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
          return 45; // Reset to 45 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRotating]);



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

  const getSlotPosition = (slot: GridSlot) => {
    const baseClasses = `relative`;
    
    if (slot.colSpan && slot.rowSpan) {
      return `${baseClasses} col-span-2 row-span-2`;
    }
    
    return baseClasses;
  };





  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header - Updated to match mockup */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
           5D SPONSOR WALL — 24 SLOTS
         </h1>
         <p className="text-lg text-gray-300 max-w-3xl mx-auto">
           Single Wall • 24 Slots + Main Sponsor • 4K Beamer Ready
         </p>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Layer 1: Base Grid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400">Layer 2: Animation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-400">Layer 3: Hologram FX</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-orange-400">Layer 4: Interactive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400">Layer 5: Live Auction</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span className="text-cyan-400">Auto-Rotation: {isAutoRotating ? 'ON' : 'OFF'}</span>
            </div>
            <button
              onClick={toggleAutoRotation}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isAutoRotating
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
            >
              {isAutoRotating ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* Cycle Information */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Cycle:</span>
              <span className="text-white font-mono text-lg">{currentCycle}/4</span>
              <span className="text-gray-400">Time:</span>
              <span className="text-white font-mono text-lg">{timeUntilNextCycle}s</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400">Active Slots:</span>
              <span className="text-white font-mono ml-2">{activeSlots.length}/24</span>
            </div>
          </div>
        </div>

        {/* Layer Status Description */}
        <div className="mt-3 pt-3 border-t border-gray-600/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs text-gray-400">
            <div>
              <strong className="text-green-400">Layer 1:</strong> 24-slot grid layout with responsive design
            </div>
            <div>
              <strong className="text-blue-400">Layer 2:</strong> Auto-rotation with 4 cycles and smooth animations
            </div>
            <div>
              <strong className="text-purple-400">Layer 3:</strong> Holographic effects with particles, light rays, and depth
            </div>
            <div>
              <strong className="text-orange-400">Layer 4:</strong> Interactive QR/NFC for hidden content, offers, and bids
            </div>
            <div>
              <strong className="text-red-400">Layer 5:</strong> Live auction feed with real-time bidding updates
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Grid */}
      <div className="grid grid-cols-6 gap-4 auto-rows-[140px] grid-flow-row">
        {gridLayout.map((slot) => (
          <div key={slot.slotNumber} className={getSlotPosition(slot)}>
            <SponsorSlot
              slotNumber={slot.slotNumber}
              slotType={slot.type}
              isActive={activeSlots.includes(slot.slotNumber)}
              className="h-full"
            />
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 text-center text-gray-400">
        <p className="text-sm">
          Kardiverse™ 5D/24D • Add-on: Hologram +€10K • Live Bidding +€15k • NFC/QR enabled
        </p>
      </div>
    </div>
  );
}; 