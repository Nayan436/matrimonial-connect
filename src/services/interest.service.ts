import {
  collection, addDoc, updateDoc, doc, query,
  where, onSnapshot, serverTimestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Interest } from '../types';

const COL = 'interests';

export async function sendInterest(fromId: string, toId: string): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    fromId, toId,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateInterestStatus(
  interestId: string,
  status: Interest['status']
): Promise<void> {
  await updateDoc(doc(db, COL, interestId), { status, updatedAt: serverTimestamp() });
}

// Real-time listener for interests sent BY this user
export function listenSentInterests(uid: string, cb: (interests: Interest[]) => void): Unsubscribe {
  const q = query(collection(db, COL), where('fromId', '==', uid));
  return onSnapshot(q, snap => {
    const interests: Interest[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Interest));
    cb(interests);
  });
}

// Real-time listener for interests received BY this user
export function listenReceivedInterests(uid: string, cb: (interests: Interest[]) => void): Unsubscribe {
  const q = query(collection(db, COL), where('toId', '==', uid));
  return onSnapshot(q, snap => {
    const interests: Interest[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Interest));
    cb(interests);
  });
}
