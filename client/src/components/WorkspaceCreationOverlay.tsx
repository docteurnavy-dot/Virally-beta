import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface WorkspaceCreationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (workspaceId: Id<"workspaces">) => void;
  isManualCreation?: boolean;
}

export function WorkspaceCreationOverlay({
  isOpen,
  onClose,
  onWorkspaceCreated,
  isManualCreation = false,
}: WorkspaceCreationOverlayProps) {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createWorkspace = useMutation(api.workspaces.createWorkspace);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !niche.trim()) {
      toast.error("Nombre y nicho son requeridos");
      return;
    }

    setIsCreating(true);
    try {
      const id = await createWorkspace({
        name: name.trim(),
        niche: niche.trim(),
      });

      toast.success("¡Workspace creado!", {
        description: "Tu espacio de trabajo está listo",
      });

      setName("");
      setNiche("");
      onWorkspaceCreated(id);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Error al crear workspace");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSkip = () => {
    if (!isManualCreation) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60"
            style={{ backdropFilter: "blur(12px)" }}
            onClick={handleSkip}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-lg pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="p-8 rounded-3xl"
                style={{
                  background: "rgba(30, 30, 35, 0.95)",
                  backdropFilter: "blur(40px) saturate(180%)",
                  WebkitBackdropFilter: "blur(40px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
                }}
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(254, 137, 137, 0.7))",
                      boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    <Rocket className="size-8 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
                    {isManualCreation ? "Crear Workspace" : "Crea tu Primer Workspace"}
                  </h2>
                  <p className="text-white/60 text-sm font-normal">
                    Cada workspace representa una marca o proyecto
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">Nombre</Label>
                    <Input
                      placeholder="Ej: Mi Marca Personal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isCreating}
                      className="h-12 rounded-xl border-0 text-white placeholder:text-white/40"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm">Nicho</Label>
                    <Input
                      placeholder="Ej: Tech, Fitness, Lifestyle..."
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      disabled={isCreating}
                      className="h-12 rounded-xl border-0 text-white placeholder:text-white/40"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full h-12 rounded-xl text-base font-medium text-white"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                      boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    {isCreating ? "Creando..." : "Crear Workspace"}
                  </Button>

                  {/* Skip Link - only for first-time users */}
                  {!isManualCreation && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSkip}
                        className="text-sm text-white/50 hover:text-white/80 transition-colors"
                        disabled={isCreating}
                      >
                        Hacerlo más tarde
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
