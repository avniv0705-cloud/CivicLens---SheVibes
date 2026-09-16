import { useState, useCallback, useEffect } from 'react';
import type { Complaint, UserProfile } from './data';
import { SAMPLE_COMPLAINTS, DEFAULT_USER } from './data';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import ComplaintDetail from './components/ComplaintDetail';
import SubmitComplaint from './components/SubmitComplaint';
import Registration from './components/Registration';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(SAMPLE_COMPLAINTS);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  // Location state
  const [userLat, setUserLat] = useState(28.6139);
  const [userLng, setUserLng] = useState(77.2090);
  const [pickingLocation, setPickingLocation] = useState(false);
  const [pickedLat, setPickedLat] = useState<number | null>(null);
  const [pickedLng, setPickedLng] = useState<number | null>(null);

  // Try to get real user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => {}
      );
    }
  }, []);

  // Auto-move approved complaints to personal archive after 24h
  useEffect(() => {
    const now = Date.now();
    const toArchive = complaints
      .filter(c => c.status === 'approved' && c.submittedBy === user.anonId && c.approvedAt)
      .filter(c => now - new Date(c.approvedAt!).getTime() > 24 * 60 * 60 * 1000)
      .map(c => c.id)
      .filter(id => !user.personalArchive.includes(id));

    if (toArchive.length > 0) {
      setUser(u => ({ ...u, personalArchive: [...u.personalArchive, ...toArchive] }));
    }
  }, [complaints, user.anonId]);

  const updateComplaint = useCallback((updated: Complaint) => {
    setComplaints(cs => cs.map(c => c.id === updated.id ? updated : c));
    setSelectedComplaint(updated);
  }, []);

  const addComplaint = useCallback((c: Complaint) => {
    setComplaints(cs => [c, ...cs]);
  }, []);

  const handleUpvote = useCallback((id: string) => {
    if (user.upvotedIds.includes(id)) return;
    setUser(u => ({ ...u, upvotedIds: [...u.upvotedIds, id] }));
  }, [user.upvotedIds]);

  // "Reload" from personal archive → move back to submitted
  const handleReloadArchive = useCallback((c: Complaint) => {
    const now = new Date().toISOString();
    const reloaded: Complaint = {
      ...c,
      status: 'submitted',
      updatedAt: now,
      editTrail: [...c.editTrail, {
        version: c.editTrail.length + 1,
        date: now,
        by: 'user',
        field: 'status',
        oldValue: 'approved',
        newValue: 'submitted',
        note: 'Reloaded from personal archive by resident. Issue may have recurred.',
      }],
    };
    setUser(u => ({ ...u, personalArchive: u.personalArchive.filter(id => id !== c.id) }));
    setComplaints(cs => cs.map(x => x.id === c.id ? reloaded : x));
    setSelectedComplaint(reloaded);
  }, []);

  function handleFileComplaintClick() {
    if (!user.phone) {
      setShowRegistration(true);
    } else {
      setShowSubmit(true);
    }
  }

  function handleRegistrationComplete(phone: string, email: string) {
    setUser(u => ({ ...u, phone, email }));
    setShowRegistration(false);
    setShowSubmit(true);
  }

  const handleLocationPicked = useCallback((lat: number, lng: number) => {
    setPickedLat(lat);
    setPickedLng(lng);
    setPickingLocation(false);
  }, []);

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'approved').length,
    pending: complaints.filter(c => ['submitted', 'pending', 'ongoing', 'seen'].includes(c.status)).length,
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0e' }}>
      {/* ── LEFT SIDEBAR ── */}
      <div
        style={{
          width: '380px',
          minWidth: '320px',
          maxWidth: '420px',
          height: '100%',
          borderRight: '1px solid #1a1f2e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Sidebar
          complaints={complaints}
          user={user}
          onSelectComplaint={setSelectedComplaint}
          onFileComplaint={handleFileComplaintClick}
          onUpvote={handleUpvote}
          onReloadArchive={handleReloadArchive}
          stats={stats}
        />
      </div>

      {/* ── RIGHT MAP ── */}
      <div style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
        <MapView
          complaints={complaints}
          onSelectComplaint={setSelectedComplaint}
          pickingLocation={pickingLocation}
          onLocationPicked={handleLocationPicked}
          userLat={userLat}
          userLng={userLng}
          anonId={user.anonId}
        />
      </div>

      {/* ── OVERLAYS ── */}
      {selectedComplaint && (
        <ComplaintDetail
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={updateComplaint}
          onReapply={(original, edited) => {
            // Keep original in personal archive, add new copy as submitted
            setUser(u => ({ ...u, personalArchive: [...new Set([...u.personalArchive, original.id])] }));
            setComplaints(cs => [edited, ...cs]);
          }}
          myAnonId={user.anonId}
          upvoted={user.upvotedIds.includes(selectedComplaint.id)}
          onUpvote={() => handleUpvote(selectedComplaint.id)}
        />
      )}

      {showSubmit && (
        <SubmitComplaint
          anonId={user.anonId}
          pickingLocation={pickingLocation}
          pickedLat={pickedLat}
          pickedLng={pickedLng}
          onStartPickLocation={() => { setPickingLocation(true); setShowSubmit(false); }}
          onSubmit={c => { addComplaint(c); setShowSubmit(false); }}
          onClose={() => { setShowSubmit(false); setPickingLocation(false); }}
        />
      )}

      {showRegistration && (
        <Registration
          onComplete={handleRegistrationComplete}
          onClose={() => setShowRegistration(false)}
        />
      )}

      {/* Re-open submit after location picked */}
      {pickedLat && !showSubmit && !selectedComplaint && !showRegistration && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400]">
          <button
            onClick={() => setShowSubmit(true)}
            className="glass border border-[#f97316] text-[#f97316] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#f9731622] transition-colors"
          >
            📍 Location set — Continue filing complaint →
          </button>
        </div>
      )}
    </div>
  );
}
