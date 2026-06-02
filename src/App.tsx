import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Pages
import AuthPage from './pages/AuthPage';
import OTPPage from './pages/OTPPage';
import CreateProfilePage from './pages/CreateProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import ChatsPage from './pages/ChatsPage';
import ChatRoomPage from './pages/ChatRoomPage';
import MyProfilePage from './pages/MyProfilePage';
import ViewProfilePage from './pages/ViewProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

// ─── Guards ───────────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isLoggedIn) return <Navigate to="/" replace />;
  if (!state.profileComplete) return <Navigate to="/create-profile" replace />;
  return <>{children}</>;
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { state } = useApp();

  return (
    <Routes>
      {/* ── Public ── */}
      <Route
        path="/"
        element={
          state.isLoggedIn
            ? state.profileComplete
              ? <Navigate to="/discover" replace />
              : <Navigate to="/create-profile" replace />
            : <AuthPage />
        }
      />
      <Route path="/otp" element={<OTPPage />} />
      <Route path="/admin" element={<AdminPage />} />

      {/* ── Auth required ── */}
      <Route path="/create-profile" element={
        <RequireAuth><CreateProfilePage /></RequireAuth>
      } />

      {/* ── Auth + Profile required ── */}
      <Route path="/discover" element={
        <RequireProfile><DiscoverPage /></RequireProfile>
      } />
      <Route path="/matches" element={
        <RequireProfile><MatchesPage /></RequireProfile>
      } />
      <Route path="/chats" element={
        <RequireProfile><ChatsPage /></RequireProfile>
      } />
      <Route path="/chats/:id" element={
        <RequireProfile><ChatRoomPage /></RequireProfile>
      } />
      <Route path="/profile" element={
        <RequireProfile><MyProfilePage /></RequireProfile>
      } />
      <Route path="/profile/:id" element={
        <RequireProfile><ViewProfilePage /></RequireProfile>
      } />
      <Route path="/notifications" element={
        <RequireProfile><NotificationsPage /></RequireProfile>
      } />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
