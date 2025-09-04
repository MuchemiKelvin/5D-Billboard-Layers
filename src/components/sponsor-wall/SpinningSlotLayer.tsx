import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLayerContext } from '../../contexts/LayerContext';

interface SpinningSlotLayerProps {
  children: React.ReactNode;
  slotNumber: number;
  slotType?: 'standard' | 'main-sponsor' | 'live-bidding';
  isActive?: boolean;
  className?: string;
}

export const SpinningSlotLayer: React.FC<SpinningSlotLayerProps> = ({
  children,
  slotNumber,
  slotType = 'standard',
  isActive = false,
  className = ''
}) => {
  const { layers } = useLayerContext();
  const spinningLayer = layers['spinning-slots'];
  const [isVisible, setIsVisible] = useState(true);

  // Only apply spinning effects if the layer is visible and active
  const shouldAnimate = spinningLayer?.isVisible && spinningLayer?.isActive;

  // Get animation settings from layer config
  const settings = spinningLayer?.settings || {};
  const {
    spinSpeed = 0.3,
    horizontalMovement = true,
    rotationAngle = 5,
    movementRange = 10,
    animationDuration = 8000,
    performance = 'optimized'
  } = settings;

  // Performance optimization: reduce animations on lower-end devices
  const [performanceMode, setPerformanceMode] = useState('full');

  useEffect(() => {
    // Detect device performance capabilities
    const checkPerformance = () => {
      const userAgent = navigator.userAgent;
      const isLowEndDevice = /Android.*Chrome.*Mobile/.test(userAgent) && 
        window.devicePixelRatio < 2;
      
      if (performance === 'optimized' || isLowEndDevice) {
        setPerformanceMode('reduced');
      } else {
        setPerformanceMode('full');
      }
    };

    checkPerformance();
  }, [performance]);

  // Generate unique animation delays and patterns for each slot
  const getSlotAnimationConfig = () => {
    const baseDelay = slotNumber * 150; // Stagger animations (reduced for smoother effect)
    const seed = slotNumber * 137.508; // Golden angle for distribution
    
    // For slot 8 and slot 24 - make them the featured spinning slots
    const isFeaturedSlot = slotNumber === 8 || slotNumber === 24;
    
    // Differentiate between slot 8 and slot 24 for unique animations
    const slotMultiplier = slotNumber === 8 ? 1.5 : slotNumber === 24 ? 1.3 : 1;
    const slotSpeedMultiplier = slotNumber === 8 ? 0.8 : slotNumber === 24 ? 0.9 : 1;
    
    return {
      delay: baseDelay,
      horizontalOffset: Math.sin(seed) * (isFeaturedSlot ? movementRange * slotMultiplier : movementRange),
      verticalOffset: Math.cos(seed) * (movementRange * 0.2), // Reduced vertical movement
      rotationOffset: Math.sin(seed * 2) * (isFeaturedSlot ? rotationAngle * slotMultiplier : rotationAngle),
      duration: isFeaturedSlot ? animationDuration * slotSpeedMultiplier : animationDuration + (Math.sin(seed) * 1000),
      isFeatured: isFeaturedSlot,
      slotType: slotNumber === 8 ? 'primary' : slotNumber === 24 ? 'secondary' : 'standard'
    };
  };

  const animConfig = getSlotAnimationConfig();

  // Animation variants based on performance mode
  const getAnimationVariants = () => {
    if (!shouldAnimate) {
      return {
        initial: { x: 0, y: 0, rotate: 0 },
        animate: { x: 0, y: 0, rotate: 0 }
      };
    }

    const baseVariants = {
      initial: { 
        x: 0, 
        y: 0, 
        rotate: 0,
        scale: 1
      },
      animate: {
        x: horizontalMovement ? [
          0, 
          animConfig.horizontalOffset, 
          -animConfig.horizontalOffset * 0.5, 
          animConfig.horizontalOffset * 0.7,
          0
        ] : 0,
        y: [
          0,
          animConfig.verticalOffset,
          -animConfig.verticalOffset * 0.3,
          animConfig.verticalOffset * 0.5,
          0
        ],
        rotate: [
          0,
          animConfig.rotationOffset,
          -animConfig.rotationOffset * 0.7,
          animConfig.rotationOffset * 0.4,
          0
        ],
        scale: animConfig.isFeatured ? [1, 1.05, 1.02, 1.03, 1] : (isActive ? [1, 1.002, 1, 1.001, 1] : [1, 1.001, 1]),
        transition: {
          duration: animConfig.duration / 1000,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
          delay: animConfig.delay / 1000
        }
      }
    };

    // Reduce animation complexity for performance mode
    if (performanceMode === 'reduced') {
      return {
        initial: baseVariants.initial,
        animate: {
          ...baseVariants.animate,
          x: horizontalMovement ? [0, animConfig.horizontalOffset * 0.5, 0] : 0,
          y: [0, animConfig.verticalOffset * 0.5, 0],
          rotate: [0, animConfig.rotationOffset * 0.5, 0],
          transition: {
            ...baseVariants.animate.transition,
            duration: (animConfig.duration / 1000) * 1.5, // Slower for performance
            times: [0, 0.5, 1]
          }
        }
      };
    }

    return baseVariants;
  };

  const animationVariants = getAnimationVariants();

  // Special handling for different slot types
  const getSlotTypeModifier = () => {
    switch (slotType) {
      case 'main-sponsor':
        return {
          scale: shouldAnimate ? 1.02 : 1,
          zIndex: 10,
          additional: {
            filter: shouldAnimate ? [
              "brightness(1)",
              "brightness(1.05)",
              "brightness(1)",
              "brightness(1.02)",
              "brightness(1)"
            ] : "brightness(1)"
          }
        };
      case 'live-bidding':
        return {
          scale: shouldAnimate ? 1.01 : 1,
          zIndex: 5,
          additional: {
            boxShadow: shouldAnimate ? [
              "0 0 0 rgba(34, 197, 94, 0)",
              "0 0 10px rgba(34, 197, 94, 0.3)",
              "0 0 0 rgba(34, 197, 94, 0)",
              "0 0 5px rgba(34, 197, 94, 0.2)",
              "0 0 0 rgba(34, 197, 94, 0)"
            ] : "none"
          }
        };
      default:
        return {
          scale: 1,
          zIndex: 1,
          additional: {}
        };
    }
  };

  const slotModifier = getSlotTypeModifier();

  // Combine animations with slot type modifiers
  const finalVariants = {
    initial: animationVariants.initial,
    animate: {
      ...animationVariants.animate,
      scale: Array.isArray(animationVariants.animate.scale) 
        ? animationVariants.animate.scale.map(s => s * slotModifier.scale)
        : slotModifier.scale,
      ...slotModifier.additional
    }
  };

  // Layer 4 disabled - spinning slots removed

  return (
    <motion.div
      className={`spinning-slot-layer ${className} ${shouldAnimate ? 'performance-' + performanceMode : ''} slot-${slotType} ${animConfig.isFeatured ? 'featured-spinning-slot' : ''} ${animConfig.slotType === 'secondary' ? 'slot-secondary' : ''}`}
      variants={finalVariants}
      initial="initial"
      animate="animate"
      style={{
        willChange: shouldAnimate ? 'transform' : 'auto',
        backfaceVisibility: 'hidden', // Performance optimization
        perspective: '1000px',
        zIndex: animConfig.isFeatured ? 20 : slotModifier.zIndex,
        transformStyle: 'preserve-3d'
      }}
      // Performance optimizations
      layoutDependency={shouldAnimate}
    >
      {children}
      
      {/* Featured Spinning Slot Visual Effect - matches mockup */}
      {animConfig.isFeatured && shouldAnimate && (
        <>
          {/* Bright circular spinning element */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: animConfig.slotType === 'primary' ? 2 : 2.5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className={`w-16 h-16 rounded-full shadow-lg ${
              animConfig.slotType === 'primary' 
                ? 'spinning-circular-element shadow-yellow-500/50' 
                : 'spinning-circular-element-secondary shadow-orange-500/50'
            }`} />
          </motion.div>
          
          {/* Pulsing glow effect */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            animate={animConfig.slotType === 'primary' ? {
              boxShadow: [
                "0 0 20px rgba(255, 193, 7, 0.5)",
                "0 0 40px rgba(255, 193, 7, 0.8)",
                "0 0 20px rgba(255, 193, 7, 0.5)"
              ]
            } : {
              boxShadow: [
                "0 0 18px rgba(251, 146, 60, 0.4)",
                "0 0 35px rgba(251, 146, 60, 0.7)",
                "0 0 18px rgba(251, 146, 60, 0.4)"
              ]
            }}
            transition={{
              duration: animConfig.slotType === 'primary' ? 1.5 : 1.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* "SPINNING SLOT" label */}
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="text-xs font-bold text-yellow-400 tracking-wider whitespace-nowrap">
              SPINNING SLOT {slotNumber}
            </div>
          </motion.div>
        </>
      )}
      
      {/* Debug indicators for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 text-xs text-white bg-black/50 px-2 py-1 rounded">
          <div>Slot {slotNumber}</div>
          {animConfig.isFeatured && <div className="text-yellow-400">FEATURED</div>}
          {shouldAnimate && <div className="text-green-400">ANIMATING</div>}
          <div className="text-gray-300">{performanceMode}</div>
        </div>
      )}
    </motion.div>
  );
};

// Higher-order component to wrap slots with spinning animation
export const withSpinningAnimation = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P & SpinningSlotLayerProps>((props, ref) => {
    const { slotNumber, slotType, isActive, className, ...componentProps } = props;
    
    return (
      <SpinningSlotLayer
        slotNumber={slotNumber}
        slotType={slotType}
        isActive={isActive}
        className={className}
      >
        <Component {...(componentProps as P)} ref={ref} />
      </SpinningSlotLayer>
    );
  });
};

// Animation controls utility functions
export const updateSpinningSlotSettings = (newSettings: Record<string, any>) => {
  // This would be connected to the context
  console.log('Updating spinning slot settings:', newSettings);
};

export const getSpinningSlotPerformanceMetrics = () => {
  return {
    activeAnimations: document.querySelectorAll('.spinning-slot-layer').length,
    performanceMode: 'optimized',
    frameRate: 60
  };
};
