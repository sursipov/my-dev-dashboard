const EXCHANGE_RATES_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const CACHE_KEY = 'exchangeRates';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface ExchangeRates {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const cached = localStorage.getItem(CACHE_KEY);
  
  if (cached) {
    const { rates, base, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp < CACHE_DURATION) {
      return { rates, base, timestamp };
    }
  }
  
  try {
    const response = await fetch(EXCHANGE_RATES_API);
    const data = await response.json();
    
    const result = {
      rates: data.rates,
      base: data.base,
      timestamp: Date.now()
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    
    return {
      rates: {
        USD: 1,
        EUR: 0.92,
        RUB: 82.5,
        GBP: 0.79,
        JPY: 149.5,
        CNY: 7.28
      },
      base: 'USD',
      timestamp: Date.now()
    };
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const usdAmount = fromCurrency === 'USD' 
    ? amount 
    : amount / rates[fromCurrency];
  
  return toCurrency === 'USD'
    ? usdAmount
    : usdAmount * rates[toCurrency];
}