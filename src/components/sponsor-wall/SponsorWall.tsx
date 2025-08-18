import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SponsorSlot } from './SponsorSlot';
import { HologramEffect } from './HologramEffect';
import { LiveBiddingOverlay } from './LiveBiddingOverlay';
import { QRInteractionOverlay } from './QRInteractionOverlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Settings, QrCode } from 'lucide-react';
import { Sponsor, SponsorRotation } from '@/types/sponsor';
import { sponsorSlots, recentBids } from '@/data/sponsorData';
import { cn } from '@/lib/utils';

interface SponsorWallProps {
  className?: string;
}

export const SponsorWall: React.FC<SponsorWallProps> = ({ className }) => {
  const [currentRotation, setCurrentRotation] = useState<SponsorRotation>({
    currentSlot: 0,
    rotationSpeed: 4000, // 4 seconds per slot
    totalRotations: 0,
    isPlaying: true
  });

  const [visibleSlots, setVisibleSlots] = useState<Set<number>>(new Set([0]));
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [showLiveBidding, setShowLiveBidding] = useState(false);
  const [showQROverlay, setShowQROverlay] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Auto rotation logic
  useEffect(() => {
    if (!currentRotation.isPlaying) return;

    const interval = setInterval(() => {
      setCurrentRotation(prev => {
        const nextSlot = (prev.currentSlot + 1) % sponsorSlots.length;
        const completedRotation = nextSlot === 0;
        
        return {
          ...prev,
          currentSlot: nextSlot,
          totalRotations: completedRotation ? prev.totalRotations + 1 : prev.totalRotations
        };
      });
    }, currentRotation.rotationSpeed);

    return () => clearInterval(interval);
  }, [currentRotation.isPlaying, currentRotation.rotationSpeed]);

  // Update visible slots based on current rotation
  useEffect(() => {
    const newVisibleSlots = new Set<number>();
    
    // Always show main sponsor and live bidding
    const mainSponsor = sponsorSlots.find(s => s.tier === 'main');
    const liveBiddingSponsor = sponsorSlots.find(s => s.liveBidding?.enabled);
    
    if (mainSponsor) newVisibleSlots.add(sponsorSlots.indexOf(mainSponsor));
    if (liveBiddingSponsor) newVisibleSlots.add(sponsorSlots.indexOf(liveBiddingSponsor));
    
    // Show current slot in rotation
    newVisibleSlots.add(currentRotation.currentSlot);
    
    // Show 2-3 premium slots
    sponsorSlots.forEach((sponsor, index) => {
      if (sponsor.tier === 'premium' && newVisibleSlots.size < 8) {
        newVisibleSlots.add(index);
      }
    });

    setVisibleSlots(newVisibleSlots);
  }, [currentRotation.currentSlot]);

  const handleSlotClick = (sponsor: Sponsor) => {
    if (sponsor.liveBidding?.enabled) {
      setShowLiveBidding(true);
    } else {
      setSelectedSponsor(sponsor);
      setShowQROverlay(true);
    }
  };

  const handlePlaceBid = (amount: number) => {
    console.log('Placing bid:', amount);
    // Here you would integrate with your bidding backend
  };

  const togglePlayPause = () => {
    setCurrentRotation(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const resetRotation = () => {
    setCurrentRotation(prev => ({ 
      ...prev, 
      currentSlot: 0, 
      totalRotations: 0 
    }));
  };

  const getGridLayout = () => {
    // 6x4 grid layout with main sponsor taking 2x2 space
    const grid = Array(24).fill(null);
    
    // Place main sponsor in center-left (positions 9-10, 15-16)
    const mainSponsorIndex = sponsorSlots.findIndex(s => s.tier === 'main');
    if (mainSponsorIndex !== -1) {
      grid[9] = { sponsor: sponsorSlots[mainSponsorIndex], isMainSponsor: true };
      grid[10] = 'occupied';
      grid[15] = 'occupied';
      grid[16] = 'occupied';
    }

    // Fill remaining slots
    let sponsorIndex = 0;
    for (let i = 0; i < 24; i++) {
      if (grid[i] === null) {
        while (sponsorIndex < sponsorSlots.length && sponsorSlots[sponsorIndex].tier === 'main') {
          sponsorIndex++;
        }
        if (sponsorIndex < sponsorSlots.length) {
          grid[i] = { 
            sponsor: sponsorSlots[sponsorIndex], 
            isMainSponsor: false,
            isLiveBidding: sponsorSlots[sponsorIndex].liveBidding?.enabled || false
          };
          sponsorIndex++;
        }
      }
    }

    return grid;
  };

  const gridLayout = getGridLayout();

  return (
    <div className={cn("relative min-h-screen bg-gradient-cyber", className)}>
      {/* Header */}
      <div className="relative z-20 pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-6xl font-bold bg-gradient-hologram bg-clip-text text-transparent mb-4"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              5D SPONSOR WALL — 24 SLOTS
            </motion.h1>
            <p className="text-lg text-hologram-accent">
              Single Wall • 24 Slots • Main Sponsor • 4K Beamer Ready
            </p>
          </div>

          {/* Control panel */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-hologram-primary/20 text-hologram-primary">
                Rotation {currentRotation.totalRotations + 1}
              </Badge>
              <Badge variant="outline" className="border-hologram-accent">
                Slot {currentRotation.currentSlot + 1}/24
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="border-hologram-accent text-hologram-accent hover:bg-hologram-accent/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                className="border-hologram-primary text-hologram-primary hover:bg-hologram-primary/10"
              >
                {currentRotation.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetRotation}
                className="border-hologram-secondary text-hologram-secondary hover:bg-hologram-secondary/10"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main sponsor grid */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-6 gap-4 max-w-7xl mx-auto">
          {gridLayout.map((item, index) => {
            if (!item || item === 'occupied') return <div key={index} />;
            
            const { sponsor, isMainSponsor, isLiveBidding } = item;
            const sponsorIndex = sponsorSlots.indexOf(sponsor);
            const isVisible = visibleSlots.has(sponsorIndex);

            return (
              <div key={sponsor.id} className={isMainSponsor ? "col-span-2 row-span-2" : ""}>
                <SponsorSlot
                  sponsor={sponsor}
                  isVisible={isVisible}
                  isMainSponsor={isMainSponsor}
                  isLiveBidding={isLiveBidding}
                  onSlotClick={handleSlotClick}
                />
                
                {/* Hologram effect for main sponsor */}
                {isMainSponsor && isVisible && (
                  <HologramEffect isActive={true} className="opacity-30" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="relative z-20 pb-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-hologram-accent">
            Kardiverse™ 5D/24D • Add-ons: Hologram +€10k • Live Bidding +€15k • NFC/QR enabled
          </p>
        </div>
      </div>

      {/* Floating QR button */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setShowQROverlay(true)}
          className="bg-hologram-primary hover:bg-hologram-primary/90 text-background rounded-full w-12 h-12 p-0 shadow-hologram"
        >
          <QrCode className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Overlays */}
      <LiveBiddingOverlay
        isVisible={showLiveBidding}
        slotNumber={8}
        currentBid={15000}
        timeRemaining={1800}
        recentBids={recentBids}
        onPlaceBid={handlePlaceBid}
        onClose={() => setShowLiveBidding(false)}
      />

      {selectedSponsor && (
        <QRInteractionOverlay
          isVisible={showQROverlay}
          sponsor={selectedSponsor}
          onClose={() => {
            setShowQROverlay(false);
            setSelectedSponsor(null);
          }}
        />
      )}
    </div>
  );
};