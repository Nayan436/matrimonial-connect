import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    navigate('/otp', { state: { mobile: digits } });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #C2185B 0%, #7B1FA2 50%, #1A1A2E 100%)' }}>
      {/* DEMO Banner */}
      <div className="bg-amber-400 text-amber-900 text-center text-xs font-bold py-2 px-4">
        🎭 DEMO MODE — Use any mobile number · OTP: 123456
      </div>

      {/* Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-10 pb-6">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-5xl">💍</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white text-center leading-tight mb-2">
          Matrimonial<br />Connect
        </h1>
        <p className="text-white/70 text-center text-base">
          Find your perfect life partner
        </p>

        {/* Decorative rings */}
        <div className="relative mt-8 mb-6">
          <div className="w-32 h-1 bg-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
        </div>

        {/* Stats */}
        <div className="flex gap-8 text-center">
          {[['2,145+', 'Profiles'], ['1,420+', 'Activated'], ['3,520+', 'Matches']].map(([num, label]) => (
            <div key={label}>
              <p className="text-white font-bold text-lg">{num}</p>
              <p className="text-white/60 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-t-4xl px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Get Started</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your mobile number to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="98765 43210"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            prefix={<span className="flex items-center gap-1"><Phone size={14} className="text-pink-500" /><span className="text-gray-600 font-medium">+91</span></span>}
            error={error}
            maxLength={10}
          />

          <Button type="submit" fullWidth size="lg">
            Send OTP
          </Button>
        </form>

        <div className="flex items-center gap-2 mt-6 p-3 bg-gray-50 rounded-2xl">
          <Shield size={16} className="text-green-500 flex-shrink-0" />
          <p className="text-xs text-gray-500">Your data is secure and never shared without consent.</p>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/admin')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Admin Panel →
          </button>
        </div>
      </div>
    </div>
  );
}
