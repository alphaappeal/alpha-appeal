/**
 * South African Rand currency formatting utilities
 */

export const formatZAR = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatZARWithoutSymbol = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseZAR = (input: string): number => {
  // Remove currency symbol and format separators
  const cleaned = input.replace(/[^\d.,-]/g, '');
  // Replace comma with dot for decimal parsing
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-ZA').format(value);
};

// Currency constants
export const CURRENCY_SYMBOL = 'R';
export const CURRENCY_CODE = 'ZAR';
export const DECIMAL_SEPARATOR = ',';
export const THOUSANDS_SEPARATOR = ' ';

/**
 * Format price with discount calculation
 */
export const formatPriceWithDiscount = (
  originalPrice: number,
  discountPercentage: number
): { original: string; discounted: string; savings: string } => {
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
  const savings = originalPrice - discountedPrice;

  return {
    original: formatZAR(originalPrice),
    discounted: formatZAR(discountedPrice),
    savings: formatZAR(savings),
  };
};

/**
 * Format subscription price with period
 */
export const formatSubscriptionPrice = (price: number, period: string = 'month'): string => {
  return `${formatZAR(price)}/${period}`;
};