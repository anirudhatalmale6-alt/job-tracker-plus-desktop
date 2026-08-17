import { Job } from '@/types/job';

// Thin wrapper around the desktop bridge exposed by preload.js. In a plain
// browser (or an older build without the bridge) this reports unavailable so
// the button can be hidden rather than throwing.
interface InvoiceBridge {
  available: boolean;
  sendJob: (job: {
    name: string;
    amount: number;
    currency: string;
    month: string;
    poNumber: string;
    invoiceNumber: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

declare global {
  interface Window {
    invoiceBridge?: InvoiceBridge;
  }
}

export function invoiceBridgeAvailable(): boolean {
  return typeof window !== 'undefined' && window.invoiceBridge?.available === true;
}

export async function sendJobToInvoice(job: Job): Promise<{ ok: boolean; error?: string }> {
  if (!invoiceBridgeAvailable()) return { ok: false, error: 'unavailable' };
  return window.invoiceBridge!.sendJob({
    name: job.name,
    amount: job.amount,
    currency: job.currency,
    month: job.month,
    poNumber: job.poNumber || '',
    invoiceNumber: job.invoiceNumber || '',
  });
}
