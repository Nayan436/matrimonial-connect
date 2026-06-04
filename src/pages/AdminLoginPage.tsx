import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ADMIN_USERNAME, ADMIN_PASSWORD, APP_NAME } from '../config/constants';

const SESSION_KEY = 'mc_admin_session';
export const isAdminLoggedIn = () => sessionStorage.getItem(SESSION_KEY) === 'true';
export const adminLogin  = () => sessionStorage.setItem(SESSION_KEY, 'true');
export const adminLogout = () => sessionStorage.removeItem(SESSION_KEY);

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        adminLogin();
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-4xl shadow-card p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Sign in</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              autoComplete="username"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              suffix={
                <button type="button" onClick={() => setShowPass(p => !p)} className="text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Restricted access. Authorised personnel only.
        </p>
      </div>
    </div>
  );
}
