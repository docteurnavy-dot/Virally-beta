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
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

const funnelStageColors = {
  tofu: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" },
  mofu: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50" },
  bofu: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50" },
};

const statusColors = {
  draft: "bg-[#27272A] text-[#A1A1AA]",
  scheduled: "bg-[#3B82F6]/20 text-[#3B82F6]",
  published: "bg-emerald-500/20 text-emerald-400",
};

const contentTypes = [
  "Reel",
  "Carrusel",
  "Story",
  "Post",
  "Video largo",
  "Live",
  "Thread",
  "Newsletter",
];

export function CalendarView({ workspaceId, role }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Doc<"calendarEvents"> | null>(null);

  const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");

  const events = useQuery(api.calendar.getEvents, {
    workspaceId,
    startDate,
    endDate,
  });

  const createEvent = useMutation(api.calendar.createEvent);
  const updateEvent = useMutation(api.calendar.updateEvent);
  const deleteEvent = useMutation(api.calendar.deleteEvent);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    funnelStage: "tofu" as "tofu" | "mofu" | "bofu",
    status: "draft" as "draft" | "scheduled" | "published",
    contentType: "Reel",
  });

  const canEdit = role !== "viewer";

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Pad the start of the month to align with weekdays
  const firstDayOfMonth = startOfMonth(currentDate).getDay();
  const paddingDays = Array(firstDayOfMonth).fill(null);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) {
      toast.error("Título y fecha son requeridos");
      return;
    }

    try {
      await createEvent({
        workspaceId,
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        date: newEvent.date,
        time: newEvent.time || undefined,
        funnelStage: newEvent.funnelStage,
        status: newEvent.status,
        contentType: newEvent.contentType,
      });
      toast.success("Evento creado");
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        funnelStage: "tofu",
        status: "draft",
        contentType: "Reel",
      });
      setIsCreateOpen(false);
    } catch (error) {
      toast.error("Error al crear evento");
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      await updateEvent({
        eventId: editingEvent._id,
        title: editingEvent.title,
        description: editingEvent.description,
        date: editingEvent.date,
        time: editingEvent.time,
        funnelStage: editingEvent.funnelStage,
        status: editingEvent.status,
        contentType: editingEvent.contentType,
      });
      toast.success("Evento actualizado");
      setIsEditOpen(false);
      setEditingEvent(null);
    } catch (error) {
      toast.error("Error al actualizar evento");
    }
  };

  const handleDeleteEvent = async (eventId: Id<"calendarEvents">) => {
    try {
      await deleteEvent({ eventId });
      toast.success("Evento eliminado");
      setIsEditOpen(false);
      setEditingEvent(null);
    } catch (error) {
      toast.error("Error al eliminar evento");
    }
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events?.filter((e) => e.date === dateStr) || [];
  };

  const openCreateForDate = (date: Date) => {
    setNewEvent({
      ...newEvent,
      date: format(date, "yyyy-MM-dd"),
    });
    setIsCreateOpen(true);
  };

  return (
    <div className="flex h-full">
      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-white tracking-tight capitalize">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
            >
              <MessageSquare className="size-4 mr-2" />
              Chat IA
            </Button>
            {canEdit && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                    <Plus className="size-4 mr-2" />
                    Nuevo contenido
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#18181B] border-[#27272A] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Nuevo contenido</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Título</Label>
                      <Input
                        placeholder="Título del contenido"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="bg-[#27272A] border-[#3F3F46] text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Fecha</Label>
                        <Input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="bg-[#27272A] border-[#3F3F46] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Hora</Label>
                        <Input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="bg-[#27272A] border-[#3F3F46] text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Etapa del funnel</Label>
                        <Select
                          value={newEvent.funnelStage}
                          onValueChange={(v) => setNewEvent({ ...newEvent, funnelStage: v as "tofu" | "mofu" | "bofu" })}
                        >
                          <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                            <SelectItem value="tofu">TOFU - Awareness</SelectItem>
                            <SelectItem value="mofu">MOFU - Consideration</SelectItem>
                            <SelectItem value="bofu">BOFU - Decision</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Tipo de contenido</Label>
                        <Select
                          value={newEvent.contentType}
                          onValueChange={(v) => setNewEvent({ ...newEvent, contentType: v })}
                        >
                          <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                            {contentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Estado</Label>
                      <Select
                        value={newEvent.status}
                        onValueChange={(v) => setNewEvent({ ...newEvent, status: v as "draft" | "scheduled" | "published" })}
                      >
                        <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="scheduled">Programado</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Descripción</Label>
                      <Textarea
                        placeholder="Descripción del contenido..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="bg-[#27272A] border-[#3F3F46] text-white min-h-[80px]"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]">
                      Crear contenido
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Funnel Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#A1A1AA]">TOFU</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-[#A1A1AA]">MOFU</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-xs text-[#A1A1AA]">BOFU</span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-[#A1A1AA] py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                onClick={() => canEdit && openCreateForDate(day)}
                className={cn(
                  "aspect-square p-1 rounded-lg border transition-all duration-200 cursor-pointer",
                  isToday
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/10"
                    : "border-[#27272A] hover:border-[#3F3F46] bg-[#18181B]/50",
                  isSelected && "ring-2 ring-[#8B5CF6]"
                )}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday ? "text-[#8B5CF6]" : "text-[#A1A1AA]"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(event);
                          setIsEditOpen(true);
                        }}
                        className={cn(
                          "text-[10px] px-1 py-0.5 rounded truncate cursor-pointer",
                          funnelStageColors[event.funnelStage].bg,
                          funnelStageColors[event.funnelStage].text
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-[#A1A1AA] px-1">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="w-96 border-l border-[#27272A] bg-[#0A0A0A] flex flex-col">
          <div className="p-4 border-b border-[#27272A]">
            <h3 className="text-sm font-semibold text-white">Asistente de Estrategia</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Pega tu estrategia o genera una nueva
            </p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#18181B] border border-[#27272A]">
                <p className="text-sm text-[#A1A1AA]">
                  👋 ¡Hola! Soy tu asistente de estrategia de contenido. Puedes:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-[#A1A1AA]">
                  <li>• Pegar una estrategia de Claude/GPT</li>
                  <li>• Pedirme que genere una estrategia</li>
                  <li>• Optimizar contenido existente</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-[#27272A]">
            <Textarea
              placeholder="Escribe tu mensaje o pega tu estrategia..."
              className="bg-[#18181B] border-[#27272A] text-white min-h-[80px] resize-none"
            />
            <Button className="w-full mt-2 bg-[#8B5CF6] hover:bg-[#7C3AED]">
              Enviar
            </Button>
          </div>
        </div>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#18181B] border-[#27272A] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar contenido</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Título</Label>
                <Input
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white"
                  disabled={!canEdit}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Fecha</Label>
                  <Input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Hora</Label>
                  <Input
                    type="time"
                    value={editingEvent.time || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="bg-[#27272A] border-[#3F3F46] text-white"
                    disabled={!canEdit}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Etapa del funnel</Label>
                  <Select
                    value={editingEvent.funnelStage}
                    onValueChange={(v) => setEditingEvent({ ...editingEvent, funnelStage: v as "tofu" | "mofu" | "bofu" })}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                      <SelectItem value="tofu">TOFU - Awareness</SelectItem>
                      <SelectItem value="mofu">MOFU - Consideration</SelectItem>
                      <SelectItem value="bofu">BOFU - Decision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Estado</Label>
                  <Select
                    value={editingEvent.status}
                    onValueChange={(v) => setEditingEvent({ ...editingEvent, status: v as "draft" | "scheduled" | "published" })}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="scheduled">Programado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Descripción</Label>
                <Textarea
                  value={editingEvent.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white min-h-[80px]"
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
                    onClick={() => handleDeleteEvent(editingEvent._id)}
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
