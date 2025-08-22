import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Gavel, Bell, DollarSign, Clock, Users, BarChart3, Lock, BarChart3 as Analytics } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { NFCTrigger } from './NFCTrigger';
import { HiddenContentSystem } from './HiddenContentSystem';
import { EngagementTracker } from './EngagementTracker';
import { AuctionTimer } from './AuctionTimer';

export const SponsorWallDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'recent-bids' | 'slot-status' | 'interactive'>('overview');
  const [auctionData] = useState({
    totalValue: 3628000,
    activeAuctions: 17,
    newBids: 10,
    avgBid: 100920,
    totalSlots: 24,
    premiumSlots: 8,
    standardSlots: 16,
    companiesParticipating: 35
  });

  // Mock data for recent bids
  const recentBids = [
    { id: 1, company: 'Equity Bank', slot: 9, amount: 500000, time: '2 min ago', status: 'active' },
    { id: 2, company: 'Safaricom', slot: 8, amount: 150000, time: '5 min ago', status: 'active' },
    { id: 3, company: 'KCB Bank', slot: 1, amount: 75000, time: '8 min ago', status: 'outbid' },
    { id: 4, company: 'Co-operative Bank', slot: 13, amount: 72000, time: '12 min ago', status: 'active' },
    { id: 5, company: 'Absa Bank', slot: 5, amount: 90000, time: '15 min ago', status: 'active' },
    { id: 6, company: 'Standard Chartered', slot: 24, amount: 95000, time: '18 min ago', status: 'active' }
  ];

  // Mock data for slot status
  const slotStatus = [
    { slot: 1, company: 'KCB Bank', currentBid: 75000, timeRemaining: '1h 2m', status: 'active', totalBids: 3 },
    { slot: 2, company: 'Co-operative Bank', currentBid: 65000, timeRemaining: '45m', status: 'active', totalBids: 2 },
    { slot: 3, company: 'Absa Bank', currentBid: 80000, timeRemaining: '30m', status: 'active', totalBids: 4 },
    { slot: 4, company: 'Standard Chartered', currentBid: 70000, timeRemaining: '1h 15m', status: 'active', totalBids: 2 },
    { slot: 5, company: 'NCBA Bank', currentBid: 90000, timeRemaining: '53m', status: 'active', totalBids: 5 },
    { slot: 6, company: 'Diamond Trust Bank', currentBid: 60000, timeRemaining: '1h 30m', status: 'active', totalBids: 1 },
    { slot: 7, company: 'I&M Bank', currentBid: 85000, timeRemaining: '35m', status: 'active', totalBids: 3 },
    { slot: 8, company: 'Safaricom', currentBid: 150000, timeRemaining: '10m', status: 'ending-soon', totalBids: 8 },
    { slot: 9, company: 'Equity Bank', currentBid: 500000, timeRemaining: '0m', status: 'reserved', totalBids: 0 },
    { slot: 13, company: 'Family Bank', currentBid: 72000, timeRemaining: '1h 5m', status: 'active', totalBids: 2 },
    { slot: 14, company: 'Prime Bank', currentBid: 68000, timeRemaining: '40m', status: 'active', totalBids: 3 },
    { slot: 15, company: 'Consolidated Bank', currentBid: 78000, timeRemaining: '1h 20m', status: 'active', totalBids: 1 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const topCompanies = [
    { name: 'Equity Bank', value: 150000 },
    { name: 'Safaricom', value: 150000 },
    { name: 'KCB Bank', value: 150000 },
    { name: 'Co-operative Bank', value: 150000 },
    { name: 'Absa Bank', value: 150000 },
    { name: 'Standard Chartered', value: 150000 }
  ];

  // Convert KES to EUR (approximate rate: 1 EUR = 150 KES)
  const convertToEUR = (kes: number) => (kes / 150).toFixed(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold text-blue-400 mb-4">
          Live Auction Feed
        </h2>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
          5D SPONSOR WALL — 24 SLOTS
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
          Single Wall • 24 Slots + Main Sponsor • 4K Beamer Ready
        </p>
        
        {/* Status Bar - Exact copy from SponsorGrid */}
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
                <span className="text-red-400">Layer 5: Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                <span className="text-cyan-400">Auto-Rotation: ON</span>
              </div>
              <button className="px-4 py-2 rounded-lg font-medium transition-all bg-green-600 hover:bg-green-500 text-white">
                Pause
              </button>
            </div>
          </div>

          {/* Cycle Information */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Cycle:</span>
                <span className="text-white font-mono text-lg">4/4</span>
                <span className="text-gray-400">Time:</span>
                <span className="text-white font-mono text-lg">12s</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400">Active Slots:</span>
                <span className="text-white font-mono ml-2">10/24</span>
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
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            EUR {convertToEUR(auctionData.totalValue)}
          </div>
          <div className="text-gray-400">Total Auction Value</div>
        </motion.div>

        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Gavel className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {auctionData.activeAuctions}
          </div>
          <div className="text-gray-400">Active Auctions</div>
        </motion.div>

        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {auctionData.newBids}
          </div>
          <div className="text-gray-400">New Bids</div>
        </motion.div>

        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            EUR {convertToEUR(auctionData.avgBid)}
          </div>
          <div className="text-gray-400">Avg Bid</div>
        </motion.div>
      </motion.div>

      {/* Content Tabs */}
      <motion.div 
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.div 
          className="flex flex-wrap gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Overview
          </motion.button>
          <motion.button 
            onClick={() => setActiveTab('recent-bids')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'recent-bids' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Recent Bids
          </motion.button>
          <motion.button 
            onClick={() => setActiveTab('slot-status')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'slot-status' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Slot Status
          </motion.button>
          <motion.button 
            onClick={() => setActiveTab('interactive')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'interactive' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Interactive Layer
          </motion.button>
        </motion.div>

        {/* Overview Content */}
        {activeTab === 'overview' && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Auction Summary */}
            <motion.div
              className="bg-gray-700/50 rounded-lg p-6"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Auction Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Slots:</span>
                  <span className="font-semibold">{auctionData.totalSlots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Premium Slots:</span>
                  <span className="font-semibold text-blue-400">{auctionData.premiumSlots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Standard Slots:</span>
                  <span className="font-semibold text-gray-400">{auctionData.standardSlots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Companies Participating:</span>
                  <span className="font-semibold text-green-400">{auctionData.companiesParticipating}</span>
                </div>
              </div>
            </motion.div>

            {/* Top Performing Companies */}
            <motion.div
              className="bg-gray-700/50 rounded-lg p-6"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Top Performing Companies
              </h3>
              <div className="space-y-3">
                {topCompanies.map((company, index) => (
                  <motion.div 
                    key={index} 
                    className="flex justify-between items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  >
                    <span className="text-gray-300">{company.name}</span>
                    <span className="font-semibold text-green-400">
                      EUR {company.value.toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Recent Bids Content */}
        {activeTab === 'recent-bids' && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-400" />
              Recent Bids
            </h3>
            {recentBids.map((bid, index) => (
              <motion.div 
                key={bid.id} 
                className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-blue-500"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 font-bold">{bid.company.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{bid.company}</div>
                      <div className="text-sm text-gray-400">Slot {bid.slot}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">EUR {bid.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{bid.time}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    bid.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {bid.status === 'active' ? 'Active' : 'Outbid'}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Slot Status Content */}
        {activeTab === 'slot-status' && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Slot Status Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slotStatus.map((slot, index) => (
                <motion.div 
                  key={slot.slot} 
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">Slot {slot.slot}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      slot.status === 'active' 
                        ? 'bg-green-500/20 text-green-400'
                        : slot.status === 'ending-soon'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {slot.status === 'active' ? 'Active' : slot.status === 'ending-soon' ? 'Ending Soon' : 'Reserved'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Company:</span>
                      <span className="text-white">{slot.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Bid:</span>
                      <span className="text-green-400 font-semibold">EUR {slot.currentBid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Left:</span>
                      <span className={`font-semibold ${
                        slot.status === 'ending-soon' ? 'text-yellow-400' : 'text-white'
                      }`}>
                        {slot.timeRemaining}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Bids:</span>
                      <span className="text-white">{slot.totalBids}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Interactive Layer Content */}
        {activeTab === 'interactive' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <Lock className="w-8 h-8 text-purple-400" />
                Interactive Layer
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Generate QR codes, enable NFC interactions, unlock hidden content, and track engagement analytics for each slot
              </p>
            </motion.div>

            {/* Interactive Components Grid */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* QR Code Generator */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <QRCodeGenerator
                  slotNumber={9}
                  slotType="main-sponsor"
                  companyData={{
                    id: "COMP-001",
                    name: "Equity Bank",
                    category: "Banking",
                    logo: "/equity-bank-logo.png"
                  }}
                  currentBid={500000}
                  reservePrice={300000}
                  onQRGenerated={(qrData) => console.log('QR Generated:', qrData)}
                />
              </motion.div>

              {/* NFC Trigger */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <NFCTrigger
                  slotNumber={9}
                  slotType="main-sponsor"
                  companyData={{
                    id: "COMP-001",
                    name: "Equity Bank",
                    category: "Banking",
                    logo: "/equity-bank-logo.png"
                  }}
                  onNFCTriggered={(nfcData) => console.log('NFC Triggered:', nfcData)}
                />
              </motion.div>

              {/* Hidden Content System */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <HiddenContentSystem
                  slotNumber={9}
                  slotType="main-sponsor"
                  companyData={{
                    id: "COMP-001",
                    name: "Equity Bank",
                    category: "Banking",
                    logo: "/equity-bank-logo.png"
                  }}
                  onContentUnlocked={(content) => console.log('Content Unlocked:', content)}
                />
              </motion.div>

              {/* Engagement Tracker */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <EngagementTracker
                  slotNumber={9}
                  slotType="main-sponsor"
                  companyData={{
                    id: "COMP-001",
                    name: "Equity Bank",
                    category: "Banking",
                    logo: "/equity-bank-logo.png"
                  }}
                  onEngagementUpdate={(data) => console.log('Engagement Updated:', data)}
                />
              </motion.div>
            </motion.div>

            {/* Additional Interactive Features */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Auction Timer */}
              <motion.div 
                className="col-span-1"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <AuctionTimer
                  slotNumber={9}
                  initialTime={3600} // 1 hour
                  onTimeUp={() => console.log('Auction time up for slot 9')}
                />
              </motion.div>

              {/* Interactive Stats */}
              <motion.div 
                className="col-span-2 bg-gray-700/50 rounded-lg p-6"
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Analytics className="w-5 h-5 text-blue-400" />
                  Interactive Layer Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { value: 24, label: 'Active Slots', color: 'text-green-400' },
                    { value: 156, label: 'QR Scans', color: 'text-blue-400' },
                    { value: 89, label: 'NFC Taps', color: 'text-purple-400' },
                    { value: 67, label: 'Content Unlocks', color: 'text-yellow-400' }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center text-gray-400 border-t border-gray-700 pt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last updated: {currentTime.toLocaleTimeString()}</span>
          </div>
          <span>Real-time data from 5D+ Beamer companies</span>
        </div>
        <div className="text-sm">
          <p className="mb-2">Kardiverse™ 5D/24D • Add-on: Hologram +€10K • Live Bidding +€15k • NFC/QR enabled</p>
        </div>
      </motion.div>
    </div>
  );
}; 