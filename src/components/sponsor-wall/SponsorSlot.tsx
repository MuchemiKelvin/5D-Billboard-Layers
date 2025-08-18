import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Zap, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Sponsor } from '@/types/sponsor';
import { cn } from '@/lib/utils';
import { WALL_CONFIG } from '@/config/wallConfig';

interface SponsorSlotProps {
  sponsor: Sponsor;
  isVisible: boolean;
  isMainSponsor?: boolean;
  isLiveBidding?: boolean;
  onSlotClick?: (sponsor: Sponsor) => void;
  liveBiddingOverride?: Sponsor['liveBidding'];
}

export const SponsorSlot: React.FC<SponsorSlotProps> = ({
  sponsor,
  isVisible,
  isMainSponsor = false,
  isLiveBidding = false,
  onSlotClick,
  liveBiddingOverride
}) => {
  const handleClick = () => {
    onSlotClick?.(sponsor);
  };

  const slotVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: WALL_CONFIG.FADE_IN_DURATION / 1000, // Convert to seconds
        ease: [0.4, 0, 0.2, 1] as const
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: {
        duration: 0.4
      }
    }
  };

  const activeLiveBidding = liveBiddingOverride ?? sponsor.liveBidding;

  return (
    <motion.div
      variants={slotVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      exit="exit"
      className={cn(
        "relative group cursor-pointer",
        isMainSponsor && "col-span-2 row-span-2"
      )}
      onClick={handleClick}
    >
      <Card className={cn(
        "relative h-full min-h-[120px] overflow-hidden border-2 transition-all duration-500",
        "bg-gradient-sponsor-slot backdrop-blur-sm",
        isMainSponsor && "border-hologram-primary shadow-hologram",
        isLiveBidding && "border-live-bidding shadow-neon",
        !isMainSponsor && !isLiveBidding && "border-slot-border",
        "hover:scale-[1.02] hover:shadow-lg hover:border-hologram-accent"
      )}
      style={{
        transitionProperty: 'transform, box-shadow, border-color, opacity'
      }}>
        {/* Holographic overlay for main sponsor */}
        {isMainSponsor && (
          <div className="absolute inset-0 bg-gradient-hologram opacity-20 animate-hologram-glow" />
        )}
        
        {/* Cyber scan effect for live bidding */}
        {isLiveBidding && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-1 bg-gradient-neon opacity-60 animate-cyber-scan" />
          </div>
        )}

        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          {/* Slot header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-mono font-bold px-2 py-1 rounded",
                isMainSponsor ? "bg-hologram-primary text-background" : "bg-muted text-muted-foreground"
              )}>
                S{sponsor.slotNumber.toString().padStart(2, '0')}
              </span>
              {isMainSponsor && <Crown className="w-4 h-4 text-hologram-primary" />}
              {isLiveBidding && <Zap className="w-4 h-4 text-live-bidding animate-pulse" />}
            </div>
            
            {sponsor.qrCode && (
              <QrCode className="w-4 h-4 text-muted-foreground hover:text-hologram-accent transition-colors" />
            )}
          </div>

          {/* Layer 2 — Sponsor content (animated) */}
          <div className="flex-1 flex items-center justify-center">
            {sponsor.videoUrl ? (
              <video
                src={sponsor.videoUrl}
                className="max-w-full max-h-20 object-contain rounded"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : sponsor.logo ? (
              <img 
                src={sponsor.logo} 
                alt={sponsor.name}
                className="max-w-full max-h-16 object-contain filter group-hover:brightness-110 transition-all"
              />
            ) : (
              <div className="text-center">
                <h3 className={cn(
                  "font-bold text-sm",
                  isMainSponsor ? "text-hologram-primary text-lg" : "text-foreground"
                )}>
                  {sponsor.name}
                </h3>
              </div>
            )}
          </div>

          {/* Pricing info */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Day €{sponsor.dayPrice.toLocaleString()}</span>
              {isLiveBidding && activeLiveBidding && (
                <div className="bg-live-bidding text-background text-xs px-2 py-1 rounded-full">
                  €{activeLiveBidding.currentBid.toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Weekend €{sponsor.weekendPrice.toFixed(1)}k</span>
              <span>Week €{sponsor.weekPrice}k</span>
            </div>
          </div>

          {/* Live bidding info */}
          {isLiveBidding && activeLiveBidding && (
            <motion.div 
              className="mt-2 p-2 bg-live-bidding/10 rounded border border-live-bidding"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-xs text-live-bidding font-medium">
                LIVE BIDDING
              </div>
              <div className="text-xs text-muted-foreground">
                {activeLiveBidding.highestBidder} leading
              </div>
            </motion.div>
          )}
        </div>

        {/* Premium tier indicator */}
        {sponsor.tier === 'premium' && !isMainSponsor && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-hologram-accent rounded-full animate-pulse" />
          </div>
        )}

        {/* Subtle QR prompt during display time */}
        {isVisible && sponsor.qrCode && (
          <motion.div
            className="absolute bottom-2 right-2 bg-background/80 border border-hologram-accent text-foreground rounded-full px-2 py-1 flex items-center gap-1 shadow-sm"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
          >
            <QrCode className="w-3 h-3 text-hologram-accent" />
            <span className="text-[10px]">Scan</span>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};