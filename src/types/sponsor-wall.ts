// ============================================================================
// SPONSOR WALL TYPE DEFINITIONS
// ============================================================================

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Company {
  id: string;
  name: string;
  category: string;
  logo: string;
  website?: string;
  description?: string;
  industry: string;
  founded?: number;
  headquarters?: string;
  employeeCount?: string;
  revenue?: string;
}

export interface AuctionSlot {
  id: string;
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  position: {
    row: number;
    col: number;
    colSpan?: number;
    rowSpan?: number;
  };
  currentSponsor?: string;
  currentBid?: number;
  reservePrice?: number;
  timeRemaining: number;
  status: 'available' | 'occupied' | 'reserved' | 'auction-active';
  totalBids: number;
  lastBidTime?: Date;
  startTime?: Date;
  endTime?: Date;
}

export interface Bid {
  id: string;
  slotId: string;
  companyId: string;
  amount: number;
  timestamp: Date;
  status: 'active' | 'outbid' | 'withdrawn';
  bidderInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

// ============================================================================
// INTERACTIVE LAYER TYPES
// ============================================================================

export interface QRCodeData {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyId?: string;
  companyName?: string;
  currentBid?: number;
  reservePrice?: number;
  timestamp: number;
  uniqueId: string;
  qrCodeUrl?: string;
  scanCount: number;
  lastScanTime?: Date;
}

export interface NFCData {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  companyId?: string;
  companyName?: string;
  nfcTag: string;
  timestamp: number;
  interactions: number;
  lastInteractionTime?: Date;
  deviceIds: string[];
}

export interface HiddenContent {
  id: string;
  slotId: string;
  type: 'offer' | 'hidden-content' | 'bid-participation' | 'special-deal';
  title: string;
  description: string;
  value: string;
  isUnlocked: boolean;
  unlockRequirement: string;
  expiresAt: Date;
  views: number;
  likes: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EngagementData {
  slotNumber: number;
  slotType: 'standard' | 'main-sponsor' | 'live-bidding';
  totalInteractions: number;
  uniqueUsers: number;
  qrScans: number;
  nfcTaps: number;
  contentViews: number;
  contentLikes: number;
  contentShares: number;
  averageSessionTime: number;
  conversionRate: number;
  lastInteraction: Date;
  topInteractions: Array<{
    type: string;
    count: number;
    timestamp: Date;
  }>;
  dailyStats: Array<{
    date: string;
    interactions: number;
    users: number;
  }>;
}

// ============================================================================
// AUCTION SYSTEM TYPES
// ============================================================================

export interface AuctionSession {
  id: string;
  slotId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
  currentBid?: Bid;
  bidHistory: Bid[];
  participants: string[];
  reservePrice: number;
  minimumBidIncrement: number;
  autoExtend: boolean;
  autoExtendMinutes: number;
}

export interface AuctionTimer {
  slotId: string;
  timeRemaining: number;
  isPaused: boolean;
  isActive: boolean;
  warningThreshold: number;
  criticalThreshold: number;
  lastUpdate: Date;
}

// ============================================================================
// HOLOGRAM & VISUAL EFFECTS TYPES
// ============================================================================

export interface HologramSettings {
  intensity: number;
  colorScheme: string[];
  enableParticles: boolean;
  enableLightRays: boolean;
  enableDepthField: boolean;
  enableScanningLines: boolean;
  enableCornerAccents: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  particleDensity: number;
  lightRayCount: number;
}

export interface VisualEffect {
  id: string;
  type: 'particle' | 'light-ray' | 'depth-field' | 'scanning-line' | 'corner-accent';
  position: { x: number; y: number; z: number };
  color: string;
  intensity: number;
  duration: number;
  delay: number;
  easing: string;
}

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'bidder' | 'admin' | 'super-admin';
  companyId?: string;
  permissions: string[];
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    deviceType: string;
  };
}

// ============================================================================
// ANALYTICS & REPORTING TYPES
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  type: 'qr_scan' | 'nfc_tap' | 'content_view' | 'content_like' | 'bid_placement' | 'auction_view';
  slotId: string;
  userId?: string;
  companyId?: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
  sessionId?: string;
}

export interface PerformanceMetrics {
  slotId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  engagementRate: number;
  averageViewTime: number;
  bounceRate: number;
}

// ============================================================================
// CONFIGURATION & SETTINGS TYPES
// ============================================================================

export interface SystemConfig {
  rotationSpeed: number; // seconds per cycle
  cyclesPerDay: number;
  autoRotation: boolean;
  maintenanceMode: boolean;
  timezone: string;
  currency: 'EUR' | 'USD' | 'KES';
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface SlotConfiguration {
  slotId: string;
  displaySettings: {
    logoSize: 'small' | 'medium' | 'large';
    textSize: 'small' | 'medium' | 'large';
    animationStyle: 'subtle' | 'moderate' | 'dramatic';
    colorScheme: string[];
  };
  contentSettings: {
    showCompanyInfo: boolean;
    showBidAmount: boolean;
    showTimer: boolean;
    showQRCode: boolean;
    showNFC: boolean;
  };
  interactionSettings: {
    enableHover: boolean;
    enableClick: boolean;
    enableTouch: boolean;
    hoverDelay: number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface SystemEvent {
  id: string;
  type: 'slot_change' | 'bid_placed' | 'auction_start' | 'auction_end' | 'content_unlocked' | 'error';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  slotId?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SlotType = 'standard' | 'main-sponsor' | 'live-bidding';
export type SlotStatus = 'available' | 'occupied' | 'reserved' | 'auction-active';
export type BidStatus = 'active' | 'outbid' | 'withdrawn';
export type AuctionStatus = 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';
export type UserRole = 'viewer' | 'bidder' | 'admin' | 'super-admin';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type Currency = 'EUR' | 'USD' | 'KES';
export type Theme = 'light' | 'dark' | 'auto';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface SlotComponentProps extends BaseComponentProps {
  slotNumber: number;
  slotType: SlotType;
  companyData?: Company;
  isActive: boolean;
  isTransitioning?: boolean;
  onSlotClick?: (slotNumber: number) => void;
  onSlotHover?: (slotNumber: number) => void;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  slotNumber: number;
  slotType: SlotType;
  companyData?: Company;
  onDataGenerated?: (data: unknown) => void;
  onError?: (error: Error) => void;
} 