import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  withWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { mark: 28, text: "text-lg" },
  md: { mark: 40, text: "text-2xl" },
  lg: { mark: 56, text: "text-4xl" },
};

/** Crisp SVG mark: sheltered care path — a route curving into a protective home arc. */
export function CareRouteMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="crPath" x1="8" y1="48" x2="56" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1A4D3E" />
          <stop offset="1" stopColor="#3D9B74" />
        </linearGradient>
      </defs>
      {/* soft mist disc */}
      <circle cx="32" cy="32" r="30" fill="#E8F0EC" />
      {/* protective arc / shelter */}
      <path
        d="M14 38c2-14 12-22 18-22s16 8 18 22"
        stroke="url(#crPath)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* journey path */}
      <path
        d="M18 44c6-2 8-8 14-8s8 6 14 8"
        stroke="#2A6B56"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* presence nodes — family points along the route */}
      <circle cx="20" cy="43.5" r="2.4" fill="#1A4D3E" />
      <circle cx="32" cy="35.5" r="2.8" fill="#3D9B74" />
      <circle cx="44" cy="43.5" r="2.4" fill="#1A4D3E" />
      {/* gentle hearth glow at center */}
      <circle cx="32" cy="35.5" r="6" fill="#3D9B74" fillOpacity="0.18" />
    </svg>
  );
}

export function CareRouteLogo({ className, withWordmark = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <CareRouteMark size={s.mark} />
      {withWordmark && (
        <span className={cn("font-display font-semibold tracking-tight text-pine-deep", s.text)}>
          Care<span className="text-pine-mid">Route</span>
        </span>
      )}
    </div>
  );
}
