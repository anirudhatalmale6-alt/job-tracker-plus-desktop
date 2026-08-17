import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Job, Currency, PaymentStatus } from '@/types/job';
import { useLang } from '@/lib/i18n';
import { toast } from 'sonner';

interface EditJobDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Job>) => void;
}

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
  { value: 'SEK', label: 'SEK', symbol: 'kr' },
];

const statuses: PaymentStatus[] = ['unpaid', 'invoiced', 'paid'];

export function EditJobDialog({ job, open, onOpenChange, onSave }: EditJobDialogProps) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [status, setStatus] = useState<PaymentStatus>('unpaid');
  const [poNumber, setPoNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceMonth, setInvoiceMonth] = useState('');
  const [error, setError] = useState('');

  // Refill the form every time a different job is opened so the dialog always
  // shows the current values rather than whatever was edited last.
  useEffect(() => {
    if (!job) return;
    setName(job.name);
    setMonth(job.month);
    setAmount(String(job.amount));
    setCurrency(job.currency);
    setStatus(job.status);
    setPoNumber(job.poNumber || '');
    setInvoiceNumber(job.invoiceNumber || '');
    setInvoiceMonth(job.invoiceMonth || '');
    setError('');
  }, [job]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!name.trim()) {
      setError(t('edit.errName'));
      return;
    }
    if (!month) {
      setError(t('edit.errMonth'));
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError(t('edit.errAmount'));
      return;
    }

    onSave(job.id, {
      name: name.trim(),
      month,
      amount: parsedAmount,
      currency,
      status,
      poNumber: poNumber.trim(),
      invoiceNumber: invoiceNumber.trim(),
      invoiceMonth,
    });
    toast.success(t('toast.jobUpdated'));
    onOpenChange(false);
  };

  const selectedCurrency = currencies.find((c) => c.value === currency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{t('edit.title')}</DialogTitle>
            <DialogDescription>{t('edit.desc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t('form.jobName')}</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-month">{t('form.month')}</Label>
                <Input
                  id="edit-month"
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">
                  {t('form.amount')} ({selectedCurrency?.symbol})
                </Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('form.currency')}</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.symbol} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('table.status')}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`status.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-po">{t('table.po')}</Label>
                <Input
                  id="edit-po"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="PO #"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-inv">{t('table.invoice')}</Label>
                <Input
                  id="edit-inv"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV #"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-invmonth">{t('table.invoiceMonth')}</Label>
              <Input
                id="edit-invmonth"
                type="month"
                value={invoiceMonth}
                onChange={(e) => setInvoiceMonth(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('edit.cancel')}
            </Button>
            <Button type="submit">{t('edit.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
