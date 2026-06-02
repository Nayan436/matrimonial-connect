import React from 'react';
import { CheckCircle, Clock, Shield } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-600',
};

export function Badge({ children, variant = 'gray', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {children}
    </span>
  );
}

export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs font-semibold">
      <CheckCircle size={size - 4} />
      Verified
    </span>
  );
}

export function OnlineDot() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
    </span>
  );
}

export function InterestStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: string; icon: React.ReactNode; label: string }> = {
    pending: { variant: 'yellow', icon: <Clock size={12} />, label: 'Pending' },
    accepted: { variant: 'green', icon: <CheckCircle size={12} />, label: 'Accepted' },
    rejected: { variant: 'red', icon: null, label: 'Declined' },
    withdrawn: { variant: 'gray', icon: null, label: 'Withdrawn' },
  };
  const config = map[status] ?? map.pending;
  return (
    <Badge variant={config.variant as 'green' | 'yellow' | 'red' | 'gray'} size="sm">
      {config.icon}
      {config.label}
    </Badge>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-gradient text-white rounded-full px-2.5 py-0.5 text-xs font-bold">
      <Shield size={10} />
      Premium
    </span>
  );
}
