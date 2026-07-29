import { useState } from 'react';
import { Job, PaymentStatus, Currency } from '@/types/job';
import { formatCurrency, formatShortMonth } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays } from 'lucide-react';
import { useLang } from '@/lib/i18n';

interface MonthlySummaryProps {
  jobs: Job[];
  selectedYear: string;
}

const months = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12',
];

export function MonthlySummary({ jobs, selectedYear }: MonthlySummaryProps) {
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const { t, lang } = useLang();

  // Group by currency, then calculate totals
  type CurrencyTotals = Record<Currency, { unpaid: number; invoiced: number; paid: number }>;
  
  const yearlyTotalsByCurrency = jobs.reduce<CurrencyTotals>((acc, job) => {
    if (!acc[job.currency]) {
      acc[job.currency] = { unpaid: 0, invoiced: 0, paid: 0 };
    }
    acc[job.currency][job.status] += job.amount;
    return acc;
  }, {} as CurrencyTotals);

  const currencies = Object.keys(yearlyTotalsByCurrency) as Currency[];

  const formatMultiCurrency = (getter: (totals: CurrencyTotals[Currency]) => number) => {
    if (currencies.length === 0) return '—';
    return currencies
      .filter((cur) => getter(yearlyTotalsByCurrency[cur]) > 0)
      .map((cur) => formatCurrency(getter(yearlyTotalsByCurrency[cur]), cur))
      .join(' + ') || '—';
  };

  const totalAll = currencies.reduce((sum, cur) => {
    const t = yearlyTotalsByCurrency[cur];
    return sum + t.unpaid + t.invoiced + t.paid;
  }, 0);

  // Monthly data grouped by currency
  const getMonthData = (month: string) => {
    const monthJobs = jobs.filter((job) => job.month === `${selectedYear}-${month}`);
    const byCurrency = monthJobs.reduce<CurrencyTotals>((acc, job) => {
      if (!acc[job.currency]) {
        acc[job.currency] = { unpaid: 0, invoiced: 0, paid: 0 };
      }
      acc[job.currency][job.status] += job.amount;
      return acc;
    }, {} as CurrencyTotals);
    return byCurrency;
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{t('summary.overview')} - {selectedYear}</h3>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'year' ? t('summary.yearly') : t('summary.monthly')}
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'year' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode('year')}
          >
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {t('summary.year')}
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode('month')}
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1" />
            {t('summary.month')}
          </Button>
        </div>
      </div>
      <div className="p-4">
        {viewMode === 'year' ? (
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="text-center p-4 rounded-lg bg-muted/30 min-w-[140px]">
              <p className="text-xs text-muted-foreground uppercase mb-1">{t('summary.total')}</p>
              <p className="text-lg font-bold">{currencies.length > 0 ? formatMultiCurrency((c) => c.unpaid + c.invoiced + c.paid) : '—'}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30 min-w-[140px]">
              <p className="text-xs text-muted-foreground uppercase mb-1">{t('stats.unpaid')}</p>
              <p className="text-lg font-bold text-muted-foreground">{formatMultiCurrency((c) => c.unpaid)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30 min-w-[140px]">
              <p className="text-xs text-muted-foreground uppercase mb-1">{t('stats.invoiced')}</p>
              <p className="text-lg font-bold text-primary">{formatMultiCurrency((c) => c.invoiced)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30 min-w-[140px]">
              <p className="text-xs text-muted-foreground uppercase mb-1">{t('summary.paid')}</p>
              <p className="text-lg font-bold text-success">{formatMultiCurrency((c) => c.paid)}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {months.map((month) => {
                const monthData = getMonthData(month);
                const monthCurrencies = Object.keys(monthData) as Currency[];
                const hasData = monthCurrencies.length > 0;
                
                return (
                  <div
                    key={month}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-colors",
                      hasData ? "bg-muted/30" : "bg-background"
                    )}
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {formatShortMonth(`${selectedYear}-${month}`, lang)}
                    </p>
                    {hasData ? (
                      <div className="mt-1 space-y-0.5">
                        {monthCurrencies.map((cur) => {
                          const d = monthData[cur];
                          return (
                            <div key={cur} className="text-xs break-words">
                              {d.invoiced > 0 && (
                                <p className="font-semibold text-primary">{formatCurrency(d.invoiced, cur)}</p>
                              )}
                              {d.paid > 0 && (
                                <p className="font-semibold text-success">{formatCurrency(d.paid, cur)}</p>
                              )}
                              {d.unpaid > 0 && (
                                <p className="text-muted-foreground">{formatCurrency(d.unpaid, cur)}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">-</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-muted-foreground justify-center">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground"></span> {t('stats.unpaid')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span> {t('stats.invoiced')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success"></span> {t('summary.paid')}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
