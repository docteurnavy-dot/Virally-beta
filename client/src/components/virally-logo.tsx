import { cn } from "@/lib/utils";

interface VirallyLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function VirallyLogo({ size = "md", className, showText = false }: VirallyLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative rounded-2xl flex items-center justify-center",
          "shadow-2xl",
          sizeClasses[size]
        )}
        style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
        }}
      >
        {/* 3D Cross Icon inspired by the reference */}
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0e0ff" />
            </linearGradient>
          </defs>
          {/* Plus/Cross shape */}
          <path
            d="M12 2C12 2 12 2 12 2V10H20C20 10 20 10 20 10C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14H12V22C12 22 12 22 12 22C12 23.1 11.1 24 10 24H14C12.9 24 12 23.1 12 22V14H4C4 14 4 14 4 14C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H12V2C12 2 12 2 12 2C12 0.9 12.9 0 14 0H10C11.1 0 12 0.9 12 2Z"
            fill="url(#crossGradient)"
          />
          {/* Simplified cross */}
          <rect x="10" y="4" width="4" height="16" rx="2" fill="white" />
          <rect x="4" y="10" width="16" height="4" rx="2" fill="white" />
        </svg>
        
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
            filter: "blur(20px)",
            opacity: 0.5,
            zIndex: -1,
          }}
        />
      </div>
      
      {showText && (
        <span
          className="text-2xl font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Virally
        </span>
      )}
    </div>
  );
}
