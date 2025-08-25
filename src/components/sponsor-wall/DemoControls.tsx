import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Zap,
  Presentation,
  Monitor,
  Smartphone,
  Tablet,
  Move,
  Expand,
  Minimize
} from 'lucide-react';

interface DemoControlsProps {
  isAutoRotating: boolean;
  onToggleAutoRotation: () => void;
  currentCycle: number;
  timeUntilNextCycle: number;
  onSetCycle: (cycle: number) => void;
  onSetTiming: (seconds: number) => void;
  className?: string;
}

interface DemoPreset {
  id: string;
  name: string;
  description: string;
  timing: number;
  cycles: number[];
  icon: React.ComponentType<{ className?: string }>;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  isAutoRotating,
  onToggleAutoRotation,
  currentCycle,
  timeUntilNextCycle,
  onSetCycle,
  onSetTiming,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('quick');
  const [customTiming, setCustomTiming] = useState(45);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Draggable position state
  const [position, setPosition] = useState<Position>(() => {
    // Always start with a safe default position
    const safeX = Math.max(0, (window.innerWidth || 1200) - 160); // 150px width + 10px margin
    const safeY = Math.max(0, (window.innerHeight || 800) - 80); // 70px height + 10px margin
    return { x: safeX, y: safeY };
  });

  // Size state
  const [size, setSize] = useState<Size>(() => {
    return { width: 150, height: 70 }; // Half the slot size: 140px/2 = 70px, width reduced proportionally
  });

  // Motion values for smooth dragging - use simple values
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  // Ensure motion values are set immediately and stay set
  useEffect(() => {
    console.log('DemoControls: Initializing with position', { x: position.x, y: position.y });
    
    // Set initial position immediately
    x.set(position.x);
    y.set(position.y);
    
    // Also set a fallback timer to ensure they stay visible
    const fallbackTimer = setTimeout(() => {
      if (x.get() !== position.x || y.get() !== position.y) {
        console.log('Fallback: repositioning controls');
        x.set(position.x);
        y.set(position.y);
      }
    }, 100);

    return () => clearTimeout(fallbackTimer);
  }, [position.x, position.y, x, y]);

  // Transform for smooth animations
  const rotateX = useTransform(y, [0, window.innerHeight || 800], [15, -15]);
  const rotateY = useTransform(x, [0, window.innerWidth || 1200], [-15, 15]);

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Calculate new position
    const newX = position.x + info.offset.x;
    const newY = position.y + info.offset.y;
    
    // Constrain to screen boundaries
    const constrainedX = Math.max(0, Math.min(window.innerWidth - size.width, newX));
    const constrainedY = Math.max(0, Math.min(window.innerHeight - size.height, newY));
    
    const newPosition = { x: constrainedX, y: constrainedY };
    
    // Update state and localStorage
    setPosition(newPosition);
    localStorage.setItem('demo-controls-position', JSON.stringify(newPosition));
    
