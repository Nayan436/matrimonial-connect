import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, X, MapPin, GraduationCap, Briefcase, Users, Utensils, Eye, EyeOff, Flag } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { VerifiedBadge, InterestStatusBadge } from '../components/ui/Badge';
import { PaywallModal } from '../components/payment/PaywallModal';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { MOCK_PROFILES } from '../data/mockProfiles';

export default function ViewProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, sendInterest } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reported, setReported] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const profile = MOCK_PROFILES.find(p => p.id === id);
  if (!profile) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">Profile not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-pink-600 font-semibold">Go Back</button>
      </div>
    </AppLayout>
  );

  const sentInterest = state.interests.find(i => i.toId === profile.id);
  const isActivated = state.isActivated;
  const isMatched = state.matches.some(m => m.profileId === profile.id);

  const handleInterest = () => {
    if (!isActivated) { setShowPaywall(true); return; }
    if (!sentInterest) sendInterest(profile.id);
  };

  const REPORT_REASONS = ['Fake Profile', 'Spam / Scam', 'Harassment', 'Inappropriate Content', 'Wrong Information'];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-3xl p-4 mb-3">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ComponentType<{size?:number;className?:string}>; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <Icon size={15} className="text-pink-500 flex-shrink-0" />
      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 flex-1">{value || '—'}</span>
    </div>
  );

  return (
    <AppLayout hideNav>
      {/* Photo Carousel */}
      <div className="relative" style={{ height: '60vw', maxHeight: 360 }}>
        <img
          src={profile.photos[selectedPhoto] ?? profile.photos[0]}
          alt={profile.firstName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="absolute top-12 left-4 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>

        {/* Report */}
        <button onClick={() => setShowReport(true)} className="absolute top-12 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center">
          <Flag size={16} />
        </button>

        {/* Photo thumbnails */}
        {profile.photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {profile.photos.map((_, i) => (
              <button key={i} onClick={() => setSelectedPhoto(i)}
                className={`h-1.5 rounded-full transition-all ${i === selectedPhoto ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        )}

        {/* Blurred gallery for non-activated */}
        {!isActivated && profile.photos.length > 1 && (
          <div className="absolute bottom-8 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-xl flex items-center gap-1">
            <EyeOff size={12} />
            {profile.photos.length - 1} more locked
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-gray-50 -mt-6 rounded-t-4xl relative z-10 px-4 pt-6 pb-32">
        {/* Name & basic info */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
              {profile.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{profile.age} yrs · {profile.height} · {profile.maritalStatus}</p>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin size={13} className="text-pink-500" />
              {profile.city}, {profile.state}
            </div>
          </div>
          {sentInterest && <InterestStatusBadge status={sentInterest.status} />}
        </div>

        {/* About */}
        <Section title="About">
          <p className="text-sm text-gray-700 leading-relaxed">
            {isActivated ? profile.about : profile.about.slice(0, 80) + '... '}
            {!isActivated && (
              <button onClick={() => setShowPaywall(true)} className="text-pink-600 font-semibold text-xs">
                <Eye size={12} className="inline mr-1" />Read More
              </button>
            )}
          </p>
        </Section>

        {/* Basic Info */}
        <Section title="Basic Information">
          <InfoRow icon={GraduationCap} label="Education" value={profile.education} />
          <InfoRow icon={Briefcase} label="Occupation" value={profile.occupation} />
          <InfoRow icon={MapPin} label="City" value={`${profile.city}, ${profile.state}`} />
          <InfoRow icon={Users} label="Religion" value={`${profile.religion} · ${profile.community}`} />
          <InfoRow icon={Utensils} label="Diet" value={profile.diet} />
        </Section>

        {/* Blurred section if not activated */}
        {!isActivated ? (
          <div className="relative">
            <div className="blur-sm pointer-events-none select-none">
              <Section title="Family Details">
                <InfoRow icon={Users} label="Father" value="●●●●●●●" />
                <InfoRow icon={Users} label="Mother" value="●●●●●●●" />
                <InfoRow icon={Users} label="Family Type" value="●●●●" />
              </Section>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={() => setShowPaywall(true)} className="bg-brand-gradient text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-lg flex items-center gap-2">
                <EyeOff size={14} />Activate to View
              </button>
            </div>
          </div>
        ) : (
          <Section title="Family Details">
            <InfoRow icon={Users} label="Father" value={profile.fatherName} />
            <InfoRow icon={Users} label="Mother" value={profile.motherName} />
            <InfoRow icon={Users} label="Family Type" value={profile.familyType} />
            <InfoRow icon={Users} label="Family Values" value={profile.familyValues} />
            <InfoRow icon={Users} label="Siblings" value={profile.siblings} />
          </Section>
        )}

        {/* Hobbies */}
        <Section title="Hobbies & Interests">
          <div className="flex flex-wrap gap-2">
            {profile.hobbies.map(h => (
              <span key={h} className="bg-pink-50 text-pink-700 text-xs font-medium px-3 py-1.5 rounded-full">{h}</span>
            ))}
          </div>
        </Section>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-4 flex gap-3 z-40">
        <button
          onClick={() => navigate(-1)}
          className="w-14 h-14 border-2 border-red-200 text-red-400 rounded-2xl flex items-center justify-center hover:bg-red-50 transition-colors"
        >
          <X size={22} />
        </button>
        <div className="flex-1">
          {isMatched ? (
            <Button fullWidth size="lg" onClick={() => navigate('/chats')}>
              💬 Open Chat
            </Button>
          ) : sentInterest ? (
            <Button fullWidth size="lg" variant="secondary" disabled>
              <Heart size={16} /> Interest {sentInterest.status === 'pending' ? 'Sent' : sentInterest.status}
            </Button>
          ) : (
            <Button fullWidth size="lg" onClick={handleInterest} icon={<Heart size={16} fill="white" strokeWidth={0} />}>
              Send Interest
            </Button>
          )}
        </div>
      </div>

      {/* Paywall */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Report Modal */}
      <Modal open={showReport} onClose={() => setShowReport(false)} title="Report Profile">
        {reported ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-semibold text-gray-800">Report Submitted</p>
            <p className="text-sm text-gray-500 mt-1">Our team will review this profile.</p>
            <Button fullWidth size="md" onClick={() => setShowReport(false)} className="mt-4">Done</Button>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {REPORT_REASONS.map(r => (
              <button key={r} onClick={() => setReported(true)}
                className="w-full text-left px-4 py-3 rounded-2xl border border-gray-200 hover:border-pink-400 hover:bg-pink-50 text-sm font-medium text-gray-700 transition-colors">
                {r}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
