import { Sponsor, BiddingEvent } from '@/types/sponsor';

export const sponsorSlots: Sponsor[] = [
  {
    id: 's01',
    name: 'TechCorp Kenya',
    logo: '/placeholder.svg',
    slotNumber: 1,
    tier: 'standard',
    dayPrice: 5000,
    weekendPrice: 12.5,
    weekPrice: 25,
    isActive: true,
    qrCode: 'qr-001',
    website: 'https://techcorp.ke',
    description: 'Leading technology solutions provider in Kenya'
  },
  {
    id: 's02',
    name: 'Safari Bank',
    logo: '/placeholder.svg',
    slotNumber: 2,
    tier: 'premium',
    dayPrice: 5000,
    weekendPrice: 12.5,
    weekPrice: 25,
    isActive: true,
    qrCode: 'qr-002',
    website: 'https://safaribank.ke'
  },
  // Main Sponsor Slot
  {
    id: 'main',
    name: 'MAIN SPONSOR',
    logo: '/placeholder.svg',
    slotNumber: 0,
    tier: 'main',
    dayPrice: 0,
    weekendPrice: 0,
    weekPrice: 0,
    isActive: true,
    description: '5D • AR • HOLOGRAM',
    qrCode: 'qr-main'
  },
  // Live Bidding Slot
  {
    id: 'live',
    name: 'LIVE BIDDING',
    logo: '/placeholder.svg',
    slotNumber: 8,
    tier: 'premium',
    dayPrice: 5000,
    weekendPrice: 12.5,
    weekPrice: 25,
    isActive: true,
    liveBidding: {
      enabled: true,
      currentBid: 15000,
      highestBidder: 'KenyaCorp',
      timeRemaining: 1800 // 30 minutes
    },
    qrCode: 'qr-live'
  }
];

// Generate remaining slots
for (let i = 3; i <= 24; i++) {
  if (i === 8) continue; // Skip live bidding slot
  
  sponsorSlots.push({
    id: `s${i.toString().padStart(2, '0')}`,
    name: `Sponsor ${i}`,
    logo: '/placeholder.svg',
    slotNumber: i,
    tier: i % 5 === 0 ? 'premium' : 'standard',
    dayPrice: 5000,
    weekendPrice: 12.5,
    weekPrice: 25,
    isActive: Math.random() > 0.2, // 80% active
    qrCode: `qr-${i.toString().padStart(3, '0')}`,
    website: `https://sponsor${i}.ke`
  });
}

export const recentBids: BiddingEvent[] = [
  {
    id: 'bid-001',
    slotNumber: 8,
    bidder: 'KenyaCorp',
    amount: 15000,
    timestamp: Date.now() - 120000,
    isWinning: true
  },
  {
    id: 'bid-002',
    slotNumber: 8,
    bidder: 'TechStart',
    amount: 14000,
    timestamp: Date.now() - 300000,
    isWinning: false
  },
  {
    id: 'bid-003',
    slotNumber: 8,
    bidder: 'DigitalKenya',
    amount: 13500,
    timestamp: Date.now() - 600000,
    isWinning: false
  },
  {
    id: 'bid-004',
    slotNumber: 8,
    bidder: 'InnovateLab',
    amount: 12000,
    timestamp: Date.now() - 900000,
    isWinning: false
  }
];

export const todaysFeaturedSponsors = [
  sponsorSlots.find(s => s.id === 'main'),
  sponsorSlots.find(s => s.slotNumber === 1),
  sponsorSlots.find(s => s.slotNumber === 2),
  sponsorSlots.find(s => s.slotNumber === 3),
  sponsorSlots.find(s => s.slotNumber === 4),
  sponsorSlots.find(s => s.slotNumber === 5),
  sponsorSlots.find(s => s.slotNumber === 6),
  sponsorSlots.find(s => s.slotNumber === 7),
  sponsorSlots.find(s => s.id === 'live'),
  sponsorSlots.find(s => s.slotNumber === 9),
  sponsorSlots.find(s => s.slotNumber === 10),
  sponsorSlots.find(s => s.slotNumber === 11),
  sponsorSlots.find(s => s.slotNumber === 12),
  sponsorSlots.find(s => s.slotNumber === 13),
  sponsorSlots.find(s => s.slotNumber === 14),
  sponsorSlots.find(s => s.slotNumber === 16),
  sponsorSlots.find(s => s.slotNumber === 17),
  sponsorSlots.find(s => s.slotNumber === 23),
  sponsorSlots.find(s => s.slotNumber === 24),
  sponsorSlots.find(s => s.slotNumber === 25),
  sponsorSlots.find(s => s.slotNumber === 26)
].filter(Boolean) as Sponsor[];