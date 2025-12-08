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

const statusConfig = {
  draft: { label: "Borrador", color: "bg-[#27272A] text-[#A1A1AA]" },
  in_progress: { label: "En progreso", color: "bg-amber-500/20 text-amber-400" },
  ready: { label: "Listo", color: "bg-emerald-500/20 text-emerald-400" },
  published: { label: "Publicado", color: "bg-[#8B5CF6]/20 text-[#8B5CF6]" },
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
    if (!newScript.title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    try {
      await createScript({
        workspaceId,
        title: newScript.title.trim(),
        hook: newScript.hook.trim() || undefined,
        body: newScript.body.trim() || undefined,
        cta: newScript.cta.trim() || undefined,
        musicSuggestion: newScript.musicSuggestion.trim() || undefined,
        duration: newScript.duration ? parseInt(newScript.duration) : undefined,
        leadMagnet: newScript.leadMagnet.trim() || undefined,
        digitalProduct: newScript.digitalProduct.trim() || undefined,
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
    <div className="p-6 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Guiones de Video
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Crea y organiza guiones con hooks, CTAs y productos
          </p>
        </div>

        {canEdit && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                <Plus className="size-4 mr-2" />
                Nuevo guión
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18181B] border-[#27272A] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nuevo guión de video</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateScript} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Título del video</Label>
                  <Input
                    placeholder="Ej: 5 herramientas de IA que cambiarán tu vida"
                    value={newScript.title}
                    onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <Target className="size-4 text-[#8B5CF6]" />
                    Hook (primeros 3 segundos)
                  </Label>
                  <Textarea
                    placeholder="El gancho que captará la atención..."
                    value={newScript.hook}
                    onChange={(e) => setNewScript({ ...newScript, hook: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <FileText className="size-4 text-[#3B82F6]" />
                    Cuerpo del guión
                  </Label>
                  <Textarea
                    placeholder="El contenido principal del video..."
                    value={newScript.body}
                    onChange={(e) => setNewScript({ ...newScript, body: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Call to Action (CTA)</Label>
                  <Input
                    placeholder="Ej: Sígueme para más tips de IA"
                    value={newScript.cta}
                    onChange={(e) => setNewScript({ ...newScript, cta: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Music className="size-4 text-emerald-400" />
                      Música sugerida
                    </Label>
                    <Input
                      placeholder="Nombre de la canción o estilo"
                      value={newScript.musicSuggestion}
                      onChange={(e) =>
                        setNewScript({ ...newScript, musicSuggestion: e.target.value })
                      }
                      className="bg-[#27272A] border-[#3F3F46] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Clock className="size-4 text-amber-400" />
                      Duración (segundos)
                    </Label>
                    <Input
                      type="number"
                      placeholder="60"
                      value={newScript.duration}
                      onChange={(e) => setNewScript({ ...newScript, duration: e.target.value })}
                      className="bg-[#27272A] border-[#3F3F46] text-white"
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
                      placeholder="Ej: Guía gratuita de IA"
                      value={newScript.leadMagnet}
                      onChange={(e) => setNewScript({ ...newScript, leadMagnet: e.target.value })}
                      className="bg-[#27272A] border-[#3F3F46] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Producto Digital</Label>
                    <Input
                      placeholder="Ej: Curso de IA para creadores"
                      value={newScript.digitalProduct}
                      onChange={(e) =>
                        setNewScript({ ...newScript, digitalProduct: e.target.value })
                      }
                      className="bg-[#27272A] border-[#3F3F46] text-white"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]">
                  Crear guión
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#A1A1AA]" />
        <Input
          placeholder="Buscar guiones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[#18181B] border-[#27272A] text-white"
        />
      </div>

      {/* Scripts Grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {filteredScripts?.map((script) => (
            <Card
              key={script._id}
              className="bg-[#18181B] border-[#27272A] cursor-pointer transition-all duration-200 hover:border-[#3F3F46] hover:shadow-lg hover:shadow-black/20"
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
                    <p className="text-xs text-[#A1A1AA] line-clamp-2">{script.hook}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {script.duration && (
                    <div className="flex items-center gap-1 text-[10px] text-[#A1A1AA] bg-[#27272A] px-2 py-1 rounded">
                      <Clock className="size-3" />
                      {script.duration}s
                    </div>
                  )}
                  {script.musicSuggestion && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      <Music className="size-3" />
                      Música
                    </div>
                  )}
                  {script.leadMagnet && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
                      <Package className="size-3" />
                      Lead Magnet
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                  <span className="text-[10px] text-[#A1A1AA]">
                    {format(script.createdAt, "d MMM yyyy", { locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!filteredScripts || filteredScripts.length === 0) && (
            <div className="col-span-full text-center py-12">
              <FileText className="size-12 text-[#27272A] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No hay guiones aún</p>
              {canEdit && (
                <Button
                  className="mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED]"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="size-4 mr-2" />
                  Crear primer guión
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Script Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#18181B] border-[#27272A] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar guión</DialogTitle>
          </DialogHeader>
          {editingScript && (
            <form onSubmit={handleUpdateScript} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Título del video</Label>
                <Input
                  value={editingScript.title}
                  onChange={(e) => setEditingScript({ ...editingScript, title: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white"
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
                      status: v as "draft" | "in_progress" | "ready" | "published",
                    })
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="ready">Listo</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
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
                    Duración (segundos)
                  </Label>
                  <Input
                    type="number"
                    value={editingScript.duration || ""}
                    onChange={(e) =>
                      setEditingScript({
                        ...editingScript,
                        duration: e.target.value ? parseInt(e.target.value) : undefined,
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
