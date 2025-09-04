import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

// Import individual modal components
import { QRCodeModal } from './QRCodeModal';
import { SlotSettingsModal } from './SlotSettingsModal';
import { BidPanelModal } from './BidPanelModal';
import { AnalyticsModal } from './AnalyticsModal';
import { CompanyDetailsModal } from './CompanyDetailsModal';
import { ARSettingsModal } from './ARSettingsModal';
import { HologramControlModal } from './HologramControlModal';
import { GlobalSettingsModal } from './GlobalSettingsModal';
import { AuctionFeedModal } from './AuctionFeedModal';

export const ModalSystem: React.FC = () => {
  const { activeModal, modalData, closeModal } = useLayerContext();

  const renderModal = () => {
    switch (activeModal) {
      case 'qr-code':
        return <QRCodeModal data={modalData} onClose={closeModal} />;
      case 'slot-settings':
        return <SlotSettingsModal data={modalData} onClose={closeModal} />;
      case 'bid-panel':
        return <BidPanelModal data={modalData} onClose={closeModal} />;
      case 'analytics':
        return <AnalyticsModal data={modalData} onClose={closeModal} />;
      case 'company-details':
        return <CompanyDetailsModal data={modalData} onClose={closeModal} />;
      case 'ar-settings':
        return <ARSettingsModal data={modalData} onClose={closeModal} />;
      case 'hologram-control':
        return <HologramControlModal data={modalData} onClose={closeModal} />;
      case 'global-settings':
        return <GlobalSettingsModal data={modalData} onClose={closeModal} />;
      case 'auction-feed':
        return <AuctionFeedModal data={modalData} onClose={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-50">
          {renderModal()}
        </div>
      )}
    </AnimatePresence>
  );
};
