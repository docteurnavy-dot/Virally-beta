import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { WorkspaceHeader } from "@/components/workspace-header";
import { CalendarView } from "@/components/calendar-view";
import { IdeasView } from "@/components/ideas-view";
import { ScriptsView } from "@/components/scripts-view";
import { AnalyticsView } from "@/components/analytics-view";
import { SettingsView } from "@/components/settings-view";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "calendar" | "ideas" | "scripts" | "analytics" | "settings";

interface WorkspacePageProps {
  workspaceId: Id<"workspaces">;
  onBack: () => void;
}

export function WorkspacePage({ workspaceId, onBack }: WorkspacePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("calendar");

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId });

  if (workspace === undefined) {
    return (
      <div 
        className="flex-1 flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0A0A0D 0%, #0F0F12 100%)" }}
      >
        <LoadingSpinner className="size-8" />
      </div>
    );
  }

  if (workspace === null) {
    return (
      <div 
        className="flex-1 flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0A0A0D 0%, #0F0F12 100%)" }}
      >
        <div className="text-center">
          <p className="text-white text-lg mb-4">Workspace no encontrado</p>
          <button
            onClick={onBack}
            className="text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarView workspaceId={workspaceId} role={workspace.role} />;
      case "ideas":
        return <IdeasView workspaceId={workspaceId} role={workspace.role} />;
      case "scripts":
        return <ScriptsView workspaceId={workspaceId} role={workspace.role} />;
      case "analytics":
        return <AnalyticsView workspaceId={workspaceId} role={workspace.role} />;
      case "settings":
        return (
          <SettingsView
            workspaceId={workspaceId}
            workspace={workspace}
            onDelete={onBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A0A0D 0%, #0F0F12 100%)" }}
    >
      <WorkspaceHeader
        workspace={workspace}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDelete={onBack}
      />
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          className="flex-1 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
