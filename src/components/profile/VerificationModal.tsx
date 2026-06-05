import React, { useState, useRef } from 'react';
import { Shield, Upload, X, CheckCircle, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { submitVerification, getUserVerificationStatus } from '../../services/verification.service';
import type { VerificationRequest } from '../../services/verification.service';

interface Props { open: boolean; onClose: () => void; }

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving', label: 'Driving Licence' },
  { value: 'voter', label: 'Voter ID' },
];

export function VerificationModal({ open, onClose }: Props) {
  const { state, firebaseUser } = useApp();
  const [existing, setExisting] = useState<VerificationRequest | null | undefined>(undefined);
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState(state.userProfile ? `${state.userProfile.firstName} ${state.userProfile.lastName}` : '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!firebaseUser) return;
    getUserVerificationStatus(firebaseUser.uid).then(setExisting);
  }, [firebaseUser]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setPhotoFile(f);
    const r = new FileReader(); r.onload = ev => setPhotoPreview(ev.target?.result as string); r.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) { setError('Enter your full name'); return; }
    if (!idNumber.trim()) { setError('Enter your ID number'); return; }
    if (!photoFile)       { setError('Upload a photo of your ID'); return; }
    if (!firebaseUser || !state.mobile) return;
    setLoading(true); setError('');
    try {
      await submitVerification(firebaseUser.uid, state.mobile, fullName, idType, idNumber, photoFile);
      setSubmitted(true);
    } catch (e: unknown) { setError((e as Error).message ?? 'Submission failed'); }
    finally { setLoading(false); }
  };

  // Already verified
  if (state.userProfile?.isVerified) {
    return (
      <Modal open={open} onClose={onClose} title="Profile Verification">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={32} className="text-blue-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">Already Verified</p>
          <p className="text-gray-500 text-sm">Your profile has the verified badge.</p>
          <Button fullWidth size="md" onClick={onClose} className="mt-5">Close</Button>
        </div>
      </Modal>
    );
  }

  // Pending review
  if (existing?.status === 'pending' || submitted) {
    return (
      <Modal open={open} onClose={onClose} title="Profile Verification">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock size={32} className="text-amber-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">Under Review</p>
          <p className="text-gray-500 text-sm mb-5">Your ID has been submitted. We verify within 24 hours and add the blue badge to your profile.</p>
          <Button fullWidth size="md" onClick={onClose}>Got It</Button>
        </div>
      </Modal>
    );
  }

  // Rejected — allow resubmit
  const rejectionNote = existing?.status === 'rejected' ? existing.rejectionReason : null;

  return (
    <Modal open={open} onClose={onClose} title="Get Verified">
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-5">
        <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">A verified badge increases your profile trust and match rate. We accept Aadhaar, PAN, Passport, Driving Licence or Voter ID.</p>
      </div>

      {rejectionNote && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4">
          <p className="text-xs text-red-600 font-medium">Previous submission rejected: {rejectionNote}. Please resubmit.</p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <Input label="Full name (as on ID) *" value={fullName} onChange={e => { setFullName(e.target.value); setError(''); }} placeholder="e.g. Rahul Sharma" />
        <Select label="ID type *" value={idType} onChange={e => setIdType(e.target.value)} options={ID_TYPES} />
        <Input label="ID number *" value={idNumber} onChange={e => { setIdNumber(e.target.value.toUpperCase()); setError(''); }} placeholder="e.g. 1234 5678 9012" />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Photo of ID document *</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="ID" className="w-full h-36 object-cover rounded-2xl border-2 border-blue-400" />
              <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors">
              <Upload size={24} />
              <span className="text-sm font-medium">Upload ID photo</span>
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
      <div className="bg-gray-50 rounded-2xl p-3 mb-4">
        <p className="text-xs text-gray-500">Your ID is used only for verification. It is stored securely and never shared publicly.</p>
      </div>
      <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>Submit for Verification</Button>
      <Button variant="ghost" fullWidth size="md" onClick={onClose} className="mt-2 text-gray-400">Maybe Later</Button>
    </Modal>
  );
}
