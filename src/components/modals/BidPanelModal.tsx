import React, { useState } from 'react';
import { BaseModal } from './BaseModal';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

interface BidPanelModalProps {
  data: any;
  onClose: () => void;
}

export const BidPanelModal: React.FC<BidPanelModalProps> = ({ data, onClose }) => {
  const { placeBid } = useLayerContext();
  const [bidAmount, setBidAmount] = useState('');
  const slotNumber = data?.slotNumber || 1;
  
  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (amount > 0) {
      placeBid(slotNumber, amount);
      onClose();
    }
  };

  return (
    <BaseModal title={`Place Bid - Slot ${slotNumber}`} onClose={onClose} size="md">
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-white font-semibold">Live Bidding Active</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Current Bid</p>
              <p className="text-white font-bold">€5,250</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Bids</p>
              <p className="text-white font-bold">23</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Time Left</p>
              <p className="text-yellow-400 font-bold">2:45</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-white font-medium">Your Bid Amount (EUR)</span>
            <div className="mt-2 relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="5,300"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </label>

          <motion.button
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            onClick={handlePlaceBid}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!bidAmount || parseFloat(bidAmount) <= 5250}
          >
            Place Bid
          </motion.button>
        </div>
      </div>
    </BaseModal>
  );
};
