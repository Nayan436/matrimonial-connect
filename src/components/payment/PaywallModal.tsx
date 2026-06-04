import React, { useState } from 'react';
import { Lock, Star, MessageCircle, Heart, Eye, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UPIPaymentModal } from './UPIPaymentModal';

interface Props { open: boolean; onClose: () => void; }

const features = [
  { icon: Heart,         text: 'Send & Receive Interests' },
  { icon: MessageCircle, text: 'Chat with Matches' },
  { icon: Eye,           text: 'View Complete Profiles' },
  { icon: Zap,           text: 'Priority in Search Results' },
  { icon: Star,          text: 'Verified Profile Badge' },
];

const plans = [
  { id: 'basic'    as const, name: 'Standard', price: '?499', desc: 'One-time activation', popular: false },
  { id: 'lifetime' as const, name: 'Lifetime',  price: '?999', desc: 'Premium forever',     popular: true  },
];

export function PaywallModal({ open, onClose }: Props) {
  const [showPayment, setShowPayment]   = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'lifetime'>('basic');

  if (showPayment) {
    return (
      <UPIPaymentModal
        open
        plan={selectedPlan}
        onClose={() => { setShowPayment(false); onClose(); }}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Lock size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Activate Your Profile</h2>
        <p className="text-gray-500 text-sm">Unlock all features and start connecting</p>
      </div>

      <div className="bg-pink-50 rounded-3xl p-4 mb-6 space-y-3">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Icon size={16} className="text-pink-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{text}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative p-4 rounded-3xl border-2 text-left transition-all ${
              selectedPlan === plan.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-gradient text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                BEST VALUE
              </span>
            )}
            <p className="font-bold text-gray-900">{plan.name}</p>
            <p className="text-xl font-extrabold text-pink-600">{plan.price}</p>
            <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-3 mb-4 flex items-center gap-2">
        <span className="text-lg">??</span>
        <p className="text-xs text-gray-600 font-medium">Pay via UPI — GPay, PhonePe, Paytm accepted</p>
      </div>

      <Button fullWidth size="lg" onClick={() => setShowPayment(true)}>
        Activate Now — {selectedPlan === 'basic' ? '?499' : '?999'}
      </Button>
      <Button variant="ghost" fullWidth size="md" onClick={onClose} className="mt-2 text-gray-400">
        Maybe Later
      </Button>
    </Modal>
  );
}
