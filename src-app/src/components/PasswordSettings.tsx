import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Lock, ShieldCheck, Fingerprint } from 'lucide-react';
import {
  touchIDAvailable,
  touchIDAuthenticate,
  touchIDEnabled,
  setTouchIDEnabled,
} from '@/lib/touchid';
import { useLang } from '@/lib/i18n';

export function PasswordSettings() {
  const { hasPassword, setPassword, changePassword, removePassword, lock } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [touchIDSupported, setTouchIDSupported] = useState(false);
  const [touchIDOn, setTouchIDOn] = useState(false);

  // Check for Touch ID hardware whenever the dialog opens (only relevant once a
  // password exists, since Touch ID is an alternative way to unlock).
  useEffect(() => {
    if (!open || !hasPassword) return;
    let cancelled = false;
    (async () => {
      const available = await touchIDAvailable();
      if (cancelled) return;
      setTouchIDSupported(available);
      setTouchIDOn(touchIDEnabled());
    })();
    return () => {
      cancelled = true;
    };
  }, [open, hasPassword]);

  const handleTouchIDToggle = async (checked: boolean) => {
    if (checked) {
      // Confirm the fingerprint works before enabling, so the user isn't
      // surprised at the next launch.
      const ok = await touchIDAuthenticate();
      if (!ok) {
        toast.error(t('toast.touchidNotConfirmed'));
        return;
      }
      setTouchIDEnabled(true);
      setTouchIDOn(true);
      toast.success(t('toast.touchidOn'));
    } else {
      setTouchIDEnabled(false);
      setTouchIDOn(false);
      toast.success(t('toast.touchidOff'));
    }
  };

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setError('');
    setBusy(false);
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) reset();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (next.length < 4) {
      setError(t('sec.errMinLen'));
      return;
    }
    if (next !== confirm) {
      setError(t('sec.errMatch'));
      return;
    }
    setBusy(true);
    if (hasPassword) {
      const ok = await changePassword(current, next);
      setBusy(false);
      if (!ok) {
        setError(t('sec.errCurrent'));
        return;
      }
      toast.success(t('toast.pwUpdated'));
    } else {
      await setPassword(next);
      setBusy(false);
      toast.success(t('toast.pwEnabled'));
    }
    handleOpenChange(false);
  };

  const handleRemove = async () => {
    setError('');
    if (!current) {
      setError(t('sec.errRemoveCurrent'));
      return;
    }
    setBusy(true);
    const ok = await removePassword(current);
    setBusy(false);
    if (!ok) {
      setError(t('sec.errCurrent'));
      return;
    }
    // No password means nothing to unlock, so Touch ID no longer applies.
    setTouchIDEnabled(false);
    setTouchIDOn(false);
    toast.success(t('toast.pwRemoved'));
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex items-center gap-2">
        {hasPassword && (
          <Button variant="outline" size="sm" onClick={lock} title={t('sec.lockNow')}>
            <Lock className="w-4 h-4" />
          </Button>
        )}
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <ShieldCheck className="w-4 h-4 mr-1" />
            {hasPassword ? t('sec.security') : t('sec.setPassword')}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hasPassword ? t('sec.changeTitle') : t('sec.setTitle')}</DialogTitle>
          <DialogDescription>
            {hasPassword ? t('sec.changeDesc') : t('sec.setDesc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {hasPassword && (
            <div className="space-y-1.5">
              <Label htmlFor="jt-current-pw">{t('sec.current')}</Label>
              <Input
                id="jt-current-pw"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="jt-new-pw">{hasPassword ? t('sec.new') : t('sec.password')}</Label>
            <Input
              id="jt-new-pw"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoFocus={!hasPassword}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jt-confirm-pw">{t('sec.confirm')}</Label>
            <Input
              id="jt-confirm-pw"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {hasPassword && touchIDSupported && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('sec.touchidLabel')}</p>
                  <p className="text-xs text-muted-foreground">{t('sec.touchidHint')}</p>
                </div>
              </div>
              <Switch checked={touchIDOn} onCheckedChange={handleTouchIDToggle} />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            {hasPassword && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive mr-auto"
                onClick={handleRemove}
                disabled={busy}
              >
                {t('sec.remove')}
              </Button>
            )}
            <Button type="submit" disabled={busy}>
              {hasPassword ? t('sec.save') : t('sec.enable')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
