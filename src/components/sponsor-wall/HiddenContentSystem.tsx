import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Lock, Unlock, Eye, Share, Heart, Zap } from 'lucide-react';

interface HiddenContent {
  id: string;
  type: 'offer' | 'hidden-content' | 'bid-participation' | 'special-deal';
  title: string;
  description: string;
  value: string;
  isUnlocked: boolean;
  unlockRequirement: string;
  expiresAt: Date;
  views: number;
  likes: number;
}

interface HiddenContentSystemProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyData?: {
    id: string;
    name: string;
    category: string;
    logo: string;
  };
  onContentUnlocked?: (content: HiddenContent) => void;
  className?: string;
}

export const HiddenContentSystem: React.FC<HiddenContentSystemProps> = ({
  slotNumber,
  companyData,
  className = ''
}) => {
  const [hiddenContents, setHiddenContents] = useState<HiddenContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<HiddenContent | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);



  // Generate hidden content for the slot
  useEffect(() => {
    if (companyData) {
      const contents: HiddenContent[] = [
        {
          id: `offer-${slotNumber}-1`,
          type: 'offer',
          title: 'Exclusive Sponsor Offer',
          description: 'Special discount on premium services for slot viewers',
          value: '€500 value',
          isUnlocked: false,
          unlockRequirement: 'Scan QR code or tap NFC',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          views: 0,
          likes: 0
        },
        {
          id: `hidden-${slotNumber}-1`,
          type: 'hidden-content',
          title: 'Behind the Scenes',
          description: 'Exclusive content about the company and their vision',
          value: 'Premium content',
          isUnlocked: false,
          unlockRequirement: 'Complete engagement survey',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          views: 0,
          likes: 0
        },
        {
          id: `bid-${slotNumber}-1`,
          type: 'bid-participation',
          title: 'Bid Participation Bonus',
          description: 'Special rewards for active bidders on this slot',
          value: '€200 bonus',
          isUnlocked: false,
          unlockRequirement: 'Place a bid on this slot',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          views: 0,
          likes: 0
        },
        {
          id: `special-${slotNumber}-1`,
          type: 'special-deal',
          title: 'Weekend Special',
          description: 'Limited time weekend promotion for slot viewers',
          value: '€300 savings',
          isUnlocked: false,
          unlockRequirement: 'Visit during weekend hours',
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          views: 0,
          likes: 0
        }
      ];

      setHiddenContents(contents);
    }
  }, [companyData, slotNumber]);



  // Like content
  const likeContent = (contentId: string) => {
    setHiddenContents(prev => 
      prev.map(c => c.id === contentId ? { ...c, likes: c.likes + 1 } : c)
    );
  };

  // View content
  const viewContent = (content: HiddenContent) => {
    if (content.isUnlocked) {
      setSelectedContent(content);
      setHiddenContents(prev => 
        prev.map(c => c.id === content.id ? { ...c, views: c.views + 1 } : c)
      );
    } else {
      setShowUnlockModal(true);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'offer': return <Gift className="w-5 h-5 text-yellow-400" />;
      case 'hidden-content': return <Eye className="w-5 h-5 text-blue-400" />;
      case 'bid-participation': return <Zap className="w-5 h-5 text-green-400" />;
      case 'special-deal': return <Star className="w-5 h-5 text-purple-400" />;
      default: return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'offer': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'hidden-content': return 'border-blue-500/30 bg-blue-500/10';
      case 'bid-participation': return 'border-green-500/30 bg-green-500/10';
      case 'special-deal': return 'border-purple-500/30 bg-purple-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Expiring soon';
  };

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
          <Lock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            Hidden Content
          </h3>
        </div>
        <span className="text-sm text-gray-400">
          {hiddenContents.filter(c => c.isUnlocked).length}/{hiddenContents.length} unlocked
        </span>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {hiddenContents.map((content) => (
          <motion.div
            key={content.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              content.isUnlocked 
                ? getContentColor(content.type) + ' hover:scale-105' 
                : 'border-gray-600/30 bg-gray-700/30 hover:border-gray-500/50'
            }`}
            onClick={() => viewContent(content)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {content.isUnlocked ? (
                  <Unlock className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                {getContentIcon(content.type)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                content.isUnlocked ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {content.type.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            <h4 className="font-semibold text-white mb-2">{content.title}</h4>
            <p className="text-sm text-gray-300 mb-3">{content.description}</p>

            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-400 font-medium">{content.value}</span>
              <span className="text-gray-400">
                {formatTimeRemaining(content.expiresAt)}
              </span>
            </div>

            {content.isUnlocked && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-600/30">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Eye className="w-3 h-3" />
                  {content.views}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    likeContent(content.id);
                  }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Heart className="w-3 h-3" />
                  {content.likes}
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Unlock Progress Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Unlock Content</h3>
                <p className="text-gray-400">
                  Complete the requirement to unlock this exclusive content
                </p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">{unlockProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${unlockProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Detail Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getContentIcon(selectedContent.type)}
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedContent.title}</h3>
                    <p className="text-sm text-gray-400">{selectedContent.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Description</h4>
                  <p className="text-gray-300">{selectedContent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Value</h4>
                    <p className="text-yellow-400 font-medium">{selectedContent.value}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Expires</h4>
                    <p className="text-gray-300">{formatTimeRemaining(selectedContent.expiresAt)}</p>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Engagement Stats</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{selectedContent.views}</div>
                      <div className="text-xs text-gray-400">Views</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">{selectedContent.likes}</div>
                      <div className="text-xs text-gray-400">Likes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round((selectedContent.likes / Math.max(selectedContent.views, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-gray-400">Engagement</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Share className="w-4 h-4" />
                  Share Content
                </button>
                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" />
                  Like Content
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 