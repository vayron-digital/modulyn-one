import React from 'react';
import { useCurrencyStore, formatCurrency, convertCurrency } from '../utils/currency';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, currency = 'AED' }) => {
  const { secondaryCurrencies } = useCurrencyStore();
  
  return (
    <div className="space-y-1">
      <div className="font-semibold">{formatCurrency(amount, currency)}</div>
      <div className="text-xs text-gray-500 space-y-0.5">
        {secondaryCurrencies.map((secondaryCurrency) => (
          <div key={secondaryCurrency}>
            {formatCurrency(convertCurrency(amount, currency, secondaryCurrency), secondaryCurrency)}
          </div>
        ))}
      </div>
    </div>
  );
}; 