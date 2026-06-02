import React from 'react';
import { Bell, Heart, MessageCircle, CreditCard, Info, type LucideIcon } from 'lucide-react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/storage';
import type { NotificationType } from '../types';

const iconMap: Record<NotificationType, LucideIcon> = {
  interest: Heart,
  match: Heart,
  message: MessageCircle,
  payment: CreditCard,
  system: Info,
};

const colorMap: Record<NotificationType, string> = {
  interest: 'bg-pink-100 text-pink-600',
  match: 'bg-red-100 text-red-600',
  message: 'bg-blue-100 text-blue-600',
  payment: 'bg-green-100 text-green-600',
  system: 'bg-purple-100 text-purple-600',
};

export default function NotificationsPage() {
  const { state, readNotification, readAllNotifications } = useApp();
  const { notifications } = state;

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.filter(n => !n.isRead).length} unread`}
        right={
          <Button variant="ghost" size="sm" onClick={readAllNotifications}>
            Mark all read
          </Button>
        }
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <Bell size={56} className="text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No notifications yet</h3>
          <p className="text-gray-400 text-sm">Activity from matches and interests will show here.</p>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-2">
          {notifications.map(notif => {
            const Icon = iconMap[notif.type] ?? Bell;
            const color = colorMap[notif.type] ?? 'bg-gray-100 text-gray-600';
            return (
              <button
                key={notif.id}
                onClick={() => readNotification(notif.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-3xl transition-colors text-left ${
                  notif.isRead ? 'bg-white' : 'bg-pink-50 border border-pink-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.timestamp)}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
