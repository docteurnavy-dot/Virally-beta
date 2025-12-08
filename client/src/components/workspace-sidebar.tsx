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
  Sparkles,
  ChevronRight,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

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
    <div className="flex flex-col h-full w-64 bg-[#0A0A0A] border-r border-[#27272A]">
      {/* Header */}
      <div className="p-4 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Creator Hub</h1>
            <p className="text-xs text-[#A1A1AA]">Content Manager</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Pending Invitations */}
          {pendingInvitations && pendingInvitations.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider px-2 mb-2">
                Invitaciones pendientes
              </p>
              <div className="space-y-2">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.invitationId}
                    className="p-3 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30"
                  >
                    <p className="text-sm text-white font-medium mb-1">
                      {invitation.workspace.name}
                    </p>
                    <p className="text-xs text-[#A1A1AA] mb-2">
                      Invitado por {invitation.invitedBy.name || invitation.invitedBy.email}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-[#8B5CF6] hover:bg-[#7C3AED]"
                        onClick={() => handleAcceptInvitation(invitation.invitationId)}
                      >
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-[#A1A1AA] hover:text-white"
                        onClick={() => handleDeclineInvitation(invitation.invitationId)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4 bg-[#27272A]" />
            </div>
          )}

          {/* My Workspaces */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                Mis Workspaces
              </p>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
                  >
                    <Plus className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#18181B] border-[#27272A]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Crear Workspace</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateWorkspace} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Nombre de la marca</Label>
                      <Input
                        placeholder="Ej: Houdin, TEDx..."
                        value={newWorkspace.name}
                        onChange={(e) =>
                          setNewWorkspace({ ...newWorkspace, name: e.target.value })
                        }
                        className="bg-[#27272A] border-[#3F3F46] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Nicho</Label>
                      <Input
                        placeholder="Ej: IA Generativa, Tech Startups..."
                        value={newWorkspace.niche}
                        onChange={(e) =>
                          setNewWorkspace({ ...newWorkspace, niche: e.target.value })
                        }
                        className="bg-[#27272A] border-[#3F3F46] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Descripción (opcional)</Label>
                      <Input
                        placeholder="Breve descripción del proyecto..."
                        value={newWorkspace.description}
                        onChange={(e) =>
                          setNewWorkspace({ ...newWorkspace, description: e.target.value })
                        }
                        className="bg-[#27272A] border-[#3F3F46] text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]"
                      disabled={isCreating}
                    >
                      {isCreating ? "Creando..." : "Crear Workspace"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-1">
              {workspaces?.owned.map((workspace) => (
                <Tooltip key={workspace._id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectWorkspace(workspace._id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200",
                        selectedWorkspaceId === workspace._id
                          ? "bg-[#8B5CF6]/20 border border-[#8B5CF6]/50"
                          : "hover:bg-[#27272A] border border-transparent"
                      )}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold",
                          selectedWorkspaceId === workspace._id
                            ? "bg-[#8B5CF6] text-white"
                            : "bg-[#27272A] text-[#A1A1AA]"
                        )}
                      >
                        {getWorkspaceInitials(workspace.name)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm text-white truncate">{workspace.name}</p>
                        <p className="text-xs text-[#A1A1AA] truncate">{workspace.niche}</p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "size-4 text-[#A1A1AA] transition-transform",
                          selectedWorkspaceId === workspace._id && "text-[#8B5CF6]"
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#27272A] border-[#3F3F46]">
                    <p className="text-white">{workspace.name}</p>
                    <p className="text-xs text-[#A1A1AA]">{workspace.niche}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {(!workspaces?.owned || workspaces.owned.length === 0) && (
                <p className="text-xs text-[#A1A1AA] px-2 py-4 text-center">
                  No tienes workspaces aún
                </p>
              )}
            </div>
          </div>

          {/* Invited Workspaces */}
          {workspaces?.invited && workspaces.invited.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <Users className="size-3 text-[#A1A1AA]" />
                <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                  Compartidos conmigo
                </p>
              </div>
              <div className="space-y-1">
                {workspaces.invited.map((workspace) => (
                  <Tooltip key={workspace._id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectWorkspace(workspace._id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200",
                          selectedWorkspaceId === workspace._id
                            ? "bg-[#3B82F6]/20 border border-[#3B82F6]/50"
                            : "hover:bg-[#27272A] border border-transparent"
                        )}
                      >
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold",
                            selectedWorkspaceId === workspace._id
                              ? "bg-[#3B82F6] text-white"
                              : "bg-[#27272A] text-[#A1A1AA]"
                          )}
                        >
                          {getWorkspaceInitials(workspace.name)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm text-white truncate">{workspace.name}</p>
                          <p className="text-xs text-[#A1A1AA] truncate">
                            {workspace.role === "editor" ? "Editor" : "Viewer"}
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            "size-4 text-[#A1A1AA] transition-transform",
                            selectedWorkspaceId === workspace._id && "text-[#3B82F6]"
                          )}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#27272A] border-[#3F3F46]">
                      <p className="text-white">{workspace.name}</p>
                      <p className="text-xs text-[#A1A1AA]">{workspace.niche}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-[#27272A]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
            onClick={() => window.location.href = "/profile"}
          >
            <Settings className="size-4 mr-2" />
            Ajustes
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#A1A1AA] hover:text-red-400 hover:bg-[#27272A]"
            onClick={() => signOut()}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
