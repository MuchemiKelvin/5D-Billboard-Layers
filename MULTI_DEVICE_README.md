# 🎬 Multi-Device Display System

## Overview

The Multi-Device Display System is a comprehensive solution for synchronizing content across different device types in the BeamerShow 24-Slot System. It enables seamless content delivery to:

- **🎬 Beamer (Projector Display)** - High-resolution projection with calibration and optimization features
- **📱 iPad (Walking Billboards)** - Mobile displays with GPS tracking and motion sensors
- **🖥️ Billboard (Static Displays)** - Fixed displays with weather protection and power management

## 🚀 Features

### Core Capabilities
- **Real-time Synchronization** - <1s latency between devices
- **Multi-Device Management** - Centralized control for all device types
- **Health Monitoring** - Real-time device status and performance metrics
- **Automatic Failover** - Seamless switching between devices
- **Content Adaptation** - Device-specific content optimization

### Device-Specific Features

#### 🎬 Beamer Display
- **Projection Modes**: Front, Rear, Ceiling
- **Auto-calibration** with test patterns
- **Keystone Correction** for perfect alignment
- **Brightness & Contrast** optimization
- **Lamp Life Monitoring** and maintenance alerts

#### 📱 iPad Display
- **Orientation Control** (Portrait/Landscape)
- **GPS Tracking** for location-based content
- **Motion Detection** for walking billboard scenarios
- **Battery Optimization** and charging status
- **Touch Sensitivity** and haptic feedback

#### 🖥️ Billboard Display
- **Weather Protection** monitoring
- **Power Management** (Eco/Normal/Performance modes)
- **LED/LCD/Projection** support
- **Maintenance Mode** for updates

## 🏗️ Architecture

### Frontend Components
```
src/components/beamer/
├── DeviceDemo.tsx          # Main demo interface
├── DeviceManager.tsx       # Device switching and management
├── MultiDeviceDisplay.tsx  # Base display component
├── BeamerDisplay.tsx       # Beamer-specific display
├── IPadDisplay.tsx         # iPad-specific display
└── [Other components...]
```

### Backend API Routes
```
backend/src/routes/
├── devices.js              # Device management
├── beamer.js               # Beamer configuration
├── ipad.js                 # iPad configuration
├── sync.js                 # Synchronization
└── [Other routes...]
```

### Device Types & Interfaces
```
src/types/device.ts         # TypeScript definitions
├── DeviceType              # 'beamer' | 'ipad' | 'billboard'
├── DeviceCapabilities      # Device-specific features
├── DeviceInfo              # Device status and metadata
├── SyncData                # Synchronization payload
└── [Other interfaces...]
```

## 🚀 Getting Started

### 1. Frontend Setup

The multi-device system is integrated into the main BeamerShow application. To access it:

```tsx
import DeviceDemo from './components/beamer/DeviceDemo';

// Use in your app
<DeviceDemo />
```

### 2. Backend Setup

The backend automatically includes all necessary routes. Ensure your server is running:

```bash
cd backend
npm install
npm start
```

### 3. Device Registration

Devices automatically register when they connect. You can also manually register devices:

```bash
# Register a new beamer
curl -X POST http://localhost:5000/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "beamer-002",
    "deviceType": "beamer",
    "capabilities": {
      "refreshRate": 60,
      "resolution": {"width": 1920, "height": 1080},
      "syncPriority": "high",
      "displayModes": ["normal", "fullscreen", "presentation"],
      "features": ["projection", "calibration", "keystone"]
    },
    "isPrimary": false
  }'
```

## 📱 Usage Examples

### Switching Between Devices

```tsx
import { DeviceManager } from './components/beamer/DeviceManager';

const [currentDevice, setCurrentDevice] = useState<DeviceType>('beamer');

<DeviceManager
  onDeviceChange={setCurrentDevice}
  onSyncStatusChange={(status) => console.log('Sync:', status)}
/>
```

### Device-Specific Configuration

#### Beamer Configuration
```tsx
// Update beamer settings
const response = await fetch('/api/beamer/config/beamer-001', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brightness: 90,
    contrast: 60,
    projectionMode: 'front'
  })
});
```

#### iPad Configuration
```tsx
// Update iPad settings
const response = await fetch('/api/ipad/config/ipad-001', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orientation: 'landscape',
    brightness: 85,
    touchSensitivity: 'high'
  })
});
```

### Location Tracking (iPad)
```tsx
// Update iPad location
const response = await fetch('/api/ipad/location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'ipad-001',
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 5
  })
});
```

## 🔧 Configuration

### Environment Variables

```bash
# Device synchronization
DEVICE_SYNC_INTERVAL=1000        # Sync frequency in ms
DEVICE_HEALTH_CHECK_INTERVAL=10000 # Health check frequency
DEVICE_TIMEOUT=30000             # Device timeout in ms

# Beamer settings
BEAMER_DEFAULT_BRIGHTNESS=100
BEAMER_DEFAULT_CONTRAST=50
BEAMER_CALIBRATION_TIMEOUT=30000

# iPad settings
IPAD_LOCATION_UPDATE_INTERVAL=30000
IPAD_BATTERY_CHECK_INTERVAL=60000
IPAD_WALKING_SPEED_THRESHOLD=0.5
```

