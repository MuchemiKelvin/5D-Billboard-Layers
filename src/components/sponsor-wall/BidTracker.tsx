import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Users } from 'lucide-react';

interface BidTrackerProps {
  slotNumber: number;
  currentBid: number;
  startingPrice: number;
  timeRemaining: number;
  totalBids: number;
  topBidder: string;
  status: 'active' | 'ending-soon' | 'ended' | 'reserved';
  className?: string;
}

export const BidTracker: React.FC<BidTrackerProps> = ({
  slotNumber,
  currentBid,
  startingPrice,
  timeRemaining,
  totalBids,
  topBidder,
  status,
  className = ''
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'ending-soon': return 'text-yellow-400';
      case 'ended': return 'text-red-400';
      case 'reserved': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500/10 border-green-500/30';
      case 'ending-soon': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'ended': return 'bg-red-500/10 border-red-500/30';
      case 'reserved': return 'bg-blue-500/10 border-blue-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getProgressPercentage = (): number => {
    const maxTime = 3600; // 1 hour in seconds
    return Math.max(0, Math.min(100, ((maxTime - timeRemaining) / maxTime) * 100));
  };

  return (
    <motion.div
      className={`p-3 rounded-lg border ${getStatusBg(status)} ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-sm font-medium text-gray-300">
            Slot {slotNumber}
          </span>
        </div>
        <span className={`text-xs font-medium ${getStatusColor(status)}`}>
          {status.replace('-', ' ').toUpperCase()}
        </span>
      </div>

      {/* Bid Information */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Current Bid:</span>
          <span className="text-lg font-bold text-white">€{currentBid.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Starting Price:</span>
          <span className="text-sm text-gray-300">€{startingPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Time Remaining */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Time Remaining:</span>
          <span className={`text-sm font-mono ${
            timeRemaining < 300 ? 'text-red-400' : 'text-white'
          }`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <motion.div
            className={`h-1.5 rounded-full ${
              timeRemaining < 300 ? 'bg-red-400' : 'bg-green-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{totalBids} bids</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{topBidder}</span>
        </div>
      </div>

      {/* Urgency Indicator */}
      {timeRemaining < 300 && (
        <motion.div
          className="mt-2 p-2 bg-red-500/20 rounded border border-red-500/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-xs text-red-400 font-medium">
              Ending Soon! Place your bid now!
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}; 