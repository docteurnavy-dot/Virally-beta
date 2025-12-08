import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Doc } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
  Eye,
  MessageSquare,
  Lightbulb,
  Star,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

const stats = [
  {
    id: "views",
    label: "Total Views",
    value: "124.5K",
    change: "+12.5%",
    icon: Eye,
    color: "#3B82F6",
  },
  {
    id: "engagement",
    label: "Engagement Rate",
    value: "8.2%",
    change: "+2.1%",
    icon: MessageSquare,
    color: "#10B981",
  },
  {
    id: "ideas",
    label: "Ideas This Month",
    value: "24",
    change: "+8",
    icon: Lightbulb,
    color: "#F59E0B",
  },
  {
    id: "viral",
    label: "Viral Score Avg",
    value: "87",
    change: "+5",
    icon: Star,
    color: "#8B5CF6",
  },
];

export function DashboardView({ workspaceId }: DashboardViewProps) {
  const ideas = useQuery(api.ideas.getIdeas, { workspaceId });

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
                  <span
                    className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                    style={{
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#10B981",
                    }}
                  >
                    <ArrowUpRight className="size-3" />
                    {stat.change}
                  </span>
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

          {/* Trending Panel */}
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
                <TrendingUp className="size-4 text-[#8B5CF6]" />
                <h2 className="text-base font-semibold text-white">
                  Tendencias
                </h2>
              </div>
              <button className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors">
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {trendingItems.map((item, index) => (
                <motion.div
                  key={item.id}
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
                      {item.title}
                    </span>
                    {item.isHot && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#EF4444",
                        }}
                      >
                        HOT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B6B78]">
                      🎯 {item.platform}
                    </span>
                    <span className="text-xs text-[#10B981]">
                      +{item.growth}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
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

// Mock trending data
const trendingItems = [
  {
    id: "1",
    title: "AI Productivity Tools",
    platform: "TikTok",
    growth: 234,
    isHot: true,
  },
  {
    id: "2",
    title: "Morning Routines",
    platform: "Instagram",
    growth: 156,
    isHot: true,
  },
  {
    id: "3",
    title: "Remote Work Tips",
    platform: "LinkedIn",
    growth: 89,
    isHot: false,
  },
  {
    id: "4",
    title: "Minimalist Living",
    platform: "YouTube",
    growth: 67,
    isHot: false,
  },
];
