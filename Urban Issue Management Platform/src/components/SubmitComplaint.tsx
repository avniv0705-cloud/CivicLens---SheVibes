import { useState } from 'react';
import type { Complaint, Category, MediaItem } from '../data';
import { CAT_LABEL, CAT_ICON } from '../data';
import MediaUploader, { type UploadedMedia } from './MediaUploader';

interface Props {
  anonId: string;
  pickingLocation: boolean;
  pickedLat: number | null;
  pickedLng: number | null;
  onStartPickLocation: () => void;
  onSubmit: (c: Complaint) => void;
  onClose: () => void;
}

const CATEGORIES: Category[] = ['pothole', 'streetlight', 'drainage', 'garbage', 'signage', 'footpath', 'other'];

export default function SubmitComplaint({ anonId, pickingLocation, pickedLat, pickedLng, onStartPickLocation, onSubmit, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category>('pothole');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    const id = `CMP-${Math.floor(Math.random() * 9000 + 1000)}`;
    const now = new Date().toISOString();
    const media: MediaItem[] = uploadedMedia.map(u => ({
      id: u.id,
      type: u.type,
      url: u.url,
      caption: u.name,
      uploadedAt: now,
      uploadedBy: 'user',
    }));
    const c: Complaint = {
      id,
      title,
      category,
      location,
      ward: 'Ward — Auto-assigned',
      description,
      status: 'submitted',
      submittedBy: anonId,
      submittedAt: now,
      updatedAt: now,
      approvedAt: null,
      media,
      upvotes: 0,
      lat: pickedLat ?? 28.6139,
      lng: pickedLng ?? 77.2090,
      intensity: 1,
      aiVerified: false,
      userApproved: null,
      feedback: '',
      editTrail: [{ version: 1, date: now, by: 'user', field: 'status', oldValue: '', newValue: 'submitted', note: 'Complaint submitted.' }],
      messages: [],
      commentCount: 0,
    };
    onSubmit(c);
    setSubmitted(true);
    setTimeout(onClose, 2200);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
        <div className="fadein text-center">
          <div className="text-5xl mb-4">✓</div>
          <div className="text-white font-bold text-xl mb-1">Complaint Filed</div>
          <div className="text-[#8892aa] text-sm">Sending to authority dashboard…</div>
        </div>
      </div>
    );
  }

  const canNext1 = !!location;
  const canNext2 = !!title;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="fadein w-full mx-2 flex flex-col border border-[#1e2130] overflow-hidden"
        style={{ background: '#0f1118', maxHeight: '90vh', maxWidth: 480, borderRadius: 12 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#1a1f2e] flex items-center justify-between" style={{ padding: '14px 16px' }}>
          <div>
            <div className="text-[10px] font-mono-data text-[#f97316] tracking-widest uppercase mb-0.5">Step {step} of 3</div>
            <div className="text-white font-bold text-base">File Complaint</div>
          </div>
          <button onClick={onClose} className="text-[#8892aa] hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 flex-shrink-0" style={{ padding: '10px 16px 0' }}>
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="rounded-full transition-all"
              style={{
                width: step === s ? 20 : 8, height: 8,
                background: step >= s ? '#f97316' : '#1e2130',
              }}
            />
          ))}
          <span className="text-[#8892aa] text-xs ml-1">
            {step === 1 ? 'Location & Category' : step === 2 ? 'Details & Photos' : 'Review & Submit'}
          </span>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1" style={{ padding: '14px 16px' }}>

          {/* Step 1 */}
          {step === 1 && (
            <div className="fadein space-y-4">
              <div>
                <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-3">Category</div>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all"
                      style={{
                        borderColor: category === cat ? '#f97316' : '#1e2130',
                        background: category === cat ? '#f9731622' : '#141720',
                        color: category === cat ? '#fff' : '#8892aa',
                      }}
                    >
                      <span>{CAT_ICON[cat]}</span>
                      <span className="text-xs">{CAT_LABEL[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-2">Location</div>
                <input
                  type="text"
                  placeholder="e.g. MG Road, Indiranagar"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm placeholder-[#3b4260] focus:outline-none focus:border-[#f97316] transition-colors"
                  style={{ background: '#141720' }}
                />
              </div>

              {/* Map pin */}
              <div className="rounded-lg border border-[#1e2130] p-4" style={{ background: '#141720' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">Pin on Map</div>
                    <div className="text-[#8892aa] text-xs mt-0.5">
                      {pickedLat ? `📍 ${pickedLat.toFixed(4)}, ${pickedLng?.toFixed(4)}` : 'Tap to place complaint pin on the map'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onStartPickLocation}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={pickingLocation
                      ? { background: '#7c6aff', color: '#fff' }
                      : { border: '1px solid #f9731644', color: '#f97316' }
                    }
                  >
                    {pickingLocation ? '⏳ Click map…' : '📍 Pick Location'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="fadein space-y-4">
              <div>
                <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-2">Title</div>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm placeholder-[#3b4260] focus:outline-none focus:border-[#f97316] transition-colors"
                  style={{ background: '#141720' }}
                />
              </div>

              <div>
                <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-2">Description</div>
                <textarea
                  rows={4}
                  placeholder="Duration, how many people affected, previous reports made…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-[#1e2130] rounded-lg px-4 py-3 text-white text-sm placeholder-[#3b4260] focus:outline-none focus:border-[#f97316] transition-colors resize-none"
                  style={{ background: '#141720' }}
                />
              </div>

              {/* File uploader */}
              <MediaUploader
                items={uploadedMedia}
                onChange={setUploadedMedia}
                label="Your Evidence (Photos & Videos)"
              />
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="fadein space-y-4">
              <div className="rounded-lg border border-[#1e2130] divide-y divide-[#1a1f2e] overflow-hidden">
                {[
                  { label: 'Category', value: `${CAT_ICON[category]} ${CAT_LABEL[category]}` },
                  { label: 'Location', value: location },
                  { label: 'Title', value: title },
                  { label: 'Media', value: `${uploadedMedia.length} file(s)` },
                  { label: 'Filed as', value: anonId },
                  { label: 'Map pin', value: pickedLat ? `${pickedLat.toFixed(4)}, ${pickedLng?.toFixed(4)}` : 'Auto (your location)' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between px-4 py-3" style={{ background: '#141720' }}>
                    <span className="text-[#8892aa] text-sm">{r.label}</span>
                    <span className="text-white text-sm font-medium text-right max-w-[55%] truncate">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Media preview */}
              {uploadedMedia.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {uploadedMedia.map(m => (
                    <div key={m.id} className="relative rounded-lg overflow-hidden border border-[#1e2130]" style={{ height: 60 }}>
                      {m.type === 'video'
                        ? <video src={m.url} className="w-full h-full object-cover" />
                        : <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      }
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg border p-4" style={{ background: '#0f1118', borderColor: '#1e2130' }}>
                <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-1">🔒 Privacy</div>
                <p className="text-[#8892aa] text-xs">Complaint is filed as <span className="text-white font-medium">{anonId}</span>. Your phone and email are never shared with anyone.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#1a1f2e] flex gap-3" style={{ padding: '12px 16px' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-[#1e2130] text-[#8892aa] hover:text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
              className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-opacity"
              style={{ background: '#f97316' }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white"
              style={{ background: '#e8322a' }}
            >
              Submit Complaint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
