import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CreditCard, Shield, RefreshCw } from 'lucide-react';

interface PaymentManagementProps {
  tenantId: string;
  customerId?: string;
  subscriptionId?: string;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ 
  tenantId, 
  customerId, 
  subscriptionId 
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    const loadFastSpringSBL = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load FastSpring SBL script
        const script = document.createElement('script');
        script.src = 'https://d1f8f9xcsvx3ha.cloudfront.net/sbl/0.8.3/fastspring-builder.min.js';
        script.async = true;
        
        script.onload = () => {
          console.log('FastSpring SBL script loaded');
          setIsLoading(false);
          setIsInitialized(true);
        };

        script.onerror = () => {
          setError('Failed to load FastSpring payment management script');
          setIsLoading(false);
        };

        document.head.appendChild(script);

        return () => {
          // Cleanup script when component unmounts
          const existingScript = document.querySelector('script[src*="fastspring-builder"]');
          if (existingScript) {
            existingScript.remove();
          }
        };
      } catch (err) {
        setError('Failed to initialize payment management');
        setIsLoading(false);
      }
    };

    if (customerId && subscriptionId) {
      loadFastSpringSBL();
    } else {
      setIsLoading(false);
      setError('Customer ID or Subscription ID not available');
    }
  }, [customerId, subscriptionId]);

  const handleOpenPaymentManagement = () => {
    if (!subscriptionId || !window.FastSpringBuilder) {
      setError('Payment management not available');
      return;
    }

    try {
      // Create payment management component using SBL
      window.FastSpringBuilder.createPaymentManagement({
        id: 'payment-management-component',
        storeId: 'usercentraltechnologies_store',
        customerId: customerId,
        subscriptionId: subscriptionId,
        theme: {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          borderRadius: '8px',
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        onLoad: () => {
          console.log('Payment management component loaded');
        },
        onError: (error: any) => {
          console.error('Payment management error:', error);
          setError('Failed to load payment management component');
        }
      });
    } catch (error) {
      console.error('Error opening payment management:', error);
      setError('Failed to open payment management');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!customerId || !subscriptionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Management
          </CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Payment management is only available for active subscribers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Management
        </CardTitle>
        <CardDescription>
          Add, remove, or update your payment methods securely
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading payment management...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 mb-2">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && isInitialized && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payment Management</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your payment information is securely managed by FastSpring. 
                    We never store your payment details on our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center py-6">
              <Button 
                onClick={handleOpenPaymentManagement}
                size="lg"
                className="px-8"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Manage Payment Methods
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Click to open payment management securely
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Add FastSpring SBL types to window object
declare global {
  interface Window {
    FastSpringBuilder?: {
      createPaymentManagement: (config: {
        id: string;
        storeId: string;
        customerId?: string;
        subscriptionId?: string;
        theme?: {
          primaryColor?: string;
          backgroundColor?: string;
          textColor?: string;
          borderRadius?: string;
          fontFamily?: string;
        };
        onLoad?: () => void;
        onError?: (error: any) => void;
      }) => void;
    };
  }
}

export default PaymentManagement;
