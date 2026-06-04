import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { AppState, UserProfile, Interest, Match, Chat, ChatMessage, Notification, DiscoverFilters } from '../types';
import { onAuthChange } from '../services/auth.service';
import * as ProfileSvc from '../services/profile.service';
import * as InterestSvc from '../services/interest.service';
import * as MatchSvc from '../services/match.service';
import * as ChatSvc from '../services/chat.service';
import * as NotifSvc from '../services/notification.service';

const DEFAULT_FILTERS: DiscoverFilters = {
  ageMin: 22, ageMax: 35, heightMin: "4'10\"", heightMax: "6'0\"",
  religion: '', community: '', education: '', occupation: '',
  income: '', city: '', maritalStatus: '',
};

interface AppContextValue {
  state: AppState;
  firebaseUser: User | null;
  authReady: boolean;
  setProfile: (p: UserProfile) => void;
  setFilters: (f: DiscoverFilters) => void;
  addSwipe: (profileId: string) => void;
  resetSwipes: () => void;
  refreshProfile: () => Promise<void>;
  unreadNotifications: number;
  unreadMessages: number;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [swipedProfiles, setSwipedProfiles] = useState<string[]>([]);
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS);

  // -- Firebase Auth listener ---------------------------------------------------
  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (!user) {
        setUserProfile(null);
        setInterests([]); setMatches([]); setChats([]); setNotifications([]);
        return;
      }
      const profile = await ProfileSvc.getProfile(user.uid);
      setUserProfile(profile);
    });
    return unsub;
  }, []);

  // -- Real-time Firestore listeners (only when logged in) ----------------------
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const u1 = InterestSvc.listenSentInterests(uid, setInterests);
    const u2 = MatchSvc.listenMatches(uid, setMatches);
    const u3 = ChatSvc.listenChats(uid, setChats);
    const u4 = NotifSvc.listenNotifications(uid, setNotifications);
    return () => { u1(); u2(); u3(); u4(); };
  }, [firebaseUser]);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    const p = await ProfileSvc.getProfile(firebaseUser.uid);
    setUserProfile(p);
  }, [firebaseUser]);

  const addSwipe = useCallback((id: string) => setSwipedProfiles(prev => [...prev, id]), []);
  const resetSwipes = useCallback(() => setSwipedProfiles([]), []);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const unreadMessages = chats.reduce((acc, c) =>
    acc + (c.messages?.filter(m => m.senderId !== firebaseUser?.uid && !m.isRead).length ?? 0), 0);

  const state: AppState = {
    mobile: firebaseUser?.uid?.replace('mobile_', '') ?? null,
    isLoggedIn: !!firebaseUser,
    isActivated: userProfile?.isActivated ?? false,
    userProfile,
    profileComplete: userProfile?.profileComplete ?? false,
    swipedProfiles,
    filters,
    interests,
    matches,
    chats,
    notifications,
    paymentHistory: [],
    isAdmin: false,
  };

  return (
    <Ctx.Provider value={{
      state, firebaseUser, authReady,
      setProfile: setUserProfile,
      setFilters,
      addSwipe, resetSwipes,
      refreshProfile,
      unreadNotifications, unreadMessages,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
