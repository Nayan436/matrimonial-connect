import {
  collection, addDoc, query, where,
  onSnapshot, serverTimestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Match } from '../types';

const COL = 'matches';

export async function createMatch(uid: string, otherUid: string, interestId: string): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    users: [uid, otherUid],
    interestId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Real-time listener for all matches involving this user
export function listenMatches(uid: string, cb: (matches: Match[]) => void): Unsubscribe {
  const q = query(collection(db, COL), where('users', 'array-contains', uid));
  return onSnapshot(q, snap => {
    const matches: Match[] = snap.docs.map(d => {
      const data = d.data();
      const profileId = (data.users as string[]).find(u => u !== uid) ?? '';
      return { id: d.id, profileId, interestId: data.interestId, createdAt: data.createdAt } as Match;
    });
    cb(matches);
  });
}
