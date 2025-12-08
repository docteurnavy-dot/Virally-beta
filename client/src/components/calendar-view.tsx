import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
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
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface CalendarViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

const funnelStageColors = {
  tofu: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50" },
  mofu: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50" },
  bofu: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50" },
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
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
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
    <motion.div 
      className="flex h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Calendar Grid */}
      <div className="flex-1 p-8">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-white tracking-tight capitalize">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9"
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9"
              >
                <ChevronRight className="size-4" strokeWidth={2} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-10"
            >
              <Sparkles className="size-4 mr-2" strokeWidth={2} />
              Chat IA
            </Button>
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
                    Nuevo contenido
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
                    <DialogTitle className="text-white text-lg">Nuevo contenido</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Título</Label>
                      <Input
                        placeholder="Título del contenido"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Fecha</Label>
                        <Input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-[#8B5CF6]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Hora</Label>
                        <Input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-[#8B5CF6]/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Etapa del funnel</Label>
                        <Select
                          value={newEvent.funnelStage}
                          onValueChange={(v) => setNewEvent({ ...newEvent, funnelStage: v as "tofu" | "mofu" | "bofu" })}
                        >
                          <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
                            <SelectItem value="tofu">TOFU - Awareness</SelectItem>
                            <SelectItem value="mofu">MOFU - Consideration</SelectItem>
                            <SelectItem value="bofu">BOFU - Decision</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Tipo de contenido</Label>
                        <Select
                          value={newEvent.contentType}
                          onValueChange={(v) => setNewEvent({ ...newEvent, contentType: v })}
                        >
                          <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
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
                      <Label className="text-white/70 text-sm">Estado</Label>
                      <Select
                        value={newEvent.status}
                        onValueChange={(v) => setNewEvent({ ...newEvent, status: v as "draft" | "scheduled" | "published" })}
                      >
                        <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="scheduled">Programado</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Descripción</Label>
                      <Textarea
                        placeholder="Descripción del contenido..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] rounded-xl focus:border-[#8B5CF6]/50"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-xl font-medium"
                      style={{
                        background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      }}
                    >
                      Crear contenido
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Funnel Legend */}
        <div 
          className="flex items-center gap-6 mb-6 px-4 py-3 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-white/50">TOFU - Awareness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-white/50">MOFU - Consideration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs text-white/50">BOFU - Decision</span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-white/40 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <motion.div
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDay(day);
                  if (canEdit) openCreateForDate(day);
                }}
                className={cn(
                  "aspect-square p-1.5 rounded-xl transition-all duration-200 cursor-pointer",
                  isToday
                    ? "ring-1 ring-[#8B5CF6] bg-[#8B5CF6]/10"
                    : "hover:bg-white/5",
                  isSelected && "ring-2 ring-[#8B5CF6]"
                )}
                style={{
                  background: isToday ? "rgba(139, 92, 246, 0.1)" : "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday ? "text-[#8B5CF6]" : "text-white/50"
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
                          "text-[10px] px-1.5 py-0.5 rounded-md truncate cursor-pointer transition-all hover:opacity-80",
                          funnelStageColors[event.funnelStage].bg,
                          funnelStageColors[event.funnelStage].text
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-white/40 px-1">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <motion.div 
          className="w-96 flex flex-col"
          style={{
            background: "linear-gradient(180deg, rgba(15, 15, 18, 0.98) 0%, rgba(10, 10, 13, 0.95) 100%)",
            borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="p-5"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#8B5CF6]" strokeWidth={2} />
              <h3 className="text-sm font-semibold text-white">Asistente de Estrategia</h3>
            </div>
            <p className="text-xs text-white/40 mt-1">
              Pega tu estrategia o genera una nueva
            </p>
          </div>
          <ScrollArea className="flex-1 p-5">
            <div className="space-y-4">
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                <p className="text-sm text-white/70">
                  👋 ¡Hola! Soy tu asistente de estrategia de contenido. Puedes:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/50">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#8B5CF6]" />
                    Pegar una estrategia de Claude/GPT
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#8B5CF6]" />
                    Pedirme que genere una estrategia
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#8B5CF6]" />
                    Optimizar contenido existente
                  </li>
                </ul>
              </div>
            </div>
          </ScrollArea>
          <div 
            className="p-5"
            style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
          >
            <Textarea
              placeholder="Escribe tu mensaje o pega tu estrategia..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none rounded-xl focus:border-[#8B5CF6]/50"
            />
            <Button 
              className="w-full mt-3 h-10 rounded-xl font-medium"
              style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
              }}
            >
              <Sparkles className="size-4 mr-2" strokeWidth={2} />
              Enviar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Edit Event Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
            <DialogTitle className="text-white text-lg">Editar contenido</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Título</Label>
                <Input
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-[#8B5CF6]/50"
                  disabled={!canEdit}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Fecha</Label>
                  <Input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-[#8B5CF6]/50"
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Hora</Label>
                  <Input
                    type="time"
                    value={editingEvent.time || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-[#8B5CF6]/50"
                    disabled={!canEdit}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Etapa del funnel</Label>
                  <Select
                    value={editingEvent.funnelStage}
                    onValueChange={(v) => setEditingEvent({ ...editingEvent, funnelStage: v as "tofu" | "mofu" | "bofu" })}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
                      <SelectItem value="tofu">TOFU - Awareness</SelectItem>
                      <SelectItem value="mofu">MOFU - Consideration</SelectItem>
                      <SelectItem value="bofu">BOFU - Decision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Estado</Label>
                  <Select
                    value={editingEvent.status}
                    onValueChange={(v) => setEditingEvent({ ...editingEvent, status: v as "draft" | "scheduled" | "published" })}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="scheduled">Programado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Descripción</Label>
                <Textarea
                  value={editingEvent.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] rounded-xl focus:border-[#8B5CF6]/50"
                  disabled={!canEdit}
                />
              </div>
              {canEdit && (
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 rounded-xl font-medium"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                    }}
                  >
                    Guardar cambios
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-11 w-11 rounded-xl"
                    onClick={() => handleDeleteEvent(editingEvent._id)}
                  >
                    <Trash2 className="size-4" strokeWidth={2} />
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
