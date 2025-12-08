/* Displays the user's avatar, email, role, and logout button in a dropdown menu.
 * Already added to the navigation bar in the Layout.tsx.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getUserColor } from "@/lib/utils";
import { LogOut, Shield, Cog, Home } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { VALID_ROLES } from "@/convex/lib/internal_schema";

type UserDropdownProps = {
  className?: string;
};

export default function UserDropdown({ className }: UserDropdownProps) {
  const user = useQuery(api.users.me);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const isLoading = user === undefined;

  if (isLoading) {
    return <div className="size-8 animate-pulse rounded-full bg-white/10" />;
  }

  function UserAvatar({
    className,
    fallbackClassName,
  }: {
    className?: string;
    fallbackClassName?: string;
  }) {
    return (
      <Avatar className={cn("transition-all duration-200", className)}>
        {user?.image && <AvatarImage src={user.image} alt={user.email || ""} />}
        <AvatarFallback
          className={cn(
            "text-white font-medium",
            getUserColor(user?.email),
            fallbackClassName,
          )}
        >
          {user?.name?.slice(0, 1).toUpperCase() ||
            user?.email?.slice(0, 1).toUpperCase()}
          {user?.name?.split(" ")[1]?.slice(0, 1).toUpperCase() ||
            user?.email?.slice(1, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  }

  const getRoleBadgeStyles = (role?: string) => {
    switch (role) {
      case VALID_ROLES.ADMIN:
        return "bg-[#8B5CF6]/20 text-[#A78BFA] border-[#8B5CF6]/30";
      case VALID_ROLES.EDITOR:
        return "bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/30";
      case VALID_ROLES.VIEWER:
        return "bg-white/5 text-white/50 border-white/10";
      default:
        return "bg-white/5 text-white/50 border-white/10";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("focus:outline-none cursor-pointer", className)}
      >
        <UserAvatar className="size-8 ring-2 ring-white/10 hover:ring-white/20 transition-all" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 border-0 p-0 overflow-hidden"
        style={{
          background: "rgba(30, 30, 35, 0.95)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
        }}
        sideOffset={8}
      >
        {user ? (
          <>
            <div className="flex items-start justify-between gap-3 p-4">
              <UserAvatar className="size-10" fallbackClassName="text-base" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate font-medium">
                  {user.name || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {user.email}
                </p>
              </div>
              <Badge className={cn("text-[10px] font-medium border", getRoleBadgeStyles(user.role))}>
                {user.role || "No role"}
              </Badge>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="p-2">
              <DropdownMenuItem
                onClick={() => navigate("/")}
                className="text-white/60 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
              >
                <Home className="mr-2 size-4" strokeWidth={2} />
                <span>Inicio</span>
              </DropdownMenuItem>
              {user.role === VALID_ROLES.ADMIN && (
                <DropdownMenuItem
                  onClick={() => navigate("/admin")}
                  className="text-white/60 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
                >
                  <Shield className="mr-2 size-4" strokeWidth={2} />
                  <span>Admin</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="text-white/60 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
              >
                <Cog className="mr-2 size-4" strokeWidth={2} />
                <span>Configuración</span>
              </DropdownMenuItem>
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="p-2">
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer"
                onClick={() => {
                  signOut();
                }}
              >
                <LogOut className="mr-2 size-4" strokeWidth={2} />
                Cerrar sesión
              </DropdownMenuItem>
            </div>
          </>
        ) : (
          <div className="p-4">
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
