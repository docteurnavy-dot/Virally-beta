import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Lightbulb,
  FileText,
  BarChart3,
  Settings,
  Users,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type TabType = "calendar" | "ideas" | "scripts" | "analytics" | "settings";

interface WorkspaceHeaderProps {
  workspace: Doc<"workspaces"> & { role: string; memberCount: number };
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onDelete?: () => void;
}

const tabs = [
  { id: "calendar" as const, label: "Calendario", icon: Calendar, color: "#8B5CF6" },
  { id: "ideas" as const, label: "Ideas", icon: Lightbulb, color: "#F59E0B" },
  { id: "scripts" as const, label: "Guiones", icon: FileText, color: "#10B981" },
  { id: "analytics" as const, label: "Analytics", icon: BarChart3, color: "#3B82F6" },
  { id: "settings" as const, label: "Ajustes", icon: Settings, color: "#71717A" },
];

export function WorkspaceHeader({
  workspace,
  activeTab,
  onTabChange,
  onDelete,
}: WorkspaceHeaderProps) {
  const isOwner = workspace.role === "owner";

  return (
    <div 
      className="border-b"
      style={{
        background: "rgba(15, 15, 18, 0.5)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Workspace Info */}
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                {workspace.name}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-medium rounded-lg px-2.5 py-0.5 border",
                  isOwner
                    ? "border-[#8B5CF6]/30 text-[#A78BFA] bg-[#8B5CF6]/10"
                    : workspace.role === "editor"
                      ? "border-[#3B82F6]/30 text-[#60A5FA] bg-[#3B82F6]/10"
                      : "border-white/10 text-white/50 bg-white/5"
                )}
              >
                {workspace.role === "owner"
                  ? "Propietario"
                  : workspace.role === "editor"
                    ? "Editor"
                    : "Viewer"}
              </Badge>
            </div>
            <p className="text-sm text-white/40 mt-1">{workspace.niche}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <Users className="size-4 text-white/40" strokeWidth={2} />
            <span className="text-white/60">{workspace.memberCount} miembro{workspace.memberCount !== 1 ? "s" : ""}</span>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9"
                >
                  <MoreVertical className="size-4" strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-0 min-w-[180px]"
                style={{
                  background: "rgba(30, 30, 35, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                }}
              >
                <DropdownMenuItem
                  onClick={() => onTabChange("settings")}
                  className="text-white/80 focus:bg-white/5 focus:text-white rounded-lg"
                >
                  <Settings className="size-4 mr-2" strokeWidth={2} />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400 rounded-lg"
                >
                  <Trash2 className="size-4 mr-2" strokeWidth={2} />
                  Eliminar workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          // Only show settings tab to owner/editor
          if (tab.id === "settings" && workspace.role === "viewer") {
            return null;
          }

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              )}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <Icon 
                className="size-4" 
                strokeWidth={2}
                style={{ color: isActive ? tab.color : undefined }}
              />
              {tab.label}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: tab.color }}
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
