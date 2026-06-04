import { json } from '../utils/cors';

interface Env {
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
}

// -- Create Razorpay order -----------------------------------------------------
export async function handleCreateOrder(request: Request, env: Env): Promise<Response> {
  const { amount, plan } = await request.json() as { amount: number; plan: string };

  const authHeader = 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amount * 100,   // paise
      currency: 'INR',
      receipt: `mc_${plan}_${Date.now()}`,
      notes: { plan },
    }),
  });

  const order = await res.json() as { id: string; error?: { description: string } };
  if (order.error) return json({ success: false, error: order.error.description }, 400);

  return json({ success: true, orderId: order.id });
}

// -- Verify Razorpay payment signature -----------------------------------------
export async function handleVerifyPayment(request: Request, env: Env): Promise<Response> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    = await request.json() as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (expected !== razorpay_signature) {
    return json({ success: false, error: 'Signature mismatch' }, 400);
  }

  return json({ success: true });
}
