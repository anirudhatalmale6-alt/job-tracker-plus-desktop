import { useJobs } from '@/hooks/useJobs';
import { AddJobForm } from '@/components/AddJobForm';
import { JobsTable } from '@/components/JobsTable';
import { StatsCards } from '@/components/StatsCards';
import { MonthlySummary } from '@/components/MonthlySummary';
import { YearSelector } from '@/components/YearSelector';
import { DataActions } from '@/components/DataActions';
import { CategoryTabs } from '@/components/CategoryTabs';
import { InvoiceMonthFilter } from '@/components/InvoiceMonthFilter';
import { PasswordSettings } from '@/components/PasswordSettings';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';

const Index = () => {
  const {
    jobs,
    allJobs,
    statsJobs,
    addJob,
    updateJob,
    cycleStatus,
    setStatus,
    deleteJob,
    importJobs,
    totalAmount,
    paidAmount,
    invoicedAmount,
    unpaidAmount,
    paidJobCount,
    selectedYear,
    setSelectedYear,
    availableYears,
    monthlySummary,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    invoiceMonthFilter,
    setInvoiceMonthFilter,
    availableInvoiceMonths,
    recentlyChangedIds,
    clearRecentlyChanged,
  } = useJobs();

  const { t } = useLang();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Job Tracker</h1>
                <p className="text-muted-foreground">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <PasswordSettings />
              <LanguageSwitcher />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <YearSelector
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={setSelectedYear}
            />
            <DataActions
              jobs={jobs}
              allJobs={allJobs}
              selectedYear={selectedYear}
              onImport={importJobs}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsCards
            jobs={statsJobs}
            jobCount={statsJobs.length}
            paidJobCount={paidJobCount}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Monthly Summary - only show for specific year */}
        {selectedYear !== 'all' && (
          <div className="mb-6">
            <MonthlySummary jobs={jobs} selectedYear={selectedYear} />
          </div>
        )}

        {/* Invoice Month Filter */}
        {availableInvoiceMonths.length > 0 && (
          <div className="mb-6">
            <InvoiceMonthFilter
              availableMonths={availableInvoiceMonths}
              selectedMonth={invoiceMonthFilter}
              onMonthChange={setInvoiceMonthFilter}
            />
          </div>
        )}

        {/* Add Job Form */}
        <div className="mb-6">
          <AddJobForm onAddJob={addJob} />
        </div>

        {/* Jobs Table */}
        <div className="space-y-2">
          {statusFilter && recentlyChangedIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('list.statusChanged', { n: recentlyChangedIds.size })}</span>
              <Button variant="outline" size="sm" onClick={clearRecentlyChanged}>
                <RefreshCw className="w-3 h-3 mr-1" />
                {t('list.refresh')}
              </Button>
            </div>
          )}
          <JobsTable
            jobs={jobs}
            onCycleStatus={cycleStatus}
            onSetStatus={setStatus}
            onDelete={deleteJob}
            onUpdateJob={updateJob}
            recentlyChangedIds={recentlyChangedIds}
            statusFilter={statusFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
