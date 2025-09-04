import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';
import { BeamerConfig, DeviceType } from '../../types/device';
import MultiDeviceDisplay from './MultiDeviceDisplay';

interface BeamerDisplayProps {
  deviceId: string;
  isPrimary?: boolean;
  onSyncStatusChange?: (status: any) => void;
}

const BeamerDisplay: React.FC<BeamerDisplayProps> = ({
  deviceId,
  isPrimary = true,
  onSyncStatusChange
}) => {
  const { 
    selectedSlot, 
    layerConfig, 
    globalSettings,
    currentBlock,
    slots 
  } = useLayerContext();

  const [beamerConfig, setBeamerConfig] = useState<BeamerConfig>({
    projectionMode: 'front',
    brightness: 100,
    contrast: 50,
    keystone: { horizontal: 0, vertical: 0 },
    aspectRatio: '16:9',
    refreshRate: 60
  });

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationGrid, setCalibrationGrid] = useState(false);
  const [testPattern, setTestPattern] = useState(false);
  const [overlayInfo, setOverlayInfo] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Initialize beamer-specific settings
    initializeBeamer();
    
    // Start render loop
    startRenderLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const initializeBeamer = async () => {
    try {
      // Load beamer configuration from backend
      const response = await fetch(`/api/beamer/config/${deviceId}`);
      if (response.ok) {
        const config = await response.json();
        setBeamerConfig(config);
      }
    } catch (error) {
      console.error('Failed to load beamer config:', error);
    }
  };

  const startRenderLoop = () => {
    const render = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          renderFrame(ctx);
        }
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const renderFrame = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply beamer-specific rendering optimizations
    ctx.imageSmoothingEnabled = false; // Sharp edges for projection
    ctx.filter = `brightness(${beamerConfig.brightness}%) contrast(${beamerConfig.contrast}%)`;

    // Render current slot content
    if (selectedSlot && slots[selectedSlot]) {
      renderSlotContent(ctx, slots[selectedSlot], width, height);
    }

    // Render calibration grid if active
    if (calibrationGrid) {
      renderCalibrationGrid(ctx, width, height);
    }

    // Render test pattern if active
    if (testPattern) {
      renderTestPattern(ctx, width, height);
    }

    // Render overlay information
    if (overlayInfo) {
      renderOverlayInfo(ctx, width, height);
    }
  };

  const renderSlotContent = (ctx: CanvasRenderingContext2D, slot: any, width: number, height: number) => {
    // Render slot content with beamer optimizations
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Slot content based on active layers
    if (layerConfig['layer-1-static'].active && slot.staticLogo) {
      renderStaticLogo(ctx, slot.staticLogo, centerX, centerY);
    }

    if (layerConfig['layer-2-hologram'].active && slot.hologramVideo) {
      renderHologramEffect(ctx, slot.hologramVideo, centerX, centerY);
    }

    if (layerConfig['layer-3-ar'].active && slot.arModel) {
      renderARPreview(ctx, slot.arModel, centerX, centerY);
    }
  };

  const renderStaticLogo = (ctx: CanvasRenderingContext2D, logo: string, x: number, y: number) => {
    // Render static sponsor logo
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOGO', x, y);
  };

  const renderHologramEffect = (ctx: CanvasRenderingContext2D, video: string, x: number, y: number) => {
    // Render hologram effect preview
    ctx.fillStyle = '#00ffff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  };

  const renderARPreview = (ctx: CanvasRenderingContext2D, model: string, x: number, y: number) => {
    // Render AR model preview
    ctx.fillStyle = '#ff00ff';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x - 75, y - 75, 150, 150);
    ctx.globalAlpha = 1.0;
  };

  const renderCalibrationGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;

    // Vertical lines
    for (let x = 0; x <= width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center crosshair
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
  };

  const renderTestPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Render test pattern for beamer calibration
    const patternSize = 50;
    
    for (let x = 0; x < width; x += patternSize) {
      for (let y = 0; y < height; y += patternSize) {
        const isEven = ((x / patternSize) + (y / patternSize)) % 2 === 0;
        ctx.fillStyle = isEven ? '#fff' : '#000';
        ctx.fillRect(x, y, patternSize, patternSize);
      }
    }
  };

  const renderOverlayInfo = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Render overlay information
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 120);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const info = [
      `Device: Beamer ${deviceId}`,
      `Mode: ${beamerConfig.projectionMode}`,
      `Brightness: ${beamerConfig.brightness}%`,
      `Contrast: ${beamerConfig.contrast}%`,
      `Aspect: ${beamerConfig.aspectRatio}`,
      `Refresh: ${beamerConfig.refreshRate}Hz`
    ];

    info.forEach((line, index) => {
      ctx.fillText(line, 20, 20 + (index * 16));
    });
  };

  const handleCalibration = () => {
    setIsCalibrating(true);
    setCalibrationGrid(true);
    
    // Auto-calibration sequence
    setTimeout(() => {
      setCalibrationGrid(false);
      setIsCalibrating(false);
    }, 5000);
  };

  const handleTestPattern = () => {
    setTestPattern(!testPattern);
  };

  const handleConfigUpdate = async (updates: Partial<BeamerConfig>) => {
    try {
      const response = await fetch(`/api/beamer/config/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setBeamerConfig(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Failed to update beamer config:', error);
    }
  };

  const renderBeamerControls = () => (
    <motion.div
      className="absolute top-2 left-2 z-50 bg-black/80 text-white p-4 rounded-lg"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-lg font-bold mb-3">🎬 Beamer Controls</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Projection Mode</label>
          <select
            value={beamerConfig.projectionMode}
            onChange={(e) => handleConfigUpdate({ projectionMode: e.target.value as any })}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          >
            <option value="front">Front</option>
            <option value="rear">Rear</option>
            <option value="ceiling">Ceiling</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Brightness: {beamerConfig.brightness}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={beamerConfig.brightness}
            onChange={(e) => handleConfigUpdate({ brightness: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Contrast: {beamerConfig.contrast}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={beamerConfig.contrast}
            onChange={(e) => handleConfigUpdate({ contrast: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleCalibration}
            disabled={isCalibrating}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isCalibrating ? 'Calibrating...' : 'Calibrate'}
          </button>
          
          <button
            onClick={handleTestPattern}
            className={`px-3 py-1 rounded text-sm ${
              testPattern ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            Test Pattern
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full relative bg-black">
      {/* Beamer-specific controls */}
      {renderBeamerControls()}

      {/* Canvas for beamer rendering */}
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="w-full h-full object-contain"
        style={{
          aspectRatio: '16/9',
          backgroundColor: '#000'
        }}
      />

      {/* Multi-device display wrapper */}
      <div className="absolute inset-0 pointer-events-none">
        <MultiDeviceDisplay
          deviceType="beamer"
          deviceId={deviceId}
          isPrimary={isPrimary}
          onSyncStatusChange={onSyncStatusChange}
        />
      </div>
    </div>
  );
};

export default BeamerDisplay;
