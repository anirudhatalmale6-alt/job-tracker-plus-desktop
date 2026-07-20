import { useState, useEffect } from 'react';
import { Job, PaymentStatus, JobCategory, Currency } from '@/types/job';

const STORAGE_KEY = 'job-tracker-jobs';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old data: convert isPaid boolean to status and add default category
      return parsed.map((job: any) => ({
        ...job,
        status: job.status || (job.isPaid ? 'paid' : 'unpaid'),
        category: job.category || 'modellande',
        currency: job.currency || 'GBP',
      }));
    }
    return [];
  });

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return new Date().getFullYear().toString();
  });

  const [selectedCategory, setSelectedCategory] = useState<JobCategory>('modellande');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | null>(null);
  const [invoiceMonthFilter, setInvoiceMonthFilter] = useState<string | null>(null);
  const [recentlyChangedIds, setRecentlyChangedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const addJob = (name: string, month: string, amount: number, currency: Currency) => {
    const newJob: Job = {
      id: crypto.randomUUID(),
      name,
      month,
      amount,
      currency,
      status: 'unpaid',
      category: selectedCategory,
      poNumber: '',
      invoiceNumber: '',
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);
  };

  const updateJob = (id: string, updates: Partial<Pick<Job, 'poNumber' | 'invoiceNumber' | 'invoiceMonth'>>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates } : job))
    );
  };

  const cycleStatus = (id: string) => {
    const statusOrder: PaymentStatus[] = ['unpaid', 'invoiced', 'paid'];
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === id) {
          const currentIndex = statusOrder.indexOf(job.status);
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          return { ...job, status: statusOrder[nextIndex] };
        }
        return job;
      })
    );
    if (statusFilter) {
      setRecentlyChangedIds((prev) => new Set(prev).add(id));
    }
  };

  const setStatus = (id: string, status: PaymentStatus) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status } : job))
    );
    if (statusFilter) {
      setRecentlyChangedIds((prev) => new Set(prev).add(id));
    }
  };

  const clearRecentlyChanged = () => {
    setRecentlyChangedIds(new Set());
  };

  const handleSetStatusFilter = (status: PaymentStatus | null) => {
    setStatusFilter(status);
    setRecentlyChangedIds(new Set());
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  };

  // Get unique years from jobs in selected category
  const categoryJobs = jobs.filter((job) => job.category === selectedCategory);
  const availableYears = [...new Set(categoryJobs.map((job) => job.month.split('-')[0]))].sort().reverse();
  
  // Filter jobs by selected year and category
  const yearFilteredJobs = selectedYear === 'all' 
    ? categoryJobs 
    : categoryJobs.filter((job) => job.month.startsWith(selectedYear));

  let filteredJobs = statusFilter
    ? yearFilteredJobs.filter((job) => job.status === statusFilter || recentlyChangedIds.has(job.id))
    : yearFilteredJobs;

  if (invoiceMonthFilter) {
    filteredJobs = filteredJobs.filter((job) => job.invoiceMonth === invoiceMonthFilter);
  }

  // Get unique invoice months for filter
  const availableInvoiceMonths = [...new Set(
    yearFilteredJobs
      .filter((job) => job.invoiceMonth)
      .map((job) => job.invoiceMonth!)
  )].sort().reverse();

  // Calculate stats for filtered jobs
  const totalAmount = yearFilteredJobs.reduce((sum, job) => sum + job.amount, 0);
  const paidAmount = yearFilteredJobs.reduce((sum, job) => (job.status === 'paid' ? sum + job.amount : sum), 0);
  const invoicedAmount = yearFilteredJobs.reduce((sum, job) => (job.status === 'invoiced' ? sum + job.amount : sum), 0);
  const unpaidAmount = yearFilteredJobs.reduce((sum, job) => (job.status === 'unpaid' ? sum + job.amount : sum), 0);
  const paidJobCount = yearFilteredJobs.filter((job) => job.status === 'paid').length;

  // Monthly summary for invoiced amounts
  const monthlySummary = filteredJobs.reduce((acc, job) => {
    const monthKey = job.month;
    if (!acc[monthKey]) {
      acc[monthKey] = { unpaid: 0, invoiced: 0, paid: 0 };
    }
    acc[monthKey][job.status] += job.amount;
    return acc;
  }, {} as Record<string, Record<PaymentStatus, number>>);

  const importJobs = (importedJobs: Job[]) => {
    setJobs(importedJobs);
  };

  return {
    jobs: filteredJobs,
    allJobs: jobs,
    statsJobs: yearFilteredJobs,
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
    setStatusFilter: handleSetStatusFilter,
    invoiceMonthFilter,
    setInvoiceMonthFilter,
    availableInvoiceMonths,
    recentlyChangedIds,
    clearRecentlyChanged,
  };
}
