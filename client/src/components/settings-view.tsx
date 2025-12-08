import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
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
  DialogDescription,
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
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  workspaceId: Id<"workspaces">;
  workspace: Doc<"workspaces"> & { role: string; memberCount: number };
  onDelete: () => void;
}

type MemberRole = "owner" | "editor" | "viewer";

const roleLabels: Record<MemberRole, string> = {
  owner: "Propietario",
  editor: "Editor",
  viewer: "Viewer",
};

const roleColors: Record<MemberRole, string> = {
  owner: "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/50",
  editor: "bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/50",
  viewer: "bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]",
};

export function SettingsView({ workspaceId, workspace, onDelete }: SettingsViewProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [isUpdating, setIsUpdating] = useState(false);

  const membersData = useQuery(api.workspaces.getWorkspaceMembers, { workspaceId });
  const pendingInvitations = useQuery(
    api.workspaces.getPendingInvitations,
    workspace.role === "owner" ? { workspaceId } : "skip"
  );
  const updateWorkspace = useMutation(api.workspaces.updateWorkspace);
  const inviteToWorkspace = useMutation(api.workspaces.inviteToWorkspace);
  const updateMemberRole = useMutation(api.workspaces.updateMemberRole);
  const removeMemberMutation = useMutation(api.workspaces.removeMember);
  const cancelInvitation = useMutation(api.workspaces.cancelInvitation);
  const deleteWorkspaceMutation = useMutation(api.workspaces.deleteWorkspace);

  const [workspaceData, setWorkspaceData] = useState({
    name: workspace.name,
    niche: workspace.niche,
    description: workspace.description || "",
  });

  const isOwner = workspace.role === "owner";

  const handleUpdateWorkspace = async () => {
    if (!workspaceData.name.trim() || !workspaceData.niche.trim()) {
      toast.error("Nombre y nicho son requeridos");
      return;
    }

    setIsUpdating(true);
    try {
      await updateWorkspace({
        workspaceId,
        name: workspaceData.name.trim(),
        niche: workspaceData.niche.trim(),
        description: workspaceData.description.trim() || undefined,
      });
      toast.success("Workspace actualizado");
    } catch (error) {
      toast.error("Error al actualizar workspace");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Email es requerido");
      return;
    }

    try {
      await inviteToWorkspace({
        workspaceId,
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      });
      toast.success("Invitación enviada");
      setInviteEmail("");
      setIsInviteOpen(false);
    } catch (error) {
      toast.error("Error al enviar invitación");
    }
  };

  const handleUpdateRole = async (userId: Id<"users">, newRole: "editor" | "viewer") => {
    try {
      await updateMemberRole({ workspaceId, userId, role: newRole });
      toast.success("Rol actualizado");
    } catch (error) {
      toast.error("Error al actualizar rol");
    }
  };

  const handleRemoveMember = async (userId: Id<"users">) => {
    try {
      await removeMemberMutation({ workspaceId, userId });
      toast.success("Miembro eliminado");
    } catch (error) {
      toast.error("Error al eliminar miembro");
    }
  };

  const handleCancelInvitation = async (invitationId: Id<"workspaceInvitations">) => {
    try {
      await cancelInvitation({ invitationId });
      toast.success("Invitación cancelada");
    } catch (error) {
      toast.error("Error al cancelar invitación");
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspaceMutation({ workspaceId });
      toast.success("Workspace eliminado");
      onDelete();
    } catch (error) {
      toast.error("Error al eliminar workspace");
    }
  };

  return (
    <div className="p-8 h-full overflow-hidden flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white tracking-tight">
          Configuración del Workspace
        </h2>
        <p className="text-sm text-white/40 mt-1">
          Gestiona la información y los miembros del workspace
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 pb-6 max-w-2xl">
          {/* General Settings */}
          <Card 
            className="border-0"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Settings className="size-4" />
                Información general
              </CardTitle>
              <CardDescription className="text-white/40">
                Actualiza el nombre, nicho y descripción del workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Nombre del workspace</Label>
                <Input
                  value={workspaceData.name}
                  onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  disabled={!isOwner}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Nicho</Label>
                <Input
                  value={workspaceData.niche}
                  onChange={(e) => setWorkspaceData({ ...workspaceData, niche: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-[#8B5CF6]/50"
                  disabled={!isOwner}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Descripción</Label>
                <Textarea
                  value={workspaceData.description}
                  onChange={(e) => setWorkspaceData({ ...workspaceData, description: e.target.value })}
                  className="bg-[#27272A] border-[#3F3F46] text-white min-h-[80px]"
                  disabled={!isOwner}
                />
              </div>
              {isOwner && (
                <Button
                  onClick={handleUpdateWorkspace}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Guardando..." : "Guardar cambios"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-[#18181B] border-[#27272A]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Users className="size-4" />
                    Miembros del equipo
                  </CardTitle>
                  <CardDescription className="text-[#A1A1AA]">
                    {workspace.memberCount} miembro{workspace.memberCount !== 1 ? "s" : ""} en este workspace
                  </CardDescription>
                </div>
                {isOwner && (
                  <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                        <UserPlus className="size-4 mr-2" />
                        Invitar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#18181B] border-[#27272A]">
                      <DialogHeader>
                        <DialogTitle className="text-white">Invitar miembro</DialogTitle>
                        <DialogDescription className="text-[#A1A1AA]">
                          Envía una invitación por email para unirse al workspace
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleInvite} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-white">Email</Label>
                          <Input
                            type="email"
                            placeholder="email@ejemplo.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="bg-[#27272A] border-[#3F3F46] text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Rol</Label>
                          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "editor" | "viewer")}>
                            <SelectTrigger className="bg-[#27272A] border-[#3F3F46] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                              <SelectItem value="editor">Editor - Puede editar contenido</SelectItem>
                              <SelectItem value="viewer">Viewer - Solo puede ver</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED]">
                          Enviar invitación
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Owner */}
              {membersData?.owner && (
                <div
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#27272A]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#27272A] flex items-center justify-center text-sm font-medium text-white">
                      {membersData.owner.name?.slice(0, 1).toUpperCase() ||
                        membersData.owner.email?.slice(0, 1).toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {membersData.owner.name || membersData.owner.email || "Usuario"}
                      </p>
                      <p className="text-xs text-[#A1A1AA]">{membersData.owner.email}</p>
                    </div>
                  </div>
                  <Badge className={cn("border", roleColors.owner)}>
                    <Crown className="size-3 mr-1" />
                    {roleLabels.owner}
                  </Badge>
                </div>
              )}

              {/* Members */}
              {membersData?.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#27272A]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#27272A] flex items-center justify-center text-sm font-medium text-white">
                      {member.name?.slice(0, 1).toUpperCase() ||
                        member.email?.slice(0, 1).toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {member.name || member.email || "Usuario"}
                      </p>
                      <p className="text-xs text-[#A1A1AA]">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleUpdateRole(member.userId, v as "editor" | "viewer")}
                      >
                        <SelectTrigger className="w-28 h-8 bg-[#27272A] border-[#3F3F46] text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#27272A] border-[#3F3F46]">
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={cn("border", roleColors[member.role as MemberRole])}>
                        {roleLabels[member.role as MemberRole]}
                      </Badge>
                    )}

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#A1A1AA] hover:text-red-400"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pending Invitations */}
              {pendingInvitations && pendingInvitations.length > 0 && (
                <>
                  <div className="pt-4 border-t border-[#27272A]">
                    <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-3">
                      Invitaciones pendientes
                    </p>
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#27272A] border-dashed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#27272A] flex items-center justify-center">
                            <Mail className="size-4 text-[#A1A1AA]" />
                          </div>
                          <div>
                            <p className="text-sm text-white">{invitation.email}</p>
                            <p className="text-xs text-[#A1A1AA]">Pendiente</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={cn("border", roleColors[invitation.role as keyof typeof roleColors])}>
                            {roleLabels[invitation.role as keyof typeof roleLabels]}
                          </Badge>
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-[#A1A1AA] hover:text-red-400"
                              onClick={() => handleCancelInvitation(invitation._id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isOwner && (
            <Card className="bg-[#18181B] border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 text-base">Zona de peligro</CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Acciones irreversibles para este workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30">
                      <Trash2 className="size-4 mr-2" />
                      Eliminar workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#18181B] border-[#27272A]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">¿Eliminar workspace?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#A1A1AA]">
                        Esta acción no se puede deshacer. Se eliminarán todos los datos del workspace incluyendo calendario, ideas, guiones y analytics.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[#27272A] border-[#3F3F46] text-white hover:bg-[#3F3F46]">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteWorkspace}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
