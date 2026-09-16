import { useState } from 'react';
import AvatarSVG from './AvatarSVG';

interface Props {
  onComplete: (phone: string, email: string) => void;
  onClose: () => void;
}

export default function Registration({ onComplete, onClose }: Props) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'intro' | 'form'>('intro');
  const [error, setError] = useState('');

  function submit() {
    if (!phone.match(/^\+?[0-9]{10,13}$/)) { setError('Enter a valid phone number'); return; }
    if (!email.includes('@')) { setError('Enter a valid email address'); return; }
    onComplete(phone, email);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
      <div className="fadein w-full max-w-sm mx-4 rounded-2xl border border-[#252a3a] overflow-hidden" style={{ background: '#0f1118' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#252a3a] flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono-data text-[#f97316] tracking-widest uppercase mb-1">WEB3 · CIVIC</div>
            <div className="text-xl font-bold text-white">Create Anonymous Account</div>
          </div>
          <button onClick={onClose} className="text-[#8892aa] hover:text-white text-xl leading-none ml-4 mt-0.5">×</button>
        </div>

        {step === 'intro' ? (
          <div className="p-6 text-center">
            <AvatarSVG size={80} className="mx-auto mb-4" />
            <div className="text-[#f97316] text-xs font-mono-data uppercase tracking-widest mb-2">WEB3 IDENTITY</div>
            <div className="text-white font-bold text-lg mb-2">Your identity stays private</div>
            <p className="text-[#8892aa] text-sm mb-6 leading-relaxed">
              Phone and email are used only for complaint updates. They are <span className="text-white">never visible</span> to authorities, the public, or anyone else.
            </p>
            <div className="space-y-2 text-left mb-6">
              {['Zero personal data shared publicly', 'Anonymous ID assigned automatically', 'Authority sees only your complaint ID'].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-[#8892aa]">
                  <span className="text-[#4ade80]">✓</span> {t}
                </div>
              ))}
            </div>
            <button onClick={() => setStep('form')} className="w-full py-3 rounded-xl font-bold text-sm text-white tracking-wider uppercase" style={{ background: '#f97316' }}>
              Create Anon. Account
            </button>
            <div className="text-[#3b4260] text-[10px] mt-4 font-mono-data uppercase tracking-wider">Powered by Web3 · Zero Personal Data</div>
          </div>
        ) : (
          <div className="p-6">
            <AvatarSVG size={56} className="mx-auto mb-5" />
            <p className="text-[#8892aa] text-sm mb-5 text-center">These details are stored locally and encrypted. No one can see them.</p>
            <div className="space-y-4">
              <div>
                <label className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider block mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); }}
                  className="w-full rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors border"
                  style={{ background: '#141720', borderColor: '#252a3a' }}
                />
              </div>
              <div>
                <label className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider block mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="w-full rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#f97316] transition-colors border"
                  style={{ background: '#141720', borderColor: '#252a3a' }}
                />
              </div>
              {error && <div className="text-[#f87171] text-xs">{error}</div>}
              <button onClick={submit} className="w-full py-3 rounded-xl font-bold text-sm text-white tracking-wider uppercase mt-2" style={{ background: '#f97316' }}>
                Register Anonymously
              </button>
              <button onClick={onClose} className="w-full py-2 text-[#8892aa] text-sm hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
