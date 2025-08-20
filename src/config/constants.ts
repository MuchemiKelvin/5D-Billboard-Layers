// ============================================================================
// SPONSOR WALL CONSTANTS & CONFIGURATION
// ============================================================================

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export const SYSTEM_CONFIG = {
  // Rotation Settings
  ROTATION_SPEED: 3, // seconds per company
  CYCLES_PER_DAY: 4,
  AUTO_ROTATION: true,
  
  // Display Settings
  THEME: 'dark' as const,
  LANGUAGE: 'en',
  CURRENCY: 'EUR' as const,
  TIMEZONE: 'Europe/Berlin',
  
  // Performance Settings
  ANIMATION_DURATION: 500, // milliseconds
  TRANSITION_DELAY: 100, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  THROTTLE_LIMIT: 100, // milliseconds
  
  // Grid Configuration
  GRID_COLUMNS: 6,
  GRID_ROWS: 4,
  TOTAL_SLOTS: 24,
  MAIN_SPONSOR_SLOTS: 1,
  PREMIUM_SLOTS: 8,
  STANDARD_SLOTS: 15,
  
  // Auction Settings
  DEFAULT_AUCTION_DURATION: 3600, // 1 hour in seconds
  MINIMUM_BID_INCREMENT: 1000, // in EUR
  AUTO_EXTEND_MINUTES: 5,
  WARNING_THRESHOLD: 300, // 5 minutes
  CRITICAL_THRESHOLD: 60, // 1 minute
  
  // Interactive Features
  ENABLE_QR_CODES: true,
  ENABLE_NFC: true,
  ENABLE_HIDDEN_CONTENT: true,
  ENABLE_ENGAGEMENT_TRACKING: true,
  
  // Hologram Effects
  ENABLE_PARTICLES: true,
  ENABLE_LIGHT_RAYS: true,
  ENABLE_DEPTH_FIELD: true,
  ENABLE_SCANNING_LINES: true,
  ENABLE_CORNER_ACCENTS: false, // Disabled as per user request
  
  // Mobile Settings
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

export const ANIMATION_VARIANTS = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 }
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  },
  
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 }
  },
  
  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 }
  },
  
  scaleInUp: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { duration: 0.3 }
  },
  
  // Slide animations
  slideInUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideInDown: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
} as const;

// ============================================================================
// COLOR SCHEMES
// ============================================================================

export const COLOR_SCHEMES = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Hologram colors
  hologram: {
    blue: '#00d4ff',
    purple: '#7c3aed',
    green: '#10b981',
    pink: '#ec4899',
    yellow: '#f59e0b',
    cyan: '#06b6d4',
    magenta: '#d946ef',
    orange: '#f97316',
  },
} as const;

// ============================================================================
// GRADIENT DEFINITIONS
// ============================================================================

export const GRADIENTS = {
  // Slot glow gradients
  slotGlowMain: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  slotGlowPremium: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  slotGlowStandard: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  slotGlowLive: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  slotGlowEmpty: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  
  // Button gradients
  buttonPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  buttonSuccess: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  buttonWarning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  buttonError: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
  
  // Background gradients
  backgroundPrimary: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  backgroundSecondary: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  backgroundAccent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  
  // Card gradients
  cardPrimary: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  cardSecondary: 'linear-gradient(135deg, rgba(44, 62, 80, 0.1) 0%, rgba(52, 73, 94, 0.1) 100%)',
  cardAccent: 'linear-gradient(135deg, rgba(247, 37, 133, 0.1) 0%, rgba(76, 201, 240, 0.1) 100%)',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const TYPOGRAPHY = {
  // Font sizes
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
  '8xl': '6rem',    // 96px
  '9xl': '8rem',    // 128px
  
  // Font weights
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
  
  // Line heights
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

// ============================================================================
// SHADOW DEFINITIONS
// ============================================================================

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  
  // Custom shadows
  glow: '0 0 20px rgba(102, 126, 234, 0.5)',
  glowStrong: '0 0 30px rgba(102, 126, 234, 0.8)',
  glowHologram: '0 0 25px rgba(0, 212, 255, 0.6)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================================================
// TRANSITION DURATIONS
// ============================================================================

export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const; 