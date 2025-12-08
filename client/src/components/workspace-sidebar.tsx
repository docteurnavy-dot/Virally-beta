import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Zap,
  ChevronRight,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion } from "framer-motion";

interface WorkspaceSidebarProps {
  selectedWorkspaceId: Id<"workspaces"> | null;
  onSelectWorkspace: (id: Id<"workspaces">) => void;
}

export function WorkspaceSidebar({
  selectedWorkspaceId,
  onSelectWorkspace,
}: WorkspaceSidebarProps) {
  const { signOut } = useAuthActions();
  const workspaces = useQuery(api.workspaces.listMyWorkspaces);
  const createWorkspace = useMutation(api.workspaces.createWorkspace);
  const pendingInvitations = useQuery(api.workspaces.getMyPendingInvitations);
  const acceptInvitation = useMutation(api.workspaces.acceptInvitation);
  const declineInvitation = useMutation(api.workspaces.declineInvitation);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    niche: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

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
        description: newWorkspace.description.trim() || undefined,
      });
      toast.success("Workspace creado");
      setNewWorkspace({ name: "", niche: "", description: "" });
      setIsCreateOpen(false);
      onSelectWorkspace(id);
    } catch (error) {
      toast.error("Error al crear workspace");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: Id<"workspaceInvitations">) => {
    try {
      const workspaceId = await acceptInvitation({ invitationId });
      toast.success("Invitación aceptada");
      if (workspaceId) {
        onSelectWorkspace(workspaceId);
      }
    } catch (error) {
      toast.error("Error al aceptar invitación");
    }
  };

  const handleDeclineInvitation = async (invitationId: Id<"workspaceInvitations">) => {
    try {
      await declineInvitation({ invitationId });
      toast.success("Invitación rechazada");
    } catch (error) {
      toast.error("Error al rechazar invitación");
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

  return (
    <div 
      className="flex flex-col h-full w-[280px]"
      style={{
        background: "linear-gradient(180deg, rgba(15, 15, 18, 0.95) 0%, rgba(10, 10, 13, 0.98) 100%)",
        borderRight: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <motion.div 
            className="h-11 w-11 rounded-[14px] flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Zap className="size-6 text-white" strokeWidth={1.5} />
          </motion.div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">Virally</h1>
            <p className="text-xs text-white/40">Content Manager</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Pending Invitations */}
          {pendingInvitations && pendingInvitations.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider px-2 mb-3">
                Invitaciones pendientes
              </p>
              <div className="space-y-2">
                {pendingInvitations.map((invitation) => (
                  <motion.div
                    key={invitation.invitationId}
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(139, 92, 246, 0.08)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-sm text-white font-medium mb-1">
                      {invitation.workspace.name}
                    </p>
                    <p className="text-xs text-white/50 mb-3">
                      Invitado por {invitation.invitedBy.name || invitation.invitedBy.email}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 text-xs rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                        }}
                        onClick={() => handleAcceptInvitation(invitation.invitationId)}
                      >
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-white/50 hover:text-white hover:bg-white/5"
                        onClick={() => handleDeclineInvitation(invitation.invitationId)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Separator className="my-5 bg-white/[0.06]" />
            </div>
          )}

          {/* My Workspaces */}
          <div className="mb-5">
            <div className="flex items-center justify-between px-2 mb-3">
              <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                Mis Workspaces
              </p>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <Plus className="size-4" strokeWidth={2} />
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="border-0 p-0 overflow-hidden max-w-md"
                  style={{
                    background: "rgba(30, 30, 35, 0.95)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "24px",
                    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
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
                        <Label className="text-white/70 text-sm font-normal">Nombre de la marca</Label>
                        <Input
                          placeholder="Ej: Houdin, TEDx..."
                          value={newWorkspace.name}
                          onChange={(e) =>
                            setNewWorkspace({ ...newWorkspace, name: e.target.value })
                          }
                          className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm font-normal">Nicho</Label>
                        <Input
                          placeholder="Ej: IA Generativa, Tech Startups..."
                          value={newWorkspace.niche}
                          onChange={(e) =>
                            setNewWorkspace({ ...newWorkspace, niche: e.target.value })
                          }
                          className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm font-normal">Descripción (opcional)</Label>
                        <Input
                          placeholder="Breve descripción del proyecto..."
                          value={newWorkspace.description}
                          onChange={(e) =>
                            setNewWorkspace({ ...newWorkspace, description: e.target.value })
                          }
                          className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isCreating}
                        className="w-full h-12 rounded-xl text-base font-medium"
                        style={{
                          background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        {isCreating ? "Creando..." : "Crear Workspace"}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-1">
              {workspaces?.owned.map((workspace, index) => (
                <Tooltip key={workspace._id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => onSelectWorkspace(workspace._id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                        selectedWorkspaceId === workspace._id
                          ? "bg-white/[0.08]"
                          : "hover:bg-white/[0.04]"
                      )}
                      style={{
                        border: selectedWorkspaceId === workspace._id 
                          ? "1px solid rgba(139, 92, 246, 0.3)" 
                          : "1px solid transparent",
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 2 }}
                    >
                      <div
                        className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all",
                          selectedWorkspaceId === workspace._id
                            ? "text-white"
                            : "text-white/60"
                        )}
                        style={{
                          background: selectedWorkspaceId === workspace._id
                            ? "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)"
                            : "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        {getWorkspaceInitials(workspace.name)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm text-white truncate">{workspace.name}</p>
                        <p className="text-xs text-white/40 truncate">{workspace.niche}</p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "size-4 transition-all",
                          selectedWorkspaceId === workspace._id 
                            ? "text-[#8B5CF6]" 
                            : "text-white/20"
                        )}
                        strokeWidth={2}
                      />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="border-0"
                    style={{
                      background: "rgba(30, 30, 35, 0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <p className="text-white">{workspace.name}</p>
                    <p className="text-xs text-white/50">{workspace.niche}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {(!workspaces?.owned || workspaces.owned.length === 0) && (
                <p className="text-xs text-white/30 px-3 py-6 text-center">
                  No tienes workspaces aún
                </p>
              )}
            </div>
          </div>

          {/* Invited Workspaces */}
          {workspaces?.invited && workspaces.invited.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-3">
                <Users className="size-3 text-white/40" strokeWidth={2} />
                <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                  Compartidos conmigo
                </p>
              </div>
              <div className="space-y-1">
                {workspaces.invited.map((workspace, index) => (
                  <Tooltip key={workspace._id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => onSelectWorkspace(workspace._id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                          selectedWorkspaceId === workspace._id
                            ? "bg-white/[0.08]"
                            : "hover:bg-white/[0.04]"
                        )}
                        style={{
                          border: selectedWorkspaceId === workspace._id 
                            ? "1px solid rgba(59, 130, 246, 0.3)" 
                            : "1px solid transparent",
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 2 }}
                      >
                        <div
                          className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all",
                            selectedWorkspaceId === workspace._id
                              ? "bg-[#3B82F6] text-white"
                              : "bg-white/5 text-white/60"
                          )}
                        >
                          {getWorkspaceInitials(workspace.name)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm text-white truncate">{workspace.name}</p>
                          <p className="text-xs text-white/40 truncate">
                            {workspace.role === "editor" ? "Editor" : "Viewer"}
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            "size-4 transition-all",
                            selectedWorkspaceId === workspace._id 
                              ? "text-[#3B82F6]" 
                              : "text-white/20"
                          )}
                          strokeWidth={2}
                        />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="border-0"
                      style={{
                        background: "rgba(30, 30, 35, 0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <p className="text-white">{workspace.name}</p>
                      <p className="text-xs text-white/50">{workspace.niche}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start text-white/50 hover:text-white hover:bg-white/5 rounded-xl h-10"
            onClick={() => window.location.href = "/profile"}
          >
            <Settings className="size-4 mr-2" strokeWidth={2} />
            Ajustes
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-red-400 hover:bg-white/5 rounded-xl h-10 w-10"
            onClick={() => signOut()}
          >
            <LogOut className="size-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}
