import React, { createContext, useContext, useState, useCallback } from 'react';
import { type Company } from '../data/dataService';

// Layer configuration interface
interface LayerConfig {
  id: string;
  name: string;
  isVisible: boolean;
  isActive: boolean;
  intensity: number;
  settings: Record<string, any>;
}

// Modal/overlay types
type ModalType = 
  | 'qr-code'
  | 'slot-settings'
  | 'bid-panel'
  | 'analytics'
  | 'company-details'
  | 'ar-settings'
  | 'hologram-control'
  | 'global-settings'
  | 'auction-feed'
  | null;

// Context state interface
interface LayerContextState {
  // Layer configurations
  layers: Record<string, LayerConfig>;
  
  // Modal/overlay state
  activeModal: ModalType;
  modalData: any;
  
  // Selected elements
  selectedSlot: number | null;
  selectedCompany: Company | null;
  
  // Global settings
  globalSettings: {
    hologramIntensity: number;
    particleEffects: boolean;
    lightRays: boolean;
    arMode: boolean;
    soundEnabled: boolean;
    autoRotation: boolean;
  };
  
  // Favorites and user data
  favorites: Set<number>;
  bidHistory: Array<{slotNumber: number; amount: number; timestamp: Date}>;
}

// Context actions interface
interface LayerContextActions {
  // Layer management
  toggleLayer: (layerId: string) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  setLayerIntensity: (layerId: string, intensity: number) => void;
  updateLayerSettings: (layerId: string, settings: Record<string, any>) => void;
  
  // Modal management
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  
  // Selection management
  selectSlot: (slotNumber: number, company?: Company) => void;
  clearSelection: () => void;
  
  // Global settings
  updateGlobalSettings: (settings: Partial<LayerContextState['globalSettings']>) => void;
  
  // User interactions
  toggleFavorite: (slotNumber: number) => void;
  placeBid: (slotNumber: number, amount: number) => void;
  shareSlot: (slotNumber: number) => void;
  
  // Navigation
  navigateToLayer: (layerId: string, options?: any) => void;
}

// Combined context type
type LayerContextType = LayerContextState & LayerContextActions;

// Create context
const LayerContext = createContext<LayerContextType | undefined>(undefined);

// BeamerShow 24-Slot System (L1–L3) - Kardiverse Technologies Ltd.
const initialLayers: Record<string, LayerConfig> = {
  'layer-1-static': {
    id: 'layer-1-static',
    name: 'Layer 1: Static Logos',
    isVisible: true,
    isActive: true,
    intensity: 1,
    settings: { 
      slotDuration: 20, // 15-30 seconds per spec
      totalSlots: 24,
      blockDuration: 4, // 4-hour blocks
      format: 'png-jpg',
      autoRotate: true
    }
  },
  'layer-2-hologram': {
    id: 'layer-2-hologram',
    name: 'Layer 2: Hologram Effects',
    isVisible: true,
    isActive: false, // Start with Layer 1 only
    intensity: 1,
    settings: { 
      animationType: 'glowing-spinning',
      loopDuration: 12, // 10-15s loops per spec
      format: 'mp4-webm-alpha',
      effects: ['glow', 'spin', 'lightReflection']
    }
  },
  'layer-3-ar': {
    id: 'layer-3-ar',
    name: 'Layer 3: AR Effects',
    isVisible: true,
    isActive: false, // Start with Layer 1 only
    intensity: 1,
    settings: { 
      triggerType: 'qr-nfc',
      rotationSchedule: 4, // 4x per day
      loadTimeout: 5, // <5 sec load time per spec
      format: 'gltf-fbx',
      schedule: ['morning', 'afternoon', 'evening', 'night']
    }
  }
};

const initialGlobalSettings = {
  hologramIntensity: 1,
  particleEffects: true,
  lightRays: true,
  arMode: true,
  soundEnabled: true,
  autoRotation: false
};

