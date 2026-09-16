// Cartoon person avatar — purple skin, afro, matching the reference design
export default function AvatarSVG({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="#2d1b69" />
      {/* Afro hair */}
      <ellipse cx="50" cy="34" rx="24" ry="22" fill="#1a0a3e" />
      <circle cx="28" cy="38" r="10" fill="#1a0a3e" />
      <circle cx="72" cy="38" r="10" fill="#1a0a3e" />
      <circle cx="50" cy="22" r="12" fill="#1a0a3e" />
      {/* Face */}
      <ellipse cx="50" cy="46" rx="17" ry="18" fill="#7c5cbf" />
      {/* Eyes */}
      <circle cx="43" cy="43" r="3" fill="#1a0a3e" />
      <circle cx="57" cy="43" r="3" fill="#1a0a3e" />
      <circle cx="44" cy="42" r="1" fill="white" />
      <circle cx="58" cy="42" r="1" fill="white" />
      {/* Smile */}
      <path d="M43 52 Q50 57 57 52" stroke="#1a0a3e" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Body */}
      <path d="M25 100 Q25 72 50 70 Q75 72 75 100" fill="#5b3ea6" />
      {/* Collar */}
      <path d="M43 70 L50 78 L57 70" fill="#7c5cbf" />
    </svg>
  );
}
