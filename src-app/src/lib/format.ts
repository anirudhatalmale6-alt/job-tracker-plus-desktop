import { Currency } from '@/types/job';

const currencyLocales: Record<Currency, string> = {
  EUR: 'de-DE',
  USD: 'en-US',
  GBP: 'en-GB',
  SEK: 'sv-SE',
};

export function formatCurrency(amount: number, currency: Currency = 'GBP'): string {
  return new Intl.NumberFormat(currencyLocales[currency], {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function formatShortMonth(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'short' });
}
