import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Lock, ShieldCheck } from 'lucide-react';

export function PasswordSettings() {
  const { hasPassword, setPassword, changePassword, removePassword, lock } = useAuth();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
      setError('Password must be at least 4 characters.');
      return;
    }
    if (next !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    if (hasPassword) {
      const ok = await changePassword(current, next);
      setBusy(false);
      if (!ok) {
        setError('Current password is incorrect.');
        return;
      }
      toast.success('Password updated');
    } else {
      await setPassword(next);
      setBusy(false);
      toast.success('Password protection enabled');
    }
    handleOpenChange(false);
  };

  const handleRemove = async () => {
    setError('');
    if (!current) {
      setError('Enter your current password to remove protection.');
      return;
    }
    setBusy(true);
    const ok = await removePassword(current);
    setBusy(false);
    if (!ok) {
      setError('Current password is incorrect.');
      return;
    }
    toast.success('Password protection removed');
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex items-center gap-2">
        {hasPassword && (
          <Button variant="outline" size="sm" onClick={lock} title="Lock now">
            <Lock className="w-4 h-4" />
          </Button>
        )}
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <ShieldCheck className="w-4 h-4 mr-1" />
            {hasPassword ? 'Security' : 'Set password'}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hasPassword ? 'Change password' : 'Set a password'}</DialogTitle>
          <DialogDescription>
            {hasPassword
              ? 'Update or remove the password used to unlock the app.'
              : "Protect the app with a password. You'll be asked for it each time you open the app."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {hasPassword && (
            <div className="space-y-1.5">
              <Label htmlFor="jt-current-pw">Current password</Label>
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
            <Label htmlFor="jt-new-pw">{hasPassword ? 'New password' : 'Password'}</Label>
            <Input
              id="jt-new-pw"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoFocus={!hasPassword}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jt-confirm-pw">Confirm password</Label>
            <Input
              id="jt-confirm-pw"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
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
                Remove password
              </Button>
            )}
            <Button type="submit" disabled={busy}>
              {hasPassword ? 'Save changes' : 'Enable protection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
