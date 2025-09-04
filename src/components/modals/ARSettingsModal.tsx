import React from 'react';
import { BaseModal } from './BaseModal';
import { ARControls } from '../beamer/ARLayer';

interface ARSettingsModalProps {
  data: any;
  onClose: () => void;
}

export const ARSettingsModal: React.FC<ARSettingsModalProps> = ({ data, onClose }) => {
  return (
    <BaseModal title="BeamerShow Layer 3: AR Effects" onClose={onClose} size="xl">
      <div className="p-6 space-y-6">
        {/* BeamerShow AR Integration Info */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-purple-400 font-semibold mb-2">🔮 AR Integration Features</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• <strong>QR/NFC Triggers:</strong> Mobile device AR activation via scanning</p>
            <p>• <strong>4x Daily Rotation:</strong> Morning, afternoon, evening, night AR content</p>
            <p>• <strong>GLTF/FBX Support:</strong> Optimized 3D models for mobile AR</p>
            <p>• <strong>Load Performance:</strong> &lt;5 second target for AR experience activation</p>
          </div>
        </div>

        {/* AR Controls Component */}
        <ARControls />
      </div>
    </BaseModal>
  );
};
