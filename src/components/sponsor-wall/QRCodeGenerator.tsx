import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Share2, Smartphone } from 'lucide-react';

interface QRCodeData {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyId?: string;
  companyName?: string;
  currentBid?: number;
  reservePrice?: number;
  timestamp: number;
  uniqueId: string;
}

interface QRCodeGeneratorProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyData?: {
    id: string;
    name: string;
    category: string;
    logo: string;
  };
  currentBid?: number;
  reservePrice?: number;
  onQRGenerated?: (qrData: QRCodeData) => void;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  slotNumber,
  slotType,
  companyData,
  currentBid,
  reservePrice,
  onQRGenerated,
  className = ''
}) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [engagementStats, setEngagementStats] = useState({
    scans: 0,
    lastScan: null as Date | null,
    uniqueUsers: 0
  });

  // Generate unique QR code data
  const generateQRData = useCallback(() => {
    setIsGenerating(true);
    
    const uniqueId = `SLOT-${slotNumber.toString().padStart(3, '0')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const data: QRCodeData = {
      slotNumber,
      slotType,
      companyId: companyData?.id,
      companyName: companyData?.name,
      currentBid,
      reservePrice,
      timestamp: Date.now(),
      uniqueId
    };

    setQrData(data);
    onQRGenerated?.(data);
    
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowQR(true);
    }, 1000);
  }, [slotNumber, slotType, companyData, currentBid, reservePrice, onQRGenerated]);

  // Simulate QR code scan
  const simulateScan = () => {
    setEngagementStats(prev => ({
      scans: prev.scans + 1,
      lastScan: new Date(),
      uniqueUsers: prev.uniqueUsers + Math.floor(Math.random() * 3) + 1
    }));
  };

  // Download QR code as image
  const downloadQR = () => {
    // In a real implementation, this would generate and download the actual QR code image
    console.log('Downloading QR code for slot', slotNumber);
  };

  // Share QR code
  const shareQR = async () => {
    if (navigator.share && qrData) {
      try {
        await navigator.share({
          title: `Slot ${slotNumber} QR Code`,
          text: `Scan this QR code for slot ${slotNumber} details`,
          url: `https://5d-sponsor-wall.com/slot/${slotNumber}/qr/${qrData.uniqueId}`
        });
      } catch {
        console.log('Share cancelled or failed');
      }
    }
  };

  // Generate QR code on mount if company data is available
  useEffect(() => {
    if (companyData && !qrData) {
      generateQRData();
    }
  }, [companyData, qrData, generateQRData]);

  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">
            Slot {slotNumber} QR Code
          </h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          slotType === 'main-sponsor' ? 'bg-blue-500/20 text-blue-400' :
          slotType === 'live-bidding' ? 'bg-green-500/20 text-green-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {slotType.replace('-', ' ').toUpperCase()}
        </span>
      </div>

      {/* QR Code Display */}
      {!showQR ? (
        <div className="text-center py-8">
          {isGenerating ? (
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Generating QR Code...</p>
            </motion.div>
          ) : (
            <motion.button
              onClick={generateQRData}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <QrCode className="w-5 h-5" />
              Generate QR Code
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* QR Code Placeholder */}
          <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-800 mx-auto mb-2" />
              <div className="text-xs text-gray-600 font-mono">
                SLOT-{slotNumber.toString().padStart(3, '0')}
              </div>
              <div className="text-xs text-gray-500">
                {companyData?.name || 'Available'}
              </div>
            </div>
          </div>

          {/* QR Code Info */}
          <div className="text-left bg-gray-700/50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Slot:</span>
                <span className="text-white ml-2">{slotNumber}</span>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="text-white ml-2">{slotType.replace('-', ' ')}</span>
              </div>
              {companyData && (
                <>
                  <div>
                    <span className="text-gray-400">Company:</span>
                    <span className="text-white ml-2">{companyData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white ml-2">{companyData.category}</span>
                  </div>
                </>
              )}
              {currentBid && (
                <div>
                  <span className="text-gray-400">Current Bid:</span>
                  <span className="text-green-400 ml-2">€{(currentBid / 150).toFixed(0)}</span>
                </div>
              )}
              {reservePrice && (
                <div>
                  <span className="text-gray-400">Reserve:</span>
                  <span className="text-yellow-400 ml-2">€{(reservePrice / 150).toFixed(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center mb-4">
            <motion.button
              onClick={downloadQR}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            
            <motion.button
              onClick={shareQR}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>

          {/* Engagement Stats */}
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Engagement Stats</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="text-white font-semibold">{engagementStats.scans}</div>
                <div className="text-gray-400">Scans</div>
              </div>
              <div>
                <div className="text-white font-semibold">{engagementStats.uniqueUsers}</div>
                <div className="text-gray-400">Users</div>
              </div>
              <div>
                <div className="text-white font-semibold">
                  {engagementStats.lastScan ? 
                    new Date(engagementStats.lastScan).toLocaleTimeString() : 
                    'Never'
                  }
                </div>
                <div className="text-gray-400">Last Scan</div>
              </div>
            </div>
          </div>

          {/* Test Scan Button */}
          <motion.button
            onClick={simulateScan}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Simulate Scan
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}; 