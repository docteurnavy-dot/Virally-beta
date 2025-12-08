import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "@/components/user-dropdown";
import { Zap } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div 
      className="flex min-h-screen w-full flex-col"
      style={{ background: "linear-gradient(180deg, #0A0A0D 0%, #0F0F12 100%)" }}
    >
      {/* Navigation Header */}
      <header 
        className="sticky top-0 z-50 w-full"
        style={{
          background: "rgba(10, 10, 13, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <nav className="flex items-center justify-between p-3 md:max-w-[1200px] mx-auto">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 group"
            >
              <div 
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                  boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
                }}
              >
                <Zap className="size-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-base font-semibold text-white tracking-tight">
                Virally
              </span>
            </button>
          </div>
          <UserDropdown />
        </nav>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
