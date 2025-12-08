import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { WorkspacePage } from "@/pages/workspace";
import { Zap, Plus, Calendar, Lightbulb, FileText, BarChart3, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

function EmptyState({ onCreateWorkspace }: { onCreateWorkspace: () => void }) {
  const features = [
    { icon: Calendar, label: "Calendario", desc: "TOFU, MOFU, BOFU", color: "#8B5CF6" },
    { icon: Lightbulb, label: "Ideas", desc: "Captura viral", color: "#F59E0B" },
    { icon: FileText, label: "Guiones", desc: "Hooks & CTAs", color: "#10B981" },
    { icon: BarChart3, label: "Analytics", desc: "Métricas", color: "#3B82F6" },
    { icon: TrendingUp, label: "Tendencias", desc: "Búsqueda web", color: "#EC4899" },
    { icon: Users, label: "Equipo", desc: "Colaboración", color: "#06B6D4" },
  ];

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background gradient orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none"
        style={{ background: "linear-gradient(135deg, #8B5CF6, #D946EF)" }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px] pointer-events-none"
        style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
      />

      <motion.div 
        className="max-w-2xl text-center px-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div 
          className="flex justify-center mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div 
            className="h-20 w-20 rounded-[24px] flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
              boxShadow: "0 8px 40px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset",
            }}
          >
            <Zap className="size-10 text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h1 
          className="text-4xl font-semibold text-white tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Bienvenido a Virally
        </motion.h1>
        
        <motion.p 
          className="text-lg text-white/50 mb-12 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Tu centro de comando para crear contenido viral. Organiza, planifica y analiza.
        </motion.p>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              className="group p-5 rounded-2xl cursor-default transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 mx-auto transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  background: `${feature.color}15`,
                }}
              >
                <feature.icon className="size-5" style={{ color: feature.color }} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{feature.label}</h3>
              <p className="text-xs text-white/40">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            onClick={onCreateWorkspace}
            className="h-14 px-10 rounded-2xl text-base font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))",
              color: "#000",
              boxShadow: "0 8px 32px rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.2) inset",
            }}
          >
            <Plus className="size-5 mr-2" strokeWidth={2} />
            Crear tu primer workspace
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Index() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    niche: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const createWorkspace = useMutation(api.workspaces.createWorkspace);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspace.name.trim() || !newWorkspace.niche.trim()) {
      toast.error("Nombre y nicho son requeridos");
      return;
    }

    setIsCreating(true);
    try {
      const id = await createWorkspace({
        name: newWorkspace.name.trim(),
        niche: newWorkspace.niche.trim(),
        description: newWorkspace.description.trim() || undefined,
      });
      toast.success("Workspace creado");
      setNewWorkspace({ name: "", niche: "", description: "" });
      setIsCreateOpen(false);
      setSelectedWorkspaceId(id);
    } catch (error) {
      toast.error("Error al crear workspace");
    } finally {
      setIsCreating(false);
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

      <div className="relative z-10 flex flex-1">
        <WorkspaceSidebar
          selectedWorkspaceId={selectedWorkspaceId}
          onSelectWorkspace={setSelectedWorkspaceId}
        />

        {selectedWorkspaceId ? (
          <WorkspacePage
            workspaceId={selectedWorkspaceId}
            onBack={() => setSelectedWorkspaceId(null)}
          />
        ) : (
          <EmptyState onCreateWorkspace={() => setIsCreateOpen(true)} />
        )}
      </div>

      {!selectedWorkspaceId && (
        <>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent 
              className="border-0 p-0 overflow-hidden max-w-md"
              style={{
                background: "rgba(30, 30, 35, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
                boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div className="p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-xl font-semibold text-white tracking-tight">
                    Crear Workspace
                  </DialogTitle>
                  <p className="text-sm text-white/50 mt-1">
                    Un espacio para cada marca o proyecto
                  </p>
                </DialogHeader>
                <form onSubmit={handleCreateWorkspace} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm font-normal">Nombre de la marca</Label>
                    <Input
                      placeholder="Ej: Houdin, TEDx..."
                      value={newWorkspace.name}
                      onChange={(e) =>
                        setNewWorkspace({ ...newWorkspace, name: e.target.value })
                      }
                      className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm font-normal">Nicho</Label>
                    <Input
                      placeholder="Ej: IA Generativa, Tech Startups..."
                      value={newWorkspace.niche}
                      onChange={(e) =>
                        setNewWorkspace({ ...newWorkspace, niche: e.target.value })
                      }
                      className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm font-normal">Descripción (opcional)</Label>
                    <Input
                      placeholder="Breve descripción del proyecto..."
                      value={newWorkspace.description}
                      onChange={(e) =>
                        setNewWorkspace({ ...newWorkspace, description: e.target.value })
                      }
                      className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full h-12 rounded-xl text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                      boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    {isCreating ? "Creando..." : "Crear Workspace"}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
