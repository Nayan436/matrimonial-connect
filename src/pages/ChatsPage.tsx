import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { useApp } from '../context/AppContext';
import { getProfileById } from '../data/mockProfiles';
import { formatTime } from '../utils/storage';

export default function ChatsPage() {
  const navigate = useNavigate();
  const { state } = useApp();

  const chats = [...state.chats].sort((a, b) =>
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  return (
    <AppLayout>
      <PageHeader title="Chats" subtitle={`${chats.length} active conversations`} />

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <MessageCircle size={56} className="text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No conversations yet</h3>
          <p className="text-gray-400 text-sm">Match with someone to start chatting!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {chats.map(chat => {
            const profile = getProfileById(chat.profileId);
            if (!profile) return null;
            const lastMsg = chat.messages[chat.messages.length - 1];
            const unread = chat.messages.filter(m => m.senderId !== 'me' && !m.isRead).length;

            return (
              <button
                key={chat.id}
                onClick={() => navigate(`/chats/${chat.id}`)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={profile.photos[0]}
                    alt={profile.firstName}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`font-bold truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {lastMsg ? formatTime(lastMsg.timestamp) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {lastMsg ? (lastMsg.senderId === 'me' ? 'You: ' : '') + lastMsg.text : 'No messages yet'}
                    </p>
                    {unread > 0 && (
                      <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
