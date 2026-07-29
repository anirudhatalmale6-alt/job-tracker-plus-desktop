import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import {
  hasPassword as storedHasPassword,
  setPassword as storeSetPassword,
  verifyPassword,
  clearPassword,
} from '@/lib/auth';

interface AuthState {
  hasPassword: boolean;
  locked: boolean;
  unlock: (password: string) => Promise<boolean>;
  unlockBiometric: () => void;
  lock: () => void;
  setPassword: (password: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<boolean>;
  removePassword: (current: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // If a password exists, the app starts locked. The unlocked state lives only in
  // memory, so relaunching the app locks it again.
  const [hasPw, setHasPw] = useState<boolean>(() => storedHasPassword());
  const [locked, setLocked] = useState<boolean>(() => storedHasPassword());

  const unlock = useCallback(async (password: string) => {
    const ok = await verifyPassword(password);
    if (ok) setLocked(false);
    return ok;
  }, []);

  // Only reachable from the lock screen, i.e. when a password is already set and
  // the user has passed the native Touch ID prompt. Biometrics authenticate the
  // Mac's owner, so on success we let them straight in.
  const unlockBiometric = useCallback(() => {
    if (storedHasPassword()) setLocked(false);
  }, []);

  const lock = useCallback(() => {
    if (storedHasPassword()) setLocked(true);
  }, []);

  const setPassword = useCallback(async (password: string) => {
    await storeSetPassword(password);
    setHasPw(true);
    setLocked(false);
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    const ok = await verifyPassword(current);
    if (!ok) return false;
    await storeSetPassword(next);
    setHasPw(true);
    return true;
  }, []);

  const removePassword = useCallback(async (current: string) => {
    const ok = await verifyPassword(current);
    if (!ok) return false;
    clearPassword();
    setHasPw(false);
    setLocked(false);
    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{ hasPassword: hasPw, locked, unlock, unlockBiometric, lock, setPassword, changePassword, removePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
