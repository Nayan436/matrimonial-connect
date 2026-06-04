import {
  collection, addDoc, updateDoc, doc, query,
  where, onSnapshot, orderBy, serverTimestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Notification, NotificationType } from '../types';

const COL = 'notifications';

export async function addNotification(
  uid: string,
  type: NotificationType,
  title: string,
  body: string,
  profileId?: string
): Promise<void> {
  await addDoc(collection(db, COL), {
    userId: uid, type, title, body,
    isRead: false,
    profileId: profileId ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function markRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COL, notificationId), { isRead: true });
}

export async function markAllRead(uid: string): Promise<void> {
  // Client-side batch — Firestore free tier has no batch write limit for small sets
  const q = query(collection(db, COL), where('userId', '==', uid), where('isRead', '==', false));
  const { getDocs } = await import('firebase/firestore');
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, { isRead: true })));
}

export function listenNotifications(uid: string, cb: (notifs: Notification[]) => void): Unsubscribe {
  const q = query(
    collection(db, COL),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const notifs: Notification[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        type: data.type,
        title: data.title,
        body: data.body,
        isRead: data.isRead,
        timestamp: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        profileId: data.profileId ?? undefined,
      };
    });
    cb(notifs);
  });
}
