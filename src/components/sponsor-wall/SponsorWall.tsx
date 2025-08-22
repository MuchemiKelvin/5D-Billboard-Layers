import React from 'react';
import { motion } from 'framer-motion';
import { SponsorGrid } from './SponsorGrid';
import { SponsorWallDashboard } from './LiveAuctionFeed';
import { useState } from 'react';

interface SponsorWallProps {
  className?: string;
}

export const SponsorWall: React.FC<SponsorWallProps> = ({ className = '' }) => {
  const [showAuctionFeed, setShowAuctionFeed] = useState(false);

  if (showAuctionFeed) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Back to Sponsor Wall Button */}
          <motion.button
            onClick={() => setShowAuctionFeed(false)}
            className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Sponsor Wall
          </motion.button>
          
          <SponsorWallDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${className}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-green-900/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
              5D Sponsor Wall
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Advanced digital advertising platform with holographic effects, interactive content, and real-time auction management
            </motion.p>
            
            {/* Layer Status Indicator */}
            <motion.div 
              className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-500/20 via-blue-500/20 via-purple-500/20 via-orange-500/20 to-red-500/20 border border-green-400/30 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Layer 1: Base Grid</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">Layer 2: Content Animation</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 text-sm font-medium">Layer 3: Hologram FX</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-orange-400 text-sm font-medium">Layer 4: Interactive</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">Layer 5: Live Auction</span>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div 
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <button
                onClick={() => setShowAuctionFeed(true)}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                📊 View Live Auction Feed
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container mx-auto px-2 sm:px-4 pb-6 sm:pb-8">
        <SponsorGrid />
      </div>
    </div>
  );
};