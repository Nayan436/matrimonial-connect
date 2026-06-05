import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Edit3, Settings, Bell, Shield, LogOut, ChevronRight, Camera, Star } from 'lucide-react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { VerifiedBadge, PremiumBadge } from '../components/ui/Badge';
import { PaywallModal } from '../components/payment/PaywallModal';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { calcProfileCompletion } from '../utils/storage';
import { VerificationModal } from '../components/profile/VerificationModal';
import { getMyViewers } from '../services/profileViews.service';
import { getProfileById } from '../services/profile.service';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { state, logout } = useApp();
  const { userProfile, isActivated } = state;
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [viewers, setViewers] = useState<Array<{ id: string; firstName: string; photos: string[]; occupation: string; city: string }>>([]);

  React.useEffect(() => {
    if (!state.isActivated || !firebaseUser) return;
    getMyViewers(firebaseUser.uid).then(views => {
      Promise.all(views.slice(0, 6).map(v => getProfileById(v.viewerId))).then(profiles => {
        setViewers(profiles.filter(Boolean) as Array<{ id: string; firstName: string; photos: string[]; occupation: string; city: string }>);
      });
    });
  }, [state.isActivated, firebaseUser]);
  const completion = userProfile ? calcProfileCompletion(userProfile) : 0;

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: Edit3, label: 'Edit Profile', action: () => navigate('/create-profile') },
        { icon: Camera, label: 'Manage Photos', action: () => navigate('/create-profile') },
        { icon: Bell, label: 'Notifications', action: () => navigate('/notifications') },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        { icon: Shield, label: 'Privacy Settings', action: () => {} },
        { icon: Shield, label: 'Blocked Users', action: () => {} },
      ],
    },
    {
      title: 'Other',
      items: [
        { icon: Settings, label: 'App Settings', action: () => {} },
        { icon: LogOut, label: 'Logout', action: () => setShowLogout(true), danger: true },
      ],
    },
  ];

  if (!userProfile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Profile not set up</h3>
          <p className="text-gray-500 text-sm mb-6">Complete your profile to start connecting</p>
          <Button onClick={() => navigate('/create-profile')}>Create Profile</Button>
        </div>
      </AppLayout>
    );
  }

  const primaryPhoto = userProfile.photos[userProfile.primaryPhoto] ?? userProfile.photos[0];

  return (
    <AppLayout>
      <PageHeader
        title="My Profile"
        right={
          <button onClick={() => navigate('/create-profile')} className="p-2 rounded-xl hover:bg-gray-100">
            <Edit3 size={18} className="text-gray-600" />
          </button>
        }
      />

      <div className="px-4 pb-8">
        {/* Profile card */}
        <div className="bg-white rounded-4xl p-5 mb-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative">
              {primaryPhoto ? (
                <img src={primaryPhoto} alt="Profile" className="w-24 h-24 rounded-3xl object-cover" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl">
                  {userProfile.gender === 'female' ? '👩' : '👨'}
                </div>
              )}
              <button
                onClick={() => navigate('/create-profile')}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-gradient text-white rounded-full flex items-center justify-center shadow"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-gray-900">{userProfile.firstName} {userProfile.lastName}</h2>
                {userProfile.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-gray-500 text-sm">{userProfile.age} yrs · {userProfile.city}</p>
              <p className="text-gray-500 text-sm">{userProfile.occupation}</p>
              <div className="flex items-center gap-2 mt-2">
                {isActivated ? <PremiumBadge /> : (
                  <button onClick={() => setShowPaywall(true)}
                    className="text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star size={11} /> Activate Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile completion */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-600">Profile Completion</span>
              <span className="text-xs font-bold text-pink-600">{completion}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gradient rounded-full transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
            {completion < 100 && (
              <button onClick={() => navigate('/create-profile')} className="text-xs text-pink-600 font-medium mt-1.5">
                Complete your profile →
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Interests Sent', value: state.interests.filter(i => i.fromId === 'me').length },
            { label: 'Matches', value: state.matches.length },
            { label: 'Chats', value: state.chats.length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-3xl p-3 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-pink-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Activation card */}
        {!isActivated && (
          <div className="bg-brand-gradient rounded-4xl p-5 mb-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">💍</div>
              <div className="flex-1">
                <p className="font-bold text-lg">Activate Now</p>
                <p className="text-white/80 text-sm">Unlock all features for just ₹499</p>
              </div>
            </div>
            <Button variant="secondary" size="md" fullWidth onClick={() => setShowPaywall(true)} className="mt-4 bg-white text-pink-600">
              Activate Profile
            </Button>
          </div>
        )}

        {/* Settings */}
        {settingsGroups.map(group => (
          <div key={group.title} className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{group.title}</p>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {group.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                    idx < group.items.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    'danger' in item && item.danger ? 'bg-red-50' : 'bg-gray-100'
                  }`}>
                    <item.icon size={17} className={'danger' in item && item.danger ? 'text-red-500' : 'text-gray-600'} />
                  </div>
                  <span className={`flex-1 text-sm font-medium text-left ${'danger' in item && item.danger ? 'text-red-500' : 'text-gray-800'}`}>
                    {item.label}
                  </span>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Mobile */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Registered Mobile</p>
          <p className="font-semibold text-gray-800 mt-0.5">+91 {state.mobile}</p>
        </div>
      </div>

              {/* Profile verification */}
        {!userProfile?.isVerified && (
          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 shadow-sm mb-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Eye size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 text-sm">Get Verified</p>
                <p className="text-xs text-blue-600">Blue badge boosts your profile trust</p>
              </div>
              <button onClick={() => setShowVerify(true)}
                className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Who viewed me */}
        {state.isActivated && viewers.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Who viewed your profile</h3>
            <div className="grid grid-cols-3 gap-2">
              {viewers.map(v => (
                <Link key={v.id} to={`/profile/${v.id}`} className="text-center">
                  <img src={v.photos?.[0] ?? ''} alt={v.firstName} className="w-full aspect-square object-cover rounded-2xl mb-1" />
                  <p className="text-xs font-medium text-gray-800 truncate">{v.firstName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{v.city}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        {state.isActivated && viewers.length === 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-sm text-center">
            <Eye size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No profile views yet</p>
          </div>
        )}

        {/* Paywall */}
        {{/* Paywall */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Logout confirm */}
      <Modal open={showLogout} onClose={() => setShowLogout(false)} title="Logout">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-3">
          <Button variant="outline" size="md" fullWidth onClick={() => setShowLogout(false)}>Cancel</Button>
          <Button variant="danger" size="md" fullWidth onClick={() => { logout(); navigate('/'); }}>Logout</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}




