import React from 'react';
import { motion } from 'framer-motion';
import { SponsorGrid } from './SponsorGrid';
import { SponsorWallDashboard } from './LiveAuctionFeed';
import { BeamerSlotScheduler } from '../beamer/SlotScheduler';
import { AdvancedScheduler } from '../beamer/AdvancedScheduler';
import { SyncManager } from '../beamer/SyncManager';
import { AnalyticsDashboard } from '../beamer/AnalyticsDashboard';
import { HologramControls } from '../beamer/HologramControls';
import { ARControls } from '../beamer/ARLayer';
import { useState } from 'react';
import { useLayerContext } from '../../contexts/LayerContext';

interface SponsorWallProps {
  className?: string;
}

export const SponsorWall: React.FC<SponsorWallProps> = ({ className = '' }) => {
  const [showAuctionFeed, setShowAuctionFeed] = useState(false);
  const { toggleLayer, openModal, navigateToLayer, layers } = useLayerContext();

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
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white ${className}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern - matches mockup */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-900/40 to-blue-900/40"></div>
        
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
              BeamerShow 24-Slot System
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              5D Beamer Demo (AR/AI/Hologram) • Kardiverse Technologies Ltd.
            </motion.p>
            
            {/* BeamerShow Layer Status - L1-L3 */}
            <motion.div 
              className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 border border-gray-400/30 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${layers['layer-1-static']?.isActive ? 'bg-green-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-green-400 text-sm font-medium">L1: Static Logos</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${layers['layer-2-hologram']?.isActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={`text-sm font-medium ${layers['layer-2-hologram']?.isActive ? 'text-blue-400' : 'text-gray-500'}`}>L2: Hologram FX</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${layers['layer-3-ar']?.isActive ? 'bg-purple-400 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={`text-sm font-medium ${layers['layer-3-ar']?.isActive ? 'text-purple-400' : 'text-gray-500'}`}>L3: AR Effects</span>
              </div>
            </motion.div>

            {/* Layer Control Buttons */}
            <motion.div 
              className="mt-6 flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <button
                className={`px-4 py-2 border rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                  layers['layer-1-static']?.isActive 
                    ? 'bg-green-500/40 border-green-400/50' 
                    : 'bg-green-500/20 border-green-400/30'
                }`}
                title="Layer 1: Static Sponsor Logos (Always Active)"
                onClick={() => {
                  navigateToLayer('layer-1-static');
                }}
              >
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-green-300 text-sm font-medium">L1: Static</span>
              </button>

              <button
                className={`px-4 py-2 border rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                  layers['layer-2-hologram']?.isActive 
                    ? 'bg-blue-500/40 border-blue-400/50' 
                    : 'bg-blue-500/20 border-blue-400/30'
                }`}
                title="Layer 2: Hologram Effects (Glowing, Spinning, Light Reflections)"
                onClick={() => {
                  toggleLayer('layer-2-hologram');
                  navigateToLayer('layer-2-hologram');
                }}
              >
                <div className={`w-2 h-2 rounded-full ${layers['layer-2-hologram']?.isActive ? 'bg-blue-400 animate-pulse' : 'bg-blue-400'}`}></div>
                <span className="text-blue-300 text-sm font-medium">L2: Hologram</span>
              </button>

              <button
                className={`px-4 py-2 border rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                  layers['layer-3-ar']?.isActive 
                    ? 'bg-purple-500/40 border-purple-400/50' 
                    : 'bg-purple-500/20 border-purple-400/30'
                }`}
                title="Layer 3: AR Effects (QR/NFC Triggered, 4x Daily Rotation)"
                onClick={() => {
                  toggleLayer('layer-3-ar');
                  navigateToLayer('layer-3-ar');
                }}
              >
                <div className={`w-2 h-2 rounded-full ${layers['layer-3-ar']?.isActive ? 'bg-purple-400 animate-pulse' : 'bg-purple-400'}`}></div>
                <span className="text-purple-300 text-sm font-medium">L3: AR</span>
              </button>

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

              <button
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                onClick={() => openModal('global-settings')}
              >
                ⚙️ Global Settings
              </button>

              <button
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                onClick={() => openModal('analytics')}
              >
                📈 Analytics
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* BeamerShow Controls - All Layers */}
      <div className="container mx-auto px-2 sm:px-4 mb-8">
        {/* Advanced 24-Slot Scheduler */}
        <div className="mb-6">
          <AdvancedScheduler />
        </div>
        
        {/* Sync Manager - Beamer + iPad Connectivity */}
        <div className="mb-6">
          <SyncManager />
        </div>
        
        {/* Analytics Dashboard - Views/Scans/AR Logging */}
        <div className="mb-6">
          <AnalyticsDashboard />
        </div>
        
        {/* Layer Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HologramControls />
          <ARControls />
        </div>
      </div>

      {/* Main Grid */}
      <div className="container mx-auto px-2 sm:px-4 pb-6 sm:pb-8">
        <SponsorGrid />
      </div>
    </div>
  );
};