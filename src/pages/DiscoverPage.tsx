import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal, Bell, RefreshCw, X, Heart, Eye, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PaywallModal } from '../components/payment/PaywallModal';
import { BottomSheet } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { VerifiedBadge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { MOCK_PROFILES } from '../data/mockProfiles';
import type { MockProfile, DiscoverFilters } from '../types';

// ── Swipe Card ──────────────────────────────────────────────────────────────

interface SwipeCardProps {
  profile: MockProfile;
  onSwipe: (dir: 'left' | 'right') => void;
  onView: () => void;
  isTop: boolean;
  stackIndex: number;
}

function SwipeCard({ profile, onSwipe, onView, isTop, stackIndex }: SwipeCardProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0, isDragging: false });
  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 100;

  const getIndicator = () => {
    if (drag.x > 60) return 'right';
    if (drag.x < -60) return 'left';
    return null;
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    startPos.current = { x: clientX, y: clientY };
    setDrag(d => ({ ...d, isDragging: true }));
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!drag.isDragging) return;
    setDrag(d => ({
      ...d,
      x: clientX - startPos.current.x,
      y: clientY - startPos.current.y,
    }));
  };

  const handleEnd = () => {
    if (!drag.isDragging) return;
    if (drag.x > THRESHOLD) onSwipe('right');
    else if (drag.x < -THRESHOLD) onSwipe('left');
    else setDrag({ x: 0, y: 0, isDragging: false });
  };

  const rot = drag.x * 0.08;
  const stackY = stackIndex * 10;
  const stackScale = 1 - stackIndex * 0.04;

  const style: React.CSSProperties = isTop ? {
    transform: `translateX(${drag.x}px) translateY(${drag.y}px) rotate(${rot}deg)`,
    transition: drag.isDragging ? 'none' : 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    zIndex: 10 - stackIndex,
    cursor: drag.isDragging ? 'grabbing' : 'grab',
  } : {
    transform: `translateY(${stackY}px) scale(${stackScale})`,
    zIndex: 10 - stackIndex,
    pointerEvents: 'none',
  };

  const indicator = getIndicator();
  const photo = profile.photos[profile.primaryPhoto] ?? profile.photos[0];

  return (
    <div
      ref={cardRef}
      style={style}
      className="absolute inset-0 w-full h-full select-none"
      onMouseDown={e => handleStart(e.clientX, e.clientY)}
      onMouseMove={e => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={e => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      {/* Photo */}
      <div className="w-full h-full rounded-4xl overflow-hidden shadow-card relative">
        <img
          src={photo}
          alt={profile.firstName}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-card-gradient" />

        {/* Like / Pass indicators */}
        {indicator === 'right' && (
          <div className="absolute top-8 left-6 bg-green-500 text-white font-extrabold text-2xl px-4 py-2 rounded-2xl rotate-[-20deg] border-4 border-white shadow-lg opacity-90">
            INTERESTED 💍
          </div>
        )}
        {indicator === 'left' && (
          <div className="absolute top-8 right-6 bg-red-500 text-white font-extrabold text-2xl px-4 py-2 rounded-2xl rotate-[20deg] border-4 border-white shadow-lg opacity-90">
            PASS ✗
          </div>
        )}

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white text-2xl font-bold">{profile.firstName}</h2>
                <span className="text-white text-xl font-light">{profile.age}</span>
                {profile.isVerified && <VerifiedBadge />}
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm mb-1">
                <Briefcase size={13} /><span>{profile.occupation}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin size={13} /><span>{profile.city}, {profile.state}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-xs mt-1">
                <GraduationCap size={12} /><span>{profile.education}</span>
                <span className="ml-2">· {profile.religion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* View profile button */}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onView(); }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow"
        >
          <Eye size={12} className="inline mr-1" />View
        </button>
      </div>
    </div>
  );
}

