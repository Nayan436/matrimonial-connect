import type { AppState } from '../types';

const KEY = 'mc_state';

const DEFAULT_FILTERS = {
  ageMin: 22,
  ageMax: 35,
  heightMin: "4'10\"",
  heightMax: "6'0\"",
  religion: '',
  community: '',
  education: '',
  occupation: '',
  income: '',
  city: '',
  maritalStatus: '',
};

export const DEFAULT_STATE: AppState = {
  mobile: null,
  isLoggedIn: false,
  isActivated: false,
  userProfile: null,
  profileComplete: false,
  swipedProfiles: [],
  filters: DEFAULT_FILTERS,
  interests: [],
  matches: [],
  chats: [],
  notifications: [],
  paymentHistory: [],
  isAdmin: false,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...DEFAULT_STATE, ...parsed, filters: { ...DEFAULT_FILTERS, ...(parsed.filters ?? {}) } };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full — ignore
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatChatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function calcProfileCompletion(p: Partial<{ firstName: string; photos: string[]; about: string; education: string; occupation: string; fatherName: string; hobbies: string[] }>): number {
  const checks = [
    !!p.firstName,
    (p.photos?.length ?? 0) > 0,
    !!p.about && p.about.length > 20,
    !!p.education,
    !!p.occupation,
    !!p.fatherName,
    (p.hobbies?.length ?? 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
