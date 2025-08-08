import { useCallback, useState } from 'react';

interface ErrorInfo {
  componentStack: string;
}

interface UseErrorBoundaryReturn {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  hasError: boolean;
  resetError: () => void;
  captureError: (error: Error, errorInfo?: ErrorInfo) => void;
  logError: (error: Error, context?: Record<string, any>) => void;
}

export const useErrorBoundary = (): UseErrorBoundaryReturn => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [errorId, setErrorId] = useState<string>('');

  const generateErrorId = useCallback(() => {
    return `hook_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
    setErrorId(generateErrorId());
  }, [generateErrorId]);

  const captureError = useCallback((error: Error, errorInfo?: ErrorInfo) => {
    const newErrorId = generateErrorId();
    setError(error);
    setErrorInfo(errorInfo || null);
    setErrorId(newErrorId);

    // Log error to service
    logErrorToService(error, errorInfo, newErrorId);
  }, [generateErrorId]);

  const logError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorData = {
      errorId: generateErrorId(),
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context
    };

    console.error('Error logged:', errorData);
    
    // TODO: Send to error tracking service
    // errorTrackingService.captureException(error, errorData);
  }, [generateErrorId]);

  const logErrorToService = (error: Error, errorInfo?: ErrorInfo, customErrorId?: string) => {
    const errorData = {
      errorId: customErrorId || generateErrorId(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error boundary error logged:', errorData);
    
    // TODO: Send to error tracking service
    // errorTrackingService.captureException(error, errorData);
  };

  return {
    error,
    errorInfo,
    errorId,
    hasError: !!error,
    resetError,
    captureError,
    logError
  };
};

// Hook for handling async errors
export const useAsyncError = () => {
  const [, setError] = useState();
  
  return useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

// Hook for error reporting
export const useErrorReporting = () => {
  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorData = {
      errorId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context
    };

    console.error('Error reported:', errorData);
    
    // TODO: Send to error tracking service
    // errorTrackingService.captureException(error, errorData);
    
    return errorData.errorId;
  }, []);

  const reportUserAction = useCallback((action: string, details?: Record<string, any>) => {
    const actionData = {
      action,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      details
    };

    console.log('User action reported:', actionData);
    
    // TODO: Send to analytics service
    // analyticsService.trackUserAction(actionData);
  }, []);

  return {
    reportError,
    reportUserAction
  };
}; 