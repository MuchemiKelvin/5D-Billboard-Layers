import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Clock, TrendingUp, Users } from 'lucide-react';
import { BiddingEvent } from '@/types/sponsor';

interface LiveBiddingOverlayProps {
  isVisible: boolean;
  slotNumber: number;
  currentBid: number;
  timeRemaining: number;
  recentBids: BiddingEvent[];
  onPlaceBid?: (amount: number) => void;
  onClose?: () => void;
}

export const LiveBiddingOverlay: React.FC<LiveBiddingOverlayProps> = ({
  isVisible,
  slotNumber,
  currentBid,
  timeRemaining,
  recentBids,
  onPlaceBid,
  onClose
}) => {
  const [bidAmount, setBidAmount] = useState(currentBid + 1000);
  const [timeLeft, setTimeLeft] = useState(timeRemaining);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlaceBid = () => {
    if (bidAmount > currentBid) {
      onPlaceBid?.(bidAmount);
      setBidAmount(bidAmount + 1000);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card className="bg-gradient-cyber border-2 border-live-bidding shadow-neon">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-live-bidding/20 rounded-lg">
                      <Zap className="w-6 h-6 text-live-bidding" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-live-bidding">
                        LIVE BIDDING
                      </h2>
                      <p className="text-muted-foreground">
                        Slot S{slotNumber.toString().padStart(2, '0')} • Premium Position
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-live-bidding">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold text-lg">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Time remaining</p>
                  </div>
                </div>

                {/* Current bid */}
                <div className="bg-live-bidding/10 rounded-lg p-4 mb-6 border border-live-bidding/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current highest bid</p>
                      <p className="text-3xl font-bold text-live-bidding">
                        €{currentBid.toLocaleString()}
                      </p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-3 bg-live-bidding/20 rounded-full"
                    >
                      <TrendingUp className="w-8 h-8 text-live-bidding" />
                    </motion.div>
                  </div>
                </div>

                {/* Bidding form */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Your bid amount
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          min={currentBid + 1}
                          step={1000}
                          className="border-slot-border focus:border-live-bidding"
                        />
                        <Button
                          onClick={handlePlaceBid}
                          disabled={bidAmount <= currentBid || timeLeft === 0}
                          className="bg-live-bidding hover:bg-live-bidding/90 text-background"
                        >
                          Place Bid
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {[1000, 5000, 10000].map((increment) => (
                        <Button
                          key={increment}
                          variant="outline"
                          size="sm"
                          onClick={() => setBidAmount(currentBid + increment)}
                          className="text-xs border-slot-border hover:border-live-bidding"
                        >
                          +€{increment.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Recent bids */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-medium">Recent Bids</h3>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {recentBids.slice(0, 5).map((bid) => (
                        <motion.div
                          key={bid.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                        >
                          <span className="font-medium">{bid.bidder}</span>
                          <div className="flex items-center gap-2">
                            <span>€{bid.amount.toLocaleString()}</span>
                            {bid.isWinning && (
                              <Badge variant="secondary" className="bg-live-bidding/20 text-live-bidding text-xs">
                                Leading
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-slot-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Auction ends in {formatTime(timeLeft)}</span>
                    <span>Powered by Kenya • 5D/24D Technology</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};