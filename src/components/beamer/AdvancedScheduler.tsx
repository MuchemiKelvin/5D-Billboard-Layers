import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

interface SlotData {
  id: number;
  sponsorName: string;
  sponsorLogo: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'active' | 'completed' | 'error' | 'skipped';
  viewCount: number;
  category: 'premium' | 'standard' | 'bidding' | 'promotional';
  priority: number;
  blockNumber: number;
  errorMessage?: string;
  lastUpdate: Date;
}

interface BlockInfo {
  blockNumber: number;
  name: string;
  startTime: Date;
  endTime: Date;
  totalSlots: number;
  completedSlots: number;
  activeSlot: number | null;
  totalViews: number;
  status: 'scheduled' | 'active' | 'completed' | 'paused';
  efficiency: number;
}

interface SystemMetrics {
  totalViews: number;
  totalErrors: number;
  uptime: number;
  efficiency: number;
  averageViewsPerSlot: number;
  currentBlockProgress: number;
  nextBlockIn: string;
  syncStatus: 'synced' | 'syncing' | 'error';
}

export const AdvancedScheduler: React.FC = () => {
  const { layers, updateLayerSettings } = useLayerContext();
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [currentBlock, setCurrentBlock] = useState<BlockInfo | null>(null);
  const [upcomingBlocks, setUpcomingBlocks] = useState<BlockInfo[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalViews: 0,
    totalErrors: 0,
    uptime: 0,
    efficiency: 100,
    averageViewsPerSlot: 0,
    currentBlockProgress: 0,
    nextBlockIn: '0h 0m',
    syncStatus: 'synced'
  });
  const [isSystemRunning, setIsSystemRunning] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // System constants
  const TOTAL_SLOTS = 24;
  const BLOCK_DURATION = 4; // hours
  const SLOT_DURATION = layers['layer-1-static']?.settings?.slotDuration || 20;

  // Sponsor database
  const sponsorDatabase = [
    { name: 'TechCorp International', category: 'premium', logo: 'tech-corp.png' },
    { name: 'Global Solutions Ltd', category: 'standard', logo: 'global-sol.png' },
    { name: 'InnovateCo', category: 'promotional', logo: 'innovate.png' },
    { name: 'FutureTech Systems', category: 'premium', logo: 'future-tech.png' },
    { name: 'DataDrive Analytics', category: 'standard', logo: 'data-drive.png' },
    { name: 'CloudFirst Technologies', category: 'premium', logo: 'cloud-first.png' },
    { name: 'AI Vision Labs', category: 'bidding', logo: 'ai-vision.png' },
    { name: 'SmartSoft Solutions', category: 'standard', logo: 'smart-soft.png' },
    { name: 'NextGen Dynamics', category: 'bidding', logo: 'next-gen.png' },
    { name: 'DigitalEdge Corp', category: 'standard', logo: 'digital-edge.png' },
    { name: 'CyberCore Systems', category: 'premium', logo: 'cyber-core.png' },
    { name: 'MetaVerse Studios', category: 'promotional', logo: 'metaverse.png' },
    { name: 'BlockChain Innovations', category: 'standard', logo: 'blockchain.png' },
    { name: 'QuantumLeap Technologies', category: 'premium', logo: 'quantum.png' },
    { name: 'NanoTech Industries', category: 'standard', logo: 'nano-tech.png' },
    { name: 'BioInnovate Research', category: 'promotional', logo: 'bio-innovate.png' },
    { name: 'GreenEnergy Solutions', category: 'bidding', logo: 'green-energy.png' },
    { name: 'SpaceX Ventures', category: 'premium', logo: 'spacex.png' },
    { name: 'Tesla Motors', category: 'premium', logo: 'tesla.png' },
    { name: 'Microsoft Corporation', category: 'premium', logo: 'microsoft.png' },
    { name: 'Amazon Web Services', category: 'premium', logo: 'aws.png' },
    { name: 'Google LLC', category: 'premium', logo: 'google.png' },
    { name: 'Apple Inc', category: 'premium', logo: 'apple.png' },
    { name: 'Meta Platforms', category: 'bidding', logo: 'meta.png' }
  ];

  // Initialize slots with sponsor data
  const initializeSlots = useCallback(() => {
    const now = new Date();
    const blockStartTime = new Date(now);
    blockStartTime.setHours(Math.floor(now.getHours() / 4) * 4, 0, 0, 0);

    const newSlots: SlotData[] = [];
    
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const sponsor = sponsorDatabase[i];
      const slotStartTime = new Date(blockStartTime.getTime() + (i * SLOT_DURATION * 1000));
      const slotEndTime = new Date(slotStartTime.getTime() + (SLOT_DURATION * 1000));
      
      // Determine status based on current time
      let status: SlotData['status'] = 'scheduled';
      if (slotEndTime < now) status = 'completed';
      else if (slotStartTime <= now && now <= slotEndTime) status = 'active';
      
      // Add some realistic errors for demo
      if (Math.random() < 0.05 && status === 'completed') status = 'error';

      newSlots.push({
        id: i + 1,
        sponsorName: sponsor.name,
        sponsorLogo: sponsor.logo,
        duration: SLOT_DURATION,
        startTime: slotStartTime,
        endTime: slotEndTime,
        status,
        viewCount: status === 'completed' ? Math.floor(Math.random() * 800) + 200 : 0,
        category: sponsor.category as SlotData['category'],
        priority: sponsor.category === 'premium' ? 1 : 
                 sponsor.category === 'bidding' ? 2 : 3,
        blockNumber: Math.floor(now.getHours() / 4) + 1,
        errorMessage: status === 'error' ? 'Connection timeout' : undefined,
        lastUpdate: now
      });
    }
    
    setSlots(newSlots);
  }, [SLOT_DURATION, TOTAL_SLOTS]);

  // Initialize block information
  const initializeBlocks = useCallback(() => {
    const now = new Date();
    const currentBlockNum = Math.floor(now.getHours() / 4) + 1;
    
    // Current block
    const blockStartTime = new Date(now);
    blockStartTime.setHours(Math.floor(now.getHours() / 4) * 4, 0, 0, 0);
    const blockEndTime = new Date(blockStartTime.getTime() + (BLOCK_DURATION * 60 * 60 * 1000));
    
    const completedSlots = slots.filter(slot => slot.status === 'completed').length;
    const activeSlotData = slots.find(slot => slot.status === 'active');
    
    const currentBlockData: BlockInfo = {
      blockNumber: currentBlockNum,
      name: `Block ${currentBlockNum}`,
      startTime: blockStartTime,
      endTime: blockEndTime,
      totalSlots: TOTAL_SLOTS,
      completedSlots,
      activeSlot: activeSlotData?.id || null,
      totalViews: slots.reduce((sum, slot) => sum + slot.viewCount, 0),
      status: isSystemRunning ? 'active' : 'paused',
      efficiency: Math.round(((completedSlots / TOTAL_SLOTS) * 100))
    };
    
    setCurrentBlock(currentBlockData);

    // Generate upcoming blocks
    const upcoming: BlockInfo[] = [];
    for (let i = 1; i <= 3; i++) {
      const futureBlockStart = new Date(blockEndTime.getTime() + ((i - 1) * BLOCK_DURATION * 60 * 60 * 1000));
      const futureBlockEnd = new Date(futureBlockStart.getTime() + (BLOCK_DURATION * 60 * 60 * 1000));
      
      upcoming.push({
        blockNumber: currentBlockNum + i,
        name: `Block ${currentBlockNum + i}`,
        startTime: futureBlockStart,
        endTime: futureBlockEnd,
        totalSlots: TOTAL_SLOTS,
        completedSlots: 0,
        activeSlot: null,
        totalViews: 0,
        status: 'scheduled',
        efficiency: 0
      });
    }
    
    setUpcomingBlocks(upcoming);
  }, [slots, isSystemRunning, TOTAL_SLOTS, BLOCK_DURATION]);

  // Update system metrics
  const updateMetrics = useCallback(() => {
    const totalViews = slots.reduce((sum, slot) => sum + slot.viewCount, 0);
    const totalErrors = slots.filter(slot => slot.status === 'error').length;
    const completedSlots = slots.filter(slot => slot.status === 'completed').length;
    const activeSlot = slots.find(slot => slot.status === 'active');
    
    // Calculate next block time
    const now = new Date();
    const currentBlockEnd = new Date(now);
    currentBlockEnd.setHours(Math.ceil(now.getHours() / 4) * 4, 0, 0, 0);
    const timeToNextBlock = Math.max(0, currentBlockEnd.getTime() - now.getTime());
    const hoursToNext = Math.floor(timeToNextBlock / (1000 * 60 * 60));
    const minutesToNext = Math.floor((timeToNextBlock % (1000 * 60 * 60)) / (1000 * 60));
    
    setMetrics({
      totalViews,
      totalErrors,
      uptime: 99.7, // Mock uptime
      efficiency: Math.round(((completedSlots / TOTAL_SLOTS) * 100)),
      averageViewsPerSlot: completedSlots > 0 ? Math.round(totalViews / completedSlots) : 0,
      currentBlockProgress: (completedSlots / TOTAL_SLOTS) * 100,
      nextBlockIn: `${hoursToNext}h ${minutesToNext}m`,
      syncStatus: Math.random() > 0.95 ? 'syncing' : 'synced'
    });
  }, [slots, TOTAL_SLOTS]);

  // Auto-rotation system
  useEffect(() => {
    if (!isSystemRunning || !autoRefresh) return;

    const interval = setInterval(() => {
      initializeSlots();
    }, 5000); // Update every 5 seconds for demo

    return () => clearInterval(interval);
  }, [isSystemRunning, autoRefresh, initializeSlots]);

  // Initialize data
  useEffect(() => {
    initializeSlots();
  }, [initializeSlots]);

  useEffect(() => {
    initializeBlocks();
    updateMetrics();
  }, [slots, initializeBlocks, updateMetrics]);

  // Control functions
  const handleSystemToggle = () => {
    setIsSystemRunning(!isSystemRunning);
  };

  const handleResetSystem = () => {
    initializeSlots();
    setIsSystemRunning(true);
  };

  const handleSkipSlot = () => {
    if (!isSystemRunning) return;
    
    setSlots(prev => prev.map(slot => 
      slot.status === 'active' 
        ? { ...slot, status: 'skipped', lastUpdate: new Date() }
        : slot
    ));
  };

  const getStatusColor = (status: SlotData['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-400/50';
      case 'completed': return 'text-blue-400 bg-blue-500/20 border-blue-400/50';
      case 'scheduled': return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-400/50';
      case 'skipped': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/50';
    }
  };

  const getCategoryIcon = (category: SlotData['category']) => {
    switch (category) {
      case 'premium': return '👑';
      case 'bidding': return '💰';
      case 'promotional': return '🎯';
      case 'standard': return '📊';
      default: return '📱';
    }
  };

  const getSyncStatusColor = () => {
    switch (metrics.syncStatus) {
      case 'synced': return 'text-green-400';
      case 'syncing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/95 border border-blue-500/30 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">
            BeamerShow Advanced Scheduler
          </h2>
          <p className="text-sm text-gray-400">
            24-Slot System • 4-Hour Blocks • Real-time Analytics • Kardiverse Tech
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`text-sm font-semibold ${getSyncStatusColor()}`}>
            ● {metrics.syncStatus.toUpperCase()}
          </div>
          <div className={`px-3 py-1 rounded-lg border text-sm font-semibold ${
            isSystemRunning 
              ? 'text-green-400 bg-green-500/20 border-green-400/50'
              : 'text-red-400 bg-red-500/20 border-red-400/50'
          }`}>
            {isSystemRunning ? '● RUNNING' : '⏸ PAUSED'}
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'detailed', 'analytics'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              selectedView === view
                ? 'bg-blue-500/30 border border-blue-400/50 text-blue-400'
                : 'bg-gray-500/20 border border-gray-400/50 text-gray-400 hover:bg-gray-500/30'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Block Status */}
            {currentBlock && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-400">
                    {currentBlock.name} - {currentBlock.status.toUpperCase()}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {currentBlock.startTime.toLocaleTimeString()} - {currentBlock.endTime.toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {currentBlock.activeSlot || 'None'}
                    </div>
                    <div className="text-xs text-gray-400">Active Slot</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {currentBlock.completedSlots}/{currentBlock.totalSlots}
                    </div>
                    <div className="text-xs text-gray-400">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {currentBlock.totalViews.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {currentBlock.efficiency}%
                    </div>
                    <div className="text-xs text-gray-400">Efficiency</div>
                  </div>
                </div>

                {/* Block Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentBlock.completedSlots / currentBlock.totalSlots) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{metrics.totalViews.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total Views</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{metrics.totalErrors}</div>
                <div className="text-xs text-gray-400">Errors</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{metrics.uptime}%</div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{metrics.averageViewsPerSlot}</div>
                <div className="text-xs text-gray-400">Avg Views/Slot</div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSystemToggle}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  isSystemRunning
                    ? 'bg-red-500/30 border border-red-400/50 text-red-400 hover:bg-red-500/40'
                    : 'bg-green-500/30 border border-green-400/50 text-green-400 hover:bg-green-500/40'
                }`}
              >
                {isSystemRunning ? '⏸️ Pause System' : '▶️ Start System'}
              </button>
              
              <button
                onClick={handleResetSystem}
                className="px-4 py-2 rounded-lg font-semibold bg-gray-500/20 border border-gray-400/50 text-gray-400 hover:bg-gray-500/30 transition-all duration-200"
              >
                🔄 Reset Block
              </button>

              <button
                onClick={handleSkipSlot}
                disabled={!isSystemRunning}
                className="px-4 py-2 rounded-lg font-semibold bg-blue-500/20 border border-blue-400/50 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                ⏭️ Skip Current
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  autoRefresh
                    ? 'bg-green-500/20 border border-green-400/50 text-green-400'
                    : 'bg-gray-500/20 border border-gray-400/50 text-gray-400'
                }`}
              >
                {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Detailed View */}
      {selectedView === 'detailed' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="detailed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Slot Grid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Current Block Slots</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {slots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    className={`p-3 rounded-lg border ${getStatusColor(slot.status)}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: slot.id * 0.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">#{slot.id}</span>
                      <span className="text-lg">{getCategoryIcon(slot.category)}</span>
                    </div>
                    <div className="text-xs mb-1 truncate font-medium">
                      {slot.sponsorName}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {slot.viewCount.toLocaleString()} views
                    </div>
                    <div className="text-xs text-gray-500">
                      {slot.status === 'active' ? 'LIVE' : slot.status.toUpperCase()}
                    </div>
                    {slot.errorMessage && (
                      <div className="text-xs text-red-400 mt-1">
                        {slot.errorMessage}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Upcoming Blocks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Upcoming Blocks</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingBlocks.map((block) => (
                  <div key={block.blockNumber} className="bg-gray-800/30 border border-gray-600/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-300">{block.name}</span>
                      <span className="text-xs text-gray-400">+{block.blockNumber - (currentBlock?.blockNumber || 1)}h</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {block.startTime.toLocaleTimeString()} - {block.endTime.toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-blue-400">
                      {block.totalSlots} slots scheduled
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Analytics View */}
      {selectedView === 'analytics' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {metrics.efficiency}%
                </div>
                <div className="text-sm text-gray-300">System Efficiency</div>
                <div className="text-xs text-gray-400 mt-1">
                  Target: 95%+
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {metrics.averageViewsPerSlot}
                </div>
                <div className="text-sm text-gray-300">Avg Views/Slot</div>
                <div className="text-xs text-gray-400 mt-1">
                  Last 24 slots
                </div>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {metrics.uptime}%
                </div>
                <div className="text-sm text-gray-300">System Uptime</div>
                <div className="text-xs text-gray-400 mt-1">
                  Last 7 days
                </div>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  &lt;1s
                </div>
                <div className="text-sm text-gray-300">Sync Latency</div>
                <div className="text-xs text-gray-400 mt-1">
                  Beamer ↔ iPad
                </div>
              </div>
            </div>

            {/* Category Performance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Category Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['premium', 'bidding', 'promotional', 'standard'].map((category) => {
                  const categorySlots = slots.filter(slot => slot.category === category);
                  const categoryViews = categorySlots.reduce((sum, slot) => sum + slot.viewCount, 0);
                  const avgViews = categorySlots.length > 0 ? Math.round(categoryViews / categorySlots.length) : 0;
                  
                  return (
                    <div key={category} className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(category as SlotData['category'])}</span>
                        <span className="font-semibold text-gray-300 capitalize">{category}</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {avgViews}
                      </div>
                      <div className="text-xs text-gray-400">
                        Avg views • {categorySlots.length} slots
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">System Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Current Block:</span>
                    <span className="text-blue-400">{currentBlock?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Active Slot:</span>
                    <span className="text-green-400">#{currentBlock?.activeSlot || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Next Block In:</span>
                    <span className="text-yellow-400">{metrics.nextBlockIn}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Total Errors:</span>
                    <span className="text-red-400">{metrics.totalErrors}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Sync Status:</span>
                    <span className={getSyncStatusColor()}>{metrics.syncStatus.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Auto Refresh:</span>
                    <span className={autoRefresh ? 'text-green-400' : 'text-red-400'}>
                      {autoRefresh ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">System Status:</span>
                    <span className={isSystemRunning ? 'text-green-400' : 'text-red-400'}>
                      {isSystemRunning ? 'RUNNING' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Last Update:</span>
                    <span className="text-gray-400">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <div>BeamerShow 24-Slot Scheduler v2.0 • Kardiverse Technologies Ltd. • Real-time sync enabled</div>
          <div>Database: Cloud-hosted • Logging: All interactions tracked • Performance: Optimized for tablets + beamer</div>
        </div>
      </div>
    </div>
  );
};

