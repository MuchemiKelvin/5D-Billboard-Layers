// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Pulse } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================================================
// LOADING SPINNER PROPS INTERFACE
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'ripple' | 'hologram';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  text?: string;
  showText?: boolean;
  className?: string;
  fullScreen?: boolean;
}

// ============================================================================
// SIZE MAPPINGS
// ============================================================================

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24',
};

const textSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

// ============================================================================
// COLOR MAPPINGS
// ============================================================================

const colorMap = {
  primary: 'text-blue-500',
  secondary: 'text-gray-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  white: 'text-white',
};

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  showText = false,
  fullScreen = false,
}) => {


  const textClasses = cn(
    textSizeMap[size],
    colorMap[color],
    'mt-2 font-medium'
  );

  // ============================================================================
  // SPINNER VARIANTS
  // ============================================================================

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={size} color={color} />;
      case 'bars':
        return <BarsSpinner size={size} color={color} />;
      case 'pulse':
        return <PulseSpinner size={size} color={color} />;
      case 'ripple':
        return <RippleSpinner size={size} color={color} />;
      case 'hologram':
        return <HologramSpinner size={size} color={color} />;
      default:
        return <DefaultSpinner size={size} color={color} />;
    }
  };

  // ============================================================================
  // COMPONENT RENDER
  // ============================================================================

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          {renderSpinner()}
          {showText && (
            <motion.p
              className={textClasses}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {text || 'Loading...'}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="text-center">
      {renderSpinner()}
      {showText && (
        <motion.p
          className={textClasses}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text || 'Loading...'}
        </motion.p>
      )}
    </div>
  );
};

// ============================================================================
// SPINNER COMPONENTS
// ============================================================================

// Default Spinner
const DefaultSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => {
  const sizeClass = sizeMap[size as keyof typeof sizeMap];
  const colorClass = colorMap[color as keyof typeof colorMap];
  
  return (
    <motion.div
      className={cn(sizeClass, colorClass)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
};

// Dots Spinner
const DotsSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => {
  const sizeClass = sizeMap[size as keyof typeof sizeMap];
  const colorClass = colorMap[color as keyof typeof colorMap];
  
  return (
    <div className={cn('flex gap-1', sizeClass)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('w-2 h-2 rounded-full', colorClass)}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Bars Spinner
const BarsSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => {
  const sizeClass = sizeMap[size as keyof typeof sizeMap];
  const colorClass = colorMap[color as keyof typeof colorMap];
  
  return (
    <div className={cn('flex gap-1', sizeClass)}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn('w-1 rounded-full', colorClass)}
          animate={{
            height: ['20%', '100%', '20%'],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Pulse Spinner
const PulseSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => {
  const sizeClass = sizeMap[size as keyof typeof sizeMap];
  const colorClass = colorMap[color as keyof typeof colorMap];
  
  return (
    <motion.div
      className={cn(sizeClass, colorClass)}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Pulse className="w-full h-full" />
    </motion.div>
  );
};

// Ripple Spinner
const RippleSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => {
  const sizeClass = sizeMap[size as keyof typeof sizeMap];
  const colorClass = colorMap[color as keyof typeof colorMap];
  
  return (
    <div className={cn('relative', sizeClass)}>
      <motion.div
        className={cn('absolute inset-0 rounded-full border-2 border-transparent border-t-current', colorClass)}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className={cn('absolute inset-2 rounded-full border-2 border-transparent border-t-current', colorClass)}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

// Hologram Spinner
const HologramSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => {
  const sizeClass = sizeMap[size as keyof typeof sizeMap];
  const colorClass = colorMap[color as keyof typeof colorMap];
  
  return (
    <div className={cn('relative', sizeClass)}>
      {/* Outer ring */}
      <motion.div
        className={cn('absolute inset-0 rounded-full border-2 border-current/30', colorClass)}
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      
      {/* Inner ring */}
      <motion.div
        className={cn('absolute inset-2 rounded-full border-2 border-current/50', colorClass)}
        animate={{
          rotate: -360,
          scale: [1, 0.9, 1],
        }}
        transition={{
          rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      
      {/* Center dot */}
      <motion.div
        className={cn('absolute inset-4 rounded-full bg-current', colorClass)}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

// ============================================================================
// LOADING OVERLAY COMPONENT
// ============================================================================

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerProps?: Omit<LoadingSpinnerProps, 'fullScreen'>;
  overlayClassName?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinnerProps,
  overlayClassName,
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center',
          overlayClassName
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <LoadingSpinner {...spinnerProps} />
      </motion.div>
    </div>
  );
};

// ============================================================================
// SKELETON LOADING COMPONENT
// ============================================================================

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 1,
  height = 'h-4',
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'bg-gray-700 rounded animate-pulse',
            height,
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

export default LoadingSpinner; 