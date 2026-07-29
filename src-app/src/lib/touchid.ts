// Renderer-side helpers for macOS Touch ID unlock. The actual biometric prompt
// runs in the Electron main process and is exposed via preload as
// `window.desktopAuth`. In a plain browser (or a non-Touch-ID Mac) this is
// undefined / unavailable, and the app simply falls back to password unlock.

interface DesktopAuth {
  canUseTouchID: () => Promise<boolean>;
  authenticate: () => Promise<{ ok: boolean; error?: string }>;
}

declare global {
  interface Window {
    desktopAuth?: DesktopAuth;
  }
}

const TOUCHID_PREF = 'jt-touchid-enabled';

export async function touchIDAvailable(): Promise<boolean> {
  try {
    if (!window.desktopAuth) return false;
    return await window.desktopAuth.canUseTouchID();
  } catch {
    return false;
  }
}

export async function touchIDAuthenticate(): Promise<boolean> {
  try {
    if (!window.desktopAuth) return false;
    const res = await window.desktopAuth.authenticate();
    return !!res?.ok;
  } catch {
    return false;
  }
}

export function touchIDEnabled(): boolean {
  return localStorage.getItem(TOUCHID_PREF) === '1';
}

export function setTouchIDEnabled(enabled: boolean): void {
  if (enabled) localStorage.setItem(TOUCHID_PREF, '1');
  else localStorage.removeItem(TOUCHID_PREF);
}
