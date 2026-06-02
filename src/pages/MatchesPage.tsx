import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock, X, MessageCircle } from 'lucide-react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { InterestStatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { MOCK_PROFILES, getProfileById } from '../data/mockProfiles';
import { formatTime } from '../utils/storage';

type Tab = 'matches' | 'sent' | 'received';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { state, acceptInterest, rejectInterest } = useApp();
  const [tab, setTab] = useState<Tab>('matches');

  const sentInterests = state.interests.filter(i => i.fromId === 'me');
  const receivedInterests = state.interests.filter(i => i.toId === 'me');
  const pendingReceived = receivedInterests.filter(i => i.status === 'pending');

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'matches', label: 'Matches', count: state.matches.length },
    { id: 'sent', label: 'Sent', count: sentInterests.length },
    { id: 'received', label: 'Received', count: pendingReceived.length },
  ];

  return (
    <AppLayout>
      <PageHeader title="Matches & Interests" />

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-[65px] z-20">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              tab === t.id ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}
            {(t.count ?? 0) > 0 && (
              <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                tab === t.id ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* ── Matches Tab ── */}
        {tab === 'matches' && (
          state.matches.length === 0 ? (
            <EmptyState icon="💍" title="No matches yet" desc="Send interests to profiles you like. Accepted interests become matches!" />
          ) : state.matches.map(match => {
            const profile = getProfileById(match.profileId);
            if (!profile) return null;
            const chat = state.chats.find(c => c.matchId === match.id);
            const unread = chat?.messages.filter(m => m.senderId !== 'me' && !m.isRead).length ?? 0;
            return (
              <div key={match.id} className="bg-white rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                <div className="relative flex-shrink-0">
                  <img src={profile.photos[0]} alt={profile.firstName} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{profile.firstName} {profile.lastName}</h3>
                    {unread > 0 && (
                      <span className="min-w-[20px] h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">{unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{profile.occupation} · {profile.city}</p>
                  <p className="text-xs text-green-600 font-medium mt-0.5">Matched {formatTime(match.createdAt)}</p>
                </div>
                <button
                  onClick={() => navigate(`/chats/${chat?.id ?? match.id}`)}
                  className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            );
          })
        )}

        {/* ── Sent Interests Tab ── */}
        {tab === 'sent' && (
          sentInterests.length === 0 ? (
            <EmptyState icon="💌" title="No interests sent" desc="Swipe right or tap Interested to send interests to profiles." />
          ) : sentInterests.map(interest => {
            const profile = getProfileById(interest.toId);
            if (!profile) return null;
            return (
              <div key={interest.id} className="bg-white rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                <img src={profile.photos[0]} alt={profile.firstName} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-xs text-gray-500">{profile.occupation} · {profile.city}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{formatTime(interest.createdAt)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <InterestStatusBadge status={interest.status} />
                </div>
              </div>
            );
          })
        )}

        {/* ── Received Interests Tab ── */}
        {tab === 'received' && (
          pendingReceived.length === 0 ? (
            <EmptyState icon="🌸" title="No pending interests" desc="When someone sends you an interest, you'll see it here." />
          ) : pendingReceived.map(interest => {
            const profile = MOCK_PROFILES.find(p => Math.random() > 0.5) ?? MOCK_PROFILES[0]; // demo
            return (
              <div key={interest.id} className="bg-white rounded-3xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <img src={profile.photos[0]} alt={profile.firstName} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{profile.firstName} {profile.lastName}</h3>
                    <p className="text-xs text-gray-500">{profile.occupation} · {profile.city}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(interest.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth onClick={() => rejectInterest(interest.id)}
                    icon={<X size={14} />}>
                    Decline
                  </Button>
                  <Button size="sm" fullWidth onClick={() => acceptInterest(interest.id, profile.id)}
                    icon={<Heart size={14} fill="white" strokeWidth={0} />}>
                    Accept
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs">{desc}</p>
    </div>
  );
}
