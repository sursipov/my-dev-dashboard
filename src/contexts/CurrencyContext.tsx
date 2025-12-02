// contexts/CurrencyContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getExchangeRates, convertCurrency } from '@/lib/exchangeRates';

interface CurrencyContextType {
  currency: string;
  conversionCurrency: string;
  setCurrency: (currency: string) => void;
  setConversionCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  getConvertedAmount: (amount: number) => number;
  formatCurrencyWithConversion: (amount: number) => string;
  formatCurrencyWithConversionJSX: (amount: number) => React.ReactNode;
  convertAmount: (amount: number, from: string, to: string) => number;
  exchangeRates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const [conversionCurrency, setConversionCurrencyState] = useState('RUB');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    EUR: 0.92,
    RUB: 92.5
  });

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    const savedConversionCurrency = localStorage.getItem('conversionCurrency');
    
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
    
    if (savedConversionCurrency) {
      setConversionCurrencyState(savedConversionCurrency);
    }

    loadExchangeRates();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadExchangeRates();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadExchangeRates = async () => {
    try {
      const ratesData = await getExchangeRates();
      setExchangeRates(ratesData.rates);
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
    }
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
  };

  const setConversionCurrency = (newCurrency: string) => {
    setConversionCurrencyState(newCurrency);
    localStorage.setItem('conversionCurrency', newCurrency);
  };

  const convertAmount = (amount: number, from: string, to: string): number => {
    if (from === to || !amount) return amount;
    return convertCurrency(amount, from, to, exchangeRates);
  };

  const getConvertedAmount = (amountInUSD: number): number => {
    return convertAmount(amountInUSD, 'USD', conversionCurrency);
  };

  const formatCurrency = (amount: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  };

  const formatCurrencyWithConversion = (amountInUSD: number): string => {
    const mainAmount = convertAmount(amountInUSD, 'USD', currency);
    const convertedAmount = getConvertedAmount(amountInUSD);
    
    const mainFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    const conversionFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: conversionCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    if (currency === conversionCurrency) {
      return mainFormatter.format(mainAmount);
    }

    return `${mainFormatter.format(mainAmount)} (${conversionFormatter.format(convertedAmount)})`;
  };

  const formatCurrencyWithConversionJSX = (amountInUSD: number): React.ReactNode => {
    const mainAmount = convertAmount(amountInUSD, 'USD', currency);
    const convertedAmount = getConvertedAmount(amountInUSD);
    
    const mainFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    const conversionFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: conversionCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    if (currency === conversionCurrency) {
      return mainFormatter.format(mainAmount);
    }

    return (
      <span className="whitespace-nowrap">
        <span className="font-semibold">{mainFormatter.format(mainAmount)}</span>
        <span className="text-sm text-muted-foreground ml-2">
          ({conversionFormatter.format(convertedAmount)})
        </span>
      </span>
    );
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      conversionCurrency,
      setCurrency,
      setConversionCurrency,
      formatCurrency,
      getConvertedAmount,
      formatCurrencyWithConversion,
      formatCurrencyWithConversionJSX,
      convertAmount,
      exchangeRates
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}