import {
  collection, addDoc, doc, updateDoc,
  serverTimestamp, query, where, onSnapshot,
  orderBy, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadPhoto } from './storage.service';

export interface PaymentRequest {
  id: string;
  userId: string;
  mobile: string;
  plan: 'basic' | 'lifetime';
  amount: number;
  payerName: string;
  transactionId: string;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// User submits payment proof
export async function submitPaymentRequest(
  uid: string,
  mobile: string,
  plan: 'basic' | 'lifetime',
  amount: number,
  payerName: string,
  transactionId: string,
  screenshotFile: File
): Promise<string> {
  // Upload screenshot to Firebase Storage
  const screenshotUrl = await uploadPhoto(uid + '/payment-proofs', screenshotFile);

  const ref = await addDoc(collection(db, 'payment_requests'), {
    userId: uid,
    mobile,
    plan,
    amount,
    payerName,
    transactionId: transactionId.trim().toUpperCase(),
    screenshotUrl,
    status: 'pending',
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

// Admin approves ? activates user
export async function approvePayment(requestId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'payment_requests', requestId), {
    status: 'approved',
    reviewedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', userId), {
    isActivated: true,
    activationDate: serverTimestamp(),
  });
}

// Admin rejects
export async function rejectPayment(requestId: string, reason: string): Promise<void> {
  await updateDoc(doc(db, 'payment_requests', requestId), {
    status: 'rejected',
    rejectionReason: reason,
    reviewedAt: serverTimestamp(),
  });
}

// Check if user already has a pending/approved request
export async function getUserPaymentStatus(
  uid: string
): Promise<PaymentRequest | null> {
  const { getDocs } = await import('firebase/firestore');
  const q = query(
    collection(db, 'payment_requests'),
    where('userId', '==', uid),
    orderBy('submittedAt', 'desc')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as PaymentRequest;
}

// Real-time listener for all payment requests (admin use)
export function listenAllPaymentRequests(
  cb: (requests: PaymentRequest[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'payment_requests'),
    orderBy('submittedAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const requests = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      submittedAt: d.data().submittedAt?.toDate?.()?.toISOString() ?? '',
      reviewedAt: d.data().reviewedAt?.toDate?.()?.toISOString(),
    })) as PaymentRequest[];
    cb(requests);
  });
}

// Ping admin WhatsApp after payment submitted (fire and forget)
export async function notifyAdminNewPayment(
  payerName: string, mobile: string, plan: string, amount: number, transactionId: string
): Promise<void> {
  const { WORKER_URL } = await import('../config/constants');
  fetch(`${WORKER_URL}/api/notify/new-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payerName, mobile, plan, amount, transactionId }),
  }).catch(() => {}); // fire and forget
}

// Send approval email when admin approves
export async function sendApprovalEmail(
  toEmail: string, toName: string, plan: string, amount: number, transactionId: string
): Promise<void> {
  const { WORKER_URL } = await import('../config/constants');
  await fetch(`${WORKER_URL}/api/notify/approval-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toEmail, toName, plan, amount, transactionId }),
  });
}
