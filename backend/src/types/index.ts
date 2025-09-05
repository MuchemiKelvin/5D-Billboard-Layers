// Core Types for BeamerShow Backend

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  companyId?: string;
  permissions: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  SPONSOR = 'SPONSOR',
  VIEWER = 'VIEWER'
}

export interface Company {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  tier: CompanyTier;
  logo?: string;
  website?: string;
  description?: string;
  industry: string;
  founded?: number;
  headquarters?: string;
  employeeCount?: string;
  revenue?: string;
  auctionEligible: boolean;
  maxBidAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum CompanyTier {
  PREMIUM = 'PREMIUM',
  STANDARD = 'STANDARD'
}

export interface Slot {
  id: string;
  slotNumber: number;
  slotType: SlotType;
  position: Position;
  currentSponsor?: string;
  currentBid: number;
  reservePrice: number;
  timeRemaining: number;
  status: SlotStatus;
  totalBids: number;
  lastBidTime?: Date;
  startTime?: Date;
  endTime?: Date;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  row: number;
  col: number;
  colSpan?: number;
  rowSpan?: number;
}

export enum SlotType {
  STANDARD = 'STANDARD',
  MAIN_SPONSOR = 'MAIN_SPONSOR',
  LIVE_BIDDING = 'LIVE_BIDDING'
}

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  AUCTION_ACTIVE = 'AUCTION_ACTIVE'
}

export interface Bid {
  id: string;
  slotId: string;
  companyId: string;
  userId: string;
  amount: number;
  status: BidStatus;
  bidderInfo?: BidderInfo;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BidderInfo {
  name: string;
  email: string;
  phone?: string;
}

export enum BidStatus {
  ACTIVE = 'ACTIVE',
  OUTBID = 'OUTBID',
  WON = 'WON',
  WITHDRAWN = 'WITHDRAWN'
}

export interface Analytics {
  id: string;
  slotId?: string;
  companyId?: string;
  userId?: string;
  eventType: AnalyticsType;
  metadata: any;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  timestamp: Date;
  createdAt: Date;
}

export interface DeviceInfo {
  device: string;
  browser: string;
  os?: string;
  version?: string;
}

export enum AnalyticsType {
  QR_SCAN = 'QR_SCAN',
  NFC_TAP = 'NFC_TAP',
  CONTENT_VIEW = 'CONTENT_VIEW',
  CONTENT_LIKE = 'CONTENT_LIKE',
  BID_PLACEMENT = 'BID_PLACEMENT',
  AUCTION_VIEW = 'AUCTION_VIEW',
  SLOT_VIEW = 'SLOT_VIEW',
  HOVER_INTERACTION = 'HOVER_INTERACTION',
  CLICK_INTERACTION = 'CLICK_INTERACTION'
}

export interface ARContent {
  id: string;
  slotId: string;
  title: string;
  description?: string;
  contentType: ARType;
  contentData: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ARType {
  LOGO_HOLOGRAM = 'LOGO_HOLOGRAM',
  INFO_PANEL = 'INFO_PANEL',
  PRODUCT_SHOWCASE = 'PRODUCT_SHOWCASE',
  INTERACTIVE_3D = 'INTERACTIVE_3D'
}

export interface HologramEffect {
  id: string;
  slotId: string;
  effectType: string;
  settings: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  id: string;
  deviceId: string;
  deviceType: DeviceType;
  name: string;
  status: DeviceStatus;
  location?: Location;
  config?: any;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export enum DeviceType {
  BEAMER = 'BEAMER',
  IPAD = 'IPAD',
  BILLBOARD = 'BILLBOARD',
  MOBILE = 'MOBILE'
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR'
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  type: FileType;
  companyId?: string;
  slotId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum FileType {
  SPONSOR_ASSET = 'SPONSOR_ASSET',
  SLOT_CONTENT = 'SLOT_CONTENT',
  AR_CONTENT = 'AR_CONTENT',
  HOLOGRAM_ASSET = 'HOLOGRAM_ASSET',
  SYSTEM_ASSET = 'SYSTEM_ASSET'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any[];
}

// JWT Payload
export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

// Request Extensions
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