// ── Main Discover Page ────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { state, swipe, resetSwipes, setFilters } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<DiscoverFilters>(state.filters);

  const { filters } = state;
  const available = MOCK_PROFILES.filter(p => {
    if (state.swipedProfiles.includes(p.id)) return false;
    if (filters.religion && p.religion !== filters.religion) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (p.age < filters.ageMin || p.age > filters.ageMax) return false;
    return true;
  });

  const topThree = available.slice(0, 3);

  const handleSwipe = useCallback((profileId: string, dir: 'left' | 'right') => {
    if (dir === 'right' && !state.isActivated) {
      setShowPaywall(true);
      return;
    }
    swipe(profileId, dir);
  }, [state.isActivated, swipe]);

  const handleAction = (dir: 'left' | 'right') => {
    if (topThree.length === 0) return;
    handleSwipe(topThree[0].id, dir);
  };

  const handleView = (profile: MockProfile) => {
    navigate(`/profile/${profile.id}`);
  };

  const applyFilters = () => {
    setFilters(localFilters);
    setShowFilters(false);
  };

  const religionOpts = ['','Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Other'].map(v => ({ value: v, label: v || 'Any Religion' }));
  const cityOpts = ['','Ahmedabad','Surat','Vadodara','Mumbai','Pune','Jaipur','Bangalore'].map(v => ({ value: v, label: v || 'Any City' }));

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 flex items-center justify-between border-b border-gray-100">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Discover</h1>
          <p className="text-xs text-gray-400">{available.length} profiles near you</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(true)} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors relative">
            <SlidersHorizontal size={18} className="text-gray-700" />
          </button>
          <button onClick={() => navigate('/notifications')} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors relative">
            <Bell size={18} className="text-gray-700" />
            {state.notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Activation banner */}
      {!state.isActivated && (
        <div className="mx-4 mt-3">
          <button onClick={() => setShowPaywall(true)} className="w-full bg-brand-gradient text-white text-sm font-semibold px-4 py-3 rounded-2xl flex items-center justify-between">
            <span>🔓 Activate to send interests & chat</span>
            <span className="bg-white/20 px-3 py-1 rounded-xl text-xs">₹499</span>
          </button>
        </div>
      )}

      {/* Card Stack */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        {topThree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">You've seen everyone!</h3>
            <p className="text-gray-500 text-sm mb-6">Reset to browse profiles again</p>
            <Button onClick={resetSwipes} icon={<RefreshCw size={16} />}>
              Reset Discover
            </Button>
          </div>
        ) : (
          <>
            {/* Card stack area */}
            <div className="relative w-full" style={{ height: 'min(520px, 68vh)' }}>
              {[...topThree].reverse().map((profile, revIdx) => {
                const stackIndex = topThree.length - 1 - revIdx;
                return (
                  <SwipeCard
                    key={profile.id}
                    profile={profile}
                    onSwipe={dir => handleSwipe(profile.id, dir)}
                    onView={() => handleView(profile)}
                    isTop={stackIndex === 0}
                    stackIndex={stackIndex}
                  />
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => handleAction('left')}
                className="w-16 h-16 bg-white border-2 border-red-200 text-red-500 rounded-full flex items-center justify-center shadow-card hover:scale-110 transition-transform active:scale-95"
              >
                <X size={28} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => handleView(topThree[0])}
                className="w-12 h-12 bg-white border-2 border-gray-200 text-gray-500 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform active:scale-95"
              >
                <Eye size={20} />
              </button>
              <button
                onClick={() => handleAction('right')}
                className="w-16 h-16 bg-brand-gradient text-white rounded-full flex items-center justify-center shadow-card hover:scale-110 transition-transform active:scale-95"
              >
                <Heart size={28} fill="white" strokeWidth={0} />
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-400 mt-3">← Swipe or use buttons to browse →</p>
          </>
        )}
      </div>

      {/* Paywall */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Filters Sheet */}
      <BottomSheet open={showFilters} onClose={() => setShowFilters(false)} title="Filter Profiles">
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Min Age</label>
              <input type="number" min={18} max={60} value={localFilters.ageMin}
                onChange={e => setLocalFilters(f => ({ ...f, ageMin: +e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Max Age</label>
              <input type="number" min={18} max={60} value={localFilters.ageMax}
                onChange={e => setLocalFilters(f => ({ ...f, ageMax: +e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-500"
              />
            </div>
          </div>
          <Select label="Religion" value={localFilters.religion} onChange={e => setLocalFilters(f => ({ ...f, religion: e.target.value }))} options={religionOpts} />
          <Select label="City" value={localFilters.city} onChange={e => setLocalFilters(f => ({ ...f, city: e.target.value }))} options={cityOpts} />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" size="md" onClick={() => { setLocalFilters(state.filters); setShowFilters(false); }} className="flex-1">Reset</Button>
          <Button size="md" onClick={applyFilters} className="flex-1">Apply Filters</Button>
        </div>
      </BottomSheet>
    </AppLayout>
  );
}
