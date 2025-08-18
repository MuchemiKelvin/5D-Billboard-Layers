import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Smartphone, Wifi, ExternalLink, Gift, Star } from 'lucide-react';
import { Sponsor } from '@/types/sponsor';

interface QRInteractionOverlayProps {
  isVisible: boolean;
  sponsor: Sponsor;
  onClose?: () => void;
}

export const QRInteractionOverlay: React.FC<QRInteractionOverlayProps> = ({
  isVisible,
  sponsor,
  onClose
}) => {
  const [showQR, setShowQR] = useState(false);

  const generateQRContent = () => {
    const baseUrl = window.location.origin;
    const sponsorData = {
      sponsor: sponsor.name,
      slot: sponsor.slotNumber,
      website: sponsor.website,
      offer: "Exclusive 5D Sponsor Offer - 20% off",
      hologram: true
    };
    
    return `${baseUrl}/sponsor/${sponsor.id}?data=${encodeURIComponent(JSON.stringify(sponsorData))}`;
  };

  const handleNFCTap = async () => {
    if ('NDEFWriter' in window) {
      try {
        // @ts-ignore - NDEFWriter is experimental
        const ndef = new NDEFWriter();
        await ndef.write({
          records: [
            { 
              recordType: "url", 
              data: generateQRContent() 
            }
          ]
        });
        console.log("NFC tag written successfully");
      } catch (error) {
        console.error("NFC write failed:", error);
      }
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
            initial={{ scale: 0.9, opacity: 0, rotateY: -30 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotateY: 30 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="bg-gradient-hologram border-2 border-hologram-primary shadow-hologram overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-hologram opacity-20 animate-hologram-glow" />
              
              <div className="relative z-10 p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-4 bg-hologram-primary/20 rounded-full flex items-center justify-center"
                  >
                    <QrCode className="w-8 h-8 text-hologram-primary" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-background mb-2">
                    5D Interactive Experience
                  </h2>
                  <p className="text-background/80">
                    {sponsor.name} • Slot S{sponsor.slotNumber.toString().padStart(2, '0')}
                  </p>
                </div>

                {/* Sponsor logo and info */}
                <div className="bg-background/90 rounded-lg p-4 mb-6 text-center">
                  {sponsor.logo && (
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name}
                      className="max-h-16 mx-auto mb-3 object-contain"
                    />
                  )}
                  <h3 className="font-bold text-foreground mb-2">{sponsor.name}</h3>
                  {sponsor.description && (
                    <p className="text-sm text-muted-foreground">{sponsor.description}</p>
                  )}
                </div>

                {/* Interaction options */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Button
                    onClick={() => setShowQR(!showQR)}
                    variant="outline"
                    className="border-background/30 text-background hover:bg-background/10"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  
                  <Button
                    onClick={handleNFCTap}
                    variant="outline"
                    className="border-background/30 text-background hover:bg-background/10"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    NFC Tap
                  </Button>
                </div>

                {/* QR Code display */}
                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-background rounded-lg p-4 mb-6 text-center"
                    >
                      <div className="w-48 h-48 mx-auto bg-foreground/10 rounded-lg flex items-center justify-center mb-3">
                        <QrCode className="w-32 h-32 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scan for exclusive holographic content
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interactive features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-background/90">
                    <Star className="w-5 h-5 text-hologram-secondary" />
                    <span className="text-sm">Unlock AR hologram preview</span>
                  </div>
                  <div className="flex items-center gap-3 text-background/90">
                    <Gift className="w-5 h-5 text-hologram-secondary" />
                    <span className="text-sm">Exclusive sponsor offers</span>
                  </div>
                  <div className="flex items-center gap-3 text-background/90">
                    <Smartphone className="w-5 h-5 text-hologram-secondary" />
                    <span className="text-sm">Mobile-optimized experience</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {sponsor.website && (
                    <Button
                      onClick={() => window.open(sponsor.website, '_blank')}
                      className="flex-1 bg-background text-hologram-primary hover:bg-background/90"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-background/30 text-background hover:bg-background/10"
                  >
                    Close
                  </Button>
                </div>

                {/* Footer info */}
                <div className="mt-6 pt-4 border-t border-background/20 text-center">
                  <p className="text-xs text-background/70">
                    Powered by Kenya • 5D Technology
                  </p>
                  <p className="text-xs text-background/70">
                    Hologram + AI + AR + NFC/QR enabled
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};