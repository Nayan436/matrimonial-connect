import { json } from '../utils/cors';

interface Env {
  FAST2SMS_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

// In-memory OTP store (for Worker — resets on cold start, fine for short TTL)
// In production you can replace with KV store for persistence across instances
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -- Send OTP via Fast2SMS -----------------------------------------------------
export async function handleSendOtp(request: Request, env: Env): Promise<Response> {
  const { mobile } = await request.json() as { mobile: string };

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return json({ success: false, error: 'Invalid mobile number' }, 400);
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(mobile, { otp, expiresAt, attempts: 0 });

  // Send via Fast2SMS
  const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: mobile,
    }),
  });

  const smsData = await fast2smsRes.json() as { return: boolean; message?: string[] };
  if (!smsData.return) {
    return json({ success: false, error: 'SMS delivery failed' }, 500);
  }

  return json({ success: true });
}

// -- Verify OTP and return Firebase custom token -------------------------------
export async function handleVerifyOtp(request: Request, env: Env): Promise<Response> {
  const { mobile, otp } = await request.json() as { mobile: string; otp: string };

  const record = otpStore.get(mobile);
  if (!record) return json({ success: false, error: 'OTP expired or not sent' }, 400);
  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    return json({ success: false, error: 'OTP expired' }, 400);
  }
  if (record.attempts >= 3) {
    otpStore.delete(mobile);
    return json({ success: false, error: 'Too many attempts' }, 429);
  }
  if (record.otp !== otp) {
    otpStore.set(mobile, { ...record, attempts: record.attempts + 1 });
    return json({ success: false, error: 'Invalid OTP' }, 400);
  }

  otpStore.delete(mobile);

  // Generate Firebase custom token using service account
  const uid = `mobile_${mobile}`;
  const token = await createFirebaseCustomToken(uid, env);

  return json({ success: true, token });
}

// -- Create Firebase Custom Token (JWT signed with service account) ------------
async function createFirebaseCustomToken(uid: string, env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    sub: env.FIREBASE_CLIENT_EMAIL,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid,
  };

  const header = { alg: 'RS256', typ: 'JWT' };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const message = `${encode(header)}.${encode(payload)}`;

  // Import private key (PEM format from env secret)
  const privateKeyPem = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const pemContent = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const binaryDer = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8', binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const msgBuffer = new TextEncoder().encode(message);
  const sigBuffer = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, msgBuffer);
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${message}.${sig}`;
}
