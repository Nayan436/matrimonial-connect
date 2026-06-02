import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, X, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import type { UserProfile } from '../types';
import { uid, calcProfileCompletion } from '../utils/storage';

const STEPS = ['Personal', 'Family', 'Lifestyle', 'Preferences', 'Photos'];

const religionOpts = ['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Parsi','Other'].map(v=>({value:v,label:v}));
const educationOpts = ['High School','Diploma','B.Tech','B.E.','BCA','B.Sc','B.Com','BA','B.Arch','BDS','MBBS','MBA','MCA','M.Tech','M.Sc','CA','LLB','PhD','Other'].map(v=>({value:v,label:v}));
const incomeOpts = ['Under ₹3 LPA','₹3–5 LPA','₹5–8 LPA','₹8–12 LPA','₹12–18 LPA','₹18–25 LPA','₹25+ LPA'].map(v=>({value:v,label:v}));
const heightOpts = ["4'8\"","4'10\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"","5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\""].map(v=>({value:v,label:v}));
const familyTypeOpts = ['Nuclear','Joint','Extended'].map(v=>({value:v,label:v}));
const familyValuesOpts = ['Traditional','Moderate','Liberal'].map(v=>({value:v,label:v}));
const dietOpts = ['Vegetarian','Non-Vegetarian','Vegan','Jain','Eggetarian'].map(v=>({value:v,label:v}));
const yesNoOpts = ['Never','Occasionally','Socially','Yes'].map(v=>({value:v,label:v}));
const stateOpts = ['Gujarat','Maharashtra','Rajasthan','Karnataka','Tamil Nadu','Delhi','Punjab','Uttar Pradesh','Other'].map(v=>({value:v,label:v}));

