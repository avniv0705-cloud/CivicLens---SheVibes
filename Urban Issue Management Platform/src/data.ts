export type Status = 'submitted' | 'seen' | 'pending' | 'approved' | 'declined' | 'ongoing';
export type Category = 'pothole' | 'streetlight' | 'drainage' | 'garbage' | 'signage' | 'footpath' | 'other';

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  uploadedAt: string;
  uploadedBy: 'user' | 'authority';
}

export interface EditEntry {
  version: number;
  date: string;
  by: 'user' | 'authority';
  field: string;
  oldValue: string;
  newValue: string;
  note: string;
}

export interface Message {
  id: string;
  from: 'user' | 'authority';
  text: string;
  time: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: Category;
  location: string;
  ward: string;
  description: string;
  status: Status;
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
  media: MediaItem[];
  upvotes: number;
  lat: number;
  lng: number;
  intensity: 1 | 2 | 3;
  aiVerified: boolean;
  userApproved: boolean | null;
  approvedAt: string | null;
  feedback: string;
  editTrail: EditEntry[];
  messages: Message[];
  commentCount: number;
}

export interface UserProfile {
  id: string;
  anonId: string;
  phone: string;
  email: string;
  createdAt: string;
  upvotedIds: string[];
  personalArchive: string[]; // complaint IDs moved to personal archive
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr_local',
  anonId: 'anon_3r7x1',
  phone: '',
  email: '',
  createdAt: '2026-08-01T00:00:00',
  upvotedIds: [],
  personalArchive: ['CMP-0041'],
};

export const STATUS_LABEL: Record<Status, string> = {
  submitted: 'Submitted',
  seen: 'Seen',
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
  ongoing: 'Ongoing',
};

export const CAT_ICON: Record<Category, string> = {
  pothole: '🕳️',
  streetlight: '💡',
  drainage: '🌊',
  garbage: '♦',
  signage: '🚧',
  footpath: '👁',
  other: '📍',
};

export const CAT_LABEL: Record<Category, string> = {
  pothole: 'Road Damage',
  streetlight: 'Street Light',
  drainage: 'Drainage',
  garbage: 'Garbage/Waste',
  signage: 'Signage',
  footpath: 'Footpath',
  other: 'Other',
};

export const DOT_COLOR: Record<Status, string> = {
  submitted: '#3b82f6',
  seen: '#a78bfa',
  pending: '#fb923c',
  approved: '#22c55e',
  declined: '#6b7280',
  ongoing: '#f59e0b',
};

// Intensity color for map dots (by upvote count)
export function intensityColor(upvotes: number): string {
  if (upvotes >= 150) return '#ef4444'; // critical - red
  if (upvotes >= 60) return '#f97316';  // high - orange
  if (upvotes >= 20) return '#eab308';  // moderate - yellow
  return '#f97316';                     // low - orange
}

export function intensityLevel(upvotes: number): 'critical' | 'high' | 'moderate' | 'low' {
  if (upvotes >= 150) return 'critical';
  if (upvotes >= 60) return 'high';
  if (upvotes >= 20) return 'moderate';
  return 'low';
}

export function intensityRadius(upvotes: number): number {
  if (upvotes >= 150) return 14;
  if (upvotes >= 60) return 10;
  if (upvotes >= 20) return 7;
  return 5;
}

