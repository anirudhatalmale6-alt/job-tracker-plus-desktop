import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

export type Lang = 'sv' | 'en';

const LANG_KEY = 'jt-lang';

type Vars = Record<string, string | number>;

// Flat key -> string per language. Swedish is the default/primary language.
const dict: Record<Lang, Record<string, string>> = {
  sv: {
    'app.subtitle': 'Håll koll på dina jobb och betalningar',
    'list.statusChanged': '{n} jobb har ändrad status',
    'list.refresh': 'Uppdatera lista',

    'stats.totalJobs': 'Totalt jobb',
    'stats.paidJobs': 'Betalda jobb',
    'stats.totalValue': 'Totalt värde',
    'stats.unpaid': 'Obetalt',
    'stats.invoiced': 'Fakturerat',
    'stats.paidValue': 'Betalt värde',

    'summary.overview': 'Översikt',
    'summary.yearly': 'Årlig summering',
    'summary.monthly': 'Månadsvis översikt',
    'summary.year': 'År',
    'summary.month': 'Månad',
    'summary.total': 'Totalt',
    'summary.paid': 'Betalt',

    'form.addJob': 'Lägg till jobb',
    'form.jobName': 'Jobbnamn',
    'form.jobNamePlaceholder': 't.ex. Fotoshoot',
    'form.month': 'Månad',
    'form.amount': 'Belopp',
    'form.currency': 'Valuta',
    'form.add': 'Lägg till',

    'table.job': 'Jobb',
    'table.month': 'Månad',
    'table.amount': 'Belopp',
    'table.po': 'PO #',
    'table.invoice': 'Faktura #',
    'table.invoiceMonth': 'Fakturamånad',
    'table.status': 'Status',
    'table.actions': 'Åtgärder',
    'table.empty': 'Inga jobb för det här året än. Lägg till ditt första jobb ovan!',
    'status.unpaid': 'Obetald',
    'status.invoiced': 'Fakturerad',
    'status.paid': 'Betald',

    'actions.exportPdf': 'Exportera PDF',
    'actions.monthlyReport': 'Månadsrapport',
    'actions.backup': 'Säkerhetskopiera',
    'actions.restore': 'Återställ data',
    'actions.delete': 'Ta bort jobb',

    'edit.title': 'Redigera jobb',
    'edit.desc': 'Ändra uppgifterna för jobbet och spara.',
    'edit.save': 'Spara',
    'edit.cancel': 'Avbryt',
    'edit.errName': 'Jobbnamn får inte vara tomt.',
    'edit.errMonth': 'Välj en månad.',
    'edit.errAmount': 'Ange ett giltigt belopp.',

    'cat.modellande': 'Modellande',
    'cat.socials': 'Socials',

    'year.all': 'Alla år',
    'year.placeholder': 'Välj år',

    'invFilter.title': 'Filtrera per fakturamånad',
    'invFilter.clear': 'Rensa',

    'lock.subtitle': 'Ange ditt lösenord för att låsa upp',
    'lock.password': 'Lösenord',
    'lock.unlock': 'Lås upp',
    'lock.unlocking': 'Låser upp…',
    'lock.wrong': 'Fel lösenord. Försök igen.',
    'lock.touchid': 'Lås upp med Touch ID',
    'lock.touchidWaiting': 'Väntar på Touch ID…',

    'sec.setPassword': 'Ange lösenord',
    'sec.security': 'Säkerhet',
    'sec.lockNow': 'Lås nu',
    'sec.changeTitle': 'Ändra lösenord',
    'sec.setTitle': 'Ange ett lösenord',
    'sec.changeDesc': 'Uppdatera eller ta bort lösenordet som används för att låsa upp appen.',
    'sec.setDesc': 'Skydda appen med ett lösenord. Du blir ombedd att ange det varje gång du öppnar appen.',
    'sec.current': 'Nuvarande lösenord',
    'sec.new': 'Nytt lösenord',
    'sec.password': 'Lösenord',
    'sec.confirm': 'Bekräfta lösenord',
    'sec.touchidLabel': 'Lås upp med Touch ID',
    'sec.touchidHint': 'Använd ditt fingeravtryck istället för att skriva lösenordet',
    'sec.remove': 'Ta bort lösenord',
    'sec.save': 'Spara ändringar',
    'sec.enable': 'Aktivera skydd',
    'sec.errMinLen': 'Lösenordet måste vara minst 4 tecken.',
    'sec.errMatch': 'Lösenorden matchar inte.',
    'sec.errCurrent': 'Nuvarande lösenord är felaktigt.',
    'sec.errRemoveCurrent': 'Ange ditt nuvarande lösenord för att ta bort skyddet.',

    'toast.pwUpdated': 'Lösenord uppdaterat',
    'toast.pwEnabled': 'Lösenordsskydd aktiverat',
    'toast.pwRemoved': 'Lösenordsskydd borttaget',
    'toast.touchidNotConfirmed': 'Touch ID bekräftades inte',
    'toast.touchidOn': 'Touch ID-upplåsning aktiverad',
    'toast.touchidOff': 'Touch ID-upplåsning inaktiverad',
    'toast.jobUpdated': 'Jobbet uppdaterat',
    'toast.pdfExported': 'PDF exporterad!',
    'toast.reportExported': 'Månadsrapport exporterad!',
    'toast.backupExported': 'Säkerhetskopia exporterad!',
    'toast.imported': 'Importerade {n} jobb!',
    'toast.invalidFormat': 'Ogiltigt filformat',
    'toast.parseFailed': 'Kunde inte läsa filen',

    'pdf.jobsReport': 'Jobbrapport',
    'pdf.allJobsReport': 'Alla jobb - rapport',
    'pdf.generated': 'Genererad',
    'pdf.invoiceMonth': 'Fakturamånad',
    'pdf.summary': 'Sammanfattning',
    'pdf.totalJobs': 'Totalt antal jobb',
    'pdf.totalValue': 'Totalt värde',
    'pdf.paid': 'Betalt',
    'pdf.invoiced': 'Fakturerat',
    'pdf.unpaid': 'Obetalt',
    'pdf.monthlyReport': 'Månadsrapport',
    'pdf.allYears': 'Alla år',
    'pdf.jobs': 'Jobb',
  },
  en: {
    'app.subtitle': 'Track your jobs and payments',
    'list.statusChanged': '{n} jobs changed status',
    'list.refresh': 'Refresh list',

    'stats.totalJobs': 'Total jobs',
    'stats.paidJobs': 'Paid jobs',
    'stats.totalValue': 'Total value',
    'stats.unpaid': 'Unpaid',
    'stats.invoiced': 'Invoiced',
    'stats.paidValue': 'Paid value',

    'summary.overview': 'Overview',
    'summary.yearly': 'Yearly summary',
    'summary.monthly': 'Monthly overview',
    'summary.year': 'Year',
    'summary.month': 'Month',
    'summary.total': 'Total',
    'summary.paid': 'Paid',

    'form.addJob': 'Add job',
    'form.jobName': 'Job name',
    'form.jobNamePlaceholder': 'e.g. Photoshoot',
    'form.month': 'Month',
    'form.amount': 'Amount',
    'form.currency': 'Currency',
    'form.add': 'Add',

    'table.job': 'Job',
    'table.month': 'Month',
    'table.amount': 'Amount',
    'table.po': 'PO #',
    'table.invoice': 'Invoice #',
    'table.invoiceMonth': 'Invoice month',
    'table.status': 'Status',
    'table.actions': 'Actions',
    'table.empty': 'No jobs for this year yet. Add your first job above!',
    'status.unpaid': 'Unpaid',
    'status.invoiced': 'Invoiced',
    'status.paid': 'Paid',

    'actions.exportPdf': 'Export PDF',
    'actions.monthlyReport': 'Monthly report',
    'actions.backup': 'Backup Data',
    'actions.restore': 'Restore Data',
    'actions.delete': 'Delete job',

    'edit.title': 'Edit job',
    'edit.desc': 'Change the details of this job and save.',
    'edit.save': 'Save',
    'edit.cancel': 'Cancel',
    'edit.errName': 'Job name cannot be empty.',
    'edit.errMonth': 'Please pick a month.',
    'edit.errAmount': 'Please enter a valid amount.',

    'cat.modellande': 'Modeling',
    'cat.socials': 'Socials',

    'year.all': 'All years',
    'year.placeholder': 'Select year',

    'invFilter.title': 'Filter by invoice month',
    'invFilter.clear': 'Clear',

    'lock.subtitle': 'Enter your password to unlock',
    'lock.password': 'Password',
    'lock.unlock': 'Unlock',
    'lock.unlocking': 'Unlocking…',
    'lock.wrong': 'Incorrect password. Please try again.',
    'lock.touchid': 'Unlock with Touch ID',
    'lock.touchidWaiting': 'Waiting for Touch ID…',

    'sec.setPassword': 'Set password',
    'sec.security': 'Security',
    'sec.lockNow': 'Lock now',
    'sec.changeTitle': 'Change password',
    'sec.setTitle': 'Set a password',
    'sec.changeDesc': 'Update or remove the password used to unlock the app.',
    'sec.setDesc': "Protect the app with a password. You'll be asked for it each time you open the app.",
    'sec.current': 'Current password',
    'sec.new': 'New password',
    'sec.password': 'Password',
    'sec.confirm': 'Confirm password',
    'sec.touchidLabel': 'Unlock with Touch ID',
    'sec.touchidHint': 'Use your fingerprint instead of typing the password',
    'sec.remove': 'Remove password',
    'sec.save': 'Save changes',
    'sec.enable': 'Enable protection',
    'sec.errMinLen': 'Password must be at least 4 characters.',
    'sec.errMatch': 'Passwords do not match.',
    'sec.errCurrent': 'Current password is incorrect.',
    'sec.errRemoveCurrent': 'Enter your current password to remove protection.',

    'toast.pwUpdated': 'Password updated',
    'toast.pwEnabled': 'Password protection enabled',
    'toast.pwRemoved': 'Password protection removed',
    'toast.touchidNotConfirmed': 'Touch ID was not confirmed',
    'toast.touchidOn': 'Touch ID unlock enabled',
    'toast.touchidOff': 'Touch ID unlock disabled',
    'toast.jobUpdated': 'Job updated',
    'toast.pdfExported': 'PDF exported successfully!',
    'toast.reportExported': 'Monthly report exported!',
    'toast.backupExported': 'Data backup exported successfully!',
    'toast.imported': 'Imported {n} jobs successfully!',
    'toast.invalidFormat': 'Invalid file format',
    'toast.parseFailed': 'Failed to parse file',

    'pdf.jobsReport': 'Jobs Report',
    'pdf.allJobsReport': 'All Jobs Report',
    'pdf.generated': 'Generated',
    'pdf.invoiceMonth': 'Invoice Month',
    'pdf.summary': 'Summary',
    'pdf.totalJobs': 'Total Jobs',
    'pdf.totalValue': 'Total Value',
    'pdf.paid': 'Paid',
    'pdf.invoiced': 'Invoiced',
    'pdf.unpaid': 'Unpaid',
    'pdf.monthlyReport': 'Monthly Report',
    'pdf.allYears': 'All years',
    'pdf.jobs': 'Jobs',
  },
};

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export type TFunc = (key: string, vars?: Vars) => string;

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunc;
}

const LangContext = createContext<LangState | null>(null);

function readLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'en' ? 'en' : 'sv';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readLang());

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  }, []);

  const t = useCallback<TFunc>(
    (key, vars) => {
      const table = dict[lang];
      const template = table[key] ?? dict.en[key] ?? key;
      return interpolate(template, vars);
    },
    [lang]
  );

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): LangState {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider');
  return ctx;
}

// Locale used for date formatting in PDF exports.
export function dateLocale(lang: Lang): string {
  return lang === 'sv' ? 'sv-SE' : 'en-GB';
}
