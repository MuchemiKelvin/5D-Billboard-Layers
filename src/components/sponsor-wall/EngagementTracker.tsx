import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Clock, Target, Activity, Eye, Heart, Share2 } from 'lucide-react';

interface EngagementData {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  totalInteractions: number;
  uniqueUsers: number;
  qrScans: number;
  nfcTaps: number;
  contentViews: number;
  contentLikes: number;
  contentShares: number;
  averageSessionTime: number;
  conversionRate: number;
  lastInteraction: Date;
  topInteractions: Array<{
    type: string;
    count: number;
    timestamp: Date;
  }>;
}

interface EngagementTrackerProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyData?: {
    id: string;
    name: string;
    category: string;
    logo: string;
  };
  onEngagementUpdate?: (data: EngagementData) => void;
  className?: string;
}

export const EngagementTracker: React.FC<EngagementTrackerProps> = ({
  slotNumber,
  slotType,
  companyData,
  onEngagementUpdate,
  className = ''
}) => {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [isRealTime, setIsRealTime] = useState(true);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // Initialize engagement data
  useEffect(() => {
    if (companyData) {
      const initialData: EngagementData = {
        slotNumber,
        slotType,
        totalInteractions: Math.floor(Math.random() * 100) + 20,
        uniqueUsers: Math.floor(Math.random() * 50) + 10,
        qrScans: Math.floor(Math.random() * 40) + 15,
        nfcTaps: Math.floor(Math.random() * 30) + 8,
        contentViews: Math.floor(Math.random() * 60) + 25,
        contentLikes: Math.floor(Math.random() * 25) + 5,
        contentShares: Math.floor(Math.random() * 15) + 3,
        averageSessionTime: Math.floor(Math.random() * 300) + 120, // seconds
        conversionRate: Math.random() * 15 + 5, // percentage
        lastInteraction: new Date(),
        topInteractions: [
          { type: 'QR Scan', count: Math.floor(Math.random() * 20) + 10, timestamp: new Date() },
          { type: 'NFC Tap', count: Math.floor(Math.random() * 15) + 8, timestamp: new Date() },
          { type: 'Content View', count: Math.floor(Math.random() * 25) + 15, timestamp: new Date() },
          { type: 'Content Like', count: Math.floor(Math.random() * 10) + 5, timestamp: new Date() }
        ]
      };

      setEngagementData(initialData);
      onEngagementUpdate?.(initialData);
    }
  }, [companyData, slotNumber, slotType, onEngagementUpdate]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime || !engagementData) return;

    const interval = setInterval(() => {
      setEngagementData(prev => {
        if (!prev) return prev;

        const randomIncrement = Math.floor(Math.random() * 3) + 1;
        const updatedData = {
          ...prev,
          totalInteractions: prev.totalInteractions + randomIncrement,
          qrScans: prev.qrScans + (Math.random() > 0.7 ? 1 : 0),
          nfcTaps: prev.nfcTaps + (Math.random() > 0.8 ? 1 : 0),
          contentViews: prev.contentViews + (Math.random() > 0.6 ? 1 : 0),
          lastInteraction: new Date()
        };

        onEngagementUpdate?.(updatedData);
        return updatedData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRealTime, engagementData, onEngagementUpdate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEngagementScore = () => {
    if (!engagementData) return 0;
    const score = (
      (engagementData.qrScans * 0.3) +
      (engagementData.nfcTaps * 0.25) +
      (engagementData.contentViews * 0.2) +
      (engagementData.contentLikes * 0.15) +
      (engagementData.contentShares * 0.1)
    );
    return Math.min(100, Math.round(score));
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (!engagementData) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            Engagement Analytics
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRealTime(!isRealTime)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isRealTime 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {isRealTime ? 'Live' : 'Static'}
          </button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
            className="px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
      </div>

      {/* Engagement Score */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {getEngagementScore()}
          </div>
          <div className={`text-lg font-medium mb-1 ${getEngagementColor(getEngagementScore())}`}>
            {getEngagementLevel(getEngagementScore())}
          </div>
          <div className="text-sm text-gray-400">Engagement Score</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{engagementData.uniqueUsers}</div>
          <div className="text-xs text-gray-400">Unique Users</div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{engagementData.totalInteractions}</div>
          <div className="text-xs text-gray-400">Total Interactions</div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(engagementData.averageSessionTime)}</div>
          <div className="text-xs text-gray-400">Avg Session</div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{engagementData.conversionRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Conversion</div>
        </div>
      </div>

      {/* Interaction Breakdown */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-white mb-4">Interaction Breakdown</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">QR Scans</span>
            </div>
            <span className="text-white font-medium">{engagementData.qrScans}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">NFC Taps</span>
            </div>
            <span className="text-white font-medium">{engagementData.nfcTaps}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Content Views</span>
            </div>
            <span className="text-white font-medium">{engagementData.contentViews}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">Content Likes</span>
            </div>
            <span className="text-white font-medium">{engagementData.contentLikes}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Content Shares</span>
            </div>
            <span className="text-white font-medium">{engagementData.contentShares}</span>
          </div>
        </div>
      </div>

      {/* Top Interactions */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-white mb-4">Top Interactions</h4>
        <div className="space-y-2">
          {engagementData.topInteractions.map((interaction, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">#{index + 1}</span>
                <span className="text-gray-300">{interaction.type}</span>
              </div>
              <span className="text-white font-medium">{interaction.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Last Interaction */}
      <div className="text-center text-sm text-gray-400">
        Last interaction: {engagementData.lastInteraction.toLocaleTimeString()}
      </div>

      {/* Detailed Stats Toggle */}
      <button
        onClick={() => setShowDetailedStats(!showDetailedStats)}
        className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {showDetailedStats ? 'Hide' : 'Show'} Detailed Statistics
      </button>

      {/* Detailed Statistics */}
      {showDetailedStats && (
        <motion.div
          className="mt-4 p-4 bg-gray-700/30 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4 className="font-semibold text-white mb-3">Advanced Analytics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Engagement Rate:</span>
              <span className="text-white ml-2">
                {((engagementData.totalInteractions / Math.max(engagementData.uniqueUsers, 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">Content Engagement:</span>
              <span className="text-white ml-2">
                {((engagementData.contentLikes + engagementData.contentShares) / Math.max(engagementData.contentViews, 1) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">QR vs NFC Ratio:</span>
              <span className="text-white ml-2">
                {(engagementData.qrScans / Math.max(engagementData.nfcTaps, 1)).toFixed(2)}:1
              </span>
            </div>
            <div>
              <span className="text-gray-400">Session Quality:</span>
              <span className="text-white ml-2">
                {engagementData.averageSessionTime > 180 ? 'High' : engagementData.averageSessionTime > 60 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}; 