import React, { useState } from 'react';
import { useSignup } from '../SignupStepper';
import { Check, CreditCard, Shield, Zap } from 'lucide-react';

const StepPayment: React.FC = () => {
  const { nextStep, prevStep, updateFormData, formData } = useSignup();
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      period: 'month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 team members',
        'Basic lead management',
        'Property listings',
        'Email support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      period: 'month',
      description: 'Ideal for growing real estate businesses',
      features: [
        'Up to 20 team members',
        'Advanced lead management',
        'Full property management',
        'Priority support',
        'Advanced analytics',
        'Team collaboration tools',
        'Scheduling & calendar'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      period: 'month',
      description: 'For large organizations with custom needs',
      features: [
        'Unlimited team members',
        'Custom integrations',
        'Dedicated support',
        'Advanced reporting',
        'API access',
        'Custom branding',
        'White-label options'
      ],
      popular: false
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    updateFormData({ selectedPlan: planId });
  };

  const handleSubmit = async () => {
    // Here you would integrate with your payment processor (Stripe, etc.)
    // For now, we'll simulate a successful payment
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update form data with payment info
      updateFormData({
        selectedPlan,
        paymentMethod,
        paymentCompleted: true
      });
      
      nextStep();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the plan that best fits your business needs</p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {selectedPlan === plan.id && (
              <div className="mt-4 text-center">
                <Check className="w-6 h-6 text-blue-500 mx-auto" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('card')}
          >
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Credit Card</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'bank'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setPaymentMethod('bank')}
          >
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Bank Transfer</p>
                <p className="text-sm text-gray-600">Direct bank transfer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Placeholder */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Plan:</span>
            <span className="font-medium">
              {plans.find(p => p.id === selectedPlan)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Price:</span>
            <span className="font-medium">
              ${plans.find(p => p.id === selectedPlan)?.price}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Free Trial:</span>
            <span className="text-green-600 font-medium">14 days</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between">
            <span className="text-gray-900 font-semibold">Total:</span>
            <span className="text-gray-900 font-semibold">
              ${plans.find(p => p.id === selectedPlan)?.price}/month
            </span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
            <p className="text-sm text-blue-700">
              Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={prevStep}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Zap className="w-4 h-4 mr-2" />
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default StepPayment;
