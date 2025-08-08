import React from 'react';
import { AlertCircle, RefreshCw, User } from 'lucide-react';

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  data?: any;
  onRetry?: () => void;
  type?: 'page' | 'component' | 'inline';
  message?: string;
  showUser?: boolean;
  children: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  data,
  onRetry,
  type = 'page',
  message = 'Loading...',
  showUser = false,
  children
}) => {
  // Show loading state
  if (loading) {
    if (type === 'inline') {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">{message}</span>
        </div>
      );
    }

    if (type === 'component') {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">{message}</p>
        </div>
      );
    }

    // Page loading
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center space-y-4">
          {showUser && (
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    if (type === 'inline') {
      return (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-auto text-xs text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    if (type === 'component') {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-600 text-center">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          )}
        </div>
      );
    }

    // Page error
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show children if no loading or error
  return <>{children}</>;
};

export default LoadingState; 