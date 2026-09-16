import { useRef, useState, useCallback } from 'react';

export interface UploadedMedia {
  id: string;
  type: 'photo' | 'video';
  url: string; // blob URL
  name: string;
}

interface Props {
  items: UploadedMedia[];
  onChange: (items: UploadedMedia[]) => void;
  label?: string;
}

export default function MediaUploader({ items, onChange, label = 'Photos & Videos' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function processFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const newItems: UploadedMedia[] = arr
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map(f => ({
        id: `u${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: f.type.startsWith('video/') ? 'video' : 'photo',
        url: URL.createObjectURL(f),
        name: f.name,
      }));
    onChange([...items, ...newItems]);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [items]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  function remove(id: string) {
    const item = items.find(i => i.id === id);
    if (item) URL.revokeObjectURL(item.url);
    onChange(items.filter(i => i.id !== id));
  }

  return (
    <div className="rounded-lg border border-[#1e2130] overflow-hidden" style={{ background: '#141720' }}>
      <div className="px-3 py-2 border-b border-[#1a1f2e] flex items-center justify-between">
        <div className="text-[10px] font-mono-data text-[#8892aa] uppercase tracking-wider">{label} ({items.length})</div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-[10px] font-mono-data px-2 py-0.5 rounded border transition-colors hover:text-white"
          style={{ color: '#f97316', borderColor: '#f9731633' }}
        >
          + Add
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => items.length === 0 && inputRef.current?.click()}
        className="transition-colors"
        style={{
          padding: items.length === 0 ? '28px 16px' : '12px',
          background: dragging ? 'rgba(249,115,22,0.08)' : 'transparent',
          border: dragging ? '1.5px dashed #f97316' : '1.5px dashed transparent',
          cursor: items.length === 0 ? 'pointer' : 'default',
        }}
      >
        {items.length === 0 ? (
          <div className="text-center pointer-events-none">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-[#8892aa] text-sm mb-1">Drag & drop files here</div>
            <div className="text-[#3b4260] text-xs">or click to browse — photos &amp; videos</div>
            <div className="text-[#3b4260] text-[10px] mt-2 font-mono-data">JPG · PNG · MP4 · MOV · WEBM</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {items.map(m => (
              <div key={m.id} className="relative rounded-lg overflow-hidden border border-[#1e2130]" style={{ height: 72 }}>
                {m.type === 'video'
                  ? <video src={m.url} className="w-full h-full object-cover" />
                  : <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                }
                {/* Type badge */}
                <div
                  className="absolute bottom-1 left-1 text-[8px] font-mono-data px-1 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.7)', color: m.type === 'video' ? '#fb923c' : '#60a5fa' }}
                >
                  {m.type === 'video' ? '▶ VID' : '🖼 IMG'}
                </div>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: '#e8322a' }}
                >
                  ×
                </button>
              </div>
            ))}
            {/* Add more tile */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-dashed border-[#252a3a] flex flex-col items-center justify-center text-[#3b4260] hover:border-[#f97316] hover:text-[#f97316] transition-colors"
              style={{ height: 72 }}
            >
              <span className="text-xl">+</span>
              <span className="text-[9px] font-mono-data mt-0.5">More</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input — accepts images and videos, multiple */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) { processFiles(e.target.files); e.target.value = ''; } }}
      />
    </div>
  );
}
