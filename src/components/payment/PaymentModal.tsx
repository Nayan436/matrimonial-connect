import React, { useState } from 'react';
import { CheckCircle, ArrowLeft, CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface PaymentModalProps {
  open: boolean;
  plan: 'basic' | 'lifetime';
  onClose: () => void;
  onBack?: () => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS = [
  { id: 'upi' as PaymentMethod, icon: Smartphone, label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card' as PaymentMethod, icon: CreditCard, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking' as PaymentMethod, icon: Building2, label: 'Net Banking', desc: 'All major banks' },
  { id: 'wallet' as PaymentMethod, icon: Wallet, label: 'Wallet', desc: 'Paytm, Amazon Pay' },
];

export function PaymentModal({ open, plan, onClose, onBack }: PaymentModalProps) {
  const { activate } = useApp();
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const amount = plan === 'basic' ? 499 : 999;

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      activate(plan, method);
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <Modal open={open} onClose={onClose} hideClose>
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h2>
          <p className="text-gray-500 text-sm mb-6">Your profile is now fully activated.</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-semibold capitalize">{plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-semibold text-green-600">₹{amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-xs font-semibold text-gray-700">TXN-DEMO-001</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-semibold capitalize">{method.toUpperCase()}</span>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={onClose}>
            Start Connecting 💍
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} hideClose>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Complete Payment</h2>
          <p className="text-xs text-gray-500">Secure · Instant · One-time</p>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-brand-gradient rounded-3xl p-5 mb-6 text-white text-center">
        <p className="text-sm opacity-80 mb-1">{plan === 'basic' ? 'Standard Activation' : 'Lifetime Activation'}</p>
        <p className="text-4xl font-extrabold">₹{amount}</p>
        <p className="text-xs opacity-70 mt-1">One-time · No hidden charges</p>
      </div>

      {/* Payment Methods */}
      <p className="text-sm font-semibold text-gray-700 mb-3">Choose Payment Method</p>
      <div className="space-y-2 mb-6">
        {METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
              method === m.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              method === m.id ? 'bg-pink-100' : 'bg-gray-100'
            }`}>
              <m.icon size={18} className={method === m.id ? 'text-pink-600' : 'text-gray-500'} />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-gray-900">{m.label}</p>
              <p className="text-xs text-gray-500">{m.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              method === m.id ? 'border-pink-500' : 'border-gray-300'
            }`}>
              {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
            </div>
          </button>
        ))}
      </div>

      {/* DEMO notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-5">
        <p className="text-xs text-amber-700 text-center font-medium">
          🎭 Demo Mode — No real payment will be processed
        </p>
      </div>

      <Button fullWidth size="lg" loading={loading} onClick={handlePay}>
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </Button>
      <Button variant="ghost" fullWidth size="md" onClick={onClose} className="mt-2 text-gray-400">
        Cancel
      </Button>
    </Modal>
  );
}