    // Update motion values
    x.set(constrainedX);
    y.set(constrainedY);
  };

  // Handle resize
  const handleResize = (newWidth: number, newHeight: number) => {
    const constrainedWidth = Math.max(120, Math.min(300, newWidth)); // Min 120px, Max 300px
    const constrainedHeight = Math.max(60, Math.min(140, newHeight)); // Min 60px, Max 140px (full slot height)
    
    const newSize = { width: constrainedWidth, height: constrainedHeight };
    setSize(newSize);
    localStorage.setItem('demo-controls-size', JSON.stringify(newSize));
    
    // Adjust position if it would go out of bounds
    const newX = Math.min(position.x, window.innerWidth - constrainedWidth);
    const newY = Math.min(position.y, window.innerHeight - constrainedHeight);
    
    if (newX !== position.x || newY !== position.y) {
      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);
      localStorage.setItem('demo-controls-position', JSON.stringify(newPosition));
      x.set(newX);
      y.set(newY);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Ensure controls stay within viewport after resize
      const newX = Math.min(position.x, window.innerWidth - size.width);
      const newY = Math.min(position.y, window.innerHeight - size.height);
      
      if (newX !== position.x || newY !== position.y) {
        const newPosition = { x: newX, y: newY };
        setPosition(newPosition);
        localStorage.setItem('demo-controls-position', JSON.stringify(newPosition));
        x.set(newX);
        y.set(newY);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, size, x, y]);

  // Emergency fallback - ensure controls are always visible
  useEffect(() => {
    const emergencyFallback = () => {
      // If controls are somehow off-screen, force them to visible area
      const currentX = x.get();
      const currentY = y.get();
      const maxX = (window.innerWidth || 1200) - size.width;
      const maxY = (window.innerHeight || 800) - size.height;
      
      if (currentX < 0 || currentX > maxX || currentY < 0 || currentY > maxY) {
        console.log('Emergency fallback: repositioning controls');
        const safePosition = {
          x: Math.max(0, Math.min(maxX, currentX)),
          y: Math.max(0, Math.min(maxY, currentY))
        };
        setPosition(safePosition);
        x.set(safePosition.x);
        y.set(safePosition.y);
      }
    };

    // Check every 2 seconds as a safety net
    const interval = setInterval(emergencyFallback, 2000);
    return () => clearInterval(interval);
  }, [x, y, size]);

  // Simple position validation on mount
  useEffect(() => {
    const validatePosition = () => {
      const maxX = (window.innerWidth || 1200) - size.width;
      const maxY = (window.innerHeight || 800) - size.height;
      
      if (position.x < 0 || position.x > maxX || position.y < 0 || position.y > maxY) {
        const safePosition = {
          x: Math.max(0, Math.min(maxX, position.x)),
          y: Math.max(0, Math.min(maxY, position.y))
        };
        setPosition(safePosition);
      }
    };

    // Validate after a short delay
    const timer = setTimeout(validatePosition, 200);
    return () => clearTimeout(timer);
  }, [position, size]);

  // Demo presets for different presentation scenarios
  const demoPresets: DemoPreset[] = [
    {
      id: 'quick',
      name: 'Quick Demo',
      description: 'Fast 15-second cycles for quick overviews',
      timing: 15,
      cycles: [1, 2, 3, 4],
      icon: Zap
    },
    {
      id: 'standard',
      name: 'Standard Demo',
      description: 'Normal 45-second cycles for detailed viewing',
      timing: 45,
      cycles: [1, 2, 3, 4],
      icon: Clock
    },
    {
      id: 'presentation',
      name: 'Presentation Mode',
      description: 'Slow 90-second cycles for client presentations',
      timing: 90,
      cycles: [1, 2, 3, 4],
      icon: Presentation
    },
    {
      id: 'custom',
      name: 'Custom Demo',
      description: 'User-defined timing and cycle selection',
      timing: customTiming,
      cycles: [1, 2, 3, 4],
      icon: Settings
    }
  ];

  // Handle preset selection
  const handlePresetSelect = (preset: DemoPreset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      onSetTiming(preset.timing);
    }
  };

  // Handle full screen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  // Reset position to safe default
  const resetPosition = () => {
    const safeX = Math.max(0, window.innerWidth - 160); // 150px width + 10px margin
    const safeY = Math.max(0, window.innerHeight - 80); // 70px height + 10px margin
    const newPosition = { x: safeX, y: safeY };
    
    setPosition(newPosition);
    localStorage.setItem('demo-controls-position', JSON.stringify(newPosition));
    x.set(safeX);
    y.set(safeY);
    
    console.log('DemoControls: Position reset to', newPosition);
  };

  return (
    <motion.div 
      className={`fixed z-50 ${className}`}
      style={{ 
        left: position.x || 0,
        top: position.y || 0,
        width: isMinimized ? 60 : size.width, // 60px when minimized (proportional to new size)
        height: isMinimized ? 40 : size.height, // 40px when minimized (proportional to new size)
        rotateX: isDragging ? rotateX : 0,
        rotateY: isDragging ? rotateY : 0
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      dragConstraints={{
        left: 0,
        right: Math.max(0, (window.innerWidth || 1200) - (isMinimized ? 60 : size.width)),
        top: 0,
        bottom: Math.max(0, (window.innerHeight || 800) - (isMinimized ? 40 : size.height))
      }}
      whileDrag={{ 
        scale: 1.05,
        zIndex: 1000
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
    >
      {/* Main Controls Bar */}
      <motion.div 
        className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-2 shadow-2xl cursor-move h-full"
        style={{ width: '100%', height: '100%' }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Header with Drag Handle and new buttons */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Move className="w-3 h-3 text-gray-400" />
            <h3 className="text-white font-semibold text-xs">Demo Controls</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetPosition}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              title="Reset Position"
            >
              <RotateCcw className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={toggleMinimized}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <Expand className="w-3 h-3 text-gray-400" />
              ) : (
                <Minimize className="w-3 h-3 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Settings className="w-3 h-3 text-gray-400" />
              </motion.div>
            </button>
            <button
              onClick={toggleFullScreen}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-3 h-3 text-gray-400" />
              ) : (
                <Maximize2 className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Basic Controls - Hidden when minimized */}
        {!isMinimized && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={onToggleAutoRotation}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isAutoRotating 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isAutoRotating ? "Pause Demo" : "Start Demo"}
            >
              {isAutoRotating ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onSetCycle(1)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Reset to Cycle 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex-1 bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-white text-xs font-mono">
                {formatTime(timeUntilNextCycle)}
              </div>
              <div className="text-gray-400 text-xs">
                Cycle {currentCycle}/4
              </div>
            </div>
          </div>
        )}

        {/* Expanded Controls - Hidden when minimized */}
        {!isMinimized && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-700 pt-4">
                  {/* Demo Presets */}
                  <div className="mb-4">
                    <h4 className="text-white text-sm font-medium mb-3">Demo Presets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {demoPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          className={`p-3 rounded-lg text-left transition-all duration-200 ${
                            selectedPreset === preset.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <preset.icon className="w-4 h-4" />
                            <span className="text-xs font-medium">{preset.name}</span>
                          </div>
                          <div className="text-xs opacity-80">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Timing */}
                  {selectedPreset === 'custom' && (
                    <div className="mb-4">
                      <h4 className="text-white text-sm font-medium mb-2">Custom Timing</h4>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="120"
                          value={customTiming}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setCustomTiming(value);
                            onSetTiming(value);
                          }}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-white text-sm font-mono min-w-[3rem]">
                          {customTiming}s
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cycle Selection */}
                  <div className="mb-4">
                    <h4 className="text-white text-sm font-medium mb-2">Active Cycles</h4>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((cycle) => (
                        <button
                          key={cycle}
                          onClick={() => onSetCycle(cycle)}
                          className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                            currentCycle === cycle
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          {cycle}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Device Preview */}
                  <div>
                    <h4 className="text-white text-sm font-medium mb-2">Device Preview</h4>
                    <div className="flex gap-2">
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Desktop">
                        <Monitor className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Tablet">
                        <Tablet className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Mobile">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Drag Indicator */}
        <div className="absolute top-2 right-2 opacity-30">
          <Move className="w-3 h-3 text-gray-400" />
        </div>

        {/* Resize Handle - Bottom Right Corner */}
        {!isMinimized && (
          <div 
            className="absolute bottom-2 right-2 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
              
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = size.width;
              const startHeight = size.height;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;
                
                handleResize(startWidth + deltaX, startHeight + deltaY);
              };
              
              const handleMouseUp = () => {
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-full h-full border-r-2 border-b-2 border-gray-400 rounded-br-lg"></div>
          </div>
        )}
      </motion.div>

      {/* Full Screen Overlay Controls */}
      {isFullScreen && (
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl px-4 py-2">
            <div className="text-white text-sm font-medium">
              Presentation Mode - Press ESC to exit
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
