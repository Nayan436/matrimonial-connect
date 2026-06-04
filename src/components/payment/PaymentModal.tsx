import React, { useState } from 'react';
import { CheckCircle, ArrowLeft, CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { initiatePayment } from '../../services/payment.service';

interface Props { open: boolean; plan: 'basic' | 'lifetime'; onClose: () => void; onBack?: () => void; }
type Method = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS = [
  { id: 'upi' as Method,       icon: Smartphone, label: 'UPI',               desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card' as Method,      icon: CreditCard,  label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking' as Method, icon: Building2,  label: 'Net Banking',         desc: 'All major banks' },
  { id: 'wallet' as Method,    icon: Wallet,      label: 'Wallet',              desc: 'Paytm, Amazon Pay' },
];

export function PaymentModal({ open, plan, onClose, onBack }: Props) {
  const { state, firebaseUser, refreshProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');
  const [error, setError] = useState('');
  const amount = plan === 'basic' ? 499 : 999;

  const handlePay = async () => {
    if (!firebaseUser || !state.mobile) return;
    setLoading(true); setError('');
    try {
      const { transactionId } = await initiatePayment(firebaseUser.uid, state.mobile, plan);
      setTxnId(transactionId);
      await refreshProfile();
      setSuccess(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal open={open} onClose={onClose} hideClose>
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-6">Your profile is now fully activated.</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan</span><span className="font-semibold capitalize">{plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span><span className="font-semibold text-green-600">?{amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-xs font-semibold text-gray-700">{txnId}</span>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={onClose}>Start Connecting ??</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} hideClose>
      <div className="flex items-center gap-3 mb-6">
        {onBack && <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"><ArrowLeft size={20} /></button>}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Complete Payment</h2>
          <p className="text-xs text-gray-500">Secure · Instant · One-time</p>
        </div>
      </div>

      <div className="bg-brand-gradient rounded-3xl p-5 mb-6 text-white text-center">
        <p className="text-sm opacity-80 mb-1">{plan === 'basic' ? 'Standard Activation' : 'Lifetime Activation'}</p>
        <p className="text-4xl font-extrabold">?{amount}</p>
        <p className="text-xs opacity-70 mt-1">One-time · No hidden charges</p>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-3">Choose Payment Method</p>
      <div className="space-y-2 mb-6">
        {METHODS.map(m => (
          <div key={m.id} className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-gray-200 bg-white">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
              <m.icon size={18} className="text-gray-500" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-gray-900">{m.label}</p>
              <p className="text-xs text-gray-500">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

      <p className="text-xs text-gray-400 text-center mb-4">
        Clicking "Pay Now" opens the Razorpay checkout where you choose your method.
      </p>

      <Button fullWidth size="lg" loading={loading} onClick={handlePay}>
        {loading ? 'Opening Razorpay...' : `Pay ?${amount}`}
      </Button>
      <Button variant="ghost" fullWidth size="md" onClick={onClose} className="mt-2 text-gray-400">Cancel</Button>
    </Modal>
  );
}
