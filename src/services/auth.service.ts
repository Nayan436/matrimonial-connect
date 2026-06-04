import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { WORKER_URL } from '../config/constants';

// Send OTP to mobile number via Cloudflare Worker ? Fast2SMS
export async function sendOtp(mobile: string): Promise<void> {
  const res = await fetch(`${WORKER_URL}/api/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile }),
  });
  const data = await res.json() as { success: boolean; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to send OTP');
}

// Verify OTP — worker returns Firebase custom token on success
export async function verifyOtp(mobile: string, otp: string): Promise<User> {
  const res = await fetch(`${WORKER_URL}/api/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp }),
  });
  const data = await res.json() as { success: boolean; token?: string; error?: string };
  if (!res.ok || !data.success || !data.token) throw new Error(data.error ?? 'Invalid OTP');
  const credential = await signInWithCustomToken(auth, data.token);
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export function currentUser(): User | null {
  return auth.currentUser;
}
