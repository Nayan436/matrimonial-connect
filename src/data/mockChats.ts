import type { ChatMessage } from '../types';

const ts = (minsAgo: number) => {
  const d = new Date(Date.now() - minsAgo * 60 * 1000);
  return d.toISOString();
};

// Pre-seeded messages per profile id
export const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  p1: [
    { id: 'p1m1', senderId: 'p1', text: 'Hi, nice to connect! 😊', timestamp: ts(120), isRead: true },
    { id: 'p1m2', senderId: 'me', text: 'Hello Priya! Great to connect with you.', timestamp: ts(115), isRead: true },
    { id: 'p1m3', senderId: 'p1', text: 'I liked your profile and wanted to know more about your family background.', timestamp: ts(110), isRead: true },
    { id: 'p1m4', senderId: 'me', text: 'Happy to share! We are a close-knit family from Ahmedabad. What about yours?', timestamp: ts(105), isRead: true },
    { id: 'p1m5', senderId: 'p1', text: 'We are a small nuclear family. My parents are very open-minded. Would love to speak sometime! 📞', timestamp: ts(60), isRead: true },
    { id: 'p1m6', senderId: 'me', text: 'That sounds wonderful. Would love to connect soon!', timestamp: ts(55), isRead: true },
    { id: 'p1m7', senderId: 'p1', text: 'Looking forward to it 🙏', timestamp: ts(10), isRead: false },
  ],
  p3: [
    { id: 'p3m1', senderId: 'p3', text: 'Hello! 👋', timestamp: ts(200), isRead: true },
    { id: 'p3m2', senderId: 'me', text: 'Hi Sneha! How are you?', timestamp: ts(195), isRead: true },
    { id: 'p3m3', senderId: 'p3', text: 'I noticed you\'re from Ahmedabad. I used to visit quite often!', timestamp: ts(190), isRead: true },
    { id: 'p3m4', senderId: 'me', text: 'Yes! It\'s a wonderful city. You should visit again sometime.', timestamp: ts(185), isRead: true },
    { id: 'p3m5', senderId: 'p3', text: 'That\'s great! I work in fintech now but Ahmedabad still feels like home 😄', timestamp: ts(30), isRead: false },
  ],
  p5: [
    { id: 'p5m1', senderId: 'p5', text: 'Hi there! 👋', timestamp: ts(90), isRead: true },
    { id: 'p5m2', senderId: 'me', text: 'Hello Kavya! Nice to meet you.', timestamp: ts(85), isRead: true },
    { id: 'p5m3', senderId: 'p5', text: 'Looking forward to getting to know you better 😊', timestamp: ts(80), isRead: true },
    { id: 'p5m4', senderId: 'me', text: 'Same here! Your profile is very impressive.', timestamp: ts(75), isRead: true },
    { id: 'p5m5', senderId: 'p5', text: 'Thank you so much! 🙏 I love your city too. I teach in Satellite area.', timestamp: ts(20), isRead: false },
  ],
};
