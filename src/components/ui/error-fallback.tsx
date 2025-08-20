import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bug, RefreshCw, Home, Copy } from 'lucide-react';

export interface DefaultErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
  showDetails?: boolean;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onCopyError: () => void;
}

export const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  showDetails = false,
  onReset,
  onReload,
  onGoHome,
  onCopyError,
}) => {
  return (
    <motion.div
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl w-full">
        {/* Error Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-xl text-gray-400">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </motion.div>

        {/* Error Details */}
        {showDetails && error && (
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white">Error Details</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Error ID:</span>
                <span className="text-white font-mono">{errorId}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-gray-400">Message:</span>
                <span className="text-red-400 font-medium">{error.message}</span>
              </div>
              
              {error.stack && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Stack:</span>
                  <pre className="text-gray-300 font-mono text-xs bg-gray-700/50 p-2 rounded overflow-x-auto">
                    {error.stack}
                  </pre>
                </div>
              )}
              
              {errorInfo?.componentStack && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">Component:</span>
                  <pre className="text-gray-300 font-mono text-xs bg-gray-700/50 p-2 rounded overflow-x-auto">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            onClick={onReset}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>
          
          <motion.button
            onClick={onReload}
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Reload Page
          </motion.button>
          
          <motion.button
            onClick={onGoHome}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-5 h-5" />
            Go Home
          </motion.button>
        </motion.div>

        {/* Copy Error Button */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            onClick={onCopyError}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Error Details
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}; 