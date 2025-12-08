import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";


interface AppHeaderProps {
  selectedWorkspaceId: Id<"workspaces"> | null;
  onSelectWorkspace: (id: Id<"workspaces">) => void;
  onNewIdea: () => void;
}

export function AppHeader({
  selectedWorkspaceId,
  onSelectWorkspace,
  onNewIdea,
}: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    niche: "",
  });

  const workspaces = useQuery(api.workspaces.listMyWorkspaces);
  const currentUser = useQuery(api.users.me);
  const createWorkspace = useMutation(api.workspaces.createWorkspace);

  const allWorkspaces = [
    ...(workspaces?.owned || []),
    ...(workspaces?.invited || []),
  ];

  const selectedWorkspace = allWorkspaces.find(
    (w) => w._id === selectedWorkspaceId
  );

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
      });
      toast.success("Workspace creado");
      setNewWorkspace({ name: "", niche: "" });
      setIsCreateOpen(false);
      onSelectWorkspace(id);
    } catch {
      toast.error("Error al crear workspace");
    } finally {
      setIsCreating(false);
    }
  };

  const getWorkspaceInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getWorkspaceColor = (name: string) => {
    const colors = [
      "#8B5CF6",
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
    ];
    const index =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <header
      className="h-20 flex items-center justify-between px-6"
      style={{
        background: "#0A0A0D",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Left: Workspace Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {selectedWorkspace ? (
              <>
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
                  style={{
                    background: getWorkspaceColor(selectedWorkspace.name),
                  }}
                >
                  {getWorkspaceInitials(selectedWorkspace.name)}
                </div>
                <span className="text-sm font-medium text-white">
                  {selectedWorkspace.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-[#A0A0AB]">
                Seleccionar workspace
              </span>
            )}
            <ChevronDown className="size-4 text-[#6B6B78]" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 border-0 p-2"
          style={{
            background: "rgba(30, 30, 35, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {allWorkspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace._id}
              onClick={() => onSelectWorkspace(workspace._id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-white hover:bg-white/5"
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
                style={{ background: getWorkspaceColor(workspace.name) }}
              >
                {getWorkspaceInitials(workspace.name)}
              </div>
              <span className="flex-1 text-sm">{workspace.name}</span>
              {selectedWorkspaceId === workspace._id && (
                <Check className="size-4 text-[#8B5CF6]" />
              )}
            </DropdownMenuItem>
          ))}
          {allWorkspaces.length > 0 && <DropdownMenuSeparator className="bg-white/10 my-2" />}
          <DropdownMenuItem
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[#8B5CF6] hover:bg-white/5"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[#8B5CF6]/20">
              <Plus className="size-4" />
            </div>
            <span className="text-sm font-medium">Crear Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#6B6B78]" />
          <Input
            placeholder="Buscar ideas, guiones, tendencias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-11 pr-4 rounded-xl border-0 text-sm text-white placeholder:text-[#6B6B78]"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.button
          className="relative h-10 w-10 rounded-xl flex items-center justify-center text-[#6B6B78] hover:text-white transition-colors"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="size-5" strokeWidth={2} />
          <span
            className="absolute top-2 right-2 h-2 w-2 rounded-full"
            style={{ background: "#EF4444" }}
          />
        </motion.button>

        {/* New Idea Button */}
        <Button
          onClick={onNewIdea}
          className="h-10 px-4 rounded-xl text-sm font-medium text-white"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
            boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
          }}
        >
          <Plus className="size-4 mr-2" strokeWidth={2} />
          Nueva Idea
        </Button>

        {/* User Avatar */}
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage src={currentUser?.image} />
          <AvatarFallback
            className="text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
            }}
          >
            {currentUser?.name?.slice(0, 2).toUpperCase() ||
              currentUser?.email?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          className="border-0 p-0 overflow-hidden max-w-md"
          style={{
            background: "rgba(30, 30, 35, 0.95)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
          }}
        >
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold text-white tracking-tight">
                Crear Workspace
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWorkspace} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[#A0A0AB] text-sm">Nombre</Label>
                <Input
                  placeholder="Ej: Mi Marca"
                  value={newWorkspace.name}
                  onChange={(e) =>
                    setNewWorkspace({ ...newWorkspace, name: e.target.value })
                  }
                  className="h-12 rounded-xl border-0 text-white placeholder:text-[#6B6B78]"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#A0A0AB] text-sm">Nicho</Label>
                <Input
                  placeholder="Ej: Tech, Fitness, Lifestyle..."
                  value={newWorkspace.niche}
                  onChange={(e) =>
                    setNewWorkspace({ ...newWorkspace, niche: e.target.value })
                  }
                  className="h-12 rounded-xl border-0 text-white placeholder:text-[#6B6B78]"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full h-12 rounded-xl text-base font-medium text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                }}
              >
                {isCreating ? "Creando..." : "Crear Workspace"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
