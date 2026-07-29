import { Button } from '@/components/ui/button';
import { formatMonth } from '@/lib/format';
import { CalendarDays, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

interface InvoiceMonthFilterProps {
  availableMonths: string[];
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
}

export function InvoiceMonthFilter({ availableMonths, selectedMonth, onMonthChange }: InvoiceMonthFilterProps) {
  const { t, lang } = useLang();
  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{t('invFilter.title')}</h3>
        {selectedMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs ml-auto"
            onClick={() => onMonthChange(null)}
          >
            <X className="w-3 h-3 mr-1" />
            {t('invFilter.clear')}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableMonths.map((month) => (
          <Button
            key={month}
            variant={selectedMonth === month ? 'default' : 'outline'}
            size="sm"
            className={cn("text-xs", selectedMonth === month && "ring-2 ring-primary/30")}
            onClick={() => onMonthChange(selectedMonth === month ? null : month)}
          >
            {formatMonth(month, lang)}
          </Button>
        ))}
      </div>
    </div>
  );
}
