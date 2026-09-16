import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Complaint } from '../data';
import { intensityColor, intensityRadius, DOT_COLOR, STATUS_LABEL, CAT_LABEL, CAT_ICON } from '../data';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
  pickingLocation: boolean;
  onLocationPicked: (lat: number, lng: number) => void;
  userLat: number;
  userLng: number;
  anonId: string;
}

function makeComplaintIcon(c: Complaint) {
  const color = intensityColor(c.upvotes);
  const r = intensityRadius(c.upvotes);
  const total = r * 2 + 16;
  return L.divIcon({
    className: '',
    iconSize: [total, total],
    iconAnchor: [total / 2, total / 2],
    html: `
      <div style="position:relative;width:${total}px;height:${total}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:${color};opacity:0.25;animation:pulse-ring 2s ease-out infinite;transform-origin:center;"></div>
        <div style="width:${r}px;height:${r}px;border-radius:50%;background:${color};box-shadow:0 0 ${r + 4}px ${color}88;position:relative;z-index:2;"></div>
      </div>
    `,
  });
}

function makeUserIcon(anonId: string) {
  return L.divIcon({
    className: '',
    iconSize: [48, 58],
    iconAnchor: [24, 58],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:move;">
        <div style="background:#141720;border:2px solid #f97316;border-radius:50%;width:36px;height:36px;overflow:hidden;box-shadow:0 0 12px #f9731688;">
          <svg viewBox="0 0 100 100" width="36" height="36">
            <circle cx="50" cy="50" r="50" fill="#2d1b69"/>
            <ellipse cx="50" cy="34" rx="24" ry="22" fill="#1a0a3e"/>
            <circle cx="28" cy="38" r="10" fill="#1a0a3e"/>
            <circle cx="72" cy="38" r="10" fill="#1a0a3e"/>
            <circle cx="50" cy="22" r="12" fill="#1a0a3e"/>
            <ellipse cx="50" cy="46" rx="17" ry="18" fill="#7c5cbf"/>
            <circle cx="43" cy="43" r="3" fill="#1a0a3e"/>
            <circle cx="57" cy="43" r="3" fill="#1a0a3e"/>
            <path d="M43 52 Q50 57 57 52" stroke="#1a0a3e" stroke-width="2" stroke-linecap="round" fill="none"/>
            <path d="M25 100 Q25 72 50 70 Q75 72 75 100" fill="#5b3ea6"/>
          </svg>
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid #f97316;"></div>
        <div style="background:#f97316;border-radius:2px;padding:1px 4px;font-size:9px;color:white;font-family:'JetBrains Mono',monospace;margin-top:1px;white-space:nowrap;">${anonId.slice(0, 8)}</div>
      </div>
    `,
  });
}

export default function MapView({ complaints, onSelectComplaint, pickingLocation, onLocationPicked, userLat, userLng, anonId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    // Update timestamp every 30s
    const timer = setInterval(() => setLastUpdated(new Date().toLocaleTimeString('en-IN')), 30000);
    return () => {
      clearInterval(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Click handler for location picking
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pickingLocation) {
      L.DomUtil.addClass(map.getContainer(), 'leaflet-crosshair');
      const handler = (e: L.LeafletMouseEvent) => { onLocationPicked(e.latlng.lat, e.latlng.lng); };
      map.once('click', handler);
      return () => { L.DomUtil.removeClass(map.getContainer(), 'leaflet-crosshair'); };
    } else {
      L.DomUtil.removeClass(map.getContainer(), 'leaflet-crosshair');
    }
  }, [pickingLocation, onLocationPicked]);

  // Complaint markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    complaints.forEach(c => {
      const marker = L.marker([c.lat, c.lng], { icon: makeComplaintIcon(c) }).addTo(map);
      marker.bindPopup(() => {
        const div = document.createElement('div');
        div.style.cssText = 'padding:12px;min-width:200px;font-family:Outfit,sans-serif;';
        div.innerHTML = `
          <div style="font-size:10px;color:#f97316;font-family:'JetBrains Mono',monospace;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.1em">${CAT_LABEL[c.category]}</div>
          <div style="font-weight:700;color:#fff;font-size:13px;margin-bottom:4px;line-height:1.3">${c.title}</div>
          <div style="color:#8892aa;font-size:11px;margin-bottom:8px">${c.location}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#8892aa;font-family:'JetBrains Mono',monospace">
            <span>▲ ${c.upvotes}</span>
            <span>·</span>
            <span style="color:${DOT_COLOR[c.status]}">${STATUS_LABEL[c.status].toUpperCase()}</span>
          </div>
        `;
        div.onclick = () => { onSelectComplaint(c); map.closePopup(); };
        div.style.cursor = 'pointer';
        return div;
      }, { maxWidth: 240, closeButton: false });
      markersRef.current.push(marker);
    });
  }, [complaints]);

  // User location marker (draggable)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
      return;
    }
    const marker = L.marker([userLat, userLng], {
      icon: makeUserIcon(anonId),
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationPicked(pos.lat, pos.lng);
    });
    userMarkerRef.current = marker;
  }, [userLat, userLng, anonId]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-[400] pointer-events-none">
        <div className="glass rounded-lg px-3 py-1.5 border border-[#252a3a] text-[11px] font-mono-data text-[#8892aa] tracking-widest uppercase">
          CivicLens // Urban Issue Map // Live
        </div>
        <div className="glass rounded-lg px-3 py-1.5 border border-[#22c55e33] flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#4ade80] text-[10px] font-mono-data uppercase tracking-wider">Chain Live</span>
        </div>
      </div>

      {/* Location picking indicator */}
      {pickingLocation && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[400] glass rounded-lg px-4 py-2 border border-[#f97316] text-[#f97316] text-xs font-mono-data uppercase tracking-wider">
          Click anywhere on map to place complaint pin
        </div>
      )}

      {/* Intensity legend */}
      <div className="absolute bottom-8 left-3 z-[400] glass rounded-xl px-3 py-3 border border-[#252a3a]">
        <div className="text-[9px] font-mono-data text-[#8892aa] uppercase tracking-widest mb-2">Intensity</div>
        {[
          { color: '#ef4444', label: 'Critical (150+)' },
          { color: '#f97316', label: 'High (60–150)' },
          { color: '#eab308', label: 'Moderate (20–60)' },
          { color: '#f97316', label: 'Low (<20)', small: true },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 mb-1.5">
            <div className="rounded-full" style={{ width: item.small ? 6 : item.label.startsWith('M') ? 8 : item.label.startsWith('H') ? 10 : 13, height: item.small ? 6 : item.label.startsWith('M') ? 8 : item.label.startsWith('H') ? 10 : 13, background: item.color, boxShadow: `0 0 6px ${item.color}88` }} />
            <span className="text-[9px] font-mono-data text-[#8892aa]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Last updated */}
      <div className="absolute bottom-3 right-3 z-[400] glass rounded-lg px-3 py-2 border border-[#252a3a]">
        <div className="text-[9px] font-mono-data text-[#3b4260] uppercase tracking-wider">Last Updated</div>
        <div className="text-[#8892aa] text-xs font-mono-data">{lastUpdated}</div>
      </div>
    </div>
  );
}
