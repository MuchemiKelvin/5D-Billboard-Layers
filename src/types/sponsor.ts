export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  videoUrl?: string;
  slotNumber: number;
  tier: 'main' | 'premium' | 'standard';
  dayPrice: number;
  weekendPrice: number;
  weekPrice: number;
  isActive: boolean;
  liveBidding?: {
    enabled: boolean;
    currentBid: number;
    highestBidder: string;
    timeRemaining: number;
  };
  qrCode?: string;
  website?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface BiddingEvent {
  id: string;
  slotNumber: number;
  bidder: string;
  amount: number;
  timestamp: number;
  isWinning: boolean;
}

export interface SponsorRotation {
  currentSlot: number;
  rotationSpeed: number;
  totalRotations: number;
  isPlaying: boolean;
  lastRotationTime: number;
}

export interface WallStatus {
  currentDay: number;
  totalRotationsToday: number;
  lastRotationTimestamp: number;
  activeRotation: number;
}