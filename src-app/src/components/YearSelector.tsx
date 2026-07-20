import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
  selectedYear: string;
  availableYears: string[];
  onYearChange: (year: string) => void;
}

export function YearSelector({ selectedYear, availableYears, onYearChange }: YearSelectorProps) {
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
        <SelectValue placeholder="Välj år" />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        <SelectItem value="all">Alla år</SelectItem>
        {yearsToShow.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
