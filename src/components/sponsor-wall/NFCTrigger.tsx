import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Wifi, Bluetooth, Zap, Shield, Activity } from 'lucide-react';

interface NFCData {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyId?: string;
  companyName?: string;
  nfcTag: string;
  timestamp: number;
  interactions: number;
}

interface NFCTriggerProps {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyData?: {
    id: string;
    name: string;
    category: string;
    logo: string;
  };
  onNFCTriggered?: (nfcData: NFCData) => void;
  className?: string;
}

export const NFCTrigger: React.FC<NFCTriggerProps> = ({
  slotNumber,
  slotType,
  companyData,
  onNFCTriggered,
  className = ''
}) => {
  const [nfcData, setNfcData] = useState<NFCData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [interactionHistory, setInteractionHistory] = useState<Array<{
    timestamp: Date;
    deviceId: string;
    action: string;
  }>>([]);

  // Generate unique NFC tag ID
  const generateNFCTag = useCallback(() => {
    const tagId = `NFC-${slotNumber.toString().padStart(3, '0')}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
    
    const data: NFCData = {
      slotNumber,
      slotType,
      companyId: companyData?.id,
      companyName: companyData?.name,
      nfcTag: tagId,
      timestamp: Date.now(),
      interactions: 0
    };

    setNfcData(data);
    onNFCTriggered?.(data);
    return data;
  }, [slotNumber, slotType, companyData, onNFCTriggered]);

  // Simulate NFC connection
  const simulateConnection = () => {
    setIsScanning(true);
    setConnectionStatus('connecting');

    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsScanning(false);
      setIsActive(true);
    }, 2000);
  };

  // Simulate NFC tap
  const simulateNFCTap = () => {
    if (!nfcData || !isActive) return;

    const deviceId = `DEV-${Math.random().toString(36).substr(2, 8)}`;
    const actions = ['content_view', 'offer_redeem', 'bid_placement', 'company_info'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    const interaction = {
      timestamp: new Date(),
      deviceId,
      action: randomAction
    };

    setInteractionHistory(prev => [interaction, ...prev.slice(0, 9)]); // Keep last 10
    setNfcData(prev => prev ? { ...prev, interactions: prev.interactions + 1 } : null);

    // Simulate NFC response
    setTimeout(() => {
      console.log(`NFC interaction: ${randomAction} from device ${deviceId}`);
    }, 500);
  };

  // Disconnect NFC
  const disconnectNFC = () => {
    setIsActive(false);
    setConnectionStatus('disconnected');
    setInteractionHistory([]);
  };

  // Initialize NFC on mount
  useEffect(() => {
    if (companyData && !nfcData) {
      generateNFCTag();
    }
  }, [companyData, nfcData, generateNFCTag]);

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getConnectionBgColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500/20';
      case 'connecting': return 'bg-yellow-500/20';
      default: return 'bg-red-500/20';
    }
  };

  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            Slot {slotNumber} NFC
          </h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          slotType === 'main-sponsor' ? 'bg-blue-500/20 text-blue-400' :
          slotType === 'live-bidding' ? 'bg-green-500/20 text-green-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {slotType.replace('-', ' ').toUpperCase()}
        </span>
      </div>

      {/* NFC Status */}
      <div className={`${getConnectionBgColor()} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Connection Status</span>
          <span className={`text-sm font-medium ${getConnectionColor()}`}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-400' :
            'bg-red-400'
          }`} />
          <span className="text-sm text-gray-300">
            {connectionStatus === 'connected' ? 'Ready for NFC interactions' :
             connectionStatus === 'connecting' ? 'Establishing connection...' :
             'Waiting for device connection'}
          </span>
        </div>
      </div>

      {/* NFC Tag Information */}
      {nfcData && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">NFC Tag:</span>
              <span className="text-white ml-2 font-mono text-xs">{nfcData.nfcTag}</span>
            </div>
            <div>
              <span className="text-gray-400">Interactions:</span>
              <span className="text-green-400 ml-2">{nfcData.interactions}</span>
            </div>
            {companyData && (
              <>
                <div>
                  <span className="text-gray-400">Company:</span>
                  <span className="text-white ml-2">{companyData.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white ml-2">{companyData.category}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Connection Controls */}
      <div className="flex gap-2 mb-4">
        {connectionStatus === 'disconnected' ? (
          <motion.button
            onClick={simulateConnection}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                Connect NFC
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={disconnectNFC}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bluetooth className="w-4 h-4" />
            Disconnect
          </motion.button>
        )}
      </div>

      {/* NFC Tap Simulation */}
      {isActive && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={simulateNFCTap}
            className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Zap className="w-8 h-8" />
          </motion.button>
          <p className="text-sm text-gray-400 mb-4">Tap your device to interact</p>
        </motion.div>
      )}

      {/* Interaction History */}
      {interactionHistory.length > 0 && (
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Recent Interactions</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {interactionHistory.map((interaction, index) => (
              <div key={index} className="flex items-center justify-between text-xs bg-gray-600/30 rounded px-2 py-1">
                <span className="text-gray-300">{interaction.action.replace('_', ' ')}</span>
                <span className="text-gray-400">{interaction.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <Shield className="w-3 h-3" />
        <span>NFC interactions are encrypted and secure</span>
      </div>
    </motion.div>
  );
}; 