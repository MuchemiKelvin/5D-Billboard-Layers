import React from 'react';
import { BaseModal } from './BaseModal';

interface GlobalSettingsModalProps {
  data: any;
  onClose: () => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({ data, onClose }) => {
  return (
    <BaseModal title="Global Settings" onClose={onClose} size="lg">
      <div className="p-6 text-center text-gray-400">
        <p>Global Settings panel coming soon...</p>
      </div>
    </BaseModal>
  );
};
