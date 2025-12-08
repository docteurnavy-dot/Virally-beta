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
  Lightbulb,
  TrendingUp,
  Flame,
  Leaf,
  XCircle,
  Trash2,
  Edit2,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface IdeasViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

const viralPotentialConfig = {
  trending: {
    icon: TrendingUp,
    label: "Trending",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/20",
    border: "border-[#8B5CF6]/50",
  },
  viral: {
    icon: Flame,
    label: "Viral",
    color: "text-rose-400",
    bg: "bg-rose-500/20",
    border: "border-rose-500/50",
  },
  evergreen: {
    icon: Leaf,
    label: "Evergreen",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
  },
  not_relevant: {
    icon: XCircle,
    label: "No relevante",
    color: "text-[#A1A1AA]",
    bg: "bg-[#27272A]",
    border: "border-[#3F3F46]",
  },
};

const statusConfig = {
  new: { label: "Nueva", color: "bg-[#3B82F6]/20 text-[#3B82F6]" },
  in_progress: { label: "En progreso", color: "bg-amber-500/20 text-amber-400" },
  completed: { label: "Completada", color: "bg-emerald-500/20 text-emerald-400" },
  archived: { label: "Archivada", color: "bg-[#27272A] text-[#A1A1AA]" },
};

export function IdeasView({ workspaceId, role }: IdeasViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Doc<"ideas"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPotential, setFilterPotential] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const ideas = useQuery(api.ideas.getIdeas, { workspaceId });
  const createIdea = useMutation(api.ideas.createIdea);
  const updateIdea = useMutation(api.ideas.updateIdea);
  const deleteIdea = useMutation(api.ideas.deleteIdea);

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    source: "",
    viralPotential: "trending" as "trending" | "viral" | "evergreen" | "not_relevant",
    tags: "",
  });

  const canEdit = role !== "viewer";

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title.trim()) {
      toast.error("El título es requerido");
      return;
    }

    try {
      await createIdea({
        workspaceId,
        title: newIdea.title.trim(),
        description: newIdea.description.trim() || undefined,
        source: newIdea.source.trim() || undefined,
        viralPotential: newIdea.viralPotential,
        tags: newIdea.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Idea creada");
      setNewIdea({
        title: "",
        description: "",
        source: "",
        viralPotential: "trending",
        tags: "",
      });
      setIsCreateOpen(false);
    } catch (error) {
      toast.error("Error al crear idea");
    }
  };

  const handleUpdateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea) return;

    try {
      await updateIdea({
        ideaId: editingIdea._id,
        title: editingIdea.title,
        description: editingIdea.description,
        source: editingIdea.source,
        viralPotential: editingIdea.viralPotential,
        status: editingIdea.status,
        tags: editingIdea.tags,
      });
      toast.success("Idea actualizada");
      setIsEditOpen(false);
      setEditingIdea(null);
    } catch (error) {
      toast.error("Error al actualizar idea");
    }
  };

  const handleDeleteIdea = async (ideaId: Id<"ideas">) => {
    try {
      await deleteIdea({ ideaId });
      toast.success("Idea eliminada");
      setIsEditOpen(false);
      setEditingIdea(null);
    } catch (error) {
      toast.error("Error al eliminar idea");
    }
  };

  // Filter ideas
  const filteredIdeas = ideas?.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPotential =
      filterPotential === "all" || idea.viralPotential === filterPotential;
    const matchesStatus =
      filterStatus === "all" || idea.status === filterStatus;
    return matchesSearch && matchesPotential && matchesStatus;
  });

  // Group ideas by viral potential
  const groupedIdeas = {
    viral: filteredIdeas?.filter((i) => i.viralPotential === "viral") || [],
    trending: filteredIdeas?.filter((i) => i.viralPotential === "trending") || [],
    evergreen: filteredIdeas?.filter((i) => i.viralPotential === "evergreen") || [],
    not_relevant: filteredIdeas?.filter((i) => i.viralPotential === "not_relevant") || [],
  };

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Organizador de Ideas
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Captura y clasifica ideas según su potencial viral
          </p>
        </div>

        {canEdit && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                <Plus className="size-4 mr-2" />
                Nueva idea
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18181B] border-[#27272A] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Nueva idea</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateIdea} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Título</Label>
                  <Input
                    placeholder="Título de la idea"
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Descripción</Label>
                  <Textarea
                    placeholder="Describe la idea..."
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Fuente (opcional)</Label>
                  <Input
                    placeholder="URL o referencia de donde vino la idea"
                    value={newIdea.source}
                    onChange={(e) => setNewIdea({ ...newIdea, source: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Potencial viral</Label>
                  <Select
                    value={newIdea.viralPotential}
                    onValueChange={(v) =>
                      setNewIdea({
                        ...newIdea,
                        viralPotential: v as "trending" | "viral" | "evergreen" | "not_relevant",
                      })
                    }
                  >
                    <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                      <SelectItem value="viral">🔥 Viral</SelectItem>
                      <SelectItem value="trending">📈 Trending</SelectItem>
                      <SelectItem value="evergreen">🌿 Evergreen</SelectItem>
                      <SelectItem value="not_relevant">❌ No relevante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Tags (separados por coma)</Label>
                  <Input
                    placeholder="IA, marketing, viral..."
                    value={newIdea.tags}
                    onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]">
                  Crear idea
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#A1A1AA]" />
          <Input
            placeholder="Buscar ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#18181B] border-[#27272A] text-white"
          />
        </div>
        <Select value={filterPotential} onValueChange={setFilterPotential}>
          <SelectTrigger className="w-40 bg-[#18181B] border-[#27272A] text-white">
            <SelectValue placeholder="Potencial" />
          </SelectTrigger>
          <SelectContent className="bg-[#27272A] border-[#3F3F46]">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="viral">🔥 Viral</SelectItem>
            <SelectItem value="trending">📈 Trending</SelectItem>
            <SelectItem value="evergreen">🌿 Evergreen</SelectItem>
            <SelectItem value="not_relevant">❌ No relevante</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-[#18181B] border-[#27272A] text-white">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#27272A] border-[#3F3F46]">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Nueva</SelectItem>
            <SelectItem value="in_progress">En progreso</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="archived">Archivada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas Grid - Kanban style */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-4 gap-4 pb-6">
          {(["viral", "trending", "evergreen", "not_relevant"] as const).map((potential) => {
            const config = viralPotentialConfig[potential];
            const Icon = config.icon;
            const columnIdeas = groupedIdeas[potential];

            return (
              <div key={potential} className="flex flex-col">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg mb-3",
                    config.bg,
                    config.border,
                    "border"
                  )}
                >
                  <Icon className={cn("size-4", config.color)} />
                  <span className={cn("text-sm font-medium", config.color)}>
                    {config.label}
                  </span>
                  <Badge variant="secondary" className="ml-auto bg-[#27272A] text-[#A1A1AA]">
                    {columnIdeas.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {columnIdeas.map((idea) => (
                    <Card
                      key={idea._id}
                      className={cn(
                        "bg-[#18181B] border-[#27272A] cursor-pointer transition-all duration-200 hover:border-[#3F3F46]",
                        "hover:shadow-lg hover:shadow-black/20"
                      )}
                      onClick={() => {
                        setEditingIdea(idea);
                        setIsEditOpen(true);
                      }}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium text-white line-clamp-2">
                            {idea.title}
                          </h3>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {idea.description && (
                          <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-3">
                            {idea.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge
                            className={cn(
                              "text-[10px]",
                              statusConfig[idea.status].color
                            )}
                          >
                            {statusConfig[idea.status].label}
                          </Badge>
                          <span className="text-[10px] text-[#A1A1AA]">
                            {format(idea.createdAt, "d MMM", { locale: es })}
                          </span>
                        </div>
                        {idea.tags && idea.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {idea.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#27272A] text-[#A1A1AA]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {columnIdeas.length === 0 && (
                    <div className="text-center py-8 text-[#A1A1AA] text-sm">
                      Sin ideas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Edit Idea Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#18181B] border-[#27272A] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar idea</DialogTitle>
          </DialogHeader>
          {editingIdea && (
            <form onSubmit={handleUpdateIdea} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Título</Label>
                <Input
                  value={editingIdea.title}
                  onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Descripción</Label>
                <Textarea
                  value={editingIdea.description || ""}
                  onChange={(e) =>
                    setEditingIdea({ ...editingIdea, description: e.target.value })
                  }
                  className="bg-[#27272A] border-[#3F3F46] text-white min-h-[100px]"
                  disabled={!canEdit}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Potencial viral</Label>
                  <Select
                    value={editingIdea.viralPotential}
                    onValueChange={(v) =>
                      setEditingIdea({
                        ...editingIdea,
                        viralPotential: v as "trending" | "viral" | "evergreen" | "not_relevant",
                      })
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                      <SelectItem value="viral">🔥 Viral</SelectItem>
                      <SelectItem value="trending">📈 Trending</SelectItem>
                      <SelectItem value="evergreen">🌿 Evergreen</SelectItem>
                      <SelectItem value="not_relevant">❌ No relevante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Estado</Label>
                  <Select
                    value={editingIdea.status}
                    onValueChange={(v) =>
                      setEditingIdea({
                        ...editingIdea,
                        status: v as "new" | "in_progress" | "completed" | "archived",
                      })
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                      <SelectItem value="new">Nueva</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="archived">Archivada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Fuente</Label>
                <Input
                  value={editingIdea.source || ""}
                  onChange={(e) => setEditingIdea({ ...editingIdea, source: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white"
                  disabled={!canEdit}
                />
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED]">
                    Guardar cambios
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteIdea(editingIdea._id)}
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
