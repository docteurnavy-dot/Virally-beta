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

type TabType = "calendar" | "ideas" | "scripts" | "analytics" | "settings";

interface WorkspaceHeaderProps {
  workspace: Doc<"workspaces"> & { role: string; memberCount: number };
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onDelete?: () => void;
}

const tabs = [
  { id: "calendar" as const, label: "Calendario", icon: Calendar },
  { id: "ideas" as const, label: "Ideas", icon: Lightbulb },
  { id: "scripts" as const, label: "Guiones", icon: FileText },
  { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { id: "settings" as const, label: "Ajustes", icon: Settings },
];

export function WorkspaceHeader({
  workspace,
  activeTab,
  onTabChange,
  onDelete,
}: WorkspaceHeaderProps) {
  const isOwner = workspace.role === "owner";

  return (
    <div className="border-b border-[#27272A] bg-[#0A0A0A]">
      {/* Workspace Info */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                {workspace.name}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  isOwner
                    ? "border-[#8B5CF6]/50 text-[#8B5CF6] bg-[#8B5CF6]/10"
                    : "border-[#3B82F6]/50 text-[#3B82F6] bg-[#3B82F6]/10"
                )}
              >
                {workspace.role === "owner"
                  ? "Propietario"
                  : workspace.role === "editor"
                    ? "Editor"
                    : "Viewer"}
              </Badge>
            </div>
            <p className="text-sm text-[#A1A1AA] mt-0.5">{workspace.niche}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
            <Users className="size-4" />
            <span>{workspace.memberCount} miembro{workspace.memberCount !== 1 ? "s" : ""}</span>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#18181B] border-[#27272A]"
              >
                <DropdownMenuItem
                  onClick={() => onTabChange("settings")}
                  className="text-white focus:bg-[#27272A] focus:text-white"
                >
                  <Settings className="size-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#27272A]" />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <Trash2 className="size-4 mr-2" />
                  Eliminar workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          // Only show settings tab to owner/editor
          if (tab.id === "settings" && workspace.role === "viewer") {
            return null;
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px",
                isActive
                  ? "text-[#8B5CF6] border-[#8B5CF6]"
                  : "text-[#A1A1AA] border-transparent hover:text-white hover:border-[#27272A]"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
