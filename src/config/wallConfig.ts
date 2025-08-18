export const WALL_CONFIG = {
  // Mode: 'demo' runs fast 4s slots continuously, 'daily' enforces 4 rotations/day (6h each)
  SCHEDULE_MODE: 'daily' as 'demo' | 'daily',
  // Rotation settings
  TOTAL_SLOTS: 24,
  ROTATIONS_PER_DAY: 4,
  ROTATION_DURATION: 86400000 / 4, // 24 hours / 4 rotations = 6 hours per rotation
  BRANDING_BREAK_MS: 30000, // Branding loop duration between rotations
  ENABLE_HOLOGRAM: false, // Toggle three.js hologram effects
  
  // Timing settings
  SLOT_DISPLAY_TIME: 4000, // 4 seconds per slot
  FADE_IN_DURATION: 600, // 0.6 seconds
  FADE_OUT_DURATION: 600, // 0.6 seconds
  CONTENT_DISPLAY_TIME: 2800, // 2.8 seconds (4s - 0.6s - 0.6s)
  
  // Visual settings
  GRID: {
    COLUMNS: 6,
    ROWS: 4,
    MAIN_SPONSOR_SIZE: 2, // 2x2 grid space
  },
  
  // Premium slot settings
  HOLOGRAM_OPACITY: 0.3,
  PREMIUM_SLOTS_PER_VIEW: 3,
  
  // Interaction settings
  QR_INTERACTION_TIMEOUT: 30000, // 30 seconds
  LIVE_BIDDING_UPDATE_INTERVAL: 5000, // 5 seconds
  
  // Pricing
  ADD_ONS: {
    HOLOGRAM: 10000, // +€10k
    LIVE_BIDDING: 15000, // +€15k
    NFC_QR: 5000, // +€5k
  }
};
