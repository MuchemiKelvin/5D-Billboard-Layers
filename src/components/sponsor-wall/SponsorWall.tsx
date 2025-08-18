import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { SponsorSlot } from './SponsorSlot';
const HologramEffect = lazy(() => import('./HologramEffect').then(m => ({ default: m.HologramEffect })));
import { LiveBiddingOverlay } from './LiveBiddingOverlay';
import { QRInteractionOverlay } from './QRInteractionOverlay';
import { BaseGridLayer } from './BaseGridLayer';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings, QrCode } from 'lucide-react';
import { Sponsor, SponsorRotation } from '@/types/sponsor';
import { sponsorSlots, recentBids } from '@/data/sponsorData';
import { useLiveBids } from '@/hooks/useLiveBids';
import { WALL_CONFIG } from '@/config/wallConfig';
import { cn } from '@/lib/utils';

interface SponsorWallProps {
  className?: string;
}

export const SponsorWall: React.FC<SponsorWallProps> = ({ className }) => {
  console.log('SponsorWall component rendering');

  useEffect(() => {
    console.log('SponsorWall mounted');
    return () => console.log('SponsorWall unmounting');
  }, []);

  const [currentRotation, setCurrentRotation] = useState<SponsorRotation>({
    currentSlot: 0,
    rotationSpeed: WALL_CONFIG.SLOT_DISPLAY_TIME,
    totalRotations: 0,
    isPlaying: true,
    lastRotationTime: Date.now()
  });

  const [visibleSlots, setVisibleSlots] = useState<Set<number>>(new Set([0]));
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [showLiveBidding, setShowLiveBidding] = useState(false);
  const [showQROverlay, setShowQROverlay] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showBaseLayer, setShowBaseLayer] = useState(true);
  const [showAnimatedLayer, setShowAnimatedLayer] = useState(true);
  const [enableHologramFx, setEnableHologramFx] = useState<boolean>((WALL_CONFIG as any).ENABLE_HOLOGRAM);
  const [showQrLayer, setShowQrLayer] = useState(true);

  // Auto rotation logic with schedule mode and branding breaks
  const [isBrandingBreak, setIsBrandingBreak] = useState(false);
  const [brandingLoopTicker, setBrandingLoopTicker] = useState(0);

  // Live bidding dynamic state (simulated polling)
  const liveBidState = useLiveBids({ currentBid: 15000, highestBidder: 'KenyaCorp', timeRemaining: 1800 });

  useEffect(() => {
    if (!currentRotation.isPlaying) return;

    if (isBrandingBreak) {
      const brandingInterval = setInterval(() => setBrandingLoopTicker((t: number) => (t + 1) % 1000000), 1000 / 30);
      return () => clearInterval(brandingInterval);
    }

    const interval = setInterval(() => {
      setCurrentRotation(prev => {
        const nextSlot = (prev.currentSlot + 1) % sponsorSlots.length;
        const completedRotation = nextSlot === 0;
        
        const updated = {
          ...prev,
          currentSlot: nextSlot,
          totalRotations: completedRotation ? prev.totalRotations + 1 : prev.totalRotations,
          lastRotationTime: Date.now()
        };

        if (completedRotation) {
          setIsBrandingBreak(true);
          setTimeout(() => setIsBrandingBreak(false), (WALL_CONFIG as any).BRANDING_BREAK_MS);
        }

        return updated;
      });
    }, currentRotation.rotationSpeed);

    return () => clearInterval(interval);
  }, [currentRotation.isPlaying, currentRotation.rotationSpeed, isBrandingBreak]);

  // Compute effective slot duration based on schedule mode
  const computeEffectiveSlotMs = () => {
    const cfg: any = WALL_CONFIG as any;
    return cfg.SCHEDULE_MODE === 'daily'
      ? Math.floor(cfg.ROTATION_DURATION / cfg.TOTAL_SLOTS)
      : cfg.SLOT_DISPLAY_TIME;
  };

  useEffect(() => {
    setCurrentRotation(prev => ({ ...prev, rotationSpeed: computeEffectiveSlotMs() }));
  }, []);

  // Schedule gating for 'daily' mode: 4 windows per day at 00:00, 06:00, 12:00, 18:00
  useEffect(() => {
    if ((WALL_CONFIG as any).SCHEDULE_MODE !== 'daily') {
      setIsBrandingBreak(false);
      return;
    }

    const rotationWindowDurationMs = (WALL_CONFIG as any).ROTATION_DURATION;

    const checkWindow = () => {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const windows = [0, 6, 12, 18].map(h => new Date(startOfDay.getTime() + h * 60 * 60 * 1000).getTime());
      const nowMs = now.getTime();
      const active = windows.some(start => nowMs >= start && nowMs <= start + rotationWindowDurationMs);
      setIsBrandingBreak(!active);
    };

    checkWindow();
    const id = setInterval(checkWindow, 5000);
    return () => clearInterval(id);
  }, []);

  // no-op: live bids handled by hook

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
    // Arrange exactly S01..S24 by slotNumber, with live bidding content centered
    const grid: Array<any> = Array(24).fill(null);
    const liveSponsor = sponsorSlots.find(s => s.liveBidding?.enabled);

    for (let n = 1; n <= 24; n++) {
      const s = sponsorSlots.find(sp => sp.slotNumber === n && sp.tier !== 'main');
      if (s) {
        grid[n - 1] = { sponsor: s, isMainSponsor: false, isLiveBidding: Boolean(s.liveBidding?.enabled) };
      }
    }

    // Place live bidding between S12 and S13 (index 12)
    if (liveSponsor) {
      grid[12] = { sponsor: liveSponsor, isMainSponsor: false, isLiveBidding: true };
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
              <div className="inline-flex items-center rounded-full bg-hologram-primary/20 text-hologram-primary px-2.5 py-0.5 text-xs font-semibold">
                Rotation {currentRotation.totalRotations + 1}
              </div>
              <div className="inline-flex items-center rounded-full border border-hologram-accent px-2.5 py-0.5 text-xs font-semibold">
                Slot {currentRotation.currentSlot + 1}/24
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowControls(!showControls)}
                variant="outline"
                size="sm"
                className="border-hologram-accent text-hologram-accent hover:bg-hologram-accent/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={togglePlayPause}
                variant="outline"
                size="sm"
                className="border-hologram-primary text-hologram-primary hover:bg-hologram-primary/10"
              >
                {currentRotation.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={resetRotation}
                variant="outline"
                size="sm"
                className="border-hologram-secondary text-hologram-secondary hover:bg-hologram-secondary/10"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showControls && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-md border border-slot-border p-3">
                <div className="font-semibold text-sm mb-2">Layer 1 — Base Grid</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowBaseLayer(v => !v)}>
                    {showBaseLayer ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
              <div className="rounded-md border border-slot-border p-3">
                <div className="font-semibold text-sm mb-2">Layer 2 — Animated Content</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAnimatedLayer(v => !v)}>
                    {showAnimatedLayer ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </div>
              <div className="rounded-md border border-slot-border p-3">
                <div className="font-semibold text-sm mb-2">Layer 3 — Hologram FX</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEnableHologramFx(v => !v)}>
                    {enableHologramFx ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
              <div className="rounded-md border border-slot-border p-3">
                <div className="font-semibold text-sm mb-2">Layer 4 — Live Bidding</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLiveBidding(true)}>
                    Open Overlay
                  </Button>
                </div>
              </div>
              <div className="rounded-md border border-slot-border p-3">
                <div className="font-semibold text-sm mb-2">Layer 5 — QR/NFC</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowQrLayer(v => !v)}>
                    {showQrLayer ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!selectedSponsor) {
                        const first = sponsorSlots.find(s => s.slotNumber === 1) || sponsorSlots[0];
                        setSelectedSponsor(first);
                      }
                      setShowQROverlay(true);
                    }}
                  >
                    Open QR
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Base static layer and animated content overlay */}
      <div className="container mx-auto px-4 pb-8">
        <div className="relative max-w-7xl mx-auto">
          {showBaseLayer && (
            <div className="opacity-90 select-none">
              <BaseGridLayer />
            </div>
          )}

          {isBrandingBreak && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="px-6 py-3 rounded-full border-2 border-hologram-primary/60 text-hologram-primary bg-background/40 backdrop-blur-sm shadow-hologram"
                style={{
                  transform: `rotate(${brandingLoopTicker * 2}deg) translateY(${Math.sin(brandingLoopTicker * 0.1) * 10}px)`
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Branding Loop
              </motion.div>
            </div>
          )}

          {showAnimatedLayer && (
          <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pointer-events-none">
            {gridLayout.map((item, index) => {
              if (!item || item === 'occupied') return <div key={index} />;
              
              const { sponsor, isMainSponsor, isLiveBidding } = item;
              const sponsorIndex = sponsorSlots.indexOf(sponsor);
              const isVisible = !isBrandingBreak && visibleSlots.has(sponsorIndex);

              return (
                <div key={sponsor.id} className={cn(isMainSponsor ? "col-span-2 row-span-2" : "", 'pointer-events-auto')}>
                  <SponsorSlot
                    sponsor={sponsor}
                    isVisible={isVisible}
                    isMainSponsor={isMainSponsor}
                    isLiveBidding={isLiveBidding}
                    onSlotClick={handleSlotClick}
                    liveBiddingOverride={isLiveBidding ? { enabled: true, currentBid: liveBidState.currentBid, highestBidder: liveBidState.highestBidder, timeRemaining: liveBidState.timeRemaining } : undefined}
                  />

                  {(isMainSponsor || sponsor.tier === 'premium') && isVisible && enableHologramFx && (
                    <div className="mix-blend-screen">
                      <Suspense fallback={null}>
                        <HologramEffect isActive={true} className="opacity-30" />
                      </Suspense>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
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
      {showQrLayer && (
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
      )}

      {/* Overlays */}
      <LiveBiddingOverlay
        isVisible={showLiveBidding}
        slotNumber={8}
        currentBid={liveBidState.currentBid}
        timeRemaining={liveBidState.timeRemaining}
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