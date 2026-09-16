import type { EditEntry } from '../data';

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EditTrail({ edits, onClose }: { edits: EditEntry[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="fadein w-full max-w-md mx-2 rounded-2xl border border-[#252a3a] overflow-hidden" style={{ background: '#0f1118', maxHeight: '80vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252a3a]">
          <div className="text-white font-semibold text-sm">All Edits</div>
          <button onClick={onClose} className="text-[#8892aa] hover:text-white text-lg leading-none">×</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
          {edits.slice().reverse().map((e, i) => (
            <div key={i} className="px-5 py-4 border-b border-[#1a1f2e] last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono-data text-[10px] text-[#3b4260]">v{e.version}</span>
                <span className={`text-[10px] font-mono-data px-1.5 py-0.5 rounded ${e.by === 'authority' ? 'bg-[#7c6aff22] text-[#a78bfa]' : 'bg-[#f9731622] text-[#fb923c]'}`}>
                  {e.by === 'authority' ? 'Authority' : 'Resident'}
                </span>
              </div>
              <div className="text-white text-sm mb-1">{e.note}</div>
              {e.field !== 'status' && (
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-[#f87171] line-through">{e.oldValue}</span>
                  <span className="text-[#8892aa]">→</span>
                  <span className="text-[#4ade80]">{e.newValue}</span>
                </div>
              )}
              <div className="text-[#3b4260] text-[11px] font-mono-data mt-1">{fmt(e.date)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
