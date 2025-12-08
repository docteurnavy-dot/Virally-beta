import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VALID_ROLES } from "@/convex/lib/internal_schema";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const currentUser = useQuery(api.users.me);
  const updateProfile = useMutation(api.users.updateProfile);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  });

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        image: currentUser.image || "",
      });
    }
  }, [currentUser]);

  const handleAutoSave = async (
    field: keyof typeof formData,
    value: string,
  ) => {
    if (!currentUser) return;

    // Don't save if the value hasn't changed
    const currentValue = currentUser[field as keyof typeof currentUser] || "";
    if (value === currentValue) return;

    setIsSaving(true);
    try {
      await updateProfile({ [field]: value });
      toast.success(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to update ${field}`;
      toast.error(errorMessage);
      // Revert the form data on error
      if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          [field]: currentUser[field as keyof typeof currentUser] || "",
        }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

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

  if (!currentUser) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-white/40" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Configuración de Perfil
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Gestiona tu información de cuenta
          </p>
        </div>

        {/* Profile Card */}
        <Card 
          className="border-0"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4 h-fit">
                <Avatar className="size-12 flex-shrink-0 ring-2 ring-white/10">
                  <AvatarImage
                    src={formData.image}
                    alt={formData.name || "User"}
                  />
                  <AvatarFallback
                    className="text-xl font-medium bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] text-white"
                  >
                    {getUserInitials(formData.name, formData.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium text-white truncate">
                      {currentUser.name || "Usuario"}
                    </h2>
                    <Badge
                      className={cn(
                        "font-medium text-xs border",
                        getRoleBadgeStyles(currentUser.role),
                      )}
                    >
                      {currentUser.role || "No role"}
                    </Badge>
                  </div>
                  <p className="text-base text-white/40">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onBlur={(e) => handleAutoSave("name", e.target.value)}
                  placeholder="Tu nombre"
                  className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0"
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  onBlur={(e) => handleAutoSave("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0"
                />
              </div>

              {/* Profile Image URL Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="image"
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  Foto de perfil
                </Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  onBlur={(e) => handleAutoSave("image", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-12 bg-white/5 border border-white/[0.1] text-white placeholder:text-white/30 rounded-xl focus:border-white/30 focus:ring-0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card 
          className="mt-6 border-0"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <CardContent className="pt-6 flex flex-col gap-6">
            <div className="flex flex-col items-start gap-2">
              <Label className="text-sm text-white/70">Miembro desde</Label>
              <span className="text-white">
                {new Date(currentUser._creationTime).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label className="text-sm text-white/70">ID de usuario</Label>
              <div className="flex items-center gap-2">
                <pre className="font-mono rounded text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded-lg">
                  {currentUser._id}
                </pre>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white/40 hover:text-white hover:bg-white/5"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUser._id);
                    toast.success("ID copiado");
                  }}
                  title="Copiar ID"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
