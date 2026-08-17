import { useState } from 'react';
import { Job, PaymentStatus } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Clock, FileText, Trash2, CalendarDays, Pencil, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatMonth } from '@/lib/format';
import { useLang } from '@/lib/i18n';
import { EditJobDialog } from '@/components/EditJobDialog';
import { invoiceBridgeAvailable, sendJobToInvoice } from '@/lib/invoiceBridge';
import { toast } from 'sonner';

interface JobsTableProps {
  jobs: Job[];
  onCycleStatus: (id: string) => void;
  onSetStatus: (id: string, status: PaymentStatus) => void;
  onDelete: (id: string) => void;
  onUpdateJob: (id: string, updates: Partial<Job>) => void;
  recentlyChangedIds?: Set<string>;
  statusFilter?: PaymentStatus | null;
}

const statusConfig: Record<PaymentStatus, { labelKey: string; icon: React.ElementType; className: string }> = {
  unpaid: {
    labelKey: 'status.unpaid',
    icon: Clock,
    className: 'bg-muted text-muted-foreground hover:bg-muted/80',
  },
  invoiced: {
    labelKey: 'status.invoiced',
    icon: FileText,
    className: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
  paid: {
    labelKey: 'status.paid',
    icon: Check,
    className: 'bg-success text-success-foreground hover:bg-success/90',
  },
};

export function JobsTable({ jobs, onCycleStatus, onSetStatus, onDelete, onUpdateJob, recentlyChangedIds, statusFilter }: JobsTableProps) {
  const { t, lang } = useLang();
  const [editingPo, setEditingPo] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [editingInvoiceMonth, setEditingInvoiceMonth] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  // Only shown inside the desktop app, where the Invoice gen bridge exists.
  const canInvoice = invoiceBridgeAvailable();
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Sends a copy of the job to Invoice gen. Deliberately changes NOTHING here:
  // no status change, no filter or sort change, no re-selection.
  const handleSendToInvoice = async (job: Job) => {
    setSendingId(job.id);
    try {
      const res = await sendJobToInvoice(job);
      if (res.ok) {
        toast.success(t('invoice.sent', { name: job.name }));
      } else {
        toast.error(t('invoice.failed'));
      }
    } finally {
      setSendingId(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-12 text-center">
        <p className="text-muted-foreground">{t('table.empty')}</p>
      </div>
    );
  }

  const handlePoBlur = (jobId: string, value: string) => {
    onUpdateJob(jobId, { poNumber: value });
    setEditingPo(null);
  };

  const handleInvoiceBlur = (jobId: string, value: string) => {
    onUpdateJob(jobId, { invoiceNumber: value });
    setEditingInvoice(null);
  };

  const handleInvoiceMonthBlur = (jobId: string, value: string) => {
    onUpdateJob(jobId, { invoiceMonth: value });
    setEditingInvoiceMonth(null);
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">{t('table.job')}</th>
              <th className="text-left p-4 font-medium text-muted-foreground">{t('table.month')}</th>
              <th className="text-right p-4 font-medium text-muted-foreground">{t('table.amount')}</th>
              <th className="text-left p-4 font-medium text-muted-foreground">{t('table.po')}</th>
              <th className="text-left p-4 font-medium text-muted-foreground">{t('table.invoice')}</th>
              <th className="text-left p-4 font-medium text-muted-foreground">{t('table.invoiceMonth')}</th>
              <th className="text-center p-4 font-medium text-muted-foreground">{t('table.status')}</th>
              <th className="text-center p-4 font-medium text-muted-foreground">{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => {
              const config = statusConfig[job.status];
              const Icon = config.icon;
              const isMovedOut = statusFilter && recentlyChangedIds?.has(job.id) && job.status !== statusFilter;
              return (
                <tr
                  key={job.id}
                  className={cn(
                    "border-b last:border-b-0 animate-fade-in transition-all hover:bg-muted/30",
                    job.status === 'paid' && !isMovedOut && "bg-success/5",
                    isMovedOut && "opacity-40"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-4 font-medium">{job.name}</td>
                  <td className="p-4 text-muted-foreground">{formatMonth(job.month, lang)}</td>
                  <td className="p-4 text-right font-mono">{formatCurrency(job.amount, job.currency)}</td>
                  <td className="p-4">
                    {editingPo === job.id ? (
                      <Input
                        autoFocus
                        className="h-8 w-24 text-xs"
                        defaultValue={job.poNumber || ''}
                        onBlur={(e) => handlePoBlur(job.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handlePoBlur(job.id, e.currentTarget.value);
                          }
                        }}
                        placeholder="PO #"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingPo(job.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted min-w-[60px] text-left"
                      >
                        {job.poNumber || '—'}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    {editingInvoice === job.id ? (
                      <Input
                        autoFocus
                        className="h-8 w-24 text-xs"
                        defaultValue={job.invoiceNumber || ''}
                        onBlur={(e) => handleInvoiceBlur(job.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleInvoiceBlur(job.id, e.currentTarget.value);
                          }
                        }}
                        placeholder="INV #"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingInvoice(job.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted min-w-[60px] text-left"
                      >
                        {job.invoiceNumber || '—'}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    {editingInvoiceMonth === job.id ? (
                      <Input
                        autoFocus
                        type="month"
                        className="h-8 w-32 text-xs"
                        defaultValue={job.invoiceMonth || ''}
                        onBlur={(e) => handleInvoiceMonthBlur(job.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleInvoiceMonthBlur(job.id, e.currentTarget.value);
                          }
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingInvoiceMonth(job.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted min-w-[60px] text-left flex items-center gap-1"
                      >
                        <CalendarDays className="w-3 h-3" />
                        {job.invoiceMonth ? formatMonth(job.invoiceMonth, lang) : '—'}
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onCycleStatus(job.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
                        config.className
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t(config.labelKey)}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {canInvoice && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={sendingId === job.id}
                          onClick={() => handleSendToInvoice(job)}
                          className="text-muted-foreground hover:text-primary"
                          title={t('invoice.send')}
                          aria-label={t('invoice.send')}
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingJob(job)}
                        className="text-muted-foreground hover:text-primary"
                        title={t('edit.title')}
                        aria-label={t('edit.title')}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(job.id)}
                        className="text-muted-foreground hover:text-destructive"
                        title={t('actions.delete')}
                        aria-label={t('actions.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditJobDialog
        job={editingJob}
        open={editingJob !== null}
        onOpenChange={(open) => {
          if (!open) setEditingJob(null);
        }}
        onSave={onUpdateJob}
      />
    </div>
  );
}
