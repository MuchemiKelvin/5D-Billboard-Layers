# 🏗️ 5D Sponsor Wall - Project Structure Documentation

## 📁 Project Overview

The 5D Sponsor Wall is a sophisticated digital advertising display system with a 5-layer architecture, featuring 24 auction slots, holographic effects, and interactive capabilities.

## 🎯 Architecture Layers

1. **Layer 1: Base Layout** - Grid structure and positioning
2. **Layer 2: Sponsor Content Animation** - Company rotation and transitions
3. **Layer 3: Hologram & FX** - Visual effects and animations
4. **Layer 4: Interactive Layer** - QR codes, NFC, hidden content
5. **Layer 5: Data & Live Bidding Feed** - Real-time auction data

## 📂 Directory Structure

```
src/
├── components/           # React components
│   ├── sponsor-wall/    # Sponsor wall specific components
│   ├── ui/              # Reusable UI components
│   └── pages/           # Page components
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and helpers
├── config/              # Configuration constants
├── data/                # Static data and mock data
└── styles/              # CSS and styling files
```

## 🔧 Core Components

### Sponsor Wall Components (`src/components/sponsor-wall/`)

- **`SponsorWall.tsx`** - Main container component
- **`SponsorGrid.tsx`** - Grid layout manager
- **`SponsorSlot.tsx`** - Individual slot component
- **`HologramEffect.tsx`** - Visual effects and animations
- **`LiveAuctionFeed.tsx`** - Live bidding interface
- **`InteractiveLayer.tsx`** - Interactive features container

### Interactive Components

- **`QRCodeGenerator.tsx`** - QR code generation and management
- **`NFCTrigger.tsx`** - NFC interaction simulation
- **`HiddenContentSystem.tsx`** - Content unlocking system
- **`EngagementTracker.tsx`** - User interaction analytics
- **`AuctionTimer.tsx`** - Countdown timers
- **`BidTracker.tsx`** - Bid tracking and management

### UI Components (`src/components/ui/`)

- **`ErrorBoundary.tsx`** - Error handling and recovery
- **`LoadingSpinner.tsx`** - Loading states and animations
- **`Toast.tsx`** - Notification system

## 📝 Type Definitions (`src/types/`)

### Core Types (`sponsor-wall.ts`)

```typescript
// Core entities
interface Company
interface AuctionSlot
interface Bid

// Interactive features
interface QRCodeData
interface NFCData
interface HiddenContent
interface EngagementData

// System configuration
interface SystemConfig
interface SlotConfiguration
interface HologramSettings

// Component props
interface BaseComponentProps
interface SlotComponentProps
interface InteractiveComponentProps
```

## 🪝 Custom Hooks (`src/hooks/`)

### Sponsor Wall Hooks (`use-sponsor-wall.ts`)

- **`useSponsorRotation`** - Company rotation management
- **`useAuctionTimer`** - Timer functionality
- **`useEngagementTracking`** - User interaction tracking
- **`useLocalStorage`** - Local storage management
- **`useMediaQuery`** - Responsive design
- **`useIntersectionObserver`** - Scroll-based animations
- **`useDebounce`** - Input debouncing
- **`useThrottle`** - Function throttling

### Utility Hooks

- **`use-mobile.tsx`** - Mobile device detection
- **`use-toast.ts`** - Toast notification system

## 🛠️ Utility Functions (`src/lib/`)

### Core Utilities (`utils.ts`)

```typescript
// Formatting
formatCurrency()
convertKESToEUR()
formatTimeRemaining()
formatDate()

// Validation
isValidEmail()
isValidPhone()
isValidBidAmount()

// Array/Object manipulation
shuffleArray()
getRandomItem()
groupBy()

// String utilities
generateRandomString()
generateUniqueId()
capitalize()
kebabToTitle()

// Math utilities
clamp()
calculatePercentage()
randomBetween()

// DOM utilities
isInViewport()
debounce()
throttle()

// Color utilities
generateRandomColor()
generateGradientColors()

// Error handling
createError()
safeJsonParse()
safeJsonStringify()
```

## ⚙️ Configuration (`src/config/`)

### Constants (`constants.ts`)

```typescript
// System configuration
SYSTEM_CONFIG
ANIMATION_VARIANTS
COLOR_SCHEMES
GRADIENTS
BREAKPOINTS
SPACING
TYPOGRAPHY
SHADOWS
BORDER_RADIUS
Z_INDEX
TRANSITIONS
```

## 🎨 Styling and CSS

### Tailwind CSS Configuration

- Custom color schemes
- Responsive breakpoints
- Animation variants
- Component-specific utilities

### CSS Custom Properties

```css
/* Slot glow effects */
.slot-glow-main
.slot-glow-premium
.slot-glow-standard
.slot-glow-live
.slot-glow-empty

/* Hologram effects */
.hologram-particle
.hologram-light-ray
.hologram-depth-field
.hologram-scanning-line
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Grid System

- **Mobile**: 2 columns
- **Tablet**: 4 columns
- **Desktop**: 6 columns

## 🚀 Performance Optimizations

### Animation Performance

- Use `transform` instead of layout-changing properties
- Implement `will-change` CSS property
- Optimize Framer Motion variants
- Reduce unnecessary re-renders

### Code Splitting

- Lazy load interactive components
- Dynamic imports for heavy features
- Component-level code splitting

## 🔒 Error Handling

### Error Boundaries

- Component-level error catching
- Graceful fallback UI
- Error reporting and logging
- User-friendly error messages

### Error Recovery

- Automatic retry mechanisms
- Fallback content display
- User-initiated recovery actions

## 📊 State Management

### Local State

- React hooks for component state
- Context API for shared state
- Local storage for persistence

### Global State (Future)

- Zustand for lightweight state management
- Redux Toolkit for complex state
- React Query for server state

## 🧪 Testing Strategy

### Component Testing

- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for user flows
- Visual regression testing

### Testing Tools

- Jest for test runner
- React Testing Library for component testing
- MSW for API mocking
- Playwright for E2E testing

## 📦 Build and Deployment

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Production

- Vite for fast builds
- Tree shaking for bundle optimization
- Asset optimization and compression
- Environment-specific configurations

## 🔄 Development Workflow

### Code Organization

1. **Feature-based structure** - Components grouped by functionality
2. **Shared utilities** - Common functions in `lib/`
3. **Type safety** - Comprehensive TypeScript interfaces
4. **Component composition** - Reusable, composable components

### Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks

### Git Workflow

- Feature branches for development
- Pull request reviews
- Automated testing on CI/CD
- Semantic versioning

## 🚧 Future Enhancements

### Backend Integration

- RESTful API endpoints
- Real-time WebSocket connections
- Database integration
- Authentication system

### Admin Panel

- Content management interface
- Analytics dashboard
- User management
- System configuration

### Advanced Features

- AI-powered content recommendations
- Advanced analytics and reporting
- Multi-language support
- Accessibility improvements

## 📚 Additional Resources

### Documentation

- [Component API Reference](./COMPONENT_API.md)
- [Styling Guide](./STYLING_GUIDE.md)
- [Performance Guide](./PERFORMANCE_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### External Libraries

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool

---

## 🎯 Getting Started

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Build for production**: `npm run build`
4. **Run tests**: `npm test`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 