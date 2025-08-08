import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Get payment result from URL parameters
        const orderId = searchParams.get('order_id');
        const success = searchParams.get('success');
        const reference = searchParams.get('reference');
        
        console.log('Payment callback params:', { orderId, success, reference });

        // Check if payment was successful
        if (success === 'true' || success === '1') {
          // Get pending account creation data
          const pendingData = localStorage.getItem('pendingAccountCreation');
          
          if (!pendingData) {
            throw new Error('No pending account creation found');
          }

          const { tenantId, userDetails, selectedPlan } = JSON.parse(pendingData);

          // Update tenant with payment success
          const { error: updateError } = await supabase
            .from('tenants')
            .update({
              subscription_status: 'active',
              subscription_plan: selectedPlan === 'professional' ? 'modulyn-one-plus' : 'modulyn-one-pro',
              fastspring_order_id: orderId,
              billing_email: userDetails.email,
              is_paid: true,
              subscription_start_date: new Date().toISOString(),
              next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', tenantId);

          if (updateError) {
            throw updateError;
          }

          // Clear pending data
          localStorage.removeItem('pendingAccountCreation');

          setStatus('success');
          setMessage('Payment successful! Your account has been activated.');

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate('/account-creation-success', {
              state: {
                plan: selectedPlan,
                userDetails,
                paymentSuccess: true
              }
            });
          }, 2000);

        } else {
          // Payment failed or cancelled
          setStatus('error');
          setMessage('Payment was cancelled or failed. Please try again.');
          
          // Redirect back to account creation after 3 seconds
          setTimeout(() => {
            navigate('/account-creation');
          }, 3000);
        }

      } catch (error: any) {
        console.error('Payment callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred while processing your payment.');
        
        // Redirect back to account creation after 3 seconds
        setTimeout(() => {
          navigate('/account-creation');
        }, 3000);
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="w-16 h-16 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return <RefreshCw className="w-16 h-16 animate-spin text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'processing' && 'Processing Payment'}
          {status === 'success' && 'Payment Successful!'}
          {status === 'error' && 'Payment Failed'}
        </h2>
        
        <p className="text-slate-600 mb-6">
          {message}
        </p>

        {status === 'processing' && (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-slate-600">Please wait...</span>
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => navigate('/account-creation')}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
