import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// ============================================================================
// ERROR BOUNDARY PROVIDER
// ============================================================================

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  onError,
  showDetails = process.env.NODE_ENV === 'development',
}) => {
  return (
    <ErrorBoundary
      onError={onError}
      showDetails={showDetails}
      resetOnPropsChange={false}
    >
      {children}
    </ErrorBoundary>
  );
}; 