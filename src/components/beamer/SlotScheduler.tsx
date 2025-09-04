import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

interface SlotSchedule {
  slotNumber: number;
  sponsorName: string;
  sponsorLogo: string;
  displayDuration: number; // seconds (15-30s per spec)
  startTime: Date;
  endTime: Date;
  blockNumber: number; // 1-6 (4-hour blocks)
  status: 'scheduled' | 'active' | 'completed' | 'error';
  viewCount: number;
  category: 'premium' | 'standard' | 'bidding';
  priority: number;
  errorCount: number;
}

interface BlockData {
  blockNumber: number;
  startTime: Date;
  endTime: Date;
  totalSlots: number;
  completedSlots: number;
  totalViews: number;
  isActive: boolean;
  status: 'scheduled' | 'active' | 'completed';
}

interface BeamerSlotSchedulerProps {
  className?: string;
}

export const BeamerSlotScheduler: React.FC<BeamerSlotSchedulerProps> = ({ className = '' }) => {
  const { layers, updateLayerSettings } = useLayerContext();
  const [currentSlot, setCurrentSlot] = useState(1);
  const [currentBlock, setCurrentBlock] = useState(1);
  const [schedule, setSchedule] = useState<SlotSchedule[]>([]);
  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [systemEfficiency, setSystemEfficiency] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // BeamerShow specifications
  const TOTAL_SLOTS = 24;
  const BLOCK_DURATION = 4; // hours
  const SLOT_DURATION = layers['layer-1-static']?.settings.slotDuration || 20; // seconds
  
  // Mock sponsor database for realistic demo
  const sponsorNames = [
    'TechCorp', 'GlobalBrand', 'InnovateCo', 'FutureTech', 'DataDrive', 'CloudFirst',
    'AIVision', 'SmartSoft', 'NextGen', 'DigitalEdge', 'CyberCore', 'MetaVerse',
    'BlockChain', 'QuantumLeap', 'NanoTech', 'BioInnovate', 'GreenEnergy', 'SpaceX',
    'Tesla', 'Microsoft', 'Amazon', 'Google', 'Apple', 'Meta'
  ];

  // Initialize 24-slot schedule for current 4-hour block
  useEffect(() => {
    const initializeSchedule = () => {
      const now = new Date();
      const blockStartTime = new Date(now);
      blockStartTime.setHours(Math.floor(now.getHours() / 4) * 4, 0, 0, 0);

      const newSchedule: SlotSchedule[] = [];
      
      for (let i = 1; i <= TOTAL_SLOTS; i++) {
        const slotStartTime = new Date(blockStartTime.getTime() + ((i - 1) * SLOT_DURATION * 1000));
        const slotEndTime = new Date(slotStartTime.getTime() + (SLOT_DURATION * 1000));
        
        newSchedule.push({
          slotNumber: i,
          sponsorLogo: `sponsor-${i}.png`, // Placeholder - will be dynamic
          displayDuration: SLOT_DURATION,
          startTime: slotStartTime,
          endTime: slotEndTime,
          blockNumber: currentBlock,
          status: slotStartTime <= now && now <= slotEndTime ? 'active' : 
                  slotEndTime < now ? 'completed' : 'scheduled'
        });
      }
      
      setSchedule(newSchedule);
    };

    initializeSchedule();
  }, [currentBlock, SLOT_DURATION, TOTAL_SLOTS]);

  // Slot rotation timer - updates every second
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      const now = new Date();
      
      // Find current active slot
      const activeSlot = schedule.find(slot => 
        slot.startTime <= now && now <= slot.endTime
      );
      
      if (activeSlot) {
        setCurrentSlot(activeSlot.slotNumber);
        
        // Log view (per spec requirements)
        setTotalViews(prev => prev + 1);
        
        // Update slot status
        setSchedule(prev => prev.map(slot => ({
          ...slot,
          status: slot.slotNumber === activeSlot.slotNumber ? 'active' :
                  slot.endTime < now ? 'completed' : 'scheduled'
        })));
      }
      
      // Check if block completed - move to next block
      if (schedule.length > 0 && schedule.every(slot => slot.status === 'completed')) {
        setCurrentBlock(prev => prev === 6 ? 1 : prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [schedule, isRunning]);

  // Calculate progress
  const completedSlots = schedule.filter(slot => slot.status === 'completed').length;
  const progressPercentage = (completedSlots / TOTAL_SLOTS) * 100;

  // Get current block time range
  const getBlockTimeRange = () => {
    const blockStart = currentBlock === 1 ? '00:00' : 
                      currentBlock === 2 ? '04:00' :
                      currentBlock === 3 ? '08:00' :
                      currentBlock === 4 ? '12:00' :
                      currentBlock === 5 ? '16:00' : '20:00';
    
    const blockEnd = currentBlock === 1 ? '04:00' : 
                     currentBlock === 2 ? '08:00' :
                     currentBlock === 3 ? '12:00' :
                     currentBlock === 4 ? '16:00' :
                     currentBlock === 5 ? '20:00' : '24:00';
    
    return `${blockStart} - ${blockEnd}`;
  };

  return (
    <motion.div 
      className={`bg-gray-900/95 border border-gray-700 rounded-lg p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-green-400">
            BeamerShow Slot Scheduler
          </h3>
          <p className="text-sm text-gray-400">
            Kardiverse Technologies Ltd. • 24-Slot System
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            Slot {currentSlot}/{TOTAL_SLOTS}
          </div>
          <div className="text-sm text-gray-400">
            Block {currentBlock} • {getBlockTimeRange()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Block Progress</span>
          <span className="text-sm text-green-400">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Current Slot Display */}
      <motion.div 
        className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-green-500/30"
        animate={{ 
          boxShadow: isRunning ? [
            '0 0 20px rgba(34, 197, 94, 0.3)',
            '0 0 30px rgba(34, 197, 94, 0.5)',
            '0 0 20px rgba(34, 197, 94, 0.3)'
          ] : 'none'
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-green-400">
              🎯 Currently Displaying
            </div>
            <div className="text-gray-300">
              Sponsor Logo #{currentSlot} • {SLOT_DURATION}s duration
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Layer 1: Static</div>
            <div className={`text-sm font-semibold ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
              {isRunning ? '● LIVE' : '⏸ PAUSED'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalViews}</div>
          <div className="text-xs text-gray-400">Total Views</div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{TOTAL_SLOTS}</div>
          <div className="text-xs text-gray-400">Slots/Block</div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{BLOCK_DURATION}h</div>
          <div className="text-xs text-gray-400">Block Duration</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
            isRunning 
              ? 'bg-red-500/20 border border-red-400/50 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 border border-green-400/50 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {isRunning ? '⏸ Pause Rotation' : '▶ Start Rotation'}
        </button>
        
        <button
          onClick={() => {
            setCurrentSlot(1);
            setCurrentBlock(1);
            setTotalViews(0);
          }}
          className="py-2 px-4 rounded-lg font-semibold bg-gray-500/20 border border-gray-400/50 text-gray-400 hover:bg-gray-500/30 transition-all duration-200"
        >
          🔄 Reset
        </button>
      </div>

      {/* Technical Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div>Sync: Beamer + iPad • Format: PNG/JPG • Auto-rotate: {layers['layer-1-static']?.settings.autoRotate ? 'ON' : 'OFF'}</div>
          <div>Logging: All views tracked • Database: Cloud-hosted • KPI: {progressPercentage > 99 ? '✅' : '⏳'} 100% rotation target</div>
        </div>
      </div>
    </motion.div>
  );
};
