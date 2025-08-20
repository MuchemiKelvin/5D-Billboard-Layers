import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Smartphone, X, ExternalLink, Gift, Eye, Gavel } from 'lucide-react';
import { type Company } from '../../data/dataService';

interface InteractiveContent {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface InteractiveLayerProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  company?: Company | null;
  className?: string;
}

export const InteractiveLayer: React.FC<InteractiveLayerProps> = ({
  slotNumber,
  slotType,
  company,
  className = ''
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showNFC, setShowNFC] = useState(false);
  const [selectedContent, setSelectedContent] = useState<InteractiveContent | null>(null);

  // Generate content based on slot type and company
  const generateContent = (): InteractiveContent[] => {
    const baseContent = [
      {
        id: 'offer-1',
        type: 'offer',
        title: 'Special Discount',
        description: 'Limited time offer for premium advertising slots',
        icon: Gift,
        color: 'from-green-500 to-emerald-600'
      },
      {
        id: 'hidden-1',
        type: 'hidden-content',
        title: 'Exclusive Content',
        description: 'Premium sponsor materials and digital assets',
        icon: Eye,
        color: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'bid-1',
        type: 'bid-participation',
        title: 'Bid Now',
        description: 'Participate in live auction for this slot',
        icon: Gavel,
        color: 'from-purple-500 to-pink-600'
      }
    ];

    // Add company-specific content if available
    if (company) {
      baseContent.unshift({
        id: 'company-info',
        type: 'company-info',
        title: company.name,
        description: `${company.industry} • ${company.category}`,
        icon: ExternalLink,
        color: 'from-orange-500 to-red-600'
      });
    }

    return baseContent;
  };

  const content: InteractiveContent[] = generateContent();

  const generateQRData = () => {
    const data = {
      slot: slotNumber,
      type: slotType,
      company: company ? {
        id: company.id,
        name: company.name,
        category: company.category,
        tier: company.tier
      } : null,
      timestamp: new Date().toLocaleString(),
      content: content.map(c => ({
        id: c.id,
        type: c.type,
        title: c.title,
        description: c.description.substring(0, 50) + '...'
      }))
    };
    return JSON.stringify(data, null, 2);
  };

  const handleContentSelect = (item: InteractiveContent) => {
    setSelectedContent(item);
    setShowQR(false);
    setShowNFC(false);
  };

  const handleNFC = () => {
    setShowNFC(true);
    setShowQR(false);
    setSelectedContent(null);
  };

  const handleQR = () => {
    setShowQR(true);
    setShowNFC(false);
    setSelectedContent(null);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setShowQR(false);
    setShowNFC(false);
    setSelectedContent(null);
  };

  return (
    <>
      {/* Interactive Trigger Buttons */}
      <div className={`absolute top-4 right-2 flex gap-2 ${className}`}>
        <button
          onClick={handleQR}
          className="p-2 bg-blue-600/80 hover:bg-blue-500/90 rounded-lg transition-all duration-200 hover:scale-110"
          title="Scan QR Code"
        >
          <QrCode className="w-3.5 h-3.5 text-white" />
        </button>
        <button
          onClick={handleNFC}
          className="p-2 bg-green-600/80 hover:bg-green-500/90 rounded-lg transition-all duration-200 hover:scale-110"
          title="Tap NFC"
        >
          <Smartphone className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Main Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOverlay}
          >
            <motion.div
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {company ? `${company.name} - Slot ${slotNumber}` : `Slot ${slotNumber}`}
                </h3>
                <button
                  onClick={closeOverlay}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Company Info Section */}
              {company && (
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={company.logo} 
                      alt={`${company.name} logo`}
                      className="w-12 h-12 object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-white">{company.name}</h4>
                      <p className="text-sm text-gray-400">{company.industry} • {company.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{company.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span>Founded: {company.founded}</span>
                    <span>HQ: {company.headquarters}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      company.tier === 'premium' 
                        ? 'bg-purple-600/20 text-purple-400' 
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {company.tier.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* QR Code Section */}
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h4 className="text-lg font-semibold text-white mb-4">Scan QR Code</h4>
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <QrCode className="w-32 h-32 text-black" />
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg max-w-lg mx-auto">
                    <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words leading-relaxed text-left">
                      {generateQRData()}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* NFC Section */}
              {showNFC && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h4 className="text-lg font-semibold text-white mb-4">NFC Interaction</h4>
                  <div className="bg-green-500/20 p-4 rounded-lg mb-4">
                    <Smartphone className="w-16 h-16 text-green-400 mx-auto mb-3" />
                    <p className="text-sm text-green-400 mb-2">Tap your smartphone</p>
                    <div className="animate-pulse">
                      <div className="w-4 h-4 bg-green-400 rounded-full mx-auto"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Hold your device near this slot to unlock exclusive content
                  </p>
                </motion.div>
              )}

              {/* Content Selection */}
              {!showQR && !showNFC && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h4 className="text-lg font-semibold text-white mb-4">Available Content</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {content.map((item) => (
                      <motion.div
                        key={item.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                          selectedContent?.id === item.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleContentSelect(item)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-medium text-white truncate">{item.title}</h5>
                            <p className="text-sm text-gray-400 truncate">{item.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Selected Content Details */}
                  {selectedContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <h5 className="font-semibold text-white mb-2">{selectedContent.title}</h5>
                      <p className="text-sm text-gray-300 mb-3">{selectedContent.description}</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white transition-colors">
                          View Details
                        </button>
                        <button className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white transition-colors">
                          Learn More
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  {company ? `Interactive content for ${company.name}` : `Slot ${slotNumber} interactive features`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 