import {
  collection, addDoc, query, where, getDocs,
  orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ProfileView {
  id: string;
  viewerId: string;
  viewedId: string;
  timestamp: string;
}

// Log that viewerId visited viewedId's profile (deduplicated per 24h)
export async function logProfileView(viewerId: string, viewedId: string): Promise<void> {
  if (viewerId === viewedId) return; // dont log self-views
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, 'profile_views'),
    where('viewerId', '==', viewerId),
    where('viewedId', '==', viewedId),
    where('timestamp', '>=', Timestamp.fromDate(since))
  );
  const existing = await getDocs(q);
  if (!existing.empty) return; // already logged in last 24h
  await addDoc(collection(db, 'profile_views'), {
    viewerId, viewedId, timestamp: serverTimestamp(),
  });
}

// Get who viewed MY profile (most recent 50, for activated users only)
export async function getMyViewers(uid: string): Promise<ProfileView[]> {
  const q = query(
    collection(db, 'profile_views'),
    where('viewedId', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    viewerId: d.data().viewerId,
    viewedId: d.data().viewedId,
    timestamp: d.data().timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }));
}
