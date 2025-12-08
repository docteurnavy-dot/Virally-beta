import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { WorkspacePage } from "@/pages/workspace";
import { Sparkles, Plus, Calendar, Lightbulb, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

function EmptyState({ onCreateWorkspace }: { onCreateWorkspace: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0A0A0A]">
      <div className="max-w-lg text-center px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-2xl shadow-[#8B5CF6]/30">
            <Sparkles className="size-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-white tracking-tight mb-4">
          Bienvenido a Creator Hub
        </h1>
        <p className="text-lg text-[#A1A1AA] mb-8">
          Tu centro de comando para crear contenido viral. Organiza ideas, planifica tu calendario y analiza el rendimiento.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
            <Calendar className="size-6 text-[#8B5CF6] mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Calendario</h3>
            <p className="text-xs text-[#A1A1AA]">Planifica con TOFU, MOFU, BOFU</p>
          </div>
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
            <Lightbulb className="size-6 text-[#3B82F6] mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Ideas</h3>
            <p className="text-xs text-[#A1A1AA]">Captura y puntúa ideas virales</p>
          </div>
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
            <FileText className="size-6 text-emerald-400 mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Guiones</h3>
            <p className="text-xs text-[#A1A1AA]">Crea scripts con hooks y CTAs</p>
          </div>
          <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
            <BarChart3 className="size-6 text-amber-400 mb-2" />
            <h3 className="text-sm font-medium text-white mb-1">Analytics</h3>
            <p className="text-xs text-[#A1A1AA]">Mide tu rendimiento</p>
          </div>
        </div>

        <Button
          onClick={onCreateWorkspace}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white font-medium h-12 px-8 shadow-lg shadow-[#8B5CF6]/25 transition-all duration-300 hover:shadow-[#8B5CF6]/40 hover:scale-[1.02]"
        >
          <Plus className="size-5 mr-2" />
          Crear tu primer workspace
        </Button>
      </div>
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
    <div className="flex h-screen bg-[#0A0A0A]">
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
        <>
          <EmptyState onCreateWorkspace={() => setIsCreateOpen(true)} />

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="bg-[#18181B] border-[#27272A]">
              <DialogHeader>
                <DialogTitle className="text-white">Crear Workspace</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Nombre de la marca</Label>
                  <Input
                    placeholder="Ej: Houdin, TEDx..."
                    value={newWorkspace.name}
                    onChange={(e) =>
                      setNewWorkspace({ ...newWorkspace, name: e.target.value })
                    }
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Nicho</Label>
                  <Input
                    placeholder="Ej: IA Generativa, Tech Startups..."
                    value={newWorkspace.niche}
                    onChange={(e) =>
                      setNewWorkspace({ ...newWorkspace, niche: e.target.value })
                    }
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Descripción (opcional)</Label>
                  <Input
                    placeholder="Breve descripción del proyecto..."
                    value={newWorkspace.description}
                    onChange={(e) =>
                      setNewWorkspace({ ...newWorkspace, description: e.target.value })
                    }
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]"
                  disabled={isCreating}
                >
                  {isCreating ? "Creando..." : "Crear Workspace"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
