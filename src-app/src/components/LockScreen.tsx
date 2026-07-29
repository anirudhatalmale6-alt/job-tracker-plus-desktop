import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

export function LockScreen() {
  const { unlock } = useAuth();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    setBusy(true);
    const ok = await unlock(pw);
    setBusy(false);
    if (!ok) {
      setError(true);
      setPw('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card border rounded-xl shadow-sm p-8 flex flex-col items-center gap-5"
      >
        <div className="p-3 rounded-full bg-primary text-primary-foreground">
          <Lock className="w-7 h-7" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">Job Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your password to unlock</p>
        </div>
        <div className="w-full">
          <Input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            className={error ? 'border-destructive' : ''}
          />
          {error && <p className="text-sm text-destructive mt-2">Incorrect password. Please try again.</p>}
        </div>
        <Button type="submit" className="w-full" disabled={busy || !pw}>
          {busy ? 'Unlocking…' : 'Unlock'}
        </Button>
      </form>
    </div>
  );
}
