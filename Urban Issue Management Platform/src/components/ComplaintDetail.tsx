import { useState } from 'react';
import type { Complaint, MediaItem, EditEntry } from '../data';
import { CAT_LABEL, CAT_ICON } from '../data';
import StatusBadge from './StatusBadge';
import EditTrail from './EditTrail';
import MediaUploader, { type UploadedMedia } from './MediaUploader';

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props {
  complaint: Complaint;
  onClose: () => void;
  onUpdate: (c: Complaint) => void;
  onReapply: (original: Complaint, edited: Complaint) => void;
  myAnonId: string;
  upvoted: boolean;
  onUpvote: () => void;
}

export default function ComplaintDetail({
  complaint: c, onClose, onUpdate, onReapply, myAnonId, upvoted, onUpvote,
}: Props) {
  const isOwner = c.submittedBy === myAnonId;

  // Edit state — only used when isOwner
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(c.description);
  // Existing saved media (from complaint) shown as read-only during edit
  // New uploads stored separately and merged on Done
  const [newUploads, setNewUploads] = useState<UploadedMedia[]>([]);

  const [tab, setTab] = useState<'overview' | 'media' | 'chat' | 'versions'>('overview');
  const [showEdits, setShowEdits] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState(c.messages);

  const lastEdit = c.editTrail.length > 1 ? c.editTrail[c.editTrail.length - 1] : null;

  // Group edit trail into versions for Versions tab
  const versions = [...c.editTrail].reverse();

  // ── Save edit (owner only, updates in place) ──────────────────────────────
  function handleDone() {
    const now = new Date().toISOString();
    const addedMedia: MediaItem[] = newUploads.map(u => ({
      id: u.id,
      type: u.type,
      url: u.url,
      caption: u.name,
      uploadedAt: now,
      uploadedBy: 'user' as const,
    }));
    const newEntry: EditEntry = {
      version: c.editTrail.length + 1,
      date: now,
      by: 'user',
      field: 'content',
      oldValue: c.description,
      newValue: editDesc,
      note: `Description edited${addedMedia.length ? ` and ${addedMedia.length} media file(s) added` : ''} by resident.`,
    };
    const updated: Complaint = {
      ...c,
      description: editDesc,
      media: [...c.media, ...addedMedia],
      updatedAt: now,
      editTrail: [...c.editTrail, newEntry],
    };
    onUpdate(updated);
    setEditing(false);
    setNewUploads([]);
  }

  // ── Reapply from archive (declined complaints) ────────────────────────────
  function handleReapply() {
    const now = new Date().toISOString();
    const newId = `CMP-${Math.floor(Math.random() * 9000 + 1000)}`;
    const addedMedia: MediaItem[] = newUploads.map(u => ({
      id: u.id, type: u.type, url: u.url, caption: u.name,
      uploadedAt: now, uploadedBy: 'user' as const,
    }));
    const copy: Complaint = {
      ...c,
      id: newId,
      description: editDesc,
      media: [...c.media, ...addedMedia],
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      approvedAt: null,
      upvotes: 0,
      userApproved: null,
      feedback: '',
      editTrail: [{
        version: 1, date: now, by: 'user',
        field: 'status', oldValue: '', newValue: 'submitted',
        note: `Re-applied from ${c.id}. Original kept in personal archive.`,
      }],
      messages: [],
      commentCount: 0,
    };
    onReapply(c, copy);
    onClose();
  }

  // ── User approve / decline ────────────────────────────────────────────────
  function handleUserApprove() {
    const now = new Date().toISOString();
    onUpdate({
      ...c, status: 'approved', approvedAt: now, userApproved: true, updatedAt: now,
      editTrail: [...c.editTrail, {
        version: c.editTrail.length + 1, date: now, by: 'user',
        field: 'status', oldValue: c.status, newValue: 'approved',
        note: 'Issue resolved — approved by resident.',
      }],
    });
  }

  function handleUserDecline() {
    const now = new Date().toISOString();
    onUpdate({
      ...c, status: 'declined', updatedAt: now,
      editTrail: [...c.editTrail, {
        version: c.editTrail.length + 1, date: now, by: 'user',
        field: 'status', oldValue: c.status, newValue: 'declined',
        note: 'Declined by resident — issue not satisfactorily resolved.',
      }],
    });
  }

  function sendMsg() {
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, { id: `msg${Date.now()}`, from: 'user', text: chatMsg, time: new Date().toISOString() }]);
    setChatMsg('');
  }

  const TABS = ['overview', 'media', 'chat', 'versions'] as const;

  return (
    <>
      <div
        className="fixed inset-0 z-[500] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      >
        <div
          className="fadein w-full mx-3 flex flex-col border border-[#1e2130] overflow-hidden"
          style={{ background: '#0f1118', maxHeight: '90vh', maxWidth: 520, borderRadius: 12 }}
        >

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 border-b border-[#1a1f2e]" style={{ padding: '14px 16px 10px' }}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="font-mono-data text-xs text-[#f97316]">{c.id}</span>
                  <StatusBadge status={c.status} />
                  <span
                    className="text-[10px] font-mono-data px-1.5 py-0.5 rounded border"
                    style={c.aiVerified
                      ? { background: '#7c6aff22', color: '#a78bfa', borderColor: '#7c6aff33' }
                      : { background: '#f9731622', color: '#fb923c', borderColor: '#f9731633' }
                    }
                    title="AI checks authority-uploaded photos/videos for AI-generated or fake imagery"
                  >
                    {c.aiVerified ? 'Authority media verified ✓' : 'AI check pending'}
                  </span>
                  {isOwner && (
                    <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded border border-[#f9731633]"
                      style={{ background: '#f9731622', color: '#f97316' }}>Your complaint</span>
                  )}
                </div>
                <div className="text-white font-semibold text-sm leading-snug mb-1">{c.title}</div>
                <div className="text-[#8892aa] text-xs">{c.location} · {c.ward}</div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Edit button — owner only, not when already approved */}
                {isOwner && !editing && c.status !== 'approved' && (
                  <button
                    onClick={() => { setEditing(true); setTab('overview'); }}
                    className="text-[11px] font-mono-data px-2.5 py-1 rounded-lg border transition-colors hover:text-white"
                    style={{ color: '#f97316', borderColor: '#f9731644' }}
                  >
                    Edit ✎
                  </button>
                )}
                <button onClick={onClose} className="text-[#8892aa] hover:text-white text-xl leading-none">×</button>
              </div>
            </div>

            {/* Edit stamp */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {lastEdit && (
                <span className="text-[10px] font-mono-data text-[#3b4260]">
                  Edited {fmt(lastEdit.date)} by {lastEdit.by === 'authority' ? 'Authority' : 'Resident'}
                </span>
              )}
              <button
                onClick={() => setShowEdits(true)}
                className="text-[10px] font-mono-data text-[#7c6aff] hover:text-[#a78bfa] underline transition-colors"
              >
                All edits ({c.editTrail.length})
              </button>
            </div>
          </div>

          {/* ── Tabs (hidden when editing — owner goes straight to edit form) ── */}
          {!editing && (
            <div className="flex border-b border-[#1a1f2e] flex-shrink-0">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 text-xs font-mono-data uppercase tracking-wider transition-colors ${tab === t ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-[#8892aa] hover:text-white'}`}
                  style={{ height: 40 }}
                >
                  {t === 'chat' ? `Chat (${messages.length})` : t === 'media' ? `Media (${c.media.length})` : t === 'versions' ? `Versions (${c.editTrail.length})` : t}
                </button>
              ))}
            </div>
          )}

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1" style={{ padding: '16px' }}>

            {/* ══ EDIT FORM (owner only) ══════════════════════════════════════ */}
            {editing && isOwner && (
              <div className="fadein space-y-4">
                <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider">
                  Editing your complaint
                </div>

                {/* Description */}
                <div className="rounded-lg border border-[#1e2130] overflow-hidden" style={{ background: '#141720' }}>
                  <div className="px-3 py-2 border-b border-[#1a1f2e]">
                    <div className="text-[10px] font-mono-data text-[#8892aa] uppercase tracking-wider">Description</div>
                  </div>
                  <div className="p-3">
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      rows={5}
                      className="w-full text-white text-sm leading-relaxed focus:outline-none resize-none placeholder-[#3b4260]"
                      style={{ background: 'transparent' }}
                      placeholder="Describe the issue in detail…"
                    />
                  </div>
                </div>

                {/* Existing media (read-only during edit) */}
                {c.media.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono-data text-[#3b4260] uppercase tracking-wider mb-2">Previously uploaded ({c.media.length})</div>
                    <div className="grid grid-cols-3 gap-2">
                      {c.media.map(m => (
                        <div key={m.id} className="rounded-lg overflow-hidden border border-[#1e2130] opacity-60" style={{ height: 64 }}>
                          {m.type === 'video'
                            ? <video src={m.url} className="w-full h-full object-cover" />
                            : <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New uploads */}
                <MediaUploader
                  items={newUploads}
                  onChange={setNewUploads}
                  label="Add New Photos & Videos"
                />
              </div>
            )}

            {/* ══ OVERVIEW (view mode) ════════════════════════════════════════ */}
            {!editing && tab === 'overview' && (
              <div className="fadein space-y-4">
                {/* Description */}
                <div className="rounded-lg border border-[#1e2130] overflow-hidden" style={{ background: '#141720' }}>
                  <div className="px-3 py-2 border-b border-[#1a1f2e]">
                    <div className="text-[10px] font-mono-data text-[#8892aa] uppercase tracking-wider">Description</div>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-white text-sm leading-relaxed">{c.description}</p>
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Category', value: `${CAT_ICON[c.category]} ${CAT_LABEL[c.category]}` },
                    { label: 'Filed by', value: c.submittedBy },
                    { label: 'Submitted', value: fmt(c.submittedAt) },
                    { label: 'Updated', value: fmt(c.updatedAt) },
                    { label: 'Upvotes', value: String(c.upvotes + (upvoted ? 1 : 0)) },
                    { label: 'Comments', value: String(c.commentCount) },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg border border-[#1e2130] px-3 py-2" style={{ background: '#141720' }}>
                      <div className="text-[10px] font-mono-data text-[#8892aa] uppercase tracking-wider mb-0.5">{m.label}</div>
                      <div className="text-white text-xs font-medium">{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Upvote — available to everyone */}
                <button
                  onClick={onUpvote}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${upvoted ? 'border-[#f97316] text-[#f97316]' : 'border-[#1e2130] text-[#8892aa] hover:border-[#f97316] hover:text-[#f97316]'}`}
                  style={{ background: upvoted ? '#f9731622' : '#141720' }}
                >
                  ▲ {upvoted ? 'Upvoted' : 'Upvote'} · {c.upvotes + (upvoted ? 1 : 0)}
                </button>

                {/* Owner: Approve / Decline when authority has seen/acted */}
                {isOwner && (c.status === 'ongoing' || c.status === 'seen') && (
                  <div className="rounded-lg border border-[#1e2130] p-4" style={{ background: '#141720' }}>
                    <div className="text-[10px] font-mono-data text-[#8892aa] uppercase tracking-wider mb-1">Your Decision</div>
                    <p className="text-[#8892aa] text-xs mb-3">Only you can approve or decline the work done by the authority.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUserApprove}
                        className="flex-1 py-2 rounded-lg text-sm font-bold text-white"
                        style={{ background: '#22c55e' }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={handleUserDecline}
                        className="flex-1 py-2 rounded-lg text-sm font-bold text-white"
                        style={{ background: '#e8322a' }}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* Approved state */}
                {c.status === 'approved' && (
                  <div className="rounded-lg border p-4" style={{ background: '#0d1a0d', borderColor: '#22c55e33' }}>
                    <div className="text-[#4ade80] text-sm font-semibold mb-1">✓ Approved by resident</div>
                    {c.feedback && <p className="text-[#8892aa] text-xs">{c.feedback}</p>}
                  </div>
                )}

                {/* Declined state — owner can reapply */}
                {c.status === 'declined' && isOwner && (
                  <div className="rounded-lg border p-4" style={{ background: '#1a0808', borderColor: '#e8322a33' }}>
                    <div className="text-[#f87171] text-sm font-semibold mb-1">Declined</div>
                    <p className="text-[#8892aa] text-xs mb-3">{c.editTrail[c.editTrail.length - 1]?.note}</p>
                    <p className="text-[#8892aa] text-xs mb-3">Edit and reapply — the original will be kept in your personal archive.</p>
                    <button
                      onClick={() => { setEditing(true); setTab('overview'); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                      style={{ background: '#f97316' }}
                    >
                      Edit & Reapply →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══ MEDIA (view only for non-owners) ═══════════════════════════ */}
            {!editing && tab === 'media' && (
              <div className="fadein space-y-3">
                {c.media.length === 0 && (
                  <div className="text-center text-[#3b4260] py-8 text-sm">No media attached.</div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {c.media.map(m => (
                    <div key={m.id} className="relative rounded-lg overflow-hidden border border-[#1e2130]" style={{ height: 120 }}>
                      {m.type === 'video'
                        ? <video src={m.url} className="w-full h-full object-cover" controls />
                        : <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                      }
                      <div
                        className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-[9px] font-mono-data text-white"
                        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
                      >
                        <span
                          className="px-1.5 py-0.5 rounded text-[8px] mr-1"
                          style={m.uploadedBy === 'authority'
                            ? { background: '#22c55e22', color: '#4ade80' }
                            : { background: '#f9731622', color: '#fb923c' }
                          }
                        >
                          {m.uploadedBy === 'authority' ? '🏛 Authority' : '👤 Resident'}
                        </span>
                        {fmtDate(m.uploadedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ CHAT ════════════════════════════════════════════════════════ */}
            {!editing && tab === 'chat' && (
              <div className="fadein flex flex-col" style={{ height: 300 }}>
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {messages.length === 0 && (
                    <div className="text-center text-[#3b4260] text-sm py-8">No messages yet.</div>
                  )}
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[75%] px-3 py-2 text-sm"
                        style={{
                          borderRadius: m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          background: m.from === 'user' ? '#f97316' : '#1a1f2e',
                          border: m.from !== 'user' ? '1px solid #1e2130' : 'none',
                          color: '#fff',
                        }}
                      >
                        <div>{m.text}</div>
                        <div className="text-[9px] mt-0.5 font-mono-data opacity-60">{fmt(m.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <input
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMsg()}
                    placeholder="Message authority…"
                    className="flex-1 border border-[#1e2130] rounded-lg px-3 py-2 text-white text-sm placeholder-[#3b4260] focus:outline-none focus:border-[#f97316] transition-colors"
                    style={{ background: '#141720' }}
                  />
                  <button
                    onClick={sendMsg}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: '#f97316' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* ══ VERSIONS (all edits, visible to everyone) ═══════════════════ */}
            {!editing && tab === 'versions' && (
              <div className="fadein space-y-2">
                <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-3">
                  All edit versions · visible to everyone
                </div>
                {versions.length === 0 && (
                  <div className="text-center text-[#3b4260] text-sm py-8">No edits yet.</div>
                )}
                {versions.map((e, i) => (
                  <div key={i} className="rounded-lg border border-[#1e2130] overflow-hidden" style={{ background: '#141720' }}>
                    <div className="px-3 py-2 border-b border-[#1a1f2e] flex items-center gap-2">
                      <span className="font-mono-data text-xs text-[#7c6aff] font-semibold">v{e.version}</span>
                      {i === 0 && <span className="text-[10px] font-mono-data text-[#4ade80]">· Current</span>}
                      <span
                        className="ml-auto text-[10px] font-mono-data px-1.5 py-0.5 rounded"
                        style={e.by === 'authority'
                          ? { background: '#7c6aff22', color: '#a78bfa' }
                          : { background: '#f9731622', color: '#fb923c' }
                        }
                      >
                        {e.by === 'authority' ? 'Authority' : 'Resident'}
                      </span>
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="text-white text-sm mb-1">{e.note}</div>
                      {e.field !== 'status' && e.oldValue && (
                        <div className="flex gap-2 mt-1 text-xs font-mono-data">
                          <span className="text-[#f87171] line-through">{e.oldValue}</span>
                          <span className="text-[#3b4260]">→</span>
                          <span className="text-[#4ade80]">{e.newValue}</span>
                        </div>
                      )}
                      <div className="text-[#3b4260] text-[10px] font-mono-data mt-1.5">{fmt(e.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          {editing && isOwner && (
            <div
              className="flex-shrink-0 border-t border-[#1a1f2e] flex gap-3"
              style={{ padding: '12px 16px' }}
            >
              <button
                onClick={() => { setEditing(false); setEditDesc(c.description); setNewUploads([]); }}
                className="flex-1 border border-[#1e2130] text-[#8892aa] hover:text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              {c.status === 'declined' ? (
                // Declined: Done sends a new copy to submitted
                <button
                  onClick={handleReapply}
                  className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white"
                  style={{ background: '#f97316' }}
                >
                  Done — Reapply →
                </button>
              ) : (
                // Active complaint: Done saves in place
                <button
                  onClick={handleDone}
                  className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white"
                  style={{ background: '#f97316' }}
                >
                  Done
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showEdits && <EditTrail edits={c.editTrail} onClose={() => setShowEdits(false)} />}
    </>
  );
}
