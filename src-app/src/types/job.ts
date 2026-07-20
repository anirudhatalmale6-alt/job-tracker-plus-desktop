export type PaymentStatus = 'unpaid' | 'invoiced' | 'paid';
export type JobCategory = 'modellande' | 'socials';
export type Currency = 'EUR' | 'USD' | 'GBP' | 'SEK';

export interface Job {
  id: string;
  name: string;
  month: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  category: JobCategory;
  poNumber?: string;
  invoiceNumber?: string;
  invoiceMonth?: string;
  createdAt: string;
}
