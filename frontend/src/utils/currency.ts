import { create } from 'zustand';

interface CurrencyState {
  currency: string;
  secondary_currencies: string[];
  exchangeRates: Record<string, number>;
  setCurrency: (currency: string) => void;
  setSecondaryCurrencies: (currencies: string[]) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
}

// Exchange rates relative to AED (1 AED = X currency)
const DEFAULT_EXCHANGE_RATES = {
  USD: 0.27,    // 1 AED = 0.27 USD
  AED: 1,       // Base currency
  INR: 22.45,   // 1 AED = 22.45 INR
  GBP: 0.21,    // 1 AED = 0.21 GBP
  EUR: 0.25,    // 1 AED = 0.25 EUR
  RUB: 24.85,   // 1 AED = 24.85 RUB
  SAR: 1.02,    // 1 AED = 1.02 SAR
  CNY: 1.95,    // 1 AED = 1.95 CNY
  CAD: 0.37,    // 1 AED = 0.37 CAD
  TRY: 8.75,    // 1 AED = 8.75 TRY
  PKR: 75.50,   // 1 AED = 75.50 PKR
  KWD: 0.083,   // 1 AED = 0.083 KWD
  LBP: 405.00,  // 1 AED = 405.00 LBP
  IRR: 11350.00, // 1 AED = 11350.00 IRR
  ZAR: 5.15,    // 1 AED = 5.15 ZAR
};

export const AVAILABLE_CURRENCIES = Object.keys(DEFAULT_EXCHANGE_RATES);

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: 'AED',
  secondary_currencies: ['USD', 'GBP', 'EUR'],
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  setCurrency: (currency) => set({ currency }),
  setSecondaryCurrencies: (currencies) => set({ secondary_currencies: currencies }),
  setExchangeRates: (rates) => set({ exchangeRates: rates }),
}));

export const formatCurrency = (amount: number, currency: string = 'AED') => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
  const { exchangeRates } = useCurrencyStore.getState();
  
  if (!amount || isNaN(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  // Check if we have the required exchange rates
  if (fromCurrency !== 'AED' && !exchangeRates[fromCurrency]) {
    console.warn(`Missing exchange rate for ${fromCurrency}`);
    return amount;
  }
  if (toCurrency !== 'AED' && !exchangeRates[toCurrency]) {
    console.warn(`Missing exchange rate for ${toCurrency}`);
    return amount;
  }
  
  // Convert to AED first if not already AED
  let amountInAED = fromCurrency === 'AED' ? amount : amount / exchangeRates[fromCurrency];
  
  // Convert from AED to target currency
  return toCurrency === 'AED' ? amountInAED : amountInAED * exchangeRates[toCurrency];
};

export const getCurrencyDisplay = (amount: number, currency: string = 'AED') => {
  const { secondary_currencies } = useCurrencyStore.getState();
  
  if (!amount || isNaN(amount)) {
    return {
      primary: formatCurrency(0, currency),
      secondary: secondary_currencies.map(c => formatCurrency(0, c))
    };
  }
  
  const primaryDisplay = formatCurrency(amount, currency);
  const secondaryDisplays = secondary_currencies.map(secondaryCurrency => 
    formatCurrency(convertCurrency(amount, currency, secondaryCurrency), secondaryCurrency)
  );
  
  return {
    primary: primaryDisplay,
    secondary: secondaryDisplays
  };
}; 