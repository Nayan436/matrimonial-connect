import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, orderBy, limit, serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile } from '../types';

const COL = 'users';

// -- Create / update own profile -----------------------------------------------
export async function saveProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, COL, uid);
  await setDoc(ref, { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

// -- Fetch own profile ---------------------------------------------------------
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

// -- Fetch profiles for discovery (exclude own + already swiped) ---------------
export async function getDiscoverProfiles(
  uid: string,
  swipedIds: string[],
  filters: { ageMin: number; ageMax: number; religion?: string; city?: string },
  pageSize = 20
): Promise<UserProfile[]> {
  let q = query(
    collection(db, COL),
    where('profileComplete', '==', true),
    where('isActivated', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1 + swipedIds.length)
  );

  const snap = await getDocs(q);
  const profiles: UserProfile[] = [];

  snap.forEach(d => {
    const data = d.data() as DocumentData;
    if (d.id === uid) return;
    if (swipedIds.includes(d.id)) return;
    if (filters.religion && data.religion !== filters.religion) return;
    if (filters.city && data.city !== filters.city) return;
    if (data.age < filters.ageMin || data.age > filters.ageMax) return;
    if (profiles.length < pageSize) profiles.push({ id: d.id, ...data } as UserProfile);
  });

  return profiles;
}

// -- Get any profile by id -----------------------------------------------------
export async function getProfileById(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

// -- Mark profile activated ----------------------------------------------------
export async function setActivated(uid: string): Promise<void> {
  await updateDoc(doc(db, COL, uid), {
    isActivated: true,
    activationDate: serverTimestamp(),
  });
}
