import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useApp } from '../context/AppContext';
import { getProfileById } from '../data/mockProfiles';
import { formatChatTime } from '../utils/storage';

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, sendMessage, markChatRead } = useApp();
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const chat = state.chats.find(c => c.id === id);
  const profile = chat ? getProfileById(chat.profileId) : null;

  useEffect(() => {
    if (id) markChatRead(id);
  }, [id, markChatRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages.length]);

  // Simulate typing indicator after user sends a message
  const simulateReply = () => {
    setIsTyping(true);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim() || !id) return;
    sendMessage(id, text.trim());
    setText('');
    simulateReply();
  };

  if (!chat || !profile) {
    return (
      <AppLayout hideNav>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-gray-500">Chat not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-pink-600 font-semibold">Go Back</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-3 pt-12 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <div className="relative" onClick={() => navigate(`/profile/${profile.id}`)}>
          <img src={profile.photos[0]} alt={profile.firstName} className="w-10 h-10 rounded-xl object-cover cursor-pointer" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/profile/${profile.id}`)}>
          <h2 className="font-bold text-gray-900 text-sm">{profile.firstName} {profile.lastName}</h2>
          <p className="text-xs text-green-500 font-medium">
            {isTyping ? 'Typing...' : 'Online'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <Phone size={18} />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <Video size={18} />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {/* Date separator */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">Today</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {chat.messages.map((msg, idx) => {
          const isMe = msg.senderId === 'me';
          const prevMsg = chat.messages[idx - 1];
          const showAvatar = !isMe && (!prevMsg || prevMsg.senderId === 'me');

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar for other person */}
              {!isMe && (
                <div className="w-8 flex-shrink-0">
                  {showAvatar && (
                    <img src={profile.photos[0]} alt="" className="w-8 h-8 rounded-full object-cover" />
                  )}
                </div>
              )}

              <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-3xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-brand-gradient text-white rounded-br-lg'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-lg'
                }`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] text-gray-400">{formatChatTime(msg.timestamp)}</span>
                  {isMe && (
                    msg.isRead
                      ? <CheckCheck size={12} className="text-blue-500" />
                      : <Check size={12} className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <img src={profile.photos[0]} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="bg-white rounded-3xl rounded-bl-lg px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none text-gray-800 placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            text.trim()
              ? 'bg-brand-gradient text-white active:scale-95'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
