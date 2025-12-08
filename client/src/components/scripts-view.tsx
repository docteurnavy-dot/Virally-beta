import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Plus,
  FileText,
  Music,
  Target,
  Package,
  Trash2,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ScriptsViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

type ScriptStatusType = "draft" | "ready" | "filmed";

const statusConfig: Record<ScriptStatusType, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-[#27272A] text-[#A1A1AA]" },
  ready: { label: "Listo", color: "bg-emerald-500/20 text-emerald-400" },
  filmed: { label: "Filmado", color: "bg-[#8B5CF6]/20 text-[#8B5CF6]" },
};

export function ScriptsView({ workspaceId, role }: ScriptsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<Doc<"videoScripts"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const scripts = useQuery(api.scripts.getScripts, { workspaceId });
  const createScript = useMutation(api.scripts.createScript);
  const updateScript = useMutation(api.scripts.updateScript);
  const deleteScript = useMutation(api.scripts.deleteScript);

  const [newScript, setNewScript] = useState({
    title: "",
    hook: "",
    body: "",
    cta: "",
    musicSuggestion: "",
    duration: "",
    leadMagnet: "",
    digitalProduct: "",
  });

  const canEdit = role !== "viewer";

  const handleCreateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScript.title.trim() || !newScript.hook.trim() || !newScript.body.trim() || !newScript.cta.trim()) {
      toast.error("Título, hook, cuerpo y CTA son requeridos");
      return;
    }

    try {
      await createScript({
        workspaceId,
        title: newScript.title.trim(),
        hook: newScript.hook.trim(),
        body: newScript.body.trim(),
        cta: newScript.cta.trim(),
        musicSuggestion: newScript.musicSuggestion.trim() || undefined,
        duration: newScript.duration.trim() || undefined,
        leadMagnet: newScript.leadMagnet.trim() || undefined,
        digitalProduct: newScript.digitalProduct.trim() || undefined,
        status: "draft",
      });
      toast.success("Guión creado");
      setNewScript({
        title: "",
        hook: "",
        body: "",
        cta: "",
        musicSuggestion: "",
        duration: "",
        leadMagnet: "",
        digitalProduct: "",
      });
      setIsCreateOpen(false);
    } catch (error) {
      toast.error("Error al crear guión");
    }
  };

  const handleUpdateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScript) return;

    try {
      await updateScript({
        scriptId: editingScript._id,
        title: editingScript.title,
        hook: editingScript.hook,
        body: editingScript.body,
        cta: editingScript.cta,
        musicSuggestion: editingScript.musicSuggestion,
        duration: editingScript.duration,
        leadMagnet: editingScript.leadMagnet,
        digitalProduct: editingScript.digitalProduct,
        status: editingScript.status,
      });
      toast.success("Guión actualizado");
      setIsEditOpen(false);
      setEditingScript(null);
    } catch (error) {
      toast.error("Error al actualizar guión");
    }
  };

  const handleDeleteScript = async (scriptId: Id<"videoScripts">) => {
    try {
      await deleteScript({ scriptId });
      toast.success("Guión eliminado");
      setIsEditOpen(false);
      setEditingScript(null);
    } catch (error) {
      toast.error("Error al eliminar guión");
    }
  };

  const filteredScripts = scripts?.filter((script) =>
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.hook?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Guiones de Video
          </h2>
          <p className="text-sm text-white/40 mt-1">
            Crea y organiza guiones con hooks, CTAs y productos
          </p>
        </div>

        {canEdit && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button 
                className="rounded-xl h-10"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                }}
              >
                <Plus className="size-4 mr-2" strokeWidth={2} />
                Nuevo guión
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-2xl max-h-[90vh] overflow-y-auto border-0"
              style={{
                background: "rgba(30, 30, 35, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-white text-lg">Nuevo guión de video</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateScript} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Título del video</Label>
                  <Input
                    placeholder="Ej: 5 herramientas de IA que cambiarán tu vida"
                    value={newScript.title}
                    onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm flex items-center gap-2">
                    <Target className="size-4 text-[#8B5CF6]" />
                    Hook (primeros 3 segundos)
                  </Label>
                  <Textarea
                    placeholder="El gancho que captará la atención..."
                    value={newScript.hook}
                    onChange={(e) => setNewScript({ ...newScript, hook: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm flex items-center gap-2">
                    <FileText className="size-4 text-[#3B82F6]" />
                    Cuerpo del guión
                  </Label>
                  <Textarea
                    placeholder="El contenido principal del video..."
                    value={newScript.body}
                    onChange={(e) => setNewScript({ ...newScript, body: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[150px] rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Call to Action (CTA)</Label>
                  <Input
                    placeholder="Ej: Sígueme para más tips de IA"
                    value={newScript.cta}
                    onChange={(e) => setNewScript({ ...newScript, cta: e.target.value })}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm flex items-center gap-2">
                      <Music className="size-4 text-emerald-400" />
                      Música sugerida
                    </Label>
                    <Input
                      placeholder="Nombre de la canción o estilo"
                      value={newScript.musicSuggestion}
                      onChange={(e) =>
                        setNewScript({ ...newScript, musicSuggestion: e.target.value })
                      }
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm flex items-center gap-2">
                      <Clock className="size-4 text-amber-400" />
                      Duración (segundos)
                    </Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={newScript.duration}
                      onChange={(e) => setNewScript({ ...newScript, duration: e.target.value })}
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm flex items-center gap-2">
                      <Package className="size-4 text-rose-400" />
                      Lead Magnet
                    </Label>
                    <Input
                      placeholder="Ej: Guía gratuita de IA"
                      value={newScript.leadMagnet}
                      onChange={(e) => setNewScript({ ...newScript, leadMagnet: e.target.value })}
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Producto Digital</Label>
                    <Input
                      placeholder="Ej: Curso de IA para creadores"
                      value={newScript.digitalProduct}
                      onChange={(e) =>
                        setNewScript({ ...newScript, digitalProduct: e.target.value })
                      }
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl font-medium"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                  }}
                >
                  Crear guión
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" strokeWidth={2} />
        <Input
          placeholder="Buscar guiones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
        />
      </div>

      {/* Scripts Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {filteredScripts?.map((script) => (
            <Card
              key={script._id}
              className="border-0 cursor-pointer transition-all duration-200 hover:-translate-y-1"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
              onClick={() => {
                setEditingScript(script);
                setIsEditOpen(true);
              }}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-white line-clamp-2 flex-1">
                    {script.title}
                  </h3>
                  <Badge className={cn("ml-2 text-[10px]", statusConfig[script.status].color)}>
                    {statusConfig[script.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {script.hook && (
                  <div className="flex items-start gap-2">
                    <Target className="size-3 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white/40 line-clamp-2">{script.hook}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {script.duration && (
                    <div className="flex items-center gap-1 text-[10px] text-white/50 bg-white/5 px-2 py-1 rounded-lg">
                      <Clock className="size-3" />
                      {script.duration}s
                    </div>
                  )}
                  {script.musicSuggestion && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <Music className="size-3" />
                      Música
                    </div>
                  )}
                  {script.leadMagnet && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg">
                      <Package className="size-3" />
                      Lead Magnet
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-white/40">
                    {format(script.createdAt, "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!filteredScripts || filteredScripts.length === 0) && (
            <div className="col-span-full text-center py-12">
              <FileText className="size-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40">No hay guiones aún</p>
              {canEdit && (
                <Button
                  className="mt-4 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                  }}
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="size-4 mr-2" strokeWidth={2} />
                  Crear primer guión
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Script Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto border-0"
          style={{
            background: "rgba(30, 30, 35, 0.95)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-lg">Editar guión</DialogTitle>
          </DialogHeader>
          {editingScript && (
            <form onSubmit={handleUpdateScript} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Título del video</Label>
                <Input
                  value={editingScript.title}
                  onChange={(e) => setEditingScript({ ...editingScript, title: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Estado</Label>
                <Select
                  value={editingScript.status}
                  onValueChange={(v) =>
                    setEditingScript({
                      ...editingScript,
                      status: v as ScriptStatusType,
                    })
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="ready">Listo</SelectItem>
                    <SelectItem value="filmed">Filmado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Target className="size-4 text-[#8B5CF6]" />
                  Hook
                </Label>
                <Textarea
                  value={editingScript.hook || ""}
                  onChange={(e) => setEditingScript({ ...editingScript, hook: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white min-h-[80px]"
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <FileText className="size-4 text-[#3B82F6]" />
                  Cuerpo del guión
                </Label>
                <Textarea
                  value={editingScript.body || ""}
                  onChange={(e) => setEditingScript({ ...editingScript, body: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white min-h-[150px]"
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Call to Action (CTA)</Label>
                <Input
                  value={editingScript.cta || ""}
                  onChange={(e) => setEditingScript({ ...editingScript, cta: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white"
                  disabled={!canEdit}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Music className="size-4 text-emerald-400" />
                    Música sugerida
                  </Label>
                  <Input
                    value={editingScript.musicSuggestion || ""}
                    onChange={(e) =>
                      setEditingScript({ ...editingScript, musicSuggestion: e.target.value })
                    }
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Clock className="size-4 text-amber-400" />
                    Duración
                  </Label>
                  <Input
                    placeholder="60s, 1min, etc."
                    value={editingScript.duration || ""}
                    onChange={(e) =>
                      setEditingScript({
                        ...editingScript,
                        duration: e.target.value || undefined,
                      })
                    }
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Package className="size-4 text-rose-400" />
                    Lead Magnet
                  </Label>
                  <Input
                    value={editingScript.leadMagnet || ""}
                    onChange={(e) =>
                      setEditingScript({ ...editingScript, leadMagnet: e.target.value })
                    }
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Producto Digital</Label>
                  <Input
                    value={editingScript.digitalProduct || ""}
                    onChange={(e) =>
                      setEditingScript({ ...editingScript, digitalProduct: e.target.value })
                    }
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED]">
                    Guardar cambios
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteScript(editingScript._id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
