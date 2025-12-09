import { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface VirallyLogoProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  size?: number;
  variant?: "full" | "icon" | "wordmark";
}

export function VirallyLogo({
  size = 32,
  variant = "full",
  className,
  ...props
}: VirallyLogoProps) {
  // Generate unique IDs for gradients to avoid conflicts
  const uniqueId = Math.random().toString(36).substring(7);
  const gradientId = `logoGradient-${uniqueId}`;
  const glowId = `glow-${uniqueId}`;

  if (variant === "wordmark") {
    return (
      <div className={cn("flex items-center", className)}>
        <span
          className="font-semibold tracking-tight"
          style={{
            fontSize: `${size * 0.6}px`,
            background: "linear-gradient(135deg, #8B5CF6 0%, #fe8989 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Viralit
        </span>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0F0F0" />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central node - main */}
          <circle
            cx="50"
            cy="70"
            r="8"
            fill={`url(#${gradientId})`}
            filter={`url(#${glowId})`}
          />

          {/* Left branch */}
          <line
            x1="50"
            y1="70"
            x2="25"
            y2="40"
            stroke={`url(#${gradientId})`}
            strokeWidth="3"
            opacity="0.8"
            strokeLinecap="round"
          />
          <circle cx="25" cy="40" r="6" fill={`url(#${gradientId})`} />

          {/* Left top node */}
          <line
            x1="25"
            y1="40"
            x2="15"
            y2="20"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            opacity="0.7"
            strokeLinecap="round"
          />
          <circle cx="15" cy="20" r="4" fill={`url(#${gradientId})`} opacity="0.9" />

          {/* Right branch */}
          <line
            x1="50"
            y1="70"
            x2="75"
            y2="40"
            stroke={`url(#${gradientId})`}
            strokeWidth="3"
            opacity="0.8"
            strokeLinecap="round"
          />
          <circle cx="75" cy="40" r="6" fill={`url(#${gradientId})`} />

          {/* Right top node */}
          <line
            x1="75"
            y1="40"
            x2="85"
            y2="20"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            opacity="0.7"
            strokeLinecap="round"
          />
          <circle cx="85" cy="20" r="4" fill={`url(#${gradientId})`} opacity="0.9" />

          {/* Extra connection nodes for network feel */}
          <line
            x1="25"
            y1="40"
            x2="35"
            y2="25"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.5"
            opacity="0.6"
            strokeLinecap="round"
          />
          <circle cx="35" cy="25" r="3" fill={`url(#${gradientId})`} opacity="0.8" />

          <line
            x1="75"
            y1="40"
            x2="65"
            y2="25"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.5"
            opacity="0.6"
            strokeLinecap="round"
          />
          <circle cx="65" cy="25" r="3" fill={`url(#${gradientId})`} opacity="0.8" />
        </svg>
        <span
          className="font-semibold tracking-tight text-white"
          style={{ fontSize: `${size * 0.6}px` }}
        >
          Viralit
        </span>
      </div>
    );
  }

  // Icon variant
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F0F0" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Central node - main */}
      <circle
        cx="50"
        cy="70"
        r="8"
        fill={`url(#${gradientId})`}
        filter={`url(#${glowId})`}
      />

      {/* Left branch */}
      <line
        x1="50"
        y1="70"
        x2="25"
        y2="40"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        opacity="0.8"
        strokeLinecap="round"
      />
      <circle cx="25" cy="40" r="6" fill={`url(#${gradientId})`} />

      {/* Left top node */}
      <line
        x1="25"
        y1="40"
        x2="15"
        y2="20"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        opacity="0.7"
        strokeLinecap="round"
      />
      <circle cx="15" cy="20" r="4" fill={`url(#${gradientId})`} opacity="0.9" />

      {/* Right branch */}
      <line
        x1="50"
        y1="70"
        x2="75"
        y2="40"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        opacity="0.8"
        strokeLinecap="round"
      />
      <circle cx="75" cy="40" r="6" fill={`url(#${gradientId})`} />

      {/* Right top node */}
      <line
        x1="75"
        y1="40"
        x2="85"
        y2="20"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        opacity="0.7"
        strokeLinecap="round"
      />
      <circle cx="85" cy="20" r="4" fill={`url(#${gradientId})`} opacity="0.9" />

      {/* Extra connection nodes for network feel */}
      <line
        x1="25"
        y1="40"
        x2="35"
        y2="25"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
      <circle cx="35" cy="25" r="3" fill={`url(#${gradientId})`} opacity="0.8" />

      <line
        x1="75"
        y1="40"
        x2="65"
        y2="25"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
      <circle cx="65" cy="25" r="3" fill={`url(#${gradientId})`} opacity="0.8" />
    </svg>
  );
}
