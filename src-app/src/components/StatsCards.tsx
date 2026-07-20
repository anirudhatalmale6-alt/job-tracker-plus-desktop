import { Briefcase, CheckCircle2, Clock, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Job, Currency, PaymentStatus } from '@/types/job';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  jobs: Job[];
  jobCount: number;
  paidJobCount: number;
  statusFilter: PaymentStatus | null;
  onStatusFilterChange: (status: PaymentStatus | null) => void;
}

type CurrencyTotals = Record<Currency, { total: number; paid: number; invoiced: number; unpaid: number }>;

export function StatsCards({ jobs, jobCount, paidJobCount, statusFilter, onStatusFilterChange }: StatsCardsProps) {
  const currencyTotals = jobs.reduce<CurrencyTotals>((acc, job) => {
    if (!acc[job.currency]) {
      acc[job.currency] = { total: 0, paid: 0, invoiced: 0, unpaid: 0 };
    }
    acc[job.currency].total += job.amount;
    acc[job.currency][job.status] += job.amount;
    return acc;
  }, {} as CurrencyTotals);

  const currencies = Object.keys(currencyTotals) as Currency[];

  const formatMultiCurrency = (getter: (totals: CurrencyTotals[Currency]) => number) => {
    if (currencies.length === 0) return '—';
    return currencies
      .map((cur) => formatCurrency(getter(currencyTotals[cur]), cur))
      .join(' / ');
  };

  const handleClick = (status: PaymentStatus | null) => {
    onStatusFilterChange(statusFilter === status ? null : status);
  };

  const cardClass = (active: boolean) =>
    cn(
      "bg-card rounded-lg border p-4 shadow-sm cursor-pointer transition-all",
      active && "ring-2 ring-primary"
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className={cardClass(statusFilter === null)} onClick={() => onStatusFilterChange(null)}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Totalt jobb</p>
            <p className="text-xl font-bold">{jobCount}</p>
          </div>
        </div>
      </div>

      <div className={cardClass(statusFilter === 'paid')} onClick={() => handleClick('paid')}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Betalda jobb</p>
            <p className="text-xl font-bold text-success">{paidJobCount}</p>
          </div>
        </div>
      </div>

      <div className={cardClass(statusFilter === null)} onClick={() => onStatusFilterChange(null)}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Totalt värde</p>
            <p className="text-base font-bold truncate" title={formatMultiCurrency((t) => t.total)}>
              {formatMultiCurrency((t) => t.total)}
            </p>
          </div>
        </div>
      </div>

      <div className={cardClass(statusFilter === 'unpaid')} onClick={() => handleClick('unpaid')}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Obetalt</p>
            <p className="text-base font-bold truncate" title={formatMultiCurrency((t) => t.unpaid)}>
              {formatMultiCurrency((t) => t.unpaid)}
            </p>
          </div>
        </div>
      </div>

      <div className={cardClass(statusFilter === 'invoiced')} onClick={() => handleClick('invoiced')}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Fakturerat</p>
            <p className="text-base font-bold text-primary truncate" title={formatMultiCurrency((t) => t.invoiced)}>
              {formatMultiCurrency((t) => t.invoiced)}
            </p>
          </div>
        </div>
      </div>

      <div className={cardClass(statusFilter === 'paid')} onClick={() => handleClick('paid')}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Betalt värde</p>
            <p className="text-base font-bold text-success truncate" title={formatMultiCurrency((t) => t.paid)}>
              {formatMultiCurrency((t) => t.paid)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}