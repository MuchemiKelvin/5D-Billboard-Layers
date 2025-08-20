import companiesData from './companies.json';
import slotsData from './auction-slots.json';
import categoriesData from './categories.json';

export interface Company {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  tier: 'premium' | 'standard';
  logo: string;
  website: string;
  auctionEligible: boolean;
  maxBidAmount: number;
  description: string;
  industry: string;
  founded: number;
  headquarters: string;
}

export interface AuctionSlot {
  id: string;
  slotNumber: number;
  type: 'standard' | 'main-sponsor' | 'live-bidding';
  currentSponsor: string | null;
  reservePrice: number;
  currentBid: number;
  auctionStatus: 'available' | 'active' | 'reserved' | 'ended';
  timeRemaining: number;
  totalBids: number;
  category: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Array<{
    id: string;
    name: string;
    description: string;
    companies: string[];
  }>;
  auctionEligible: boolean;
  reservePriceMultiplier: number;
  color: string;
}

export interface Bid {
  id: string;
  slotId: string;
  bidderId: string;
  amount: number;
  timestamp: Date;
  status: 'active' | 'outbid' | 'won';
}

export interface Auction {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended';
  totalSlots: number;
  reservePrice: number;
  currentRevenue: number;
  totalBids: number;
}

class DataService {
  private companies: Company[] = [];
  private slots: AuctionSlot[] = [];
  private categories: Category[] = [];
  private bids: Bid[] = [];
  private auctions: Auction[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      this.companies = companiesData.companies;
      this.slots = slotsData.slots;
      this.categories = categoriesData.categories;
      this.initializeDemoData();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private initializeDemoData() {
    // Initialize demo auction
    this.auctions = [
      {
        id: 'AUCTION-001',
        title: 'Q1 2024 Digital Advertising Auction',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-03-31T23:59:59Z'),
        status: 'active',
        totalSlots: 24,
        reservePrice: 50000,
        currentRevenue: 650000,
        totalBids: 12
      }
    ];

    // Initialize demo bids
    this.bids = [
      {
        id: 'BID-001',
        slotId: 'SLOT-008',
        bidderId: 'COMP-002',
        amount: 150000,
        timestamp: new Date('2024-01-15T10:30:00Z'),
        status: 'active'
      },
      {
        id: 'BID-002',
        slotId: 'SLOT-009',
        bidderId: 'COMP-001',
        amount: 500000,
        timestamp: new Date('2024-01-15T09:00:00Z'),
        status: 'won'
      }
    ];
  }

  // Company methods
  getAllCompanies(): Company[] {
    return this.companies;
  }

  getCompanyById(id: string): Company | undefined {
    return this.companies.find(company => company.id === id);
  }

  getCompaniesByCategory(category: string): Company[] {
    return this.companies.filter(company => company.category === category);
  }

  getCompaniesByTier(tier: 'premium' | 'standard'): Company[] {
    return this.companies.filter(company => company.tier === tier);
  }

  getAuctionEligibleCompanies(): Company[] {
    return this.companies.filter(company => company.auctionEligible);
  }

  // Slot methods
  getAllSlots(): AuctionSlot[] {
    return this.slots;
  }

  getSlotByNumber(slotNumber: number): AuctionSlot | undefined {
    return this.slots.find(slot => slot.slotNumber === slotNumber);
  }

  getSlotsByType(type: 'standard' | 'main-sponsor' | 'live-bidding'): AuctionSlot[] {
    return this.slots.filter(slot => slot.type === type);
  }

  getAvailableSlots(): AuctionSlot[] {
    return this.slots.filter(slot => slot.auctionStatus === 'available');
  }

  getActiveSlots(): AuctionSlot[] {
    return this.slots.filter(slot => slot.auctionStatus === 'active');
  }

  // Category methods
  getAllCategories(): Category[] {
    return this.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(category => category.id === id);
  }

  getCategoryByName(name: string): Category | undefined {
    return this.categories.find(category => category.name === name);
  }

  // Bid methods
  getAllBids(): Bid[] {
    return this.bids;
  }

  getBidsBySlot(slotId: string): Bid[] {
    return this.bids.filter(bid => bid.slotId === slotId);
  }

  getBidsByCompany(companyId: string): Bid[] {
    return this.bids.filter(bid => bid.bidderId === companyId);
  }

  addBid(bid: Bid): void {
    this.bids.push(bid);
  }

  // Auction methods
  getAllAuctions(): Auction[] {
    return this.auctions;
  }

  getActiveAuctions(): Auction[] {
    return this.auctions.filter(auction => auction.status === 'active');
  }

  // Utility methods
  getCompanyLogo(companyId: string): string | null {
    const company = this.getCompanyById(companyId);
    return company?.logo || null;
  }

  getCompanyName(companyId: string): string | null {
    const company = this.getCompanyById(companyId);
    return company?.name || null;
  }

  getSlotCompany(slotNumber: number): Company | null {
    const slot = this.getSlotByNumber(slotNumber);
    if (slot?.currentSponsor) {
      return this.getCompanyById(slot.currentSponsor) || null;
    }
    return null;
  }

  // Statistics methods
  getTotalRevenue(): number {
    return this.slots.reduce((total, slot) => total + slot.currentBid, 0);
  }

  getTotalBids(): number {
    return this.bids.length;
  }

  getAvailableSlotsCount(): number {
    return this.getAvailableSlots().length;
  }

  getOccupiedSlotsCount(): number {
    return this.slots.length - this.getAvailableSlotsCount();
  }

  // Search methods
  searchCompanies(query: string): Company[] {
    const lowerQuery = query.toLowerCase();
    return this.companies.filter(company => 
      company.name.toLowerCase().includes(lowerQuery) ||
      company.category.toLowerCase().includes(lowerQuery) ||
      company.industry.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter methods
  filterCompaniesByMaxBid(minBid: number, maxBid: number): Company[] {
    return this.companies.filter(company => 
      company.maxBidAmount >= minBid && company.maxBidAmount <= maxBid
    );
  }

  filterSlotsByPriceRange(minPrice: number, maxPrice: number): AuctionSlot[] {
    return this.slots.filter(slot => 
      slot.reservePrice >= minPrice && slot.reservePrice <= maxPrice
    );
  }
}

// Create singleton instance
export const dataService = new DataService();

// Export types for use in components
export type { Company, AuctionSlot, Category, Bid, Auction }; 