// Placeholder profile photos (demo only)
const DEMO_PHOTOS = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
];

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { setProfile, state } = useApp();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: 'male', dob: '1995-01-15',
    height: "5'8\"", religion: 'Hindu', community: '', motherTongue: 'Hindi',
    education: '', occupation: '', income: '', city: 'Ahmedabad', state: 'Gujarat',
    country: 'India', about: '', maritalStatus: 'Never Married',
    fatherName: '', motherName: '', familyType: 'Nuclear', familyValues: 'Moderate', siblings: 'None',
    diet: 'Vegetarian', smoking: 'Never', drinking: 'Never', fitness: '', hobbies: [] as string[],
    prefAgeMin: 22, prefAgeMax: 32, prefHeightMin: "5'0\"", prefHeightMax: "5'8\"",
    prefEducation: '', prefOccupation: '', prefReligion: '', prefCity: '',
    photos: [] as string[], primaryPhoto: 0,
  });

  const [hobbyInput, setHobbyInput] = useState('');

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const addHobby = () => {
    if (hobbyInput.trim() && form.hobbies.length < 8) {
      set('hobbies', [...form.hobbies, hobbyInput.trim()]);
      setHobbyInput('');
    }
  };

  const addDemoPhoto = () => {
    if (form.photos.length < 6) {
      const next = DEMO_PHOTOS[form.photos.length % DEMO_PHOTOS.length];
      set('photos', [...form.photos, next]);
    }
  };

  const completion = calcProfileCompletion(form);

  const handleFinish = () => {
    const dob = form.dob;
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
    const profile: UserProfile = {
      id: uid(),
      mobile: state.mobile ?? '',
      isActivated: state.isActivated,
      createdAt: new Date().toISOString(),
      ...form,
      age,
      isVerified: false,
      profileCompletion: completion,
    };
    setProfile(profile);
    navigate('/discover');
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-bold text-gray-900">Create Profile</h1>
          <span className="text-xs font-semibold text-pink-600">{completion}% complete</span>
        </div>
        {/* Step pills */}
        <div className="flex gap-1.5 mb-3">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i <= step && setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-pink-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">Step {step + 1}/{STEPS.length} · {STEPS[step]}</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 pb-32">
        {/* ── Step 0: Personal ─────────────────── */}
        {step === 0 && (
          <>
            <Input label="First Name *" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Your first name" />
            <Input label="Last Name *" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Your last name" />
            <Select label="Gender *" value={form.gender} onChange={e => set('gender', e.target.value)}
              options={[{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} />
            <Input label="Date of Birth *" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
            <Select label="Height" value={form.height} onChange={e => set('height', e.target.value)} options={heightOpts} />
            <Select label="Religion" value={form.religion} onChange={e => set('religion', e.target.value)} options={religionOpts} />
            <Input label="Community / Caste" value={form.community} onChange={e => set('community', e.target.value)} placeholder="e.g. Brahmin, Patel" />
            <Input label="Mother Tongue" value={form.motherTongue} onChange={e => set('motherTongue', e.target.value)} placeholder="e.g. Gujarati, Hindi" />
            <Select label="Education" value={form.education} onChange={e => set('education', e.target.value)} options={educationOpts} placeholder="Select education" />
            <Input label="Occupation" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Software Engineer" />
            <Select label="Annual Income" value={form.income} onChange={e => set('income', e.target.value)} options={incomeOpts} placeholder="Select income" />
            <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Your city" />
            <Select label="State" value={form.state} onChange={e => set('state', e.target.value)} options={stateOpts} placeholder="Select state" />
            <Select label="Marital Status" value={form.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}
              options={['Never Married','Divorced','Widowed','Separated'].map(v=>({value:v,label:v}))} />
            <Textarea label="About Me" value={form.about} onChange={e => set('about', e.target.value)} rows={4} placeholder="Write a brief introduction about yourself..." />
          </>
        )}

        {/* ── Step 1: Family ─────────────────── */}
        {step === 1 && (
          <>
            <Input label="Father's Name" value={form.fatherName} onChange={e => set('fatherName', e.target.value)} placeholder="Father's full name" />
            <Input label="Mother's Name" value={form.motherName} onChange={e => set('motherName', e.target.value)} placeholder="Mother's full name" />
            <Select label="Family Type" value={form.familyType} onChange={e => set('familyType', e.target.value)} options={familyTypeOpts} />
            <Select label="Family Values" value={form.familyValues} onChange={e => set('familyValues', e.target.value)} options={familyValuesOpts} />
            <Input label="Siblings" value={form.siblings} onChange={e => set('siblings', e.target.value)} placeholder="e.g. 1 Brother, 2 Sisters" />
          </>
        )}

        {/* ── Step 2: Lifestyle ─────────────────── */}
        {step === 2 && (
          <>
            <Select label="Diet" value={form.diet} onChange={e => set('diet', e.target.value)} options={dietOpts} />
            <Select label="Smoking" value={form.smoking} onChange={e => set('smoking', e.target.value)} options={yesNoOpts} />
            <Select label="Drinking" value={form.drinking} onChange={e => set('drinking', e.target.value)} options={yesNoOpts} />
            <Input label="Fitness / Exercise" value={form.fitness} onChange={e => set('fitness', e.target.value)} placeholder="e.g. Gym, Yoga, Running" />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Hobbies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.hobbies.map(h => (
                  <span key={h} className="flex items-center gap-1 bg-pink-100 text-pink-700 text-sm px-3 py-1 rounded-full">
                    {h}
                    <button onClick={() => set('hobbies', form.hobbies.filter(x => x !== h))}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={hobbyInput}
                  onChange={e => setHobbyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHobby()}
                  placeholder="Add a hobby..."
                  className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-500"
                />
                <button onClick={addHobby} className="bg-pink-500 text-white rounded-xl px-3">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Partner Preferences ─────────────────── */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Preferred Age (Min)" type="number" value={String(form.prefAgeMin)} onChange={e => set('prefAgeMin', parseInt(e.target.value))} />
              <Input label="Preferred Age (Max)" type="number" value={String(form.prefAgeMax)} onChange={e => set('prefAgeMax', parseInt(e.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Height (Min)" value={form.prefHeightMin} onChange={e => set('prefHeightMin', e.target.value)} options={heightOpts} />
              <Select label="Height (Max)" value={form.prefHeightMax} onChange={e => set('prefHeightMax', e.target.value)} options={heightOpts} />
            </div>
            <Select label="Preferred Education" value={form.prefEducation} onChange={e => set('prefEducation', e.target.value)} options={educationOpts} placeholder="Any education" />
            <Input label="Preferred Occupation" value={form.prefOccupation} onChange={e => set('prefOccupation', e.target.value)} placeholder="e.g. Doctor, Engineer (any)" />
            <Select label="Preferred Religion" value={form.prefReligion} onChange={e => set('prefReligion', e.target.value)} options={religionOpts} placeholder="Any religion" />
            <Input label="Preferred City" value={form.prefCity} onChange={e => set('prefCity', e.target.value)} placeholder="e.g. Ahmedabad (any city)" />
          </>
        )}

        {/* ── Step 4: Photos ─────────────────── */}
        {step === 4 && (
          <>
            <p className="text-sm text-gray-500">Add up to 6 photos. Your first photo will be your primary display photo.</p>
            <div className="grid grid-cols-3 gap-3">
              {form.photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  {i === form.primaryPhoto && (
                    <span className="absolute bottom-1 left-1 bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Main</span>
                  )}
                  <button
                    onClick={() => set('photos', form.photos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                  <button
                    onClick={() => set('primaryPhoto', i)}
                    className="absolute bottom-1 right-1 w-6 h-6 bg-white/80 text-gray-700 rounded-full flex items-center justify-center"
                  >
                    <Check size={10} />
                  </button>
                </div>
              ))}
              {form.photos.length < 6 && (
                <button
                  onClick={addDemoPhoto}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-pink-400 hover:text-pink-400 transition-colors"
                >
                  <Camera size={24} />
                  <span className="text-xs font-medium">Add Photo</span>
                </button>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
              <p className="text-xs text-blue-700 font-medium">
                📸 Demo Mode: Click "Add Photo" to use sample photos
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
        {step > 0 && (
          <Button variant="outline" size="lg" onClick={() => setStep(s => s - 1)} className="flex-1">
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button size="lg" onClick={() => setStep(s => s + 1)} className="flex-1"
            disabled={step === 0 && !form.firstName}>
            Next
          </Button>
        ) : (
          <Button size="lg" onClick={handleFinish} className="flex-1">
            Save Profile
          </Button>
        )}
      </div>
    </div>
  );
}
