import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, UserProfile, Interest, Match, Chat, ChatMessage, Notification, PaymentRecord, DiscoverFilters } from '../types';
import { loadState, saveState, DEFAULT_STATE, uid } from '../utils/storage';
import { MOCK_PROFILES, AUTO_ACCEPT_IDS, AUTO_REJECT_IDS } from '../data/mockProfiles';
import { SEED_MESSAGES } from '../data/mockChats';

// ─── Action Types ────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOGIN'; mobile: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_PROFILE'; profile: UserProfile }
  | { type: 'ACTIVATE'; record: PaymentRecord }
  | { type: 'SWIPE'; profileId: string }
  | { type: 'RESET_SWIPES' }
  | { type: 'SET_FILTERS'; filters: DiscoverFilters }
  | { type: 'SEND_INTEREST'; interest: Interest }
  | { type: 'UPDATE_INTEREST'; id: string; status: Interest['status'] }
  | { type: 'ADD_MATCH'; match: Match; chat: Chat }
  | { type: 'ADD_MESSAGE'; chatId: string; message: ChatMessage }
  | { type: 'MARK_CHAT_READ'; chatId: string }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'READ_NOTIFICATION'; id: string }
  | { type: 'READ_ALL_NOTIFICATIONS' }
  | { type: 'SET_ADMIN'; value: boolean }
  | { type: 'LOAD'; state: AppState };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return action.state;
    case 'LOGIN':
      return { ...state, mobile: action.mobile, isLoggedIn: true };
    case 'LOGOUT':
      return { ...DEFAULT_STATE };
    case 'SET_PROFILE':
      return { ...state, userProfile: action.profile, profileComplete: true };
    case 'ACTIVATE':
      return { ...state, isActivated: true, paymentHistory: [...state.paymentHistory, action.record] };
    case 'SWIPE':
      return { ...state, swipedProfiles: [...state.swipedProfiles, action.profileId] };
    case 'RESET_SWIPES':
      return { ...state, swipedProfiles: [] };
    case 'SET_FILTERS':
      return { ...state, filters: action.filters };
    case 'SEND_INTEREST':
      return { ...state, interests: [...state.interests, action.interest] };
    case 'UPDATE_INTEREST':
      return {
        ...state,
        interests: state.interests.map(i =>
          i.id === action.id ? { ...i, status: action.status, updatedAt: new Date().toISOString() } : i
        ),
      };
    case 'ADD_MATCH':
      return { ...state, matches: [...state.matches, action.match], chats: [...state.chats, action.chat] };
    case 'ADD_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(c =>
          c.id === action.chatId
            ? { ...c, messages: [...c.messages, action.message], lastActivity: action.message.timestamp }
            : c
        ),
      };
    case 'MARK_CHAT_READ':
      return {
        ...state,
        chats: state.chats.map(c =>
          c.id === action.chatId ? { ...c, messages: c.messages.map(m => ({ ...m, isRead: true })) } : c
        ),
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };
    case 'READ_NOTIFICATION':
      return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, isRead: true } : n) };
    case 'READ_ALL_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, isRead: true })) };
    case 'SET_ADMIN':
      return { ...state, isAdmin: action.value };
    default:
      return state;
  }
}