export const SAMPLE_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-0041',
    title: 'Large pothole on MG Road near Indiranagar junction',
    category: 'pothole',
    location: 'MG Road, Indiranagar Junction',
    ward: 'Ward 76 – Indiranagar',
    description: 'A 3-foot wide pothole has formed after the last monsoon. Two bikes have already skidded here. No barricades or warning signs have been placed.',
    status: 'approved',
    submittedBy: 'anon_3r7x1',
    submittedAt: '2026-08-14T09:22:00',
    updatedAt: '2026-09-02T14:10:00',
    approvedAt: '2026-09-02T14:10:00',
    media: [
      { id: 'm1', type: 'photo', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&h=400&fit=crop', caption: 'Before — pothole', uploadedAt: '2026-08-14T09:22:00', uploadedBy: 'user' },
      { id: 'm2', type: 'photo', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop', caption: 'After — road repaired', uploadedAt: '2026-09-02T14:10:00', uploadedBy: 'authority' },
    ],
    upvotes: 211,
    lat: 28.6129,
    lng: 77.2295,
    intensity: 3,
    aiVerified: true,
    userApproved: true,
    feedback: 'Road is smooth now. Work completed satisfactorily.',
    editTrail: [
      { version: 1, date: '2026-08-14T09:22:00', by: 'user', field: 'status', oldValue: '', newValue: 'submitted', note: 'Complaint submitted.' },
      { version: 2, date: '2026-08-20T11:00:00', by: 'authority', field: 'status', oldValue: 'submitted', newValue: 'seen', note: 'Marked as Seen by Ward Officer.' },
      { version: 3, date: '2026-08-28T08:30:00', by: 'authority', field: 'status', oldValue: 'seen', newValue: 'ongoing', note: 'Work order raised. Repair crew dispatched.' },
      { version: 4, date: '2026-09-02T14:10:00', by: 'authority', field: 'status', oldValue: 'ongoing', newValue: 'approved', note: 'Repair completed. After photo uploaded.' },
    ],
    messages: [
      { id: 'msg1', from: 'authority', text: 'We have noted your complaint. A team will inspect by 22nd Aug.', time: '2026-08-20T11:05:00' },
      { id: 'msg2', from: 'user', text: 'Thank you. Please also look at the drainage near the pit.', time: '2026-08-20T11:30:00' },
      { id: 'msg3', from: 'authority', text: 'Drainage issue forwarded to the relevant department.', time: '2026-08-21T09:00:00' },
    ],
    commentCount: 3,
  },
  {
    id: 'CMP-0052',
    title: 'Street light out for 3 weeks — Sector 14',
    category: 'streetlight',
    location: 'Sector 14, Gurugram',
    ward: 'Ward 22 – Sector 14',
    description: 'Four consecutive street lights non-functional for over three weeks. The stretch is completely dark at night, causing safety concerns for pedestrians.',
    status: 'seen',
    submittedBy: 'anon_2a1d7',
    submittedAt: '2026-09-02T19:45:00',
    updatedAt: '2026-09-07T10:00:00',
    approvedAt: null,
    media: [
      { id: 'm3', type: 'photo', url: 'https://images.unsplash.com/photo-1565620731358-e8c038abc8d1?w=600&h=400&fit=crop', caption: 'Dark stretch at night', uploadedAt: '2026-09-02T19:45:00', uploadedBy: 'user' },
    ],
    upvotes: 83,
    lat: 28.4595,
    lng: 77.0266,
    intensity: 2,
    aiVerified: true,
    userApproved: null,
    feedback: '',
    editTrail: [
      { version: 1, date: '2026-09-02T19:45:00', by: 'user', field: 'status', oldValue: '', newValue: 'submitted', note: 'Complaint submitted.' },
      { version: 2, date: '2026-09-07T10:00:00', by: 'authority', field: 'status', oldValue: 'submitted', newValue: 'seen', note: 'Seen by electricity department.' },
    ],
    messages: [
      { id: 'msg4', from: 'authority', text: 'Noted. Scheduling repairs.', time: '2026-09-07T10:05:00' },
    ],
    commentCount: 1,
  },
  {
    id: 'CMP-0067',
    title: 'Road completely broken — trucks avoid it',
    category: 'pothole',
    location: 'Yamuna Bank, East Delhi',
    ward: 'Ward 55 – Yamuna Bank',
    description: 'Road is completely broken with multiple large potholes. Trucks are avoiding this route causing additional congestion on parallel roads.',
    status: 'pending',
    submittedBy: 'anon_9k2p4',
    submittedAt: '2026-09-07T07:10:00',
    updatedAt: '2026-09-09T09:20:00',
    approvedAt: null,
    media: [
      { id: 'm5', type: 'photo', url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop', caption: 'Broken road surface', uploadedAt: '2026-09-07T07:10:00', uploadedBy: 'user' },
    ],
    upvotes: 211,
    lat: 28.6286,
    lng: 77.2997,
    intensity: 3,
    aiVerified: true,
    userApproved: null,
    feedback: '',
    editTrail: [
      { version: 1, date: '2026-09-07T07:10:00', by: 'user', field: 'status', oldValue: '', newValue: 'submitted', note: 'Complaint submitted.' },
      { version: 2, date: '2026-09-09T09:20:00', by: 'authority', field: 'status', oldValue: 'submitted', newValue: 'pending', note: 'Added to repair queue.' },
    ],
    messages: [],
    commentCount: 1,
  },
  {
    id: 'CMP-0078',
    title: 'Illegal garbage dump near school',
    category: 'garbage',
    location: 'Rohini, North Delhi',
    ward: 'Ward 33 – Rohini Sector 9',
    description: 'An illegal garbage dump has formed right next to a primary school. Stray animals scatter waste daily. Health hazard for children.',
    status: 'declined',
    submittedBy: 'anon_3r7x1',
    submittedAt: '2026-09-05T08:00:00',
    updatedAt: '2026-09-10T08:00:00',
    approvedAt: null,
    media: [
      { id: 'm6', type: 'photo', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop', caption: 'Garbage dump site', uploadedAt: '2026-09-05T08:00:00', uploadedBy: 'user' },
    ],
    upvotes: 31,
    lat: 28.7041,
    lng: 77.1025,
    intensity: 1,
    aiVerified: false,
    userApproved: null,
    feedback: '',
    editTrail: [
      { version: 1, date: '2026-09-05T08:00:00', by: 'user', field: 'status', oldValue: '', newValue: 'submitted', note: 'Complaint submitted.' },
      { version: 2, date: '2026-09-10T08:00:00', by: 'authority', field: 'status', oldValue: 'submitted', newValue: 'declined', note: 'Area under private land — not municipal jurisdiction. Refer to local RWA.' },
    ],
    messages: [
      { id: 'msg5', from: 'authority', text: 'This land falls outside municipal limits. Please contact your local RWA.', time: '2026-09-10T08:05:00' },
    ],
    commentCount: 1,
  },
  {
    id: 'CMP-0083',
    title: 'Broken footpath blocking wheelchair access',
    category: 'footpath',
    location: 'Karol Bagh, New Delhi',
    ward: 'Ward 61 – Karol Bagh',
    description: 'Tiles missing for 50m stretch. Elderly residents and wheelchair users forced onto road. This has been reported twice before with no action.',
    status: 'approved',
    submittedBy: 'anon_5m8n2',
    submittedAt: '2026-08-20T14:55:00',
    updatedAt: '2026-09-05T17:00:00',
    approvedAt: '2026-09-05T17:00:00',
    media: [
      { id: 'm7', type: 'photo', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop', caption: 'Broken footpath tiles', uploadedAt: '2026-08-20T14:55:00', uploadedBy: 'user' },
    ],
    upvotes: 124,
    lat: 28.6519,
    lng: 77.1909,
    intensity: 2,
    aiVerified: true,
    userApproved: null,
    feedback: '',
    editTrail: [
      { version: 1, date: '2026-08-20T14:55:00', by: 'user', field: 'status', oldValue: '', newValue: 'submitted', note: 'Complaint submitted with photos.' },
      { version: 2, date: '2026-08-30T10:00:00', by: 'authority', field: 'status', oldValue: 'submitted', newValue: 'ongoing', note: 'Repair scheduled.' },
      { version: 3, date: '2026-09-05T17:00:00', by: 'authority', field: 'status', oldValue: 'ongoing', newValue: 'approved', note: 'Footpath restored. 60m section relaid.' },
    ],
    messages: [
      { id: 'msg6', from: 'authority', text: 'Repair completed. Please verify and confirm.', time: '2026-09-05T17:10:00' },
    ],
    commentCount: 2,
  },
];
