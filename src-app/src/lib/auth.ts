// Local password protection for the desktop app.
// This is a convenience lock (gate) so others can't casually open the app on the
// user's Mac. Data stays in localStorage; we only store a salted SHA-256 hash of
// the password (never the password itself). Uses the Web Crypto API, which is
// available because the app runs in a secure context (app:// scheme / localhost).

const AUTH_KEY = 'jt-auth';

interface AuthRecord {
  salt: string;
  hash: string;
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bufToHex(arr.buffer);
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufToHex(digest);
}

function readRecord(): AuthRecord | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw) as AuthRecord;
    return rec && rec.hash && rec.salt ? rec : null;
  } catch {
    return null;
  }
}

export function hasPassword(): boolean {
  return readRecord() !== null;
}

export async function setPassword(password: string): Promise<void> {
  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ salt, hash }));
}

export async function verifyPassword(password: string): Promise<boolean> {
  const rec = readRecord();
  if (!rec) return false;
  const hash = await hashPassword(password, rec.salt);
  return hash === rec.hash;
}

export function clearPassword(): void {
  localStorage.removeItem(AUTH_KEY);
}
