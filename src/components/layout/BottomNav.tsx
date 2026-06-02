import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/discover', icon: Home, label: 'Home' },
  { to: '/matches', icon: Heart, label: 'Matches' },
  { to: '/chats', icon: MessageCircle, label: 'Chats' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const { unreadNotifications, unreadMessages } = useApp();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 shadow-nav z-40 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? 'text-pink-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-pink-50' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {/* Unread badge */}
                  {to === '/chats' && unreadMessages > 0 && (
                    <span className="absolute top-1 right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                  {to === '/matches' && unreadNotifications > 0 && (
                    <span className="absolute top-1 right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-pink-600' : 'text-gray-400'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
