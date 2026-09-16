import { useState, useMemo } from 'react';
import type { Complaint, Category, UserProfile } from '../data';
import { CAT_LABEL, CAT_ICON } from '../data';
import StatusBadge from './StatusBadge';
import AvatarSVG from './AvatarSVG';
import EditTrail from './EditTrail';

type Tab = 'feed' | 'archive' | 'profile';

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ComplaintRow({
  c, onClick, upvoted, onUpvote,
}: {
  c: Complaint; onClick: () => void; upvoted: boolean; onUpvote: (e: React.MouseEvent) => void;
}) {
  const [showEdits, setShowEdits] = useState(false);
  const lastEdit = c.editTrail.length > 1 ? c.editTrail[c.editTrail.length - 1] : null;

  return (
    <>
      <div
        onClick={onClick}
        className="cursor-pointer transition-colors hover:bg-[#111318] mx-2 my-1.5 rounded-lg border border-[#1e2130]"
        style={{ padding: '10px 12px' }}
      >
        {/* Title + status — height ~26px */}
        <div
          className="flex justify-between items-start gap-2 mb-1.5"
          style={{ minHeight: 26 }}
        >
          <div className="font-semibold text-white text-sm leading-snug flex-1 pr-1">{c.title}</div>
          <div className="flex-shrink-0"><StatusBadge status={c.status} /></div>
        </div>

        {/* Category + location — box-shadow, border */}
        <div
          className="flex items-center gap-2 mb-2 flex-wrap"
          style={{ boxShadow: 'rgba(0,0,0,0.25) 0px 4px 4px 0px', border: '1px solid rgb(0,0,0)', borderRadius: 6, padding: '3px 6px', display: 'inline-flex', width: 'fit-content' }}
        >
          <span className="text-[#8892aa] text-[11px] font-mono-data tracking-wide">
            {CAT_ICON[c.category]} {CAT_LABEL[c.category].toUpperCase()}
          </span>
          <span className="text-[#8892aa] text-xs">{c.location}</span>
        </div>

        {/* Last-edit stamp */}
        {lastEdit && (
          <div className="flex items-center gap-2 mb-1.5 mt-1">
            <span className="text-[10px] font-mono-data text-[#3b4260]">Edited {fmt(lastEdit.date)}</span>
            <button
              onClick={e => { e.stopPropagation(); setShowEdits(true); }}
              className="text-[10px] font-mono-data text-[#7c6aff] hover:text-[#a78bfa] underline transition-colors"
            >
              Show all edits
            </button>
          </div>
        )}

        {/* Footer — align-items flex-end */}
        <div className="flex items-end justify-between mt-2">
          <span className="text-[#3b4260] text-[11px] font-mono-data">{fmtDate(c.submittedAt)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#8892aa] text-xs">💬 {c.commentCount}</span>
            <button
              onClick={onUpvote}
              className={`flex items-center gap-1 text-xs font-mono-data font-semibold transition-colors ${upvoted ? 'text-[#f97316]' : 'text-[#8892aa] hover:text-[#f97316]'}`}
            >
              ▲ {c.upvotes + (upvoted ? 1 : 0)}
            </button>
          </div>
        </div>
      </div>

      {showEdits && <EditTrail edits={c.editTrail} onClose={() => setShowEdits(false)} />}
    </>
  );
}

interface Props {
  complaints: Complaint[];
  user: UserProfile;
  onSelectComplaint: (c: Complaint) => void;
  onFileComplaint: () => void;
  onUpvote: (id: string) => void;
  onReloadArchive: (c: Complaint) => void;
  stats: { total: number; resolved: number; pending: number };
}

export default function Sidebar({ complaints, user, onSelectComplaint, onFileComplaint, onUpvote, onReloadArchive, stats }: Props) {
  const [tab, setTab] = useState<Tab>('feed');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveCat, setArchiveCat] = useState<Category | 'all'>('all');
  const [archiveSort, setArchiveSort] = useState<'newest' | 'votes'>('newest');
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [phoneVal, setPhoneVal] = useState(user.phone || '');
  const [emailVal, setEmailVal] = useState(user.email || '');

  const feedComplaints = useMemo(() =>
    complaints
      .filter(c => !user.personalArchive.includes(c.id))
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [complaints, user.personalArchive]
  );

  const allApproved = useMemo(() => complaints.filter(c => c.status === 'approved'), [complaints]);

  const publicArchive = useMemo(() => {
    return allApproved
      .filter(c => !user.personalArchive.includes(c.id))
      .filter(c => {
        const q = archiveSearch.toLowerCase();
        const match = !q || c.title.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
        const catMatch = archiveCat === 'all' || c.category === archiveCat;
        return match && catMatch;
      })
      .sort((a, b) => archiveSort === 'votes'
        ? b.upvotes - a.upvotes
        : new Date(b.approvedAt ?? b.updatedAt).getTime() - new Date(a.approvedAt ?? a.updatedAt).getTime()
      );
  }, [allApproved, user.personalArchive, archiveSearch, archiveCat, archiveSort]);

  const personalArchive = useMemo(() =>
    complaints.filter(c => user.personalArchive.includes(c.id)),
    [complaints, user.personalArchive]
  );

  const myComplaints = complaints.filter(c => c.submittedBy === user.anonId && !user.personalArchive.includes(c.id));
  const cats: (Category | 'all')[] = ['all', 'pothole', 'streetlight', 'drainage', 'garbage', 'signage', 'footpath'];

  const TABS: Tab[] = ['feed', 'archive', 'profile'];

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a0a0e' }}>
      {/* ── Brand header ── */}
      <div
        className="flex-shrink-0 border-b border-[#1a1f2e]"
        style={{ padding: '9px 9px 5px 9px', margin: '2px 2px 0 2px' }}
      >
        {/* Brand row — height 60px */}
        <div
          className="flex items-start justify-between"
          style={{ height: 60 }}
        >
          <div className="flex flex-col justify-center h-full">
            <div className="text-[10px] font-mono-data tracking-widest uppercase" style={{ color: '#f97316' }}>WEB3 · CIVIC</div>
            <div className="text-white font-bold text-xl leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>CivicLens</div>
          </div>
          <button
            onClick={() => setTab('profile')}
            className="rounded-lg overflow-hidden border-2 border-[#252a3a] hover:border-[#f97316] transition-colors flex-shrink-0"
            style={{ width: 40, height: 40, marginTop: 4 }}
          >
            <AvatarSVG size={40} />
          </button>
        </div>

        {/* Stats — height 70px, padding 4px 2px */}
        <div
          className="grid grid-cols-3 gap-2"
          style={{ height: 70, padding: '4px 2px', marginBottom: 4, alignContent: 'center' }}
        >
          {[
            { label: 'Total', value: stats.total, color: '#fff' },
            { label: 'Resolved', value: stats.resolved, color: '#4ade80' },
            { label: 'Pending', value: stats.pending, color: '#fb923c' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-lg border border-[#1e2130] text-center flex flex-col items-center justify-center"
              style={{ background: '#141720' }}
            >
              <div className="font-bold text-lg leading-tight" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] font-mono-data text-[#8892aa] uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* File complaint button — rounded 9px, height 50px, margin 4px 0 */}
        <button
          onClick={onFileComplaint}
          className="w-full font-bold text-sm tracking-widest uppercase text-white hover:opacity-90 transition-opacity"
          style={{
            background: '#f97316',
            borderRadius: 9,
            height: 50,
            marginTop: 4,
            marginBottom: 4,
            padding: '5px 0',
          }}
        >
          + FILE COMPLAINT
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-[#1a1f2e] flex-shrink-0" style={{ margin: '0 2px' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs font-mono-data uppercase tracking-widest transition-colors ${tab === t ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-[#8892aa] hover:text-white'}`}
            style={{ height: 45 }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ margin: '2px 2px 2px 2px', padding: '5px 9px 5px 9px', maxHeight: 467 }}
      >
        {/* FEED */}
        {tab === 'feed' && (
          <div className="fadein" style={{ margin: '0 -9px' }}>
            {feedComplaints.length === 0 && (
              <div className="text-center text-[#3b4260] py-12 text-sm">No active complaints nearby.</div>
            )}
            {feedComplaints.map(c => (
              <ComplaintRow
                key={c.id}
                c={c}
                onClick={() => onSelectComplaint(c)}
                upvoted={user.upvotedIds.includes(c.id)}
                onUpvote={e => { e.stopPropagation(); onUpvote(c.id); }}
              />
            ))}
          </div>
        )}

        {/* ARCHIVE */}
        {tab === 'archive' && (
          <div className="fadein" style={{ margin: '0 -9px' }}>
            <div className="space-y-2 mb-3 px-2">
              <input
                type="text"
                placeholder="# Search resolved complaints..."
                value={archiveSearch}
                onChange={e => setArchiveSearch(e.target.value)}
                className="w-full border border-[#252a3a] rounded-lg px-3 py-2 text-white text-xs placeholder-[#3b4260] focus:outline-none focus:border-[#f97316] transition-colors font-mono-data"
                style={{ background: '#141720' }}
              />
              <div className="flex gap-2">
                <select
                  value={archiveCat}
                  onChange={e => setArchiveCat(e.target.value as Category | 'all')}
                  className="flex-1 border border-[#252a3a] rounded-lg px-2 py-1.5 text-[#8892aa] text-xs focus:outline-none font-mono-data uppercase"
                  style={{ background: '#141720' }}
                >
                  {cats.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : CAT_LABEL[c as Category]}</option>)}
                </select>
                <select
                  value={archiveSort}
                  onChange={e => setArchiveSort(e.target.value as 'newest' | 'votes')}
                  className="flex-1 border border-[#252a3a] rounded-lg px-2 py-1.5 text-[#8892aa] text-xs focus:outline-none font-mono-data uppercase"
                  style={{ background: '#141720' }}
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="votes">Sort: Votes</option>
                </select>
              </div>
              <div className="text-[#3b4260] text-[10px] font-mono-data uppercase text-right">{publicArchive.length} Resolved</div>
            </div>

            {publicArchive.length === 0 && (
              <div className="text-center text-[#3b4260] py-10 text-sm px-4">No resolved complaints match your search.</div>
            )}
            {publicArchive.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="cursor-pointer hover:bg-[#111318] transition-colors mx-2 my-1.5 rounded-lg border border-[#1e2130]"
                style={{ padding: '10px 12px' }}
              >
                <div className="font-semibold text-white text-sm mb-1.5">{c.title}</div>
                <div
                  className="inline-flex items-center gap-2 mb-2"
                  style={{ boxShadow: 'rgba(0,0,0,0.25) 0px 4px 4px 0px', border: '1px solid rgb(0,0,0)', borderRadius: 6, padding: '3px 6px' }}
                >
                  <span className="text-[#8892aa] text-[11px] font-mono-data">{CAT_ICON[c.category]} {CAT_LABEL[c.category].toUpperCase()}</span>
                  <span className="text-[#8892aa] text-xs">{c.location}</span>
                </div>
                {c.description && <p className="text-[#8892aa] text-xs mb-2 line-clamp-2">{c.description}</p>}
                <div className="flex items-end justify-between mt-2">
                  <span className="text-[#3b4260] text-[11px] font-mono-data">{fmtDate(c.approvedAt ?? c.updatedAt)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8892aa] text-xs">💬 {c.commentCount}</span>
                    <button
                      onClick={e => { e.stopPropagation(); onUpvote(c.id); }}
                      className={`flex items-center gap-1 text-xs font-mono-data font-semibold transition-colors ${user.upvotedIds.includes(c.id) ? 'text-[#f97316]' : 'text-[#8892aa] hover:text-[#f97316]'}`}
                    >
                      ▲ {c.upvotes + (user.upvotedIds.includes(c.id) ? 1 : 0)}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="fadein">
            {!user.phone ? (
              <div className="text-center py-4">
                <AvatarSVG size={80} className="mx-auto mb-4" />
                <div className="text-[#f97316] text-xs font-mono-data uppercase tracking-widest mb-2">WEB3 IDENTITY</div>
                <div className="text-white font-bold text-lg mb-2">Anonymous Account</div>
                <p className="text-[#8892aa] text-sm mb-6 leading-relaxed">Create a pseudonymous account. No personal info is ever shared with anyone.</p>
                <button onClick={onFileComplaint} className="w-full py-3 rounded-lg font-bold text-sm tracking-widest uppercase text-white" style={{ background: '#f97316' }}>
                  Create Anon. Account
                </button>
                <div className="text-[#3b4260] text-[10px] font-mono-data uppercase tracking-wider mt-4">Powered by Web3 · Zero Personal Data</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center pt-2">
                  <AvatarSVG size={64} className="mx-auto mb-2" />
                  <div className="text-[#f97316] text-[10px] font-mono-data uppercase tracking-widest mb-1">WEB3 IDENTITY</div>
                  <div className="text-white font-bold">{user.anonId}</div>
                  <div className="text-[#8892aa] text-xs mt-1">Member since {fmtDate(user.createdAt)}</div>
                </div>

                {/* Private contact */}
                <div className="rounded-lg border border-[#1e2130] overflow-hidden" style={{ background: '#141720' }}>
                  <div className="px-3 py-2 border-b border-[#1a1f2e]">
                    <div className="text-[10px] font-mono-data text-[#8892aa] uppercase tracking-wider">Private · Not visible to anyone</div>
                  </div>
                  {[
                    { label: 'PHONE', val: phoneVal, editing: editingPhone, setVal: setPhoneVal, toggle: () => setEditingPhone(p => !p) },
                    { label: 'EMAIL', val: emailVal, editing: editingEmail, setVal: setEmailVal, toggle: () => setEditingEmail(p => !p) },
                  ].map(f => (
                    <div key={f.label} className="px-3 py-2.5 flex items-center justify-between border-b border-[#1a1f2e] last:border-0">
                      <div>
                        <div className="text-[10px] font-mono-data text-[#3b4260] mb-0.5">{f.label}</div>
                        {f.editing
                          ? <input value={f.val} onChange={e => f.setVal(e.target.value)} className="bg-transparent text-white text-sm focus:outline-none border-b border-[#f97316] w-44" />
                          : <div className="text-white text-sm font-mono-data">{f.val || '—'}</div>
                        }
                      </div>
                      <button onClick={f.toggle} className="text-[11px] font-mono-data transition-colors hover:text-white" style={{ color: '#f97316' }}>
                        {f.editing ? 'Save' : 'Edit ✎'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* My complaints */}
                <div>
                  <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-2">My Complaints ({myComplaints.length})</div>
                  {myComplaints.length === 0 && <div className="text-[#3b4260] text-xs text-center py-3">No active complaints.</div>}
                  {myComplaints.map(c => (
                    <div
                      key={c.id}
                      onClick={() => onSelectComplaint(c)}
                      className="cursor-pointer rounded-lg border border-[#1e2130] px-3 py-2.5 mb-2 hover:border-[#252a3a] transition-colors"
                      style={{ background: '#141720' }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-white text-sm font-medium flex-1 leading-snug">{c.title}</div>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="text-[#3b4260] text-[11px] font-mono-data mt-1">{fmtDate(c.submittedAt)}</div>
                    </div>
                  ))}
                </div>

                {/* Personal archive */}
                <div>
                  <div className="text-[#8892aa] text-xs font-mono-data uppercase tracking-wider mb-2">Personal Archive ({personalArchive.length})</div>
                  {personalArchive.length === 0 && <div className="text-[#3b4260] text-xs text-center py-3">Approved complaints auto-move here after 24h.</div>}
                  {personalArchive.map(c => (
                    <div key={c.id} className="rounded-lg border border-[#1e2130] px-3 py-2.5 mb-2" style={{ background: '#0f1118' }}>
                      <div className="text-white text-sm font-medium mb-1 leading-snug">{c.title}</div>
                      <div className="text-[#3b4260] text-[11px] font-mono-data mb-2">{fmtDate(c.approvedAt ?? c.updatedAt)}</div>
                      <div className="flex gap-2">
                        <button onClick={() => onSelectComplaint(c)} className="text-xs text-[#8892aa] hover:text-white border border-[#252a3a] px-2 py-1 rounded-lg transition-colors">View</button>
                        <button
                          onClick={() => onReloadArchive(c)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg text-white transition-colors"
                          style={{ background: '#f97316' }}
                        >
                          ↺ Reload
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
