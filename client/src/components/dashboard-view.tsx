import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Doc } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
  Lightbulb,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AIChat } from "@/components/ai-chat";

interface DashboardViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

export function DashboardView({ workspaceId }: DashboardViewProps) {
  const ideas = useQuery(api.ideas.getIdeas, { workspaceId });
  const scripts = useQuery(api.scripts.getScripts, { workspaceId });
  const events = useQuery(api.calendar.getEvents, { workspaceId });

  // Calculate real stats
  const totalIdeas = ideas?.length || 0;
  const totalScripts = scripts?.length || 0;
  const upcomingEvents = events?.filter(e => new Date(e.date) >= new Date()).length || 0;
  const completedScripts = scripts?.filter(s => s.status === "filmed").length || 0;

  const stats = [
    {
      id: "ideas",
      label: "Ideas",
      value: totalIdeas.toString(),
      icon: Lightbulb,
      color: "#F59E0B",
    },
    {
      id: "scripts",
      label: "Guiones",
      value: totalScripts.toString(),
      icon: FileText,
      color: "#8B5CF6",
    },
    {
      id: "events",
      label: "Eventos Próximos",
      value: upcomingEvents.toString(),
      icon: Calendar,
      color: "#3B82F6",
    },
    {
      id: "completed",
      label: "Guiones Finalizados",
      value: completedScripts.toString(),
      icon: Clock,
      color: "#10B981",
    },
  ];

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#6B6B78] mt-1">
            Resumen de tu rendimiento de contenido
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                className="p-6 rounded-2xl cursor-pointer transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(39, 39, 45, 0.5) 0%, rgba(39, 39, 45, 0.3) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -4,
                  borderColor: "rgba(139, 92, 246, 0.3)",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}20` }}
                  >
                    <Icon
                      className="size-5"
                      style={{ color: stat.color }}
                      strokeWidth={2}
                    />
                  </div>
                </div>
                <p className="text-[28px] font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-[#6B6B78]">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Ideas */}
          <motion.div
            className="col-span-2 p-6 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(39, 39, 45, 0.5) 0%, rgba(39, 39, 45, 0.3) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">
                Ideas Recientes
              </h2>
              <button className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {ideas?.slice(0, 4).map((idea: Doc<"ideas">, index: number) => (
                <motion.div
                  key={idea._id}
                  className="p-4 rounded-xl transition-all duration-300 cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{
                    background: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white mb-1">
                        {idea.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <ViralScoreBadge score={idea.viralScore} />
                        <span className="text-xs text-[#6B6B78]">
                          {idea.contentType}
                        </span>
                      </div>
                    </div>
                    <SourceBadge source={idea.source} />
                  </div>
                </motion.div>
              ))}
              {(!ideas || ideas.length === 0) && (
                <p className="text-sm text-[#6B6B78] text-center py-8">
                  No hay ideas aún. ¡Crea tu primera idea!
                </p>
              )}
            </div>
          </motion.div>

          {/* Upcoming Events Panel */}
          <motion.div
            className="p-6 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(39, 39, 45, 0.5) 0%, rgba(39, 39, 45, 0.3) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-[#8B5CF6]" />
                <h2 className="text-base font-semibold text-white">
                  Próximos Eventos
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              {events
                ?.filter((e) => new Date(e.date) >= new Date())
                .slice(0, 4)
                .map((event, index) => (
                  <motion.div
                    key={event._id}
                    className="p-4 rounded-xl transition-all duration-300 cursor-pointer"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{
                      background: "rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {event.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#6B6B78]">
                        📅 {format(new Date(event.date), "d MMM", { locale: es })}
                      </span>
                      <span className="text-xs text-[#8B5CF6]">
                        {event.contentType}
                      </span>
                    </div>
                  </motion.div>
                ))}
              {(!events || events.filter((e) => new Date(e.date) >= new Date()).length === 0) && (
                <p className="text-sm text-[#6B6B78] text-center py-8">
                  No hay eventos próximos
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Chat Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="h-[500px]">
            <AIChat workspaceId={workspaceId} />
          </div>
        </motion.div>
      </div>
    </ScrollArea>
  );
}

// Viral Score Badge Component
function ViralScoreBadge({
  score,
}: {
  score: "trending" | "viral" | "evergreen" | "not_relevant";
}) {
  const scoreConfig: Record<
    string,
    { bg: string; border: string; text: string; label: string }
  > = {
    viral: {
      bg: "rgba(139, 92, 246, 0.2)",
      border: "rgba(139, 92, 246, 0.3)",
      text: "#8B5CF6",
      label: "🔥 Viral",
    },
    trending: {
      bg: "rgba(59, 130, 246, 0.2)",
      border: "rgba(59, 130, 246, 0.3)",
      text: "#3B82F6",
      label: "📈 Trending",
    },
    evergreen: {
      bg: "rgba(16, 185, 129, 0.2)",
      border: "rgba(16, 185, 129, 0.3)",
      text: "#10B981",
      label: "🌲 Evergreen",
    },
    not_relevant: {
      bg: "rgba(107, 107, 120, 0.2)",
      border: "rgba(107, 107, 120, 0.3)",
      text: "#6B6B78",
      label: "No relevante",
    },
  };

  const config = scoreConfig[score] || scoreConfig.not_relevant;

  return (
    <span
      className="text-xs font-medium px-3 py-1 rounded-full"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
}

// Source Badge Component
function SourceBadge({
  source,
}: {
  source: "manual" | "competitor" | "trend" | "ai";
}) {
  const sourceConfig: Record<string, { icon: string; color: string }> = {
    manual: { icon: "✏️", color: "#A0A0AB" },
    competitor: { icon: "👀", color: "#F59E0B" },
    trend: { icon: "📊", color: "#3B82F6" },
    ai: { icon: "🤖", color: "#8B5CF6" },
  };

  const config = sourceConfig[source] || sourceConfig.manual;

  return (
    <span className="text-xs" style={{ color: config.color }}>
      {config.icon}
    </span>
  );
}


