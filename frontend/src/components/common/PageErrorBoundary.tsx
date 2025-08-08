import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Mail } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  pageName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showTechnicalDetails: boolean;
}

class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
      showTechnicalDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: PageErrorBoundary.generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PageErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.logErrorToService(error, errorInfo);
  }

  private static generateErrorId(): string {
    return `page_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return PageErrorBoundary.generateErrorId();
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      errorId: this.state.errorId,
      pageName: this.props.pageName || 'Unknown',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };

    console.error('Page error logged:', errorData);
    
    // TODO: Send to error tracking service
    // errorTrackingService.captureException(error, errorData);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
      showTechnicalDetails: false
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleContactSupport = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Page: ${this.props.pageName || 'Unknown'}
URL: ${window.location.href}
Time: ${new Date().toISOString()}

Error Message: ${this.state.error?.message || 'Unknown error'}

Please provide any additional details about what you were doing when this error occurred.
    `);
    
    window.open(`mailto:support@yourcompany.com?subject=${subject}&body=${body}`, '_blank');
  };

  private toggleTechnicalDetails = () => {
    this.setState(prev => ({
      showTechnicalDetails: !prev.showTechnicalDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {this.props.pageName ? `${this.props.pageName} Error` : 'Page Error'}
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                We're sorry, but something went wrong while loading this page.
              </p>
              <p className="text-gray-500 text-sm">
                Our team has been automatically notified and is working to fix this issue.
              </p>
            </div>

            {this.props.showDetails && this.state.error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Error Details
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleTechnicalDetails}
                    className="text-xs"
                  >
                    {this.state.showTechnicalDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Message:</strong> {this.state.error.message}
                </p>
                
                {this.state.showTechnicalDetails && this.state.errorInfo && (
                  <div className="mt-4 p-3 bg-gray-100 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">Component Stack:</h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={this.handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={this.handleGoBack}
                  className="py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="py-3"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={this.handleReload}
                  className="flex-1 text-gray-600 hover:text-gray-800"
                >
                  Reload Page
                </Button>
                <Button
                  variant="ghost"
                  onClick={this.handleContactSupport}
                  className="flex-1 text-gray-600 hover:text-gray-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-2">
                Error ID: {this.state.errorId}
              </p>
              <p className="text-xs text-gray-400">
                If this problem persists, please contact our support team with the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary; 