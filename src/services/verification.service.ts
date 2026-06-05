import {
  collection, addDoc, doc, updateDoc, query,
  where, onSnapshot, orderBy, serverTimestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadPhoto } from './storage.service';
import { WORKER_URL } from '../config/constants';

export interface VerificationRequest {
  id: string;
  userId: string;
  mobile: string;
  fullName: string;
  idType: string;
  idNumber: string;
  idPhotoUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export async function submitVerification(
  uid: string,
  mobile: string,
  fullName: string,
  idType: string,
  idNumber: string,
  idPhotoFile: File
): Promise<void> {
  const idPhotoUrl = await uploadPhoto(`${uid}/verification`, idPhotoFile);
  await addDoc(collection(db, 'verification_requests'), {
    userId: uid, mobile, fullName, idType,
    idNumber: idNumber.trim().toUpperCase(),
    idPhotoUrl, status: 'pending',
    submittedAt: serverTimestamp(),
  });
  // Ping admin WhatsApp (fire and forget)
  fetch(`${WORKER_URL}/api/notify/new-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: fullName, mobile }),
  }).catch(() => {});
}

export async function approveVerification(requestId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'verification_requests', requestId), {
    status: 'approved', reviewedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', userId), {
    isVerified: true, verifiedAt: serverTimestamp(),
  });
}

export async function rejectVerification(requestId: string, reason: string): Promise<void> {
  await updateDoc(doc(db, 'verification_requests', requestId), {
    status: 'rejected', rejectionReason: reason, reviewedAt: serverTimestamp(),
  });
}

export function listenAllVerificationRequests(cb: (reqs: VerificationRequest[]) => void): Unsubscribe {
  const q = query(collection(db, 'verification_requests'), orderBy('submittedAt', 'desc'));
  return onSnapshot(q, snap => {
    const reqs = snap.docs.map(d => ({
      id: d.id, ...d.data(),
      submittedAt: d.data().submittedAt?.toDate?.()?.toISOString() ?? '',
      reviewedAt:  d.data().reviewedAt?.toDate?.()?.toISOString(),
    })) as VerificationRequest[];
    cb(reqs);
  });
}

export async function getUserVerificationStatus(uid: string): Promise<VerificationRequest | null> {
  const { getDocs } = await import('firebase/firestore');
  const q = query(collection(db, 'verification_requests'), where('userId', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as VerificationRequest;
}
