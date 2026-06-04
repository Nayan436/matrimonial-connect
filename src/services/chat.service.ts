import {
  collection, addDoc, doc, setDoc, query, orderBy,
  onSnapshot, serverTimestamp, updateDoc, where, getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Chat, ChatMessage } from '../types';

const CHATS_COL = 'chats';

// Create a chat room for a match
export async function createChat(matchId: string, uid: string, otherUid: string): Promise<string> {
  const chatRef = doc(collection(db, CHATS_COL));
  await setDoc(chatRef, {
    matchId,
    users: [uid, otherUid],
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return chatRef.id;
}

// Get chat id for a match
export async function getChatByMatch(matchId: string): Promise<string | null> {
  const q = query(collection(db, CHATS_COL), where('matchId', '==', matchId));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}

// Send a message
export async function sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
  const msgRef = collection(db, CHATS_COL, chatId, 'messages');
  await addDoc(msgRef, {
    senderId, text,
    timestamp: serverTimestamp(),
    isRead: false,
  });
  await updateDoc(doc(db, CHATS_COL, chatId), {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
  });
}

// Mark all messages in a chat as read
export async function markRead(chatId: string, currentUid: string): Promise<void> {
  const q = query(
    collection(db, CHATS_COL, chatId, 'messages'),
    where('senderId', '!=', currentUid),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, { isRead: true })));
}

// Real-time listener for messages in a chat
export function listenMessages(chatId: string, cb: (msgs: ChatMessage[]) => void): Unsubscribe {
  const q = query(collection(db, CHATS_COL, chatId, 'messages'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, snap => {
    const msgs: ChatMessage[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        senderId: data.senderId,
        text: data.text,
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        isRead: data.isRead,
      };
    });
    cb(msgs);
  });
}

// Real-time listener for all chats of a user
export function listenChats(uid: string, cb: (chats: Chat[]) => void): Unsubscribe {
  const q = query(collection(db, CHATS_COL), where('users', 'array-contains', uid));
  return onSnapshot(q, snap => {
    const chats: Chat[] = snap.docs.map(d => {
      const data = d.data();
      const profileId = (data.users as string[]).find((u: string) => u !== uid) ?? '';
      return {
        id: d.id,
        matchId: data.matchId,
        profileId,
        messages: [],
        lastActivity: data.lastMessageTime?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });
    cb(chats);
  });
}
