# 🥽 Layer 3: AR Effects System

This directory contains the Augmented Reality (AR) effects for Layer 3 of the 5D Beamer Demo system.

## 🎯 **System Overview**

Layer 3 provides **QR/NFC-triggered AR overlays** that rotate **4x daily** based on time slots:
- **Morning** (6:00 AM - 12:00 PM)
- **Afternoon** (12:00 PM - 6:00 PM)  
- **Evening** (6:00 PM - 12:00 AM)
- **Night** (12:00 AM - 6:00 AM)

## 🔗 **Trigger Methods**

### **QR Code Triggers**
- **Format**: High-density QR codes with AR metadata
- **Content**: JSON payload with overlay ID, slot info, and trigger data
- **Usage**: Scan with mobile device camera or QR reader app
- **Fallback**: CSS-based QR code generation if external library fails

### **NFC Tag Triggers**
- **Format**: NFC tags with AR activation data
- **Content**: NDEF records containing overlay information
- **Usage**: Tap NFC-enabled device to trigger AR
- **Simulation**: Button-based NFC trigger simulation for testing

### **Trigger Types**
- **QR Only**: Exclusive QR code scanning
- **NFC Only**: Exclusive NFC tag proximity
- **Both**: Support for both trigger methods

## 🕐 **4x Daily Rotation System**

### **Morning Slot (6:00 AM - 12:00 PM)**
- **Mascot**: Morning Energy Mascot with coffee and sunrise effects
- **Product**: Breakfast product showcase with 3D models
- **Theme**: Energetic, productive, morning vibes

### **Afternoon Slot (12:00 PM - 6:00 PM)**
- **Mascot**: Afternoon Work Mascot with office and productivity themes
- **Product**: Lunch and snack product demonstrations
- **Theme**: Professional, focused, work-oriented

### **Evening Slot (6:00 PM - 12:00 AM)**
- **Mascot**: Evening Relaxation Mascot with sunset and relaxation effects
- **Product**: Dinner and entertainment product showcase
- **Theme**: Relaxed, social, evening atmosphere

### **Night Slot (12:00 AM - 6:00 AM)**
- **Mascot**: Night Owl Mascot with moon and stars effects
- **Product**: Late night product demonstrations
- **Theme**: Mysterious, calm, night-time ambiance

## 🎭 **AR Overlay Types**

### **1. Mascot Overlays**
- **Format**: Animated character representations
- **Props**: Contextual items (coffee, laptop, sunset, moon)
- **Animation**: Bouncing, floating, and interactive movements
- **Duration**: Continuous until manually closed

### **2. Product Demonstrations**
- **Format**: 3D product models and showcases
- **Content**: Interactive product information and features
- **Models**: GLTF/FBX format support (when available)
- **Fallback**: CSS-based product representations

### **3. Interactive Content**
- **Format**: Clickable and responsive AR elements
- **Features**: Touch gestures, hover effects, animations
- **Engagement**: User interaction tracking and feedback

### **4. 3D Model Integration**
- **Format**: GLTF/FBX 3D model files
- **Optimization**: Compressed for mobile performance
- **Loading**: Target <5 seconds load time
- **Fallback**: CSS-based 3D effect simulation

## 🛠️ **Technical Implementation**

### **QR Code Generation**
```typescript
// QR Code data structure
{
  type: 'ar-trigger',
  overlayId: 'morning-mascot',
  slotNumber: 1,
  timestamp: 1640995200000,
  triggerType: 'qr',
  data: {
    name: 'Morning Energy Mascot',
    description: 'Energetic morning mascot with coffee and sunrise effects',
    timeSlot: 'morning',
    modelUrl: '/ar-models/morning-mascot.glb'
  }
}
```

### **NFC Data Format**
```typescript
// NFC NDEF record structure
{
  type: 'ar-trigger',
  payload: {
    overlayId: 'afternoon-product',
    slotNumber: 8,
    timeSlot: 'afternoon',
    triggerType: 'nfc'
  }
}
```

### **AR Overlay Activation**
```typescript
// AR overlay state management
interface AROverlay {
  id: string;
  name: string;
  type: 'mascot' | 'product' | 'interactive' | '3d-model';
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  description: string;
  modelUrl?: string;
  animationData?: any;
  triggerType: 'qr' | 'nfc' | 'both';
}
```

## 📱 **Device Compatibility**

### **High-End Devices (Beamer Systems)**
- **Resolution**: 1920x1080 or higher
- **Performance**: Full AR effects with 60fps
- **Features**: Advanced 3D rendering and effects
- **Optimization**: Hardware acceleration enabled

### **Tablets (iPad/Walking Billboards)**
- **Resolution**: 1024x768 to 2048x1536
- **Performance**: Optimized AR effects with 30fps
- **Features**: Touch interaction and responsive design
- **Optimization**: Battery-efficient rendering

### **Mobile Devices**
- **Resolution**: 375x667 to 414x896
- **Performance**: Simplified AR effects for compatibility
- **Features**: Touch gestures and mobile-optimized UI
- **Optimization**: Reduced effects for performance

## 🎨 **Visual Effects**

