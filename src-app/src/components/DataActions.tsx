import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Job } from '@/types/job';
import { Download, Upload, FileDown, Printer } from 'lucide-react';
import { formatCurrency, formatMonth } from '@/lib/format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { useLang, dateLocale } from '@/lib/i18n';

interface DataActionsProps {
  jobs: Job[];
  allJobs: Job[];
  selectedYear: string;
  onImport: (jobs: Job[]) => void;
}

export function DataActions({ jobs, allJobs, selectedYear, onImport }: DataActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLang();

  const exportToPdf = () => {
    const doc = new jsPDF();
    const title = selectedYear === 'all' ? t('pdf.allJobsReport') : `${t('pdf.jobsReport')} - ${selectedYear}`;

    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.text(`${t('pdf.generated')}: ${new Date().toLocaleDateString(dateLocale(lang))}`, 14, 30);

    const tableData = jobs.map((job) => [
      job.name,
      formatMonth(job.month, lang),
      formatCurrency(job.amount, job.currency),
      job.poNumber || '-',
      job.invoiceNumber || '-',
      job.invoiceMonth ? formatMonth(job.invoiceMonth, lang) : '-',
      t(`status.${job.status}`),
    ]);

    autoTable(doc, {
      head: [[t('table.job'), t('table.month'), t('table.amount'), t('table.po'), t('table.invoice'), t('pdf.invoiceMonth'), t('table.status')]],
      body: tableData,
      startY: 38,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 38;
    const totalAmount = jobs.reduce((sum, job) => sum + job.amount, 0);
    const paidAmount = jobs.reduce((sum, job) => (job.status === 'paid' ? sum + job.amount : sum), 0);
    const invoicedAmount = jobs.reduce((sum, job) => (job.status === 'invoiced' ? sum + job.amount : sum), 0);
    const unpaidAmount = jobs.reduce((sum, job) => (job.status === 'unpaid' ? sum + job.amount : sum), 0);

    doc.setFontSize(11);
    doc.text(`${t('pdf.summary')}:`, 14, finalY + 15);
    doc.setFontSize(10);
    doc.text(`${t('pdf.totalJobs')}: ${jobs.length}`, 14, finalY + 23);
    doc.text(`${t('pdf.totalValue')}: ${formatCurrency(totalAmount)}`, 14, finalY + 30);
    doc.text(`${t('pdf.paid')}: ${formatCurrency(paidAmount)}`, 14, finalY + 37);
    doc.text(`${t('pdf.invoiced')}: ${formatCurrency(invoicedAmount)}`, 14, finalY + 44);
    doc.text(`${t('pdf.unpaid')}: ${formatCurrency(unpaidAmount)}`, 14, finalY + 51);

    const fileName = selectedYear === 'all' ? 'jobs-report-all.pdf' : `jobs-report-${selectedYear}.pdf`;
    doc.save(fileName);
    toast.success(t('toast.pdfExported'));
  };

  const exportMonthlyReport = () => {
    const doc = new jsPDF();
    const year = selectedYear === 'all' ? t('pdf.allYears') : selectedYear;

    doc.setFontSize(20);
    doc.text(`${t('pdf.monthlyReport')} - ${year}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`${t('pdf.generated')}: ${new Date().toLocaleDateString(dateLocale(lang))}`, 14, 30);

    // Group jobs by month
    const jobsByMonth: Record<string, Job[]> = {};
    jobs.forEach((job) => {
      const key = job.month;
      if (!jobsByMonth[key]) jobsByMonth[key] = [];
      jobsByMonth[key].push(job);
    });

    const sortedMonths = Object.keys(jobsByMonth).sort();
    let currentY = 40;

    sortedMonths.forEach((month) => {
      const monthJobs = jobsByMonth[month];
      const monthTotal = monthJobs.reduce((s, j) => s + j.amount, 0);
      const monthPaid = monthJobs.reduce((s, j) => j.status === 'paid' ? s + j.amount : s, 0);
      const monthInvoiced = monthJobs.reduce((s, j) => j.status === 'invoiced' ? s + j.amount : s, 0);
      const monthUnpaid = monthJobs.reduce((s, j) => j.status === 'unpaid' ? s + j.amount : s, 0);

      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(formatMonth(month, lang), 14, currentY);
      currentY += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t('pdf.jobs')}: ${monthJobs.length} | ${t('pdf.totalValue')}: ${formatCurrency(monthTotal)} | ${t('pdf.paid')}: ${formatCurrency(monthPaid)} | ${t('pdf.invoiced')}: ${formatCurrency(monthInvoiced)} | ${t('pdf.unpaid')}: ${formatCurrency(monthUnpaid)}`, 14, currentY);
      currentY += 4;

      autoTable(doc, {
        head: [[t('table.job'), t('table.amount'), t('table.po'), t('table.invoice'), t('pdf.invoiceMonth'), t('table.status')]],
        body: monthJobs.map((j) => [
          j.name,
          formatCurrency(j.amount, j.currency),
          j.poNumber || '-',
          j.invoiceNumber || '-',
          j.invoiceMonth ? formatMonth(j.invoiceMonth, lang) : '-',
          t(`status.${j.status}`),
        ]),
        startY: currentY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 12;
    });

    // Grand summary
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    const grandTotal = jobs.reduce((s, j) => s + j.amount, 0);
    const grandPaid = jobs.reduce((s, j) => j.status === 'paid' ? s + j.amount : s, 0);
    const grandInvoiced = jobs.reduce((s, j) => j.status === 'invoiced' ? s + j.amount : s, 0);
    const grandUnpaid = jobs.reduce((s, j) => j.status === 'unpaid' ? s + j.amount : s, 0);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('pdf.summary'), 14, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('pdf.totalJobs')}: ${jobs.length}`, 14, currentY); currentY += 7;
    doc.text(`${t('pdf.totalValue')}: ${formatCurrency(grandTotal)}`, 14, currentY); currentY += 7;
    doc.text(`${t('pdf.paid')}: ${formatCurrency(grandPaid)}`, 14, currentY); currentY += 7;
    doc.text(`${t('pdf.invoiced')}: ${formatCurrency(grandInvoiced)}`, 14, currentY); currentY += 7;
    doc.text(`${t('pdf.unpaid')}: ${formatCurrency(grandUnpaid)}`, 14, currentY);

    const fileName = selectedYear === 'all' ? 'manadsrapport-alla.pdf' : `manadsrapport-${selectedYear}.pdf`;
    doc.save(fileName);
    toast.success(t('toast.reportExported'));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(allJobs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('toast.backupExported'));
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedJobs = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedJobs)) {
          onImport(importedJobs);
          toast.success(t('toast.imported', { n: importedJobs.length }));
        } else {
          toast.error(t('toast.invalidFormat'));
        }
      } catch {
        toast.error(t('toast.parseFailed'));
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={exportToPdf}>
        <FileDown className="w-4 h-4 mr-2" />
        {t('actions.exportPdf')}
      </Button>
      <Button variant="outline" size="sm" onClick={exportMonthlyReport}>
        <Printer className="w-4 h-4 mr-2" />
        {t('actions.monthlyReport')}
      </Button>
      <Button variant="outline" size="sm" onClick={exportData}>
        <Download className="w-4 h-4 mr-2" />
        {t('actions.backup')}
      </Button>
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="w-4 h-4 mr-2" />
        {t('actions.restore')}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importData}
        className="hidden"
      />
    </div>
  );
}
