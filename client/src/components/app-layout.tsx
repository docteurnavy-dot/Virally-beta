import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { DashboardView } from "@/components/dashboard-view";
import { CalendarView } from "@/components/calendar-view";
import { IdeasView } from "@/components/ideas-view";
import { ScriptsView } from "@/components/scripts-view";
import { AnalyticsView } from "@/components/analytics-view";
import { SettingsView } from "@/components/settings-view";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export function AppLayout() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState<Id<"workspaces"> | null>(null);


  const workspaces = useQuery(api.workspaces.listMyWorkspaces);
  const selectedWorkspace = useQuery(
    api.workspaces.getWorkspace,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );

  // Auto-select first workspace if none selected
  if (
    !selectedWorkspaceId &&
    workspaces?.owned &&
    workspaces.owned.length > 0
  ) {
    setSelectedWorkspaceId(workspaces.owned[0]._id);
  }

  const renderContent = () => {
    if (!selectedWorkspaceId || !selectedWorkspace) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#A0A0AB] text-lg mb-2">
              Selecciona o crea un workspace
            </p>
            <p className="text-[#6B6B78] text-sm">
              para empezar a crear contenido viral
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <DashboardView
            workspaceId={selectedWorkspaceId}
            role={selectedWorkspace.role}
          />
        );
      case "calendar":
        return (
          <CalendarView
            workspaceId={selectedWorkspaceId}
            role={selectedWorkspace.role}
          />
        );
      case "ideas":
        return (
          <IdeasView
            workspaceId={selectedWorkspaceId}
            role={selectedWorkspace.role}
          />
        );
      case "scripts":
        return (
          <ScriptsView
            workspaceId={selectedWorkspaceId}
            role={selectedWorkspace.role}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            workspaceId={selectedWorkspaceId}
            role={selectedWorkspace.role}
          />
        );
      case "team":
        return selectedWorkspace ? (
          <SettingsView
            workspaceId={selectedWorkspaceId}
            workspace={selectedWorkspace}
            onDelete={() => setSelectedWorkspaceId(null)}
          />
        ) : null;
      default:
        return (
          <DashboardView
            workspaceId={selectedWorkspaceId}
            role={selectedWorkspace.role}
          />
        );
    }
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Shader Gradient Background */}
      <div className="fixed inset-0 z-0">
        <ShaderGradientCanvas
          style={{ position: "absolute", inset: 0 }}
          pixelDensity={1}
          fov={45}
        >
          <ShaderGradient
            animate="on"
            brightness={1.1}
            cAzimuthAngle={180}
            cDistance={3.9}
            cPolarAngle={115}
            cameraZoom={1}
            color1="#5606ff"
            color2="#fe8989"
            color3="#000000"
            envPreset="city"
            grain="off"
            lightType="3d"
            positionX={-0.5}
            positionY={0.1}
            positionZ={0}
            reflection={0.1}
            rotationX={0}
            rotationY={0}
            rotationZ={235}
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.1}
            uFrequency={5.5}
            uSpeed={0.1}
            uStrength={2.4}
            uTime={0.2}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </div>

      {/* App Container */}
      <div className="relative z-10 flex flex-1">
        {/* Sidebar - 80px */}
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col" style={{ background: "#0A0A0D" }}>
          {/* Header - 80px */}
          <AppHeader
            selectedWorkspaceId={selectedWorkspaceId}
            onSelectWorkspace={setSelectedWorkspaceId}
            onNewIdea={() => setActiveTab("ideas")}
          />

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.main
              key={activeTab}
              className="flex-1 overflow-auto"
              style={{ background: "#0A0A0D" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
