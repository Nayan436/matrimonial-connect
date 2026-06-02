import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';

const DEMO_OTP = '123456';

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, state } = useApp();
  const mobile = (location.state as { mobile?: string })?.mobile ?? '9876543210';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const t = setInterval(() => setResendTimer(p => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError('');
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the 6-digit OTP'); return; }
    if (code !== DEMO_OTP) { setError('Invalid OTP. Demo OTP is 123456'); return; }

    setLoading(true);
    setTimeout(() => {
      login(mobile);
      setLoading(false);
      // If profile exists, go to discover; else create-profile
      if (state.profileComplete) {
        navigate('/discover');
      } else {
        navigate('/create-profile');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* DEMO Banner */}
      <div className="bg-amber-400 text-amber-900 text-center text-xs font-bold py-2">
        🎭 DEMO MODE — OTP: 123456
      </div>

      {/* Header */}
      <div className="px-4 pt-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-8">
        {/* Icon */}
        <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <MessageSquare size={28} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h1>
        <p className="text-gray-500 text-sm mb-8">
          We sent a 6-digit code to{' '}
          <span className="font-semibold text-gray-800">+91 {mobile.replace(/(\d{5})(\d{5})/, '$1 $2')}</span>
        </p>

        {/* OTP Boxes — grid keeps all 6 cells equal & contained */}
        <div
          className="grid mb-3 w-full"
          style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}
          onPaste={handlePaste}
        >
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-full aspect-square text-center text-xl font-bold border-2 rounded-2xl outline-none transition-all min-w-0 ${
                error ? 'border-red-400 bg-red-50' : d ? 'border-pink-500 bg-pink-50' : 'border-gray-200 focus:border-pink-500'
              }`}
            />
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        {/* Auto-fill hint */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <p className="text-xs text-amber-700 font-medium text-center">
            Demo OTP: <button onClick={() => setOtp(['1','2','3','4','5','6'])} className="font-bold underline">123456</button> (click to auto-fill)
          </p>
        </div>

        <Button fullWidth size="lg" loading={loading} onClick={handleVerify}>
          Verify & Continue
        </Button>

        {/* Resend */}
        <div className="text-center mt-6">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">Resend OTP in <span className="font-semibold text-pink-600">{resendTimer}s</span></p>
          ) : (
            <button
              onClick={() => setResendTimer(30)}
              className="text-sm font-semibold text-pink-600"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
