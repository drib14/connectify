/**
 * Connectify SVG Logo component.
 * @param {{ className?: string, gradientId?: string }} props
 */
export default function Logo({ className = "h-6 w-6", gradientId = "logo-grad" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M 70 30 A 25 25 0 1 0 70 70"
        stroke={`url(#${gradientId})`}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="50" r="6" fill={`url(#${gradientId})`} />
      <line
        x1="30"
        y1="50"
        x2="50"
        y2="50"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeDasharray="2 2"
      />
    </svg>
  );
}
