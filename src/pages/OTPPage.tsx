import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { sendOtp, verifyOtp } from '../services/auth.service';
import { getProfile } from '../services/profile.service';

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = (location.state as { mobile?: string })?.mobile ?? '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP on mount
  useEffect(() => {
    if (!mobile) { navigate('/'); return; }
    sendOtp(mobile)
      .then(() => setSending(false))
      .catch(e => { setError(e.message); setSending(false); });
    refs.current[0]?.focus();
    const t = setInterval(() => setResendTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [mobile, navigate]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next); setError('');
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) { setOtp(text.split('')); refs.current[5]?.focus(); }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await verifyOtp(mobile, code);
      const profile = await getProfile(user.uid);
      navigate(profile?.profileComplete ? '/discover' : '/create-profile');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setSending(true); setResendTimer(30);
    try { await sendOtp(mobile); } catch { setError('Failed to resend'); }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-12">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
      </div>
      <div className="flex-1 px-6 pt-8">
        <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <MessageSquare size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h1>
        <p className="text-gray-500 text-sm mb-8">
          {sending ? 'Sending OTP...' : <>Code sent to <span className="font-semibold text-gray-800">+91 {mobile}</span></>}
        </p>

        <div className="grid mb-3 w-full" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }} onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input key={i} ref={el => { refs.current[i] = el; }}
              type="tel" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-full aspect-square text-center text-xl font-bold border-2 rounded-2xl outline-none transition-all min-w-0 ${
                error ? 'border-red-400 bg-red-50' : d ? 'border-pink-500 bg-pink-50' : 'border-gray-200 focus:border-pink-500'
              }`}
            />
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <Button fullWidth size="lg" loading={loading || sending} onClick={handleVerify} className="mt-4">
          Verify & Continue
        </Button>

        <div className="text-center mt-6">
          {resendTimer > 0
            ? <p className="text-sm text-gray-500">Resend in <span className="font-semibold text-pink-600">{resendTimer}s</span></p>
            : <button onClick={handleResend} className="text-sm font-semibold text-pink-600">Resend OTP</button>
          }
        </div>
      </div>
    </div>
  );
}
