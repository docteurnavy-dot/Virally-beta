import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  Lightbulb,
  Video,
  Users,
  Settings,
  Zap,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthActions } from "@convex-dev/auth/react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

const navItems: NavItem[] = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "calendar", label: "Calendario", icon: Calendar },
  { id: "ideas", label: "Ideas", icon: Lightbulb },
  { id: "scripts", label: "Guiones", icon: Video },
  { id: "team", label: "Equipo", icon: Users },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { signOut } = useAuthActions();

  return (
    <div
      className="flex flex-col h-full w-20 items-center py-4"
      style={{
        background: "linear-gradient(180deg, #0F0F12 0%, #1A1A1F 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Logo */}
      <motion.div
        className="h-12 w-12 rounded-2xl flex items-center justify-center mb-8 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.2)",
        }}
        whileHover={{ scale: 1.05 }}
        animate={{
          boxShadow: [
            "0 8px 24px rgba(139, 92, 246, 0.2)",
            "0 8px 32px rgba(139, 92, 246, 0.4)",
            "0 8px 24px rgba(139, 92, 246, 0.2)",
          ],
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        onClick={() => onTabChange("home")}
      >
        <Zap className="size-6 text-white" strokeWidth={1.5} />
      </motion.div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "relative h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive ? "text-white" : "text-[#6B6B78] hover:text-white"
                  )}
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)"
                      : "transparent",
                    boxShadow: isActive
                      ? "0 8px 24px rgba(139, 92, 246, 0.3)"
                      : "none",
                  }}
                  whileHover={{
                    backgroundColor: isActive
                      ? undefined
                      : "rgba(255, 255, 255, 0.05)",
                    scale: 1.05,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="size-5" strokeWidth={2} />
                  {item.badge && (
                    <span
                      className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-0 text-white"
                style={{
                  background: "rgba(30, 30, 35, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => (window.location.href = "/profile")}
              className="h-14 w-14 rounded-xl flex items-center justify-center text-[#6B6B78] hover:text-white transition-colors"
              whileHover={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="size-5" strokeWidth={2} />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="border-0 text-white"
            style={{
              background: "rgba(30, 30, 35, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            Ajustes
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => signOut()}
              className="h-14 w-14 rounded-xl flex items-center justify-center text-[#6B6B78] hover:text-[#EF4444] transition-colors"
              whileHover={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="size-5" strokeWidth={2} />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="border-0 text-white"
            style={{
              background: "rgba(30, 30, 35, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            Cerrar sesión
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
