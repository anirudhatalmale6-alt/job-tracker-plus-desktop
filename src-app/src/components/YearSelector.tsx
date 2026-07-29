import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { useLang } from '@/lib/i18n';

interface YearSelectorProps {
  selectedYear: string;
  availableYears: string[];
  onYearChange: (year: string) => void;
}

export function YearSelector({ selectedYear, availableYears, onYearChange }: YearSelectorProps) {
  const { t } = useLang();
  // Generate years from 2024 to 15 years from now
  const startYear = 2024;
  const endYear = new Date().getFullYear() + 15;
  const allYears = Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString());
  
  // Combine with any years that have data (in case older data exists)
  const yearsToShow = [...new Set([...allYears, ...availableYears])].sort().reverse();

  return (
    <Select value={selectedYear} onValueChange={onYearChange}>
      <SelectTrigger className="w-[140px]">
        <Calendar className="w-4 h-4 mr-2" />
        <SelectValue placeholder={t('year.placeholder')} />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        <SelectItem value="all">{t('year.all')}</SelectItem>
        {yearsToShow.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
