import { cn } from "@/lib/utils";

const PETAL_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);
const DOT_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);

interface KolamMandalaProps {
  className?: string;
}

export function KolamMandala({ className }: KolamMandalaProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="97" strokeWidth="0.6" strokeDasharray="1.5 4" />
      <circle cx="100" cy="100" r="80" strokeWidth="0.7" />
      <circle cx="100" cy="100" r="46" strokeWidth="0.6" strokeDasharray="3 3" />
      {PETAL_ANGLES.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 100 100)`}>
          <path
            d="M100 100 C 88 80, 90 48, 100 30 C 110 48, 112 80, 100 100 Z"
            strokeWidth="0.8"
          />
          <path d="M100 30 C 92 24, 94 14, 100 12 C 106 14, 108 24, 100 30" strokeWidth="0.7" />
        </g>
      ))}
      {DOT_ANGLES.map((angle) => (
        <circle
          key={angle}
          cx="100"
          cy="8"
          r="1.6"
          fill="currentColor"
          stroke="none"
          transform={`rotate(${angle} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="14" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface KolamBorderProps {
  className?: string;
}

export function KolamBorder({ className }: KolamBorderProps) {
  return (
    <div
      className={cn("h-3 w-full", className)}
      aria-hidden="true"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12' viewBox='0 0 24 12'%3E%3Cpath d='M0 6 Q6 0 12 6 T24 6' fill='none' stroke='%23d9a43a' stroke-width='1'/%3E%3Ccircle cx='12' cy='6' r='1.4' fill='%23d9a43a'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat-x",
        backgroundSize: "24px 12px",
      }}
    />
  );
}
