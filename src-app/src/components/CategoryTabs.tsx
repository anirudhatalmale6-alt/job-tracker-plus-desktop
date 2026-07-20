import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobCategory } from '@/types/job';
import { Camera, Users } from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: JobCategory;
  onCategoryChange: (category: JobCategory) => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <Tabs value={selectedCategory} onValueChange={(value) => onCategoryChange(value as JobCategory)}>
      <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
        <TabsTrigger value="modellande" className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Modellande
        </TabsTrigger>
        <TabsTrigger value="socials" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Socials
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
