import React from 'react';
import { BaseModal } from './BaseModal';
import { Settings, DollarSign, Clock } from 'lucide-react';

interface SlotSettingsModalProps {
  data: any;
  onClose: () => void;
}

export const SlotSettingsModal: React.FC<SlotSettingsModalProps> = ({ data, onClose }) => {
  const slotNumber = data?.slotNumber || 1;
  
  return (
    <BaseModal title={`Slot ${slotNumber} Settings`} onClose={onClose} size="md">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <Settings className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="text-white font-semibold">Configuration</h3>
            <p className="text-gray-400 text-sm">Manage slot display settings</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-white font-semibold">Pricing</h3>
            <p className="text-gray-400 text-sm">Set pricing and bid parameters</p>
          </div>
        </div>
        <div className="text-center text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Detailed settings panel coming soon...</p>
        </div>
      </div>
    </BaseModal>
  );
};
