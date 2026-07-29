import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Fingerprint } from 'lucide-react';
import { touchIDAvailable, touchIDAuthenticate, touchIDEnabled } from '@/lib/touchid';
import { useLang } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function LockScreen() {
  const { unlock, unlockBiometric } = useAuth();
  const { t } = useLang();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showTouchID, setShowTouchID] = useState(false);
  const [touchBusy, setTouchBusy] = useState(false);

  const tryTouchID = useCallback(async () => {
    setTouchBusy(true);
    const ok = await touchIDAuthenticate();
    setTouchBusy(false);
    if (ok) unlockBiometric();
  }, [unlockBiometric]);

  // On mount, if Touch ID is both available and enabled, show the button and
  // trigger the native prompt automatically once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!touchIDEnabled()) return;
      const available = await touchIDAvailable();
      if (cancelled || !available) return;
      setShowTouchID(true);
      const ok = await touchIDAuthenticate();
      if (!cancelled && ok) unlockBiometric();
    })();
    return () => {
      cancelled = true;
    };
  }, [unlockBiometric]);

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
          <p className="text-sm text-muted-foreground mt-1">{t('lock.subtitle')}</p>
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
            placeholder={t('lock.password')}
            className={error ? 'border-destructive' : ''}
          />
          {error && <p className="text-sm text-destructive mt-2">{t('lock.wrong')}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={busy || !pw}>
          {busy ? t('lock.unlocking') : t('lock.unlock')}
        </Button>
        {showTouchID && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={tryTouchID}
            disabled={touchBusy}
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            {touchBusy ? t('lock.touchidWaiting') : t('lock.touchid')}
          </Button>
        )}
        <LanguageSwitcher />
      </form>
    </div>
  );
}
