import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { isAdminLoggedIn } from './pages/AdminLoginPage';

import AuthPage          from './pages/AuthPage';
import OTPPage           from './pages/OTPPage';
import CreateProfilePage from './pages/CreateProfilePage';
import DiscoverPage      from './pages/DiscoverPage';
import MatchesPage       from './pages/MatchesPage';
import ChatsPage         from './pages/ChatsPage';
import ChatRoomPage      from './pages/ChatRoomPage';
import MyProfilePage     from './pages/MyProfilePage';
import ViewProfilePage   from './pages/ViewProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminLoginPage    from './pages/AdminLoginPage';
import AdminPage         from './pages/AdminPage';
import TermsPage         from './pages/TermsPage';
import PrivacyPage       from './pages/PrivacyPage';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
  </div>
);

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { state, authReady } = useApp();
  if (!authReady) return <Spinner />;
  if (!state.isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { state, authReady } = useApp();
  if (!authReady) return <Spinner />;
  if (!state.isLoggedIn) return <Navigate to="/" replace />;
  if (!state.profileComplete) return <Navigate to="/create-profile" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!isAdminLoggedIn()) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  const { state, authReady } = useApp();
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={
        !authReady ? <Spinner /> :
        state.isLoggedIn
          ? (state.profileComplete ? <Navigate to="/discover" replace/> : <Navigate to="/create-profile" replace/>)
          : <AuthPage/>
      }/>

      {/* Auth */}
      <Route path="/otp" element={<OTPPage/>}/>

      {/* Legal */}
      <Route path="/terms"   element={<TermsPage/>}/>
      <Route path="/privacy" element={<PrivacyPage/>}/>

      {/* Admin */}
      <Route path="/admin"           element={<AdminLoginPage/>}/>
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminPage/></RequireAdmin>}/>

      {/* Logged in */}
      <Route path="/create-profile" element={<RequireAuth><CreateProfilePage/></RequireAuth>}/>

      {/* Full profile */}
      <Route path="/discover"      element={<RequireProfile><DiscoverPage/></RequireProfile>}/>
      <Route path="/matches"       element={<RequireProfile><MatchesPage/></RequireProfile>}/>
      <Route path="/chats"         element={<RequireProfile><ChatsPage/></RequireProfile>}/>
      <Route path="/chats/:id"     element={<RequireProfile><ChatRoomPage/></RequireProfile>}/>
      <Route path="/profile"       element={<RequireProfile><MyProfilePage/></RequireProfile>}/>
      <Route path="/profile/:id"   element={<RequireProfile><ViewProfilePage/></RequireProfile>}/>
      <Route path="/notifications" element={<RequireProfile><NotificationsPage/></RequireProfile>}/>

      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}