// ─── Context Interface ────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  login: (mobile: string) => void;
  logout: () => void;
  setProfile: (profile: UserProfile) => void;
  activate: (plan: 'basic' | 'lifetime', method: string) => void;
  swipe: (profileId: string, direction: 'left' | 'right') => void;
  resetSwipes: () => void;
  setFilters: (filters: DiscoverFilters) => void;
  sendInterest: (profileId: string) => void;
  acceptInterest: (interestId: string, profileId: string) => void;
  rejectInterest: (interestId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  markChatRead: (chatId: string) => void;
  readNotification: (id: string) => void;
  readAllNotifications: () => void;
  setAdmin: (v: boolean) => void;
  unreadNotifications: number;
  unreadMessages: number;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    dispatch({ type: 'LOAD', state: saved });
  }, []);

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Auth ─────────────────────────────────────────────────────────────────────

  const login = useCallback((mobile: string) => {
    dispatch({ type: 'LOGIN', mobile });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: uid(),
        type: 'system',
        title: 'Welcome to Matrimonial Connect!',
        body: 'Complete your profile to start connecting with matches.',
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    });
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  const setProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', profile });
  }, []);

  // ── Activation ───────────────────────────────────────────────────────────────

  const activate = useCallback((plan: 'basic' | 'lifetime', method: string) => {
    const record: PaymentRecord = {
      id: uid(),
      plan,
      amount: plan === 'basic' ? 499 : 999,
      method,
      transactionId: `TXN-DEMO-${Math.floor(Math.random() * 90000 + 10000)}`,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ACTIVATE', record });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: uid(),
        type: 'payment',
        title: 'Payment Successful 🎉',
        body: `Your profile is now activated. Transaction ID: ${record.transactionId}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    });
  }, []);

  // ── Interests — MUST be defined before swipe ──────────────────────────────────

  const sendInterestInternal = useCallback((profileId: string) => {
    const interest: Interest = {
      id: uid(),
      fromId: 'me',
      toId: profileId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'SEND_INTEREST', interest });

    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (!profile) return;

    if (AUTO_ACCEPT_IDS.has(profileId)) {
      setTimeout(() => {
        dispatch({ type: 'UPDATE_INTEREST', id: interest.id, status: 'accepted' });
        const match: Match = {
          id: uid(),
          profileId,
          interestId: interest.id,
          createdAt: new Date().toISOString(),
        };
        const chat: Chat = {
          id: uid(),
          matchId: match.id,
          profileId,
          messages: SEED_MESSAGES[profileId] ?? [],
          lastActivity: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_MATCH', match, chat });
        dispatch({
          type: 'ADD_NOTIFICATION',
          notification: {
            id: uid(),
            type: 'match',
            title: `${profile.firstName} accepted your interest! 💍`,
            body: `You and ${profile.firstName} ${profile.lastName} are now matched. Start chatting!`,
            timestamp: new Date().toISOString(),
            isRead: false,
            profileId,
          },
        });
      }, 2500);
    } else if (AUTO_REJECT_IDS.has(profileId)) {
      setTimeout(() => {
        dispatch({ type: 'UPDATE_INTEREST', id: interest.id, status: 'rejected' });
        dispatch({
          type: 'ADD_NOTIFICATION',
          notification: {
            id: uid(),
            type: 'interest',
            title: `${profile.firstName} passed on your interest`,
            body: 'Keep exploring — your perfect match is out there!',
            timestamp: new Date().toISOString(),
            isRead: false,
            profileId,
          },
        });
      }, 3000);
    }
    // Others remain pending
  }, []);

  // ── Discovery — defined after sendInterestInternal ────────────────────────────

  const swipe = useCallback((profileId: string, direction: 'left' | 'right') => {
    dispatch({ type: 'SWIPE', profileId });
    if (direction === 'right') {
      sendInterestInternal(profileId);
    }
  }, [sendInterestInternal]);

  const resetSwipes = useCallback(() => dispatch({ type: 'RESET_SWIPES' }), []);
  const setFilters = useCallback((filters: DiscoverFilters) => dispatch({ type: 'SET_FILTERS', filters }), []);

  // ── Public interest API ───────────────────────────────────────────────────────

  const sendInterest = useCallback((profileId: string) => {
    sendInterestInternal(profileId);
  }, [sendInterestInternal]);

  const acceptInterest = useCallback((interestId: string, profileId: string) => {
    dispatch({ type: 'UPDATE_INTEREST', id: interestId, status: 'accepted' });
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    const match: Match = {
      id: uid(),
      profileId,
      interestId,
      createdAt: new Date().toISOString(),
    };
    const chat: Chat = {
      id: uid(),
      matchId: match.id,
      profileId,
      messages: SEED_MESSAGES[profileId] ?? [],
      lastActivity: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MATCH', match, chat });
    if (profile) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: uid(),
          type: 'match',
          title: `You accepted ${profile.firstName}'s interest!`,
          body: `You can now chat with ${profile.firstName} ${profile.lastName}.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          profileId,
        },
      });
    }
  }, []);

  const rejectInterest = useCallback((interestId: string) => {
    dispatch({ type: 'UPDATE_INTEREST', id: interestId, status: 'rejected' });
  }, []);

  // ── Chat ──────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback((chatId: string, text: string) => {
    const message: ChatMessage = {
      id: uid(),
      senderId: 'me',
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    dispatch({ type: 'ADD_MESSAGE', chatId, message });
  }, []);

  const markChatRead = useCallback((chatId: string) => {
    dispatch({ type: 'MARK_CHAT_READ', chatId });
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────────

  const readNotification = useCallback((id: string) => {
    dispatch({ type: 'READ_NOTIFICATION', id });
  }, []);

  const readAllNotifications = useCallback(() => {
    dispatch({ type: 'READ_ALL_NOTIFICATIONS' });
  }, []);

  const setAdmin = useCallback((v: boolean) => dispatch({ type: 'SET_ADMIN', value: v }), []);

  // ── Derived counts ────────────────────────────────────────────────────────────

  const unreadNotifications = state.notifications.filter(n => !n.isRead).length;
  const unreadMessages = state.chats.reduce(
    (acc, c) => acc + c.messages.filter(m => m.senderId !== 'me' && !m.isRead).length,
    0
  );

  return (
    <AppContext.Provider value={{
      state, login, logout, setProfile, activate,
      swipe, resetSwipes, setFilters,
      sendInterest, acceptInterest, rejectInterest,
      sendMessage, markChatRead,
      readNotification, readAllNotifications, setAdmin,
      unreadNotifications, unreadMessages,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
