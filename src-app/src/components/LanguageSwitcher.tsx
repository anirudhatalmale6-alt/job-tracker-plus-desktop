import { useLang, Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'sv', label: 'SV' },
  { value: 'en', label: 'EN' },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={cn('inline-flex items-center rounded-md border bg-muted p-0.5', className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLang(opt.value)}
          className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-[0.3rem] transition-colors',
            lang === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={lang === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
