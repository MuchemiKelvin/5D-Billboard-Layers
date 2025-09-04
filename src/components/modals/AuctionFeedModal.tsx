import React from 'react';
import { BaseModal } from './BaseModal';

interface AuctionFeedModalProps {
  data: any;
  onClose: () => void;
}

export const AuctionFeedModal: React.FC<AuctionFeedModalProps> = ({ data, onClose }) => {
  return (
    <BaseModal title="Live Auction Feed" onClose={onClose} size="xl">
      <div className="p-6 text-center text-gray-400">
        <p>Live Auction Feed coming soon...</p>
      </div>
    </BaseModal>
  );
};
