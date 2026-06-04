import { doc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { WORKER_URL, RAZORPAY_KEY_ID, PLANS } from '../config/constants';
import { setActivated } from './profile.service';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { contact: string };
  theme: { color: string };
  handler(response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }): void;
  modal: { ondismiss(): void };
}

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(s);
  });
}

export async function initiatePayment(
  uid: string,
  mobile: string,
  plan: 'basic' | 'lifetime'
): Promise<{ transactionId: string }> {
  await loadRazorpayScript();

  const planInfo = PLANS[plan];

  // Create order via Worker (keeps Razorpay secret key server-side)
  const orderRes = await fetch(`${WORKER_URL}/api/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: planInfo.price, plan }),
  });
  const { orderId } = await orderRes.json() as { orderId: string };

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: planInfo.price * 100,
      currency: 'INR',
      name: 'Matrimonial Connect',
      description: `${planInfo.label} Activation`,
      order_id: orderId,
      prefill: { contact: mobile },
      theme: { color: '#C2185B' },
      handler: async (response) => {
        // Verify payment via Worker
        const verifyRes = await fetch(`${WORKER_URL}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const { success } = await verifyRes.json() as { success: boolean };
        if (!success) { reject(new Error('Payment verification failed')); return; }

        // Record in Firestore
        await addDoc(collection(db, 'payments'), {
          userId: uid,
          plan,
          amount: planInfo.price,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          status: 'success',
          createdAt: serverTimestamp(),
        });

        // Activate user profile
        await setActivated(uid);

        resolve({ transactionId: response.razorpay_payment_id });
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.open();
  });
}
