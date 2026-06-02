import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, TrendingUp, AlertTriangle, Search, ChevronRight, ArrowLeft, BarChart3, CheckCircle, XCircle, Ban } from 'lucide-react';
import { MOCK_PROFILES } from '../data/mockProfiles';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type AdminTab = 'dashboard' | 'users' | 'payments';

const STATS = [
  { label: 'Total Users', value: '2,145', icon: Users, color: 'bg-blue-100 text-blue-600', trend: '+12%' },
  { label: 'Activated', value: '1,420', icon: CheckCircle, color: 'bg-green-100 text-green-600', trend: '+8%' },
  { label: 'Revenue', value: '₹7,10,000', icon: CreditCard, color: 'bg-purple-100 text-purple-600', trend: '+15%' },
  { label: 'Matches', value: '3,520', icon: TrendingUp, color: 'bg-pink-100 text-pink-600', trend: '+22%' },
  { label: 'Interests', value: '12,450', icon: BarChart3, color: 'bg-amber-100 text-amber-600', trend: '+18%' },
  { label: 'Reports', value: '34', icon: AlertTriangle, color: 'bg-red-100 text-red-600', trend: '-5%' },
];

const MOCK_USERS = MOCK_PROFILES.map((p, i) => ({
  id: p.id,
  name: `${p.firstName} ${p.lastName}`,
  mobile: `98${String(Math.floor(Math.random() * 90000000 + 10000000))}`,
  city: p.city,
  occupation: p.occupation,
  isActivated: i % 3 !== 2,
  isVerified: p.isVerified,
  status: i === 3 ? 'suspended' : 'active',
  joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 3600000).toLocaleDateString('en-IN'),
}));

const MOCK_PAYMENTS = MOCK_PROFILES.slice(0, 8).map((p, i) => ({
  id: `TXN-DEMO-${1000 + i}`,
  user: `${p.firstName} ${p.lastName}`,
  amount: i % 3 === 0 ? 999 : 499,
  plan: i % 3 === 0 ? 'Lifetime' : 'Standard',
  method: ['UPI', 'Credit Card', 'Net Banking', 'Wallet'][i % 4],
  date: new Date(Date.now() - i * 2 * 24 * 3600000).toLocaleDateString('en-IN'),
  status: 'Success',
}));

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [search, setSearch] = useState('');
  const [activationFee, setActivationFee] = useState('499');
  const [editingFee, setEditingFee] = useState(false);

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile.includes(search) ||
    u.city.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { id: AdminTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'payments', label: 'Payments' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-brand-gradient text-white px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold">Admin Panel</h1>
            <p className="text-white/70 text-xs">Matrimonial Connect Management</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-20">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              tab === t.id ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 pb-10">
        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {STATS.map(s => (
                <div key={s.label} className="bg-white rounded-3xl p-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                    <s.icon size={18} />
                  </div>
                  <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${s.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{s.trend} this month</p>
                </div>
              ))}
            </div>

            {/* Activation Fee Settings */}
            <div className="bg-white rounded-3xl p-4 shadow-sm mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Activation Fee Settings</h3>
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Standard Plan (₹)</p>
                  {editingFee ? (
                    <input type="number" value={activationFee} onChange={e => setActivationFee(e.target.value)}
                      className="w-full border-2 border-pink-400 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none" />
                  ) : (
                    <p className="text-2xl font-extrabold text-pink-600">₹{activationFee}</p>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Lifetime Plan (₹)</p>
                  <p className="text-2xl font-extrabold text-purple-600">₹999</p>
                </div>
              </div>
              <Button
                variant={editingFee ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => setEditingFee(f => !f)}
              >
                {editingFee ? '✓ Save Fee' : 'Edit Activation Fee'}
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { text: 'Priya Shah activated profile', time: '2 min ago', icon: '✅' },
                  { text: 'New report filed against ID #p7', time: '15 min ago', icon: '⚠️' },
                  { text: 'Sneha Jain verified', time: '1 hr ago', icon: '🔵' },
                  { text: '₹999 payment received from Anjali P.', time: '2 hr ago', icon: '💳' },
                  { text: 'User ID #p4 suspended', time: '5 hr ago', icon: '🚫' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xl">{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{a.text}</p>
                      <p className="text-xs text-gray-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <>
            <div className="mb-3">
              <Input
                placeholder="Search by name, mobile, city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                prefix={<Search size={15} className="text-gray-400" />}
              />
            </div>
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div key={user.id} className="bg-white rounded-3xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                        {user.status === 'suspended' && (
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">SUSPENDED</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{user.mobile} · {user.city}</p>
                      <p className="text-xs text-gray-500">{user.occupation} · Joined {user.joinedAt}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {user.isActivated && <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVATED</span>}
                      {user.isVerified && <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">VERIFIED</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 text-xs font-semibold border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-1">
                      <CheckCircle size={11} />Activate
                    </button>
                    <button className="flex-1 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                      <Ban size={11} />Suspend
                    </button>
                    <button className="flex-1 py-1.5 text-xs font-semibold border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                      <XCircle size={11} />Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Payments ── */}
        {tab === 'payments' && (
          <>
            {/* Revenue summary */}
            <div className="bg-brand-gradient rounded-3xl p-4 text-white mb-4">
              <p className="text-sm opacity-80 mb-1">Total Revenue This Month</p>
              <p className="text-3xl font-extrabold">₹7,10,000</p>
              <div className="flex gap-6 mt-3">
                <div>
                  <p className="text-xs opacity-70">Standard Plans</p>
                  <p className="font-bold">₹4,40,000</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Lifetime Plans</p>
                  <p className="font-bold">₹2,70,000</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {MOCK_PAYMENTS.map(p => (
                <div key={p.id} className="bg-white rounded-3xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-900 text-sm">{p.user}</p>
                    <p className="font-extrabold text-green-600">₹{p.amount}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{p.plan} · {p.method}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.date}</p>
                    </div>
                    <div>
                      <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">SUCCESS</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">{p.id}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
