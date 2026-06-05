import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { APP_NAME } from '../config/constants';

const SECTIONS = [
  { title: '1. Acceptance of Terms', body: `By registering on ${APP_NAME} you agree to these Terms. If you do not agree, please do not use the platform.` },
  { title: '2. Eligibility', body: 'You must be at least 18 years of age and legally permitted to marry under applicable laws. You confirm that the information you provide is accurate and truthful.' },
  { title: '3. Profile & Content', body: `You are solely responsible for the content you upload, including photos and personal details. ${APP_NAME} reserves the right to remove profiles that violate these terms or contain false information. Impersonation, misrepresentation, or inappropriate content will result in immediate suspension.` },
  { title: '4. Account Activation', body: `Profile activation is a one-time fee. Once activated and verified, the fee is non-refundable. Activation is valid for the plan duration selected.` },
  { title: '5. Payments & Refunds', body: `Payments are processed manually via UPI. ${APP_NAME} verifies each payment before activation. Refunds are not provided after profile activation, except in cases of technical error on our part. Disputes must be raised within 7 days of payment.` },
  { title: '6. Privacy', body: `Your personal data is stored securely on Google Firebase. We do not sell, share, or disclose your data to third parties except as required by law. Your profile is visible only to registered users on the platform.` },
  { title: '7. Prohibited Activities', body: 'You agree not to: use the platform for commercial solicitation; harass, threaten or abuse other users; share another user\'s personal contact details without consent; create fake or duplicate profiles; use automated tools to scrape data.' },
  { title: '8. Limitation of Liability', body: `${APP_NAME} is a platform that facilitates introductions. We do not verify every user\'s claims and are not responsible for the conduct of users. You use the platform at your own risk. We strongly recommend meeting potential matches in public places and informing a trusted person.` },
  { title: '9. Termination', body: `${APP_NAME} reserves the right to suspend or terminate any account that violates these terms, without prior notice.` },
  { title: '10. Governing Law', body: 'These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts of [your city], India.' },
  { title: '11. Contact', body: `For any queries or grievances, contact us at support@yourmatrimonialdomain.in.` },
];

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      <div className="bg-white sticky top-0 z-10 px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">Terms & Conditions</h1>
          <p className="text-xs text-gray-400">Last updated: June 2026</p>
        </div>
      </div>
      <div className="px-4 py-5 space-y-5 pb-12">
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">
          <p className="text-sm text-pink-800">Please read these terms carefully before using {APP_NAME}. By using this platform you agree to be bound by these terms.</p>
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