### Device Capabilities

Each device type has specific capabilities that can be configured:

```typescript
interface DeviceCapabilities {
  refreshRate: number;           // Hz (60, 120, 144)
  resolution: {                  // Display resolution
    width: number;
    height: number;
  };
  syncPriority: 'high' | 'medium' | 'low';
  displayModes: DisplayMode[];   // Available display modes
  features: string[];            // Device-specific features
}
```

## 📊 Monitoring & Analytics

### Device Health Dashboard

Access device health information:

```bash
# Get all devices overview
curl http://localhost:5000/api/devices/overview

# Get specific device health
curl http://localhost:5000/api/devices/beamer-001/health

# Get devices by type
curl http://localhost:5000/api/devices/type/ipad

# Get devices by status
curl http://localhost:5000/api/devices/status/online
```

### Performance Metrics

Each device reports:
- **FPS** (Frames per second)
- **Memory Usage** (MB)
- **Network Latency** (ms)
- **Sync Latency** (ms)
- **Uptime** (seconds)
- **Temperature** (for beamers)
- **Battery Level** (for iPads)

## 🔌 API Endpoints

### Device Management
- `GET /api/devices` - List all devices
- `POST /api/devices` - Register new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Remove device
- `GET /api/devices/overview` - Devices overview

### Beamer Control
- `GET /api/beamer/config/:deviceId` - Get beamer config
- `PUT /api/beamer/config/:deviceId` - Update beamer config
- `POST /api/beamer/:deviceId/calibrate` - Start calibration
- `POST /api/beamer/:deviceId/test-pattern` - Display test pattern
- `GET /api/beamer/:deviceId/status` - Get beamer status

### iPad Control
- `GET /api/ipad/config/:deviceId` - Get iPad config
- `PUT /api/ipad/config/:deviceId` - Update iPad config
- `POST /api/ipad/location` - Update location
- `GET /api/ipad/:deviceId/location` - Get location
- `POST /api/ipad/:deviceId/battery` - Update battery status

### Synchronization
- `GET /api/sync/status` - Sync system status
- `GET /api/sync/devices` - Connected devices
- `POST /api/sync/device/:deviceId/sync` - Force sync
- `GET /api/sync/health` - System health

## 🧪 Testing

### Frontend Testing

```bash
# Run component tests
npm test -- --testPathPattern=DeviceManager

# Run specific test file
npm test -- DeviceDemo.test.tsx
```

### Backend Testing

```bash
# Run API tests
cd backend
npm test

# Test specific endpoints
npm test -- --testNamePattern="device registration"
```

### Manual Testing

1. **Start the backend server**
2. **Open the frontend application**
3. **Navigate to DeviceDemo component**
4. **Switch between different device types**
5. **Test device-specific controls**
6. **Monitor synchronization status**

## 🚨 Troubleshooting

### Common Issues

#### Device Not Connecting
- Check network connectivity
- Verify device ID is correct
- Ensure backend is running
- Check firewall settings

#### Sync Latency High
- Reduce sync frequency
- Check network bandwidth
- Optimize device capabilities
- Monitor device performance

#### Beamer Calibration Issues
- Check projection surface
- Verify keystone settings
- Ensure proper lighting
- Run test patterns

#### iPad Location Issues
- Grant location permissions
- Check GPS signal
- Verify accuracy settings
- Monitor battery level

### Debug Mode

Enable debug logging:

```typescript
// Frontend
localStorage.setItem('debug', 'true');

// Backend
DEBUG=* npm start
```

### Log Files

Check backend logs for detailed information:

```bash
# View real-time logs
tail -f backend/logs/combined.log

# View error logs
tail -f backend/logs/error.log
```

## 🔮 Future Enhancements

### Planned Features
- **AI-powered Content Optimization** - Automatic content adaptation
- **Predictive Maintenance** - Proactive device health monitoring
- **Advanced Analytics** - Deep insights into device performance
- **Mobile App** - Remote device management
- **Cloud Integration** - Multi-location device management

### API Extensions
- **Webhook Support** - Real-time notifications
- **GraphQL API** - Flexible data queries
- **REST API v3** - Enhanced endpoints
- **WebSocket v2** - Improved real-time communication

## 📚 Additional Resources

### Documentation
- [API Documentation](./backend/API_DOCUMENTATION.md)
- [Database Setup](./backend/DATABASE_SETUP.md)
- [Backend README](./backend/README.md)

### Examples
- [Device Configuration Examples](./examples/device-config.md)
- [Synchronization Patterns](./examples/sync-patterns.md)
- [Performance Optimization](./examples/performance.md)

### Support
- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Comprehensive guides and tutorials
- **Community** - Developer discussions and support

---

**🎬 BeamerShow Multi-Device Display System**  
*Powered by Kardiverse Technologies Ltd.*  
*Version 2.0.0* | *Last Updated: 2025*
