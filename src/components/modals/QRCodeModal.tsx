import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Share, Copy, Smartphone } from 'lucide-react';
import { BaseModal } from './BaseModal';
import { useLayerContext } from '../../contexts/LayerContext';

interface QRCodeModalProps {
  data: any;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ data, onClose }) => {
  const { selectedSlot, selectedCompany } = useLayerContext();
  const [copied, setCopied] = useState(false);

  const slotNumber = data?.slotNumber || selectedSlot || 1;
  const company = data?.company || selectedCompany;

  // Generate QR data
  const qrData = {
    slot: slotNumber,
    type: data?.slotType || 'standard',
    company: company ? {
      id: company.id,
      name: company.name,
      category: company.category,
      tier: company.tier
    } : null,
    timestamp: new Date().toISOString(),
    url: `${window.location.origin}/slot/${slotNumber}`,
    interactive: {
      ar: true,
      hologram: true,
      bidding: data?.slotType === 'live-bidding'
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `slot-${slotNumber}-qr-code.png`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `5D Billboard Slot ${slotNumber}`,
          text: company ? `Check out ${company.name} on our 5D Billboard!` : 'Interactive 5D Billboard Experience',
          url: qrData.url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <BaseModal title={`QR Code - Slot ${slotNumber}`} onClose={onClose} size="md">
      <div className="p-6">
        {/* QR Code Display */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-2xl">
            <img 
              src={qrUrl} 
              alt={`QR Code for Slot ${slotNumber}`}
              className="w-64 h-64"
            />
          </div>
          
          {company && (
            <motion.div 
              className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{company.name}</h3>
              <p className="text-gray-300 text-sm">{company.category} • {company.industry}</p>
              <div className="mt-2 inline-block px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                {company.tier.toUpperCase()}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Download
          </motion.button>

          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share className="w-4 h-4" />
            Share
          </motion.button>

          <motion.button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Data'}
          </motion.button>
        </div>

        {/* QR Data Preview */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Code Data
          </h4>
          <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
            {JSON.stringify(qrData, null, 2)}
          </pre>
        </div>

        {/* Scan Instructions */}
        <motion.div 
          className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            How to Use
          </h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Scan with any QR code reader or smartphone camera</li>
            <li>• Access interactive AR content and holographic displays</li>
            <li>• View company information and special offers</li>
            {data?.slotType === 'live-bidding' && (
              <li className="text-green-400">• Participate in live bidding sessions</li>
            )}
          </ul>
        </motion.div>
      </div>
    </BaseModal>
  );
};