// Provider component
export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layers, setLayers] = useState<Record<string, LayerConfig>>(initialLayers);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [globalSettings, setGlobalSettings] = useState(initialGlobalSettings);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [bidHistory, setBidHistory] = useState<Array<{slotNumber: number; amount: number; timestamp: Date}>>([]);

  // Layer management actions
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        isVisible: !prev[layerId].isVisible
      }
    }));
  }, []);

  const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        isVisible: visible
      }
    }));
  }, []);

  const setLayerIntensity = useCallback((layerId: string, intensity: number) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        intensity: Math.max(0, Math.min(2, intensity))
      }
    }));
  }, []);

  const updateLayerSettings = useCallback((layerId: string, settings: Record<string, any>) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        settings: { ...prev[layerId].settings, ...settings }
      }
    }));
  }, []);

  // Modal management actions
  const openModal = useCallback((type: ModalType, data?: any) => {
    setActiveModal(type);
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  // Selection management actions
  const selectSlot = useCallback((slotNumber: number, company?: Company) => {
    setSelectedSlot(slotNumber);
    setSelectedCompany(company || null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlot(null);
    setSelectedCompany(null);
  }, []);

  // Global settings actions
  const updateGlobalSettings = useCallback((newSettings: Partial<typeof initialGlobalSettings>) => {
    setGlobalSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // User interaction actions
  const toggleFavorite = useCallback((slotNumber: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(slotNumber)) {
        newFavorites.delete(slotNumber);
      } else {
        newFavorites.add(slotNumber);
      }
      return newFavorites;
    });
  }, []);

  const placeBid = useCallback((slotNumber: number, amount: number) => {
    setBidHistory(prev => [...prev, {
      slotNumber,
      amount,
      timestamp: new Date()
    }]);
    
    // Open bid confirmation modal
    openModal('bid-panel', { slotNumber, amount, type: 'confirmation' });
  }, [openModal]);

  const shareSlot = useCallback((slotNumber: number) => {
    // Generate share URL and data
    const shareData = {
      title: `5D Billboard Slot ${slotNumber}`,
      text: `Check out this premium advertising slot on our 5D Billboard system!`,
      url: `${window.location.origin}/slot/${slotNumber}`
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      openModal('company-details', { type: 'share-success', slotNumber });
    }
  }, [openModal]);

  // Navigation action
  const navigateToLayer = useCallback((layerId: string, options?: any) => {
    // First, make sure the layer is visible and active
    setLayerVisibility(layerId, true);
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        isActive: true
      }
    }));

    // Open appropriate modal based on BeamerShow layer
    switch (layerId) {
      case 'layer-1-static':
        openModal('global-settings', { activeTab: 'layer-1-static', ...options });
        break;
      case 'layer-2-hologram':
        openModal('hologram-control', { layerId, ...options });
        break;
      case 'layer-3-ar':
        openModal('ar-settings', { layerId, ...options });
        break;
      default:
        openModal('global-settings', { activeTab: layerId, ...options });
        break;
    }
  }, [setLayerVisibility, openModal]);

  const contextValue: LayerContextType = {
    // State
    layers,
    activeModal,
    modalData,
    selectedSlot,
    selectedCompany,
    globalSettings,
    favorites,
    bidHistory,

    // Actions
    toggleLayer,
    setLayerVisibility,
    setLayerIntensity,
    updateLayerSettings,
    openModal,
    closeModal,
    selectSlot,
    clearSelection,
    updateGlobalSettings,
    toggleFavorite,
    placeBid,
    shareSlot,
    navigateToLayer
  };

  return (
    <LayerContext.Provider value={contextValue}>
      {children}
    </LayerContext.Provider>
  );
};

// Hook for using the context
export const useLayerContext = () => {
  const context = useContext(LayerContext);
  if (context === undefined) {
    throw new Error('useLayerContext must be used within a LayerProvider');
  }
  return context;
};

// Export types for use in other components
export type { LayerConfig, ModalType, LayerContextState, LayerContextActions };
