import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { APP_NAME } from '../config/constants';

const SECTIONS = [
  { title: '1. Information We Collect', body: 'We collect information you provide during registration: mobile number, name, age, occupation, religion, family details, photos, and partner preferences. We also collect usage data such as profile views and swipe activity to improve the experience.' },
  { title: '2. How We Use Your Information', body: `Your information is used to display your profile to other registered users, match you with compatible profiles, send OTP messages for verification, and communicate account and activation updates. ${APP_NAME} does not use your data for advertising.` },
  { title: '3. Data Storage & Security', body: 'All data is stored securely on Google Firebase (Firestore & Firebase Storage), which are SOC 2 and ISO 27001 certified services. Photos are stored in Firebase Storage with restricted access rules. We do not store payment credentials — UPI payments are made directly through your UPI app.' },
  { title: '4. Data Sharing', body: 'We do not sell your personal data. Your profile is visible only to other registered users. Your contact number is never shared publicly. It may only be shared with a matched user if both parties have accepted the interest.' },
  { title: '5. Photos & Media', body: 'Photos you upload are stored in Firebase Storage and accessible only to authenticated users on the platform. You may delete your photos at any time from your profile settings.' },
  { title: '6. OTP & Communications', body: 'Your mobile number is used to send one-time passwords for login. We may send transactional SMS messages (such as activation confirmation). We do not send promotional SMS without your consent.' },
  { title: '7. Your Rights', body: 'You have the right to access, update, or delete your personal data at any time. To permanently delete your account and all associated data, contact us at support@yourmatrimonialdomain.in. Deletion requests are processed within 7 working days.' },
  { title: '8. Cookies', body: 'This platform does not use tracking cookies. We use browser local storage solely to maintain your login session on your device.' },
  { title: '9. Children\'s Privacy', body: 'This platform is strictly for users aged 18 and above. We do not knowingly collect data from minors. If we discover an underage account, it will be immediately suspended.' },
  { title: '10. Changes to Privacy Policy', body: 'We may update this policy from time to time. Significant changes will be communicated via in-app notification. Continued use of the platform after changes constitutes acceptance.' },
  { title: '11. Contact & Grievance', body: `For privacy-related queries or to exercise your data rights, contact our Grievance Officer at support@yourmatrimonialdomain.in. We respond within 72 hours.` },
];

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      <div className="bg-white sticky top-0 z-10 px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-xs text-gray-400">Last updated: June 2026</p>
        </div>
      </div>
      <div className="px-4 py-5 space-y-5 pb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800">We respect your privacy. This policy explains how {APP_NAME} collects, uses and protects your personal information.</p>
        </div>
        {SECTIONS.map(s => (
          <div key={s.title} className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 mb-2">{s.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
