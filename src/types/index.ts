// ─── Core User Types ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  mobile: string;
  isActivated: boolean;
  activationDate?: string;
  createdAt: string;

  // Personal
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  age: number;
  height: string;
  religion: string;
  community: string;
  motherTongue: string;
  education: string;
  occupation: string;
  income: string;
  city: string;
  state: string;
  country: string;
  about: string;
  maritalStatus: string;

  // Family
  fatherName: string;
  motherName: string;
  familyType: string;
  familyValues: string;
  siblings: string;

  // Lifestyle
  diet: string;
  smoking: string;
  drinking: string;
  fitness: string;
  hobbies: string[];

  // Partner Preferences
  prefAgeMin: number;
  prefAgeMax: number;
  prefHeightMin: string;
  prefHeightMax: string;
  prefEducation: string;
  prefOccupation: string;
  prefReligion: string;
  prefCity: string;

  // Photos
  photos: string[];
  primaryPhoto: number;

  // Verification
  isVerified: boolean;
  profileCompletion: number;
}

// ─── Mock Profile (pre-loaded demo) ────────────────────────────────────────

export interface MockProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female';
  height: string;
  religion: string;
  community: string;
  motherTongue: string;
  education: string;
  occupation: string;
  income: string;
  city: string;
  state: string;
  country: string;
  about: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  familyType: string;
  familyValues: string;
  siblings: string;
  diet: string;
  smoking: string;
  drinking: string;
  fitness: string;
  hobbies: string[];
  photos: string[];
  primaryPhoto: number;
  isVerified: boolean;
  interestOutcome: 'accept' | 'reject' | 'pending';
}

// ─── Interest Types ─────────────────────────────────────────────────────────

export type InterestStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Interest {
  id: string;
  fromId: string;
  toId: string;
  status: InterestStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Match ──────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  profileId: string;
  interestId: string;
  createdAt: string;
}

// ─── Chat ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  matchId: string;
  profileId: string;
  messages: ChatMessage[];
  lastActivity: string;
}

// ─── Notification ───────────────────────────────────────────────────────────

export type NotificationType = 'interest' | 'match' | 'message' | 'payment' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  profileId?: string;
}

// ─── Payment ────────────────────────────────────────────────────────────────

export type PaymentPlan = 'basic' | 'lifetime';

export interface PaymentRecord {
  id: string;
  plan: PaymentPlan;
  amount: number;
  method: string;
  transactionId: string;
  timestamp: string;
}

// ─── Filters ────────────────────────────────────────────────────────────────

export interface DiscoverFilters {
  ageMin: number;
  ageMax: number;
  heightMin: string;
  heightMax: string;
  religion: string;
  community: string;
  education: string;
  occupation: string;
  income: string;
  city: string;
  maritalStatus: string;
}

// ─── App State ──────────────────────────────────────────────────────────────

export interface AppState {
  // Auth
  mobile: string | null;
  isLoggedIn: boolean;
  isActivated: boolean;

  // Profile
  userProfile: UserProfile | null;
  profileComplete: boolean;

  // Discovery
  swipedProfiles: string[];
  filters: DiscoverFilters;

  // Social
  interests: Interest[];
  matches: Match[];
  chats: Chat[];
  notifications: Notification[];

  // Payment
  paymentHistory: PaymentRecord[];

  // Admin
  isAdmin: boolean;
}
