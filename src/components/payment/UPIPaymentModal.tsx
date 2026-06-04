import React, { useState, useRef } from 'react';
import { CheckCircle, ArrowLeft, Upload, Copy, X, Image } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useApp } from '../../context/AppContext';
import { submitPaymentRequest } from '../../services/payment.service';
import { UPI_ID, UPI_NAME, UPI_NOTE, PLANS } from '../../config/constants';

interface Props { open: boolean; plan: 'basic' | 'lifetime'; onClose: () => void; onBack?: () => void; }

type Step = 'qr' | 'proof' | 'success';

export function UPIPaymentModal({ open, plan, onClose, onBack }: Props) {
  const { state, firebaseUser, refreshProfile } = useApp();
  const [step, setStep] = useState<Step>('qr');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payerName, setPayerName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const planInfo = PLANS[plan];
  const amount = planInfo.price;

  // Generate UPI deep link QR
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(UPI_NOTE)}`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!payerName.trim())     { setError('Enter the name used for payment'); return; }
    if (!transactionId.trim()) { setError('Enter the transaction / UTR number'); return; }
    if (!screenshot)           { setError('Upload a screenshot of the payment'); return; }
    if (!firebaseUser || !state.mobile) return;

    setLoading(true); setError('');
    try {
      await submitPaymentRequest(
        firebaseUser.uid,
        state.mobile,
        plan,
        amount,
        payerName.trim(),
        transactionId.trim(),
        screenshot
      );
      await refreshProfile();
      setStep('success');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('qr'); setPayerName(''); setTransactionId('');
    setScreenshot(null); setScreenshotPreview(null); setError('');
    onClose();
  };

  // -- Success screen ------------------------------------------------------------
  if (step === 'success') {
    return (
      <Modal open={open} onClose={resetAndClose} hideClose>
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-500 text-sm mb-5">
            Your payment proof has been sent to our team for verification. We typically approve within <strong className="font-semibold text-gray-700">2–4 hours</strong>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-semibold capitalize">{planInfo.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold">?{amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">UTR / Txn ID</span>
              <span className="font-mono text-xs font-semibold uppercase">{transactionId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-amber-600">Pending Review</span>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={resetAndClose}>Got It</Button>
        </div>
      </Modal>
    );
  }

  // -- Proof submission screen ---------------------------------------------------
  if (step === 'proof') {
    return (
      <Modal open={open} hideClose>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setStep('qr')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submit Payment Proof</h2>
            <p className="text-xs text-gray-500">Fill details exactly as in your UPI app</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <Input
            label="Your Name (as in UPI app) *"
            placeholder="e.g. Rahul Sharma"
            value={payerName}
            onChange={e => { setPayerName(e.target.value); setError(''); }}
          />
          <Input
            label="Transaction / UTR Number *"
            placeholder="e.g. 426112345678"
            value={transactionId}
            onChange={e => { setTransactionId(e.target.value.toUpperCase()); setError(''); }}
          />

          {/* Screenshot upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Payment Screenshot *</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {screenshotPreview ? (
              <div className="relative">
                <img src={screenshotPreview} alt="Payment screenshot" className="w-full h-40 object-cover rounded-2xl border-2 border-pink-400" />
                <button
                  onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center gap-2 text-gray-400 hover:border-pink-400 hover:text-pink-400 transition-colors"
              >
                <Image size={28} />
                <span className="text-sm font-medium">Tap to upload screenshot</span>
                <span className="text-xs">JPG, PNG up to 5 MB</span>
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-4">
          <p className="text-xs text-blue-700">
            After submission, our team will verify your payment and activate your profile within 2–4 hours. You'll see the status in your profile.
          </p>
        </div>

        <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
          {loading ? 'Uploading...' : 'Submit for Verification'}
        </Button>
        <Button variant="ghost" fullWidth size="md" onClick={resetAndClose} className="mt-2 text-gray-400">Cancel</Button>
      </Modal>
    );
  }

  // -- QR / UPI screen -----------------------------------------------------------
  return (
    <Modal open={open} hideClose>
      <div className="flex items-center gap-3 mb-5">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pay via UPI</h2>
          <p className="text-xs text-gray-500">Scan QR or copy UPI ID</p>
        </div>
      </div>

      {/* Amount badge */}
      <div className="bg-brand-gradient rounded-3xl p-4 text-white text-center mb-5">
        <p className="text-sm opacity-80">{planInfo.label} Activation</p>
        <p className="text-4xl font-extrabold">?{amount}</p>
        <p className="text-xs opacity-70 mt-1">One-time · No hidden charges</p>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center mb-4">
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-4 inline-block mb-3 shadow-sm">
          <img
            src={qrUrl}
            alt="UPI QR Code"
            className="w-44 h-44"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <p className="text-xs text-gray-500 mb-3">Scan with any UPI app (GPay, PhonePe, Paytm)</p>

        {/* UPI ID */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3 w-full">
          <p className="flex-1 text-sm font-mono font-semibold text-gray-800 select-all">{UPI_ID}</p>
          <button onClick={copyUpi} className="flex-shrink-0 flex items-center gap-1 text-pink-600 text-xs font-semibold">
            {copied ? <><CheckCircle size={14} />Copied!</> : <><Copy size={14} />Copy</>}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-5">
        {[
          'Open GPay, PhonePe, Paytm or any UPI app',
          `Send exactly ?${amount} to the UPI ID above`,
          'Take a screenshot of the payment confirmation',
          'Tap "I\'ve Paid" and submit your proof below',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-gray-600">{step}</p>
          </div>
        ))}
      </div>

      <Button fullWidth size="lg" icon={<Upload size={16} />} onClick={() => setStep('proof')}>
        I've Paid — Submit Proof
      </Button>
      <Button variant="ghost" fullWidth size="md" onClick={resetAndClose} className="mt-2 text-gray-400">Maybe Later</Button>
    </Modal>
  );
}
