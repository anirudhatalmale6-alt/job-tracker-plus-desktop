import { Button } from '@/components/ui/button';
import { formatMonth } from '@/lib/format';
import { CalendarDays, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceMonthFilterProps {
  availableMonths: string[];
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
}

export function InvoiceMonthFilter({ availableMonths, selectedMonth, onMonthChange }: InvoiceMonthFilterProps) {
  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Filtrera per fakturamånad</h3>
        {selectedMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs ml-auto"
            onClick={() => onMonthChange(null)}
          >
            <X className="w-3 h-3 mr-1" />
            Rensa
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
            {formatMonth(month)}
          </Button>
        ))}
      </div>
    </div>
  );
}
