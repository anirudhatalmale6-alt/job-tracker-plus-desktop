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

// Locale for month names; 'sv' shows Swedish month names, otherwise English.
type MonthLang = 'sv' | 'en';
function monthLocale(lang?: MonthLang): string {
  return lang === 'sv' ? 'sv-SE' : 'en-GB';
}

export function formatMonth(monthString: string, lang?: MonthLang): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(monthLocale(lang), { month: 'long', year: 'numeric' });
}

export function formatShortMonth(monthString: string, lang?: MonthLang): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(monthLocale(lang), { month: 'short' });
}
