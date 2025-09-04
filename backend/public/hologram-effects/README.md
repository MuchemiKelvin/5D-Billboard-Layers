# 🎬 Hologram Effects Video Library

This directory contains MP4/WebM video files with alpha channels for Layer 2 hologram effects.

## 📁 File Structure

```
hologram-effects/
├── README.md                           # This file
├── hologram-alpha.mp4                  # Main alpha channel video (MP4)
├── hologram-alpha.webm                 # WebM version for better compatibility
├── glow-effect.mp4                     # Glow pulse effect with transparency
├── spin-effect.mp4                     # Spinning energy rings
├── light-sweep.mp4                     # Light reflection sweep
└── combined-effect.mp4                 # Combined hologram effects
```

## 🎯 Video Specifications

### **Format Requirements**
- **Primary**: MP4 with alpha channel (H.264 + Alpha)
- **Secondary**: WebM with alpha channel (VP8/VP9 + Alpha)
- **Resolution**: 1920x1080 (Full HD) or higher for Beamer systems
- **Frame Rate**: 30fps or 60fps for smooth playback
- **Duration**: 10-15 seconds per effect (as per technical specs)

### **Alpha Channel Support**
- **Transparency**: True alpha channel for transparent backgrounds
- **Blending**: Screen blend mode for hologram overlay effect
- **Fallback**: CSS effects if video fails to load
- **Performance**: Hardware accelerated playback

## 🎨 Effect Types

### **1. Glow Pulse Effect**
- **File**: `glow-effect.mp4`
- **Duration**: 12 seconds
- **Description**: Pulsing glow with transparent background
- **Use Case**: Subtle hologram enhancement

### **2. Energy Spin Effect**
- **File**: `spin-effect.mp4`
- **Duration**: 14 seconds
- **Description**: Spinning energy rings with alpha overlay
- **Use Case**: Dynamic energy visualization

### **3. Light Reflection Sweep**
- **File**: `light-sweep.mp4`
- **Duration**: 10 seconds
- **Description**: Moving light reflection sweep
- **Use Case**: Light movement simulation

### **4. Combined Effects**
- **File**: `combined-effect.mp4`
- **Duration**: 15 seconds
- **Description**: All effects combined with transparency
- **Use Case**: Maximum hologram impact

### **5. Main Alpha Video**
- **File**: `hologram-alpha.mp4`
- **Duration**: 12 seconds
- **Description**: Comprehensive hologram effect
- **Use Case**: Default hologram layer

## 🛠️ Technical Implementation

### **Video Loading**
```typescript
// In HologramLayer.tsx
{currentEffect.type === 'video' && currentEffect.videoSrc && (
  <video
    ref={videoRef}
    className="hologram-video"
    loop
    muted
    playsInline
    style={{
      mixBlendMode: 'screen',
      opacity: currentEffect.intensity
    }}
  >
    <source src={currentEffect.videoSrc} type="video/mp4" />
    <source src={currentEffect.videoSrc.replace('.mp4', '.webm')} type="video/webm" />
  </video>
)}
```

### **Fallback Handling**
- **CSS Effects**: Automatic fallback if video fails
- **Error Detection**: Console warnings for debugging
- **Graceful Degradation**: Maintains hologram appearance

## 📱 Device Optimization

### **Beamer Systems (High Performance)**
- **Resolution**: 1920x1080 or higher
- **Frame Rate**: 60fps for smooth projection
- **Effects**: Enhanced brightness and contrast

### **iPad/Walking Billboard (Mobile)**
- **Resolution**: 1024x768 or lower
- **Frame Rate**: 30fps for battery efficiency
- **Effects**: Optimized for mobile displays

### **Responsive Design**
- **Desktop**: Full video quality
- **Tablet**: Reduced quality for performance
- **Mobile**: CSS fallback for compatibility

## 🔄 Looping Behavior

### **Slot Duration Awareness**
- **Continuous Loop**: Effects loop until slot ends
- **Smart Cycling**: Automatic effect transitions
- **Duration Control**: 10-15 second effect cycles
- **Slot Integration**: Respects overall slot timing

### **Performance Optimization**
- **Hardware Acceleration**: GPU-accelerated playback
- **Memory Management**: Efficient video loading
- **Smooth Transitions**: Seamless effect changes

## 🎭 Maya's Design Templates

### **Visual Style**
- **Transparency**: True alpha channel support
- **Hologram Look**: Futuristic, sci-fi aesthetic
- **Color Palette**: Blue/cyan primary colors
- **Light Effects**: Glowing, pulsing, spinning

### **Animation Principles**
- **Organic Movement**: Natural, flowing animations
- **Depth Perception**: 3D-like visual effects
- **Light Interaction**: Dynamic lighting effects
- **Transparency Layers**: Multiple overlay levels

## 📋 Usage Instructions

### **1. Add Video Files**
Place your MP4/WebM files in this directory with alpha channels.

### **2. Update Component**
Modify `HologramLayer.tsx` to reference your video files.

### **3. Test Effects**
Use the hologram controls to test different effects.

### **4. Optimize Performance**
Adjust video quality based on device capabilities.

## 🚀 Future Enhancements

### **Planned Features**
- **AI-Generated Effects**: Machine learning for dynamic effects
- **Real-time Rendering**: Live hologram generation
- **Interactive Elements**: Clickable hologram effects
- **3D Integration**: True 3D hologram support

### **Performance Improvements**
- **WebGL Rendering**: GPU-accelerated effects
- **Compression**: Better video compression
- **Streaming**: Adaptive bitrate streaming
- **Caching**: Intelligent video caching

---

**Note**: This directory is served statically by the backend server. Ensure all video files are optimized for web delivery and include proper alpha channel support.
