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
  TrendingUp,
  Flame,
  Leaf,
  XCircle,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface IdeasViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

type ViralScoreType = "trending" | "viral" | "evergreen" | "not_relevant";
type SourceType = "manual" | "competitor" | "trend" | "ai";

const viralScoreConfig = {
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

const sourceLabels: Record<SourceType, string> = {
  manual: "Manual",
  competitor: "Competidor",
  trend: "Tendencia",
  ai: "IA",
};

export function IdeasView({ workspaceId, role }: IdeasViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Doc<"ideas"> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScore, setFilterScore] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  const ideas = useQuery(api.ideas.getIdeas, { workspaceId });
  const createIdea = useMutation(api.ideas.createIdea);
  const updateIdea = useMutation(api.ideas.updateIdea);
  const deleteIdea = useMutation(api.ideas.deleteIdea);

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    source: "manual" as SourceType,
    viralScore: "trending" as ViralScoreType,
    contentType: "reel",
    hooks: "",
    competitorName: "",
    competitorUrl: "",
    notes: "",
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
        description: newIdea.description.trim() || "",
        source: newIdea.source,
        viralScore: newIdea.viralScore,
        contentType: newIdea.contentType,
        hooks: newIdea.hooks
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        competitorName: newIdea.competitorName.trim() || undefined,
        competitorUrl: newIdea.competitorUrl.trim() || undefined,
        notes: newIdea.notes.trim() || undefined,
      });
      toast.success("Idea creada");
      setNewIdea({
        title: "",
        description: "",
        source: "manual",
        viralScore: "trending",
        contentType: "reel",
        hooks: "",
        competitorName: "",
        competitorUrl: "",
        notes: "",
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
        viralScore: editingIdea.viralScore,
        contentType: editingIdea.contentType,
        hooks: editingIdea.hooks,
        competitorName: editingIdea.competitorName,
        competitorUrl: editingIdea.competitorUrl,
        notes: editingIdea.notes,
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
    const matchesScore =
      filterScore === "all" || idea.viralScore === filterScore;
    const matchesSource =
      filterSource === "all" || idea.source === filterSource;
    return matchesSearch && matchesScore && matchesSource;
  });

  // Group ideas by viral score
  const groupedIdeas = {
    viral: filteredIdeas?.filter((i) => i.viralScore === "viral") || [],
    trending: filteredIdeas?.filter((i) => i.viralScore === "trending") || [],
    evergreen: filteredIdeas?.filter((i) => i.viralScore === "evergreen") || [],
    not_relevant: filteredIdeas?.filter((i) => i.viralScore === "not_relevant") || [],
  };

  return (
    <motion.div 
      className="p-8 h-full overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Organizador de Ideas
          </h2>
          <p className="text-sm text-white/40 mt-1">
            Captura y clasifica ideas según su potencial viral
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
                Nueva idea
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-md border-0"
              style={{
                background: "rgba(30, 30, 35, 0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "24px",
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-white text-lg">Nueva idea</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateIdea} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Título</Label>
                  <Input
                    placeholder="Título de la idea"
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Descripción</Label>
                  <Textarea
                    placeholder="Describe la idea..."
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Fuente</Label>
                    <Select
                      value={newIdea.source}
                      onValueChange={(v) => setNewIdea({ ...newIdea, source: v as SourceType })}
                    >
                      <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="competitor">Competidor</SelectItem>
                        <SelectItem value="trend">Tendencia</SelectItem>
                        <SelectItem value="ai">IA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Potencial viral</Label>
                    <Select
                      value={newIdea.viralScore}
                      onValueChange={(v) =>
                        setNewIdea({
                          ...newIdea,
                          viralScore: v as ViralScoreType,
                        })
                      }
                    >
                      <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
                        <SelectItem value="viral">🔥 Viral</SelectItem>
                        <SelectItem value="trending">📈 Trending</SelectItem>
                        <SelectItem value="evergreen">🌿 Evergreen</SelectItem>
                        <SelectItem value="not_relevant">❌ No relevante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Tipo de contenido</Label>
                  <Input
                    placeholder="reel, carousel, story..."
                    value={newIdea.contentType}
                    onChange={(e) => setNewIdea({ ...newIdea, contentType: e.target.value })}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Hooks (separados por coma)</Label>
                  <Input
                    placeholder="Hook 1, Hook 2..."
                    value={newIdea.hooks}
                    onChange={(e) => setNewIdea({ ...newIdea, hooks: e.target.value })}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl font-medium"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                  }}
                >
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" strokeWidth={2} />
          <Input
            placeholder="Buscar ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
          />
        </div>
        <Select value={filterScore} onValueChange={setFilterScore}>
          <SelectTrigger className="w-44 h-11 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="Potencial" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="viral">🔥 Viral</SelectItem>
            <SelectItem value="trending">📈 Trending</SelectItem>
            <SelectItem value="evergreen">🌿 Evergreen</SelectItem>
            <SelectItem value="not_relevant">❌ No relevante</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-44 h-11 bg-white/5 border-white/10 text-white rounded-xl">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="competitor">Competidor</SelectItem>
            <SelectItem value="trend">Tendencia</SelectItem>
            <SelectItem value="ai">IA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas Grid - Kanban style */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-4 gap-5 pb-6">
          {(["viral", "trending", "evergreen", "not_relevant"] as const).map((score) => {
            const config = viralScoreConfig[score];
            const Icon = config.icon;
            const columnIdeas = groupedIdeas[score];

            return (
              <div key={score} className="flex flex-col">
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4",
                    config.bg,
                    config.border,
                    "border"
                  )}
                >
                  <Icon className={cn("size-4", config.color)} strokeWidth={2} />
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
                          <Badge className="text-[10px] bg-[#27272A] text-[#A1A1AA]">
                            {sourceLabels[idea.source]}
                          </Badge>
                          <span className="text-[10px] text-[#A1A1AA]">
                            {format(idea.createdAt, "d MMM", { locale: es })}
                          </span>
                        </div>
                        {idea.hooks && idea.hooks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {idea.hooks.slice(0, 3).map((hook, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#27272A] text-[#A1A1AA]"
                              >
                                {hook}
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
                    value={editingIdea.viralScore}
                    onValueChange={(v) =>
                      setEditingIdea({
                        ...editingIdea,
                        viralScore: v as ViralScoreType,
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
                  <Label className="text-white">Fuente</Label>
                  <Select
                    value={editingIdea.source}
                    onValueChange={(v) =>
                      setEditingIdea({
                        ...editingIdea,
                        source: v as SourceType,
                      })
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="competitor">Competidor</SelectItem>
                      <SelectItem value="trend">Tendencia</SelectItem>
                      <SelectItem value="ai">IA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Tipo de contenido</Label>
                <Input
                  value={editingIdea.contentType || ""}
                  onChange={(e) => setEditingIdea({ ...editingIdea, contentType: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Hooks</Label>
                <Input
                  value={editingIdea.hooks?.join(", ") || ""}
                  onChange={(e) => setEditingIdea({ 
                    ...editingIdea, 
                    hooks: e.target.value.split(",").map(h => h.trim()).filter(Boolean) 
                  })}
                  className="bg-[#27272A] border-[#3F3F46] text-white"
                  disabled={!canEdit}
                  placeholder="Hook 1, Hook 2..."
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
    </motion.div>
  );
}
