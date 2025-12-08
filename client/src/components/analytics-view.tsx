import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface AnalyticsViewProps {
  workspaceId: Id<"workspaces">;
  role: string;
}

const platformColors: Record<string, string> = {
  instagram: "#E4405F",
  tiktok: "#000000",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  other: "#8B5CF6",
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  other: "Otro",
};

type PlatformType = "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin" | "other";

export function AnalyticsView({ workspaceId, role }: AnalyticsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const endDate = format(new Date(), "yyyy-MM-dd");

  const analytics = useQuery(api.analyticsData.getAnalytics, {
    workspaceId,
    startDate,
    endDate,
    platform: selectedPlatform === "all" ? undefined : selectedPlatform as PlatformType,
  });

  const summary = useQuery(api.analyticsData.getAnalyticsSummary, {
    workspaceId,
    startDate,
    endDate,
  });

  const trends = useQuery(api.analyticsData.getAnalyticsTrend, {
    workspaceId,
    days: 30,
  });

  const createAnalytics = useMutation(api.analyticsData.createAnalyticsEntry);
  const deleteAnalytics = useMutation(api.analyticsData.deleteAnalyticsEntry);

  const [newEntry, setNewEntry] = useState({
    contentTitle: "",
    platform: "instagram" as PlatformType,
    publishedDate: format(new Date(), "yyyy-MM-dd"),
    views: "",
    likes: "",
    comments: "",
    shares: "",
    contentUrl: "",
  });

  const canEdit = role !== "viewer";

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.contentTitle.trim() || !newEntry.publishedDate) {
      toast.error("Título y fecha son requeridos");
      return;
    }

    try {
      await createAnalytics({
        workspaceId,
        contentTitle: newEntry.contentTitle.trim(),
        platform: newEntry.platform,
        publishedDate: newEntry.publishedDate,
        views: newEntry.views ? parseInt(newEntry.views) : 0,
        likes: newEntry.likes ? parseInt(newEntry.likes) : 0,
        comments: newEntry.comments ? parseInt(newEntry.comments) : 0,
        shares: newEntry.shares ? parseInt(newEntry.shares) : 0,
        contentUrl: newEntry.contentUrl.trim() || undefined,
      });
      toast.success("Métricas guardadas");
      setNewEntry({
        contentTitle: "",
        platform: "instagram",
        publishedDate: format(new Date(), "yyyy-MM-dd"),
        views: "",
        likes: "",
        comments: "",
        shares: "",
        contentUrl: "",
      });
      setIsCreateOpen(false);
    } catch (error) {
      toast.error("Error al guardar métricas");
    }
  };

  const handleDeleteEntry = async (entryId: Id<"analytics">) => {
    try {
      await deleteAnalytics({ entryId });
      toast.success("Entrada eliminada");
    } catch (error) {
      toast.error("Error al eliminar entrada");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Prepare chart data
  const chartData = trends?.map((t) => ({
    date: format(new Date(t.date), "d MMM", { locale: es }),
    views: t.views,
    likes: t.likes,
    comments: t.comments,
    shares: t.shares,
  })) || [];

  return (
    <div className="p-8 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-white/40 mt-1">
            Últimos 30 días de rendimiento
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40 h-10 bg-white/5 border-white/10 text-white rounded-xl">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>

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
                  Añadir métricas
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
                  <DialogTitle className="text-white text-lg">Añadir métricas de contenido</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">Título del contenido</Label>
                    <Input
                      placeholder="Ej: Reel sobre IA generativa"
                      value={newEntry.contentTitle}
                      onChange={(e) => setNewEntry({ ...newEntry, contentTitle: e.target.value })}
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Plataforma</Label>
                      <Select
                        value={newEntry.platform}
                        onValueChange={(v) => setNewEntry({ ...newEntry, platform: v as PlatformType })}
                      >
                        <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E1E23] border-white/10 rounded-xl">
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Fecha</Label>
                      <Input
                        type="date"
                        value={newEntry.publishedDate}
                        onChange={(e) => setNewEntry({ ...newEntry, publishedDate: e.target.value })}
                        className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-[#8B5CF6]/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm flex items-center gap-2">
                        <Eye className="size-4 text-[#8B5CF6]" />
                        Views
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newEntry.views}
                        onChange={(e) => setNewEntry({ ...newEntry, views: e.target.value })}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm flex items-center gap-2">
                        <Heart className="size-4 text-rose-400" />
                        Likes
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newEntry.likes}
                        onChange={(e) => setNewEntry({ ...newEntry, likes: e.target.value })}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm flex items-center gap-2">
                        <MessageCircle className="size-4 text-[#3B82F6]" />
                        Comentarios
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newEntry.comments}
                        onChange={(e) => setNewEntry({ ...newEntry, comments: e.target.value })}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm flex items-center gap-2">
                        <Share2 className="size-4 text-emerald-400" />
                        Shares
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newEntry.shares}
                        onChange={(e) => setNewEntry({ ...newEntry, shares: e.target.value })}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-sm">URL del contenido (opcional)</Label>
                    <Input
                      placeholder="https://..."
                      value={newEntry.contentUrl}
                      onChange={(e) => setNewEntry({ ...newEntry, contentUrl: e.target.value })}
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
                    Guardar métricas
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 pb-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card 
              className="border-0"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Total Views</p>
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(summary?.totals?.views || 0)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                    <Eye className="size-5 text-[#8B5CF6]" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-white/40">{summary?.totalPosts || 0} publicaciones</span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Total Likes</p>
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(summary?.totals?.likes || 0)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <Heart className="size-5 text-rose-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-white/40">Engagement: {summary?.engagementRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Comentarios</p>
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(summary?.totals?.comments || 0)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                    <MessageCircle className="size-5 text-[#3B82F6]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-0"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Shares</p>
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(summary?.totals?.shares || 0)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Share2 className="size-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card 
              className="border-0"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Tendencia de Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                      <YAxis stroke="#A1A1AA" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181B",
                          border: "1px solid #27272A",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#FFFFFF" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorViews)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          <Card className="bg-[#18181B] border-[#27272A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base">Entradas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#27272A]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: platformColors[entry.platform] }}
                      />
                      <div>
                        <p className="text-sm text-white font-medium">{entry.contentTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className="text-[10px]"
                            style={{
                              backgroundColor: `${platformColors[entry.platform]}20`,
                              color: platformColors[entry.platform],
                            }}
                          >
                            {platformLabels[entry.platform]}
                          </Badge>
                          <span className="text-xs text-[#A1A1AA]">
                            {format(new Date(entry.publishedDate), "d MMM", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-[#A1A1AA]">
                          <Eye className="size-3" />
                          <span>{formatNumber(entry.views)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#A1A1AA]">
                          <Heart className="size-3" />
                          <span>{formatNumber(entry.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#A1A1AA]">
                          <MessageCircle className="size-3" />
                          <span>{formatNumber(entry.comments)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#A1A1AA]">
                          <Share2 className="size-3" />
                          <span>{formatNumber(entry.shares)}</span>
                        </div>
                      </div>

                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#A1A1AA] hover:text-red-400"
                          onClick={() => handleDeleteEntry(entry._id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {(!analytics || analytics.length === 0) && (
                  <div className="text-center py-8">
                    <BarChart3 className="size-12 text-[#27272A] mx-auto mb-4" />
                    <p className="text-[#A1A1AA]">No hay datos de analytics aún</p>
                    {canEdit && (
                      <Button
                        className="mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED]"
                        onClick={() => setIsCreateOpen(true)}
                      >
                        <Plus className="size-4 mr-2" />
                        Añadir primera entrada
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
