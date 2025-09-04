export type DeviceType = 'beamer' | 'ipad' | 'billboard';
export type DisplayMode = 'normal' | 'fullscreen' | 'presentation' | 'portrait' | 'landscape' | 'billboard' | 'advertising';
export type SyncStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface DeviceCapabilities {
  refreshRate: number;
  resolution: {
    width: number;
    height: number;
  };
  syncPriority: 'high' | 'medium' | 'low';
  displayModes: DisplayMode[];
  features: string[];
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: DeviceType;
  capabilities: DeviceCapabilities;
  isPrimary: boolean;
  lastSeen: Date;
  status: 'online' | 'offline' | 'syncing';
  syncLatency: number;
  displayMode: DisplayMode;
  location?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SyncData {
  slots: any[];
  layerConfig: any;
  globalSettings: any;
  currentBlock: any;
  timestamp: Date;
  deviceId: string;
  syncId: string;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  syncTime: number;
  timestamp: Date;
}

export interface DeviceSyncEvent {
  type: 'connect' | 'disconnect' | 'sync' | 'display_mode_change' | 'error';
  deviceId: string;
  deviceType: DeviceType;
  data?: any;
  timestamp: Date;
  error?: string;
}

export interface BeamerConfig {
  projectionMode: 'front' | 'rear' | 'ceiling';
  brightness: number;
  contrast: number;
  keystone: {
    horizontal: number;
    vertical: number;
  };
  aspectRatio: '16:9' | '4:3' | '21:9';
  refreshRate: 60 | 120 | 144;
}

export interface IPadConfig {
  orientation: 'portrait' | 'landscape' | 'auto';
  brightness: number;
  autoLock: boolean;
  batteryOptimization: boolean;
  touchSensitivity: 'low' | 'medium' | 'high';
  hapticFeedback: boolean;
}

export interface BillboardConfig {
  displayType: 'led' | 'lcd' | 'projection';
  brightness: number;
  autoBrightness: boolean;
  weatherProtection: boolean;
  powerMode: 'eco' | 'normal' | 'performance';
  maintenanceMode: boolean;
}

export interface DeviceConfig {
  beamer: BeamerConfig;
  ipad: IPadConfig;
  billboard: BillboardConfig;
}

export interface SyncRequest {
  deviceId: string;
  deviceType: DeviceType;
  lastSyncTime: Date;
  requestedData: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface SyncResponse {
  syncId: string;
  timestamp: Date;
  data: SyncData;
  nextSyncTime: Date;
  priority: 'high' | 'medium' | 'low';
  compression: boolean;
  checksum: string;
}

export interface DeviceHealth {
  deviceId: string;
  deviceType: DeviceType;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    uptime: number;
    temperature: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    syncLatency: number;
    lastSync: Date;
  };
  alerts: string[];
  lastCheck: Date;
}