### **AR Frame Design**
- **Style**: Futuristic, sci-fi aesthetic
- **Colors**: Green (#00ff00) primary with transparency
- **Elements**: Corner markers, border effects, glow
- **Animation**: Subtle pulsing and hover effects

### **Content Animations**
- **Mascots**: Bouncing, floating, character-specific movements
- **Products**: Pulsing, rotating, interactive animations
- **Effects**: Glow, shadow, particle systems
- **Performance**: Hardware-accelerated CSS animations

### **Time Slot Visuals**
- **Morning**: Warm yellows and oranges
- **Afternoon**: Bright oranges and reds
- **Evening**: Purple and blue gradients
- **Night**: Dark blues and grays

## 🔄 **Rotation Logic**

### **Automatic Time Detection**
```typescript
// Time slot determination
const updateTimeSlot = () => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
};
```

### **Overlay Selection**
```typescript
// Random overlay selection within time slot
const availableOverlays = arOverlays.filter(
  overlay => overlay.timeSlot === currentTimeSlot
);
const randomOverlay = availableOverlays[
  Math.floor(Math.random() * availableOverlays.length)
];
```

### **Trigger Validation**
```typescript
// Trigger type validation
const canTrigger = (overlay: AROverlay, triggerType: string) => {
  return overlay.triggerType === 'both' || 
         overlay.triggerType === triggerType;
};
```

## 📊 **Performance Metrics**

### **Load Time Targets**
- **AR Activation**: <2 seconds
- **3D Model Loading**: <5 seconds
- **QR Code Generation**: <100ms
- **NFC Response**: <500ms

### **Memory Usage**
- **Base AR Layer**: <50MB
- **3D Models**: <100MB per model
- **Textures**: <200MB total
- **Animations**: <50MB

### **Frame Rate Targets**
- **High-End**: 60fps
- **Tablet**: 30fps
- **Mobile**: 24fps minimum

## 🧪 **Testing & Development**

### **Development Mode**
- **Info Overlays**: Technical details and debug information
- **Test Buttons**: Direct AR activation for testing
- **Performance Monitoring**: Real-time metrics display
- **Error Logging**: Console warnings and error tracking

### **Testing Features**
- **QR Code Simulation**: Button-based QR scan simulation
- **NFC Simulation**: Button-based NFC trigger simulation
- **AR Preview**: Direct AR overlay testing
- **Time Slot Testing**: Manual time slot switching

### **Debug Information**
```typescript
// Development info display
<div className="dev-ar-info">
  L3: {currentAROverlay.name} • {currentTimeSlot} • {currentAROverlay.triggerType}
</div>
```

## 🚀 **Future Enhancements**

### **Planned Features**
- **AI-Generated Content**: Dynamic AR content generation
- **Real-time Collaboration**: Multi-user AR experiences
- **Advanced 3D Rendering**: WebGL and WebXR integration
- **Cloud AR Processing**: Server-side AR computation

### **Performance Improvements**
- **WebGL Rendering**: GPU-accelerated AR effects
- **Model Compression**: Advanced 3D model optimization
- **Streaming AR**: Progressive AR content loading
- **Caching System**: Intelligent AR content caching

### **Integration Features**
- **IoT Integration**: Smart device AR triggers
- **Analytics Dashboard**: AR usage and engagement metrics
- **Content Management**: Dynamic AR content updates
- **Multi-Platform**: Cross-device AR synchronization

## 📋 **Usage Instructions**

### **1. Enable Layer 3**
- Activate Layer 3 in the layer controls
- Select desired time slot and trigger type
- Adjust AR intensity settings

### **2. Trigger AR Effects**
- **QR Code**: Scan displayed QR code with mobile device
- **NFC**: Tap NFC-enabled device to trigger
- **Test**: Use test buttons for direct activation

### **3. Interact with AR**
- **Mascots**: Watch animated character interactions
- **Products**: Explore 3D product demonstrations
- **Interactive**: Touch and interact with AR elements
- **3D Models**: View and manipulate 3D content

### **4. Monitor Performance**
- Check development info overlays
- Monitor frame rates and load times
- Review console logs for errors
- Test across different devices

## 🔧 **Troubleshooting**

### **Common Issues**
- **QR Code Not Scanning**: Check lighting and camera focus
- **NFC Not Triggering**: Ensure NFC is enabled on device
- **AR Not Loading**: Check device compatibility and performance
- **Slow Performance**: Reduce AR intensity or use simpler effects

### **Performance Optimization**
- **Reduce Effects**: Lower AR intensity for better performance
- **Simplify Models**: Use lower-poly 3D models
- **Optimize Textures**: Compress image assets
- **Limit Animations**: Reduce complex animation sequences

### **Device Compatibility**
- **Older Devices**: Use CSS-based effects only
- **Low Memory**: Disable 3D model loading
- **Slow Network**: Use local assets and caching
- **Battery Saving**: Reduce animation complexity

---

**Note**: This AR system is designed to work seamlessly with the existing 5D Beamer Demo framework. All effects are optimized for performance and compatibility across different device types and network conditions.
