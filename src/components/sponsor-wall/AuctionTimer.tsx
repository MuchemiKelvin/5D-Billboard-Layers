import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AuctionTimerProps {
  slotNumber: number;
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  className?: string;
}

export const AuctionTimer: React.FC<AuctionTimerProps> = ({
  slotNumber,
  initialTime,
  onTimeUp,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeRemaining, onTimeUp]);

  // Show warning when time is running low
  useEffect(() => {
    if (timeRemaining <= 300 && timeRemaining > 0) { // 5 minutes or less
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    if (timeRemaining <= 60) return 'text-red-400';
    if (timeRemaining <= 300) return 'text-yellow-400';
    if (timeRemaining <= 600) return 'text-orange-400';
    return 'text-green-400';
  };

  const getProgressPercentage = (): number => {
    return Math.max(0, Math.min(100, ((initialTime - timeRemaining) / initialTime) * 100));
  };

  const getStatusIcon = () => {
    if (timeRemaining <= 0) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (timeRemaining <= 60) return <XCircle className="w-4 h-4 text-red-400" />;
    if (timeRemaining <= 300) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <Clock className="w-4 h-4 text-blue-400" />;
  };

  const getStatusText = (): string => {
    if (timeRemaining <= 0) return 'Auction Ended';
    if (timeRemaining <= 60) return 'Final Minute!';
    if (timeRemaining <= 300) return 'Ending Soon';
    if (timeRemaining <= 600) return 'Active';
    return 'Active';
  };

  const getStatusColor = (): string => {
    if (timeRemaining <= 0) return 'text-green-400';
    if (timeRemaining <= 60) return 'text-red-400';
    if (timeRemaining <= 300) return 'text-yellow-400';
    if (timeRemaining <= 600) return 'text-orange-400';
    return 'text-blue-400';
  };

  const getProgressColor = (): string => {
    if (timeRemaining <= 60) return 'bg-red-400';
    if (timeRemaining <= 300) return 'bg-yellow-400';
    if (timeRemaining <= 600) return 'bg-orange-400';
    return 'bg-green-400';
  };

  return (
    <motion.div
      className={`p-3 rounded-lg border border-gray-700 bg-gray-800/50 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-300">
            Slot {slotNumber}
          </span>
        </div>
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-3">
        <motion.div
          className={`text-2xl font-mono font-bold ${getTimeColor()}`}
          key={timeRemaining}
          initial={{ scale: 1.2, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatTime(timeRemaining)}
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 mb-3">
        <motion.button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            isPaused
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </motion.button>
        
        <motion.button
          onClick={() => setTimeRemaining(initialTime)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      </div>

      {/* Warning Message */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            className="p-2 bg-red-500/20 rounded border border-red-500/30"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">
                {timeRemaining <= 60 
                  ? 'Final minute! Place your bid now!' 
                  : 'Auction ending soon!'
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Up Message */}
      <AnimatePresence>
        {timeRemaining <= 0 && (
          <motion.div
            className="p-2 bg-green-500/20 rounded border border-green-500/30"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                Auction has ended! Winner will be announced shortly.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 