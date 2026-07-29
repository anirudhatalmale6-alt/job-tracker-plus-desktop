import { useState } from 'react';
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
import { Plus } from 'lucide-react';
import { Currency } from '@/types/job';
import { useLang } from '@/lib/i18n';

interface AddJobFormProps {
  onAddJob: (name: string, month: string, amount: number, currency: Currency) => void;
}

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'GBP', label: 'GBP', symbol: '£' },
  { value: 'SEK', label: 'SEK', symbol: 'kr' },
];

const LAST_CURRENCY_KEY = 'jt-last-currency';

function readLastCurrency(): Currency {
  const stored = localStorage.getItem(LAST_CURRENCY_KEY);
  return currencies.some((c) => c.value === stored) ? (stored as Currency) : 'EUR';
}

export function AddJobForm({ onAddJob }: AddJobFormProps) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState('');
  // Remember the last currency the user applied (persists across launches) so
  // they don't have to re-pick it for every job.
  const [currency, setCurrency] = useState<Currency>(() => readLastCurrency());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !month || !amount) return;

    onAddJob(name.trim(), month, parseFloat(amount), currency);
    localStorage.setItem(LAST_CURRENCY_KEY, currency);
    setName('');
    setMonth('');
    setAmount('');
  };

  const selectedCurrency = currencies.find((c) => c.value === currency);

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{t('form.addJob')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('form.jobName')}</Label>
          <Input
            id="name"
            placeholder={t('form.jobNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="month">{t('form.month')}</Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">{t('form.amount')} ({selectedCurrency?.symbol})</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t('form.currency')}</Label>
          <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
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
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {t('form.add')}
          </Button>
        </div>
      </div>
    </form>
  );
}
