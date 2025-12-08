import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LoadingLoginScreen() {
  return (
    <div 
      className="min-h-screen flex flex-col gap-6 items-center justify-center"
      style={{ background: "linear-gradient(180deg, #0A0A0D 0%, #0F0F12 100%)" }}
    >
      <LoadingSpinner className="size-7 text-white/40" />
    </div>
  );
}
