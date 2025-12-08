import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationMessage } from "@/components/validation-message";
import { useLoginForm } from "@/hooks/use-loign-form";
import type {
  EmailValidation,
  PasswordValidation,
} from "@/hooks/use-password-validation";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Sparkles, Calendar, Lightbulb, BarChart3 } from "lucide-react";

function SignUpFields({
  data,
  isLoading,
  updateField,
}: {
  data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  isLoading: boolean;
  updateField: (field: keyof typeof data, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name" className="text-white">Nombre</Label>
      <Input
        id="name"
        type="text"
        placeholder="Tu nombre"
        value={data.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
        disabled={isLoading}
        className="bg-[#18181B] border-[#27272A] text-white placeholder:text-[#A1A1AA] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
      />
    </div>
  );
}

function PasswordField({
  data,
  isLoading,
  isSignUp,
  passwordTouched,
  passwordValidation,
  updateField,
  setPasswordTouched,
}: {
  data: { password: string };
  isLoading: boolean;
  isSignUp: boolean;
  passwordTouched: boolean;
  passwordValidation: PasswordValidation;
  updateField: (field: keyof typeof data, value: string) => void;
  setPasswordTouched: () => void;
}) {
  const getValidationState = () => {
    if (!isSignUp || !passwordTouched || !data.password) return "neutral";
    return passwordValidation.isValid ? "valid" : "invalid";
  };

  const showError =
    isSignUp && passwordTouched && !passwordValidation.isValid && data.password;

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-white">Contraseña</Label>
      <PasswordInput
        id="password"
        placeholder="Tu contraseña"
        value={data.password}
        onChange={(e) => updateField("password", e.target.value)}
        onBlur={setPasswordTouched}
        validationState={getValidationState()}
        required
        disabled={isLoading}
        className="bg-[#18181B] border-[#27272A] text-white placeholder:text-[#A1A1AA] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
      />
      {showError && (
        <p className="text-xs text-red-400 font-medium">
          Mínimo 6 caracteres con una letra y un número
        </p>
      )}
    </div>
  );
}

function ConfirmPasswordField({
  data,
  isLoading,
  passwordsMatch,
  updateField,
}: {
  data: { password: string; confirmPassword: string };
  isLoading: boolean;
  passwordsMatch: boolean;
  updateField: (field: keyof typeof data, value: string) => void;
}) {
  const getValidationState = () => {
    if (!data.confirmPassword) return "neutral";
    return passwordsMatch && data.password ? "valid" : "invalid";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="confirmPassword" className="text-white">Confirmar contraseña</Label>
      <PasswordInput
        id="confirmPassword"
        placeholder="Confirma tu contraseña"
        value={data.confirmPassword}
        onChange={(e) => updateField("confirmPassword", e.target.value)}
        validationState={getValidationState()}
        required
        disabled={isLoading}
        className="bg-[#18181B] border-[#27272A] text-white placeholder:text-[#A1A1AA] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
      />
      <ValidationMessage
        type="error"
        show={!!data.confirmPassword && !passwordsMatch}
      >
        Las contraseñas no coinciden
      </ValidationMessage>
      <ValidationMessage
        type="success"
        show={!!data.confirmPassword && passwordsMatch && !!data.password}
      >
        Las contraseñas coinciden
      </ValidationMessage>
    </div>
  );
}

function EmailField({
  data,
  isLoading,
  emailTouched,
  emailValidation,
  updateField,
  setEmailTouched,
}: {
  data: { email: string };
  isLoading: boolean;
  emailTouched: boolean;
  emailValidation: EmailValidation;
  updateField: (field: keyof typeof data, value: string) => void;
  setEmailTouched: () => void;
}) {
  const getValidationState = () => {
    if (!data.email) return "neutral";
    if (!emailTouched) return "neutral";
    return emailValidation.isValid ? "valid" : "invalid";
  };

  const validationState = getValidationState();
  const showError = emailTouched && !emailValidation.isValid && data.email;

  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-white">Email</Label>
      <div className="relative">
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={setEmailTouched}
          className={cn(
            "pr-9 transition-all duration-200 bg-[#18181B] border-[#27272A] text-white placeholder:text-[#A1A1AA]",
            validationState === "valid" &&
              "border-emerald-500 focus:border-emerald-400 focus:ring-emerald-400/20",
            validationState === "invalid" &&
              "border-red-500 focus:border-red-400 focus:ring-red-400/20",
            validationState === "neutral" &&
              "focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
          )}
          required
          disabled={isLoading}
        />
        {validationState === "valid" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
        )}
        {validationState === "invalid" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
        )}
      </div>
      {showError && (
        <p className="text-xs text-red-400 font-medium">
          Introduce un email válido
        </p>
      )}
    </div>
  );
}

export function LoginPage() {
  const {
    data,
    isLoading,
    isSignUp,
    passwordTouched,
    emailTouched,
    passwordValidation,
    passwordsMatch,
    emailValidation,
    isFormValid,
    updateField,
    toggleMode,
    setPasswordTouched,
    setEmailTouched,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/25">
              <Sparkles className="size-7 text-white" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {isSignUp ? "Crea tu cuenta" : "Bienvenido de nuevo"}
            </h1>
            <p className="text-[#A1A1AA] font-normal">
              {isSignUp
                ? "Empieza a organizar tu contenido como un pro"
                : "Accede a tu espacio de trabajo"}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <SignUpFields
                data={data}
                isLoading={isLoading}
                updateField={updateField}
              />
            )}
            <EmailField
              data={data}
              isLoading={isLoading}
              emailTouched={emailTouched}
              emailValidation={emailValidation}
              updateField={updateField}
              setEmailTouched={setEmailTouched}
            />
            <PasswordField
              data={data}
              isLoading={isLoading}
              isSignUp={isSignUp}
              passwordTouched={passwordTouched}
              passwordValidation={passwordValidation}
              updateField={updateField}
              setPasswordTouched={setPasswordTouched}
            />
            {isSignUp && (
              <ConfirmPasswordField
                data={data}
                isLoading={isLoading}
                passwordsMatch={passwordsMatch}
                updateField={updateField}
              />
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white font-medium h-11 shadow-lg shadow-[#8B5CF6]/25 transition-all duration-300 hover:shadow-[#8B5CF6]/40 hover:scale-[1.02]"
              disabled={isLoading || !isFormValid}
            >
              {isLoading
                ? isSignUp
                  ? "Creando cuenta..."
                  : "Iniciando sesión..."
                : isSignUp
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </Button>
          </form>
          <div className="text-center">
            <span className="text-sm text-[#A1A1AA]">
              {isSignUp
                ? "¿Ya tienes cuenta? "
                : "¿No tienes cuenta? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium cursor-pointer text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? "Inicia sesión" : "Regístrate"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right side panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-[#0A0A0A] to-[#3B82F6]/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-center">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 mb-8">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-sm font-medium text-[#8B5CF6] uppercase tracking-wider">Content Creator Hub</span>
            </div>
            
            <h2 className="text-4xl font-semibold text-white leading-tight mb-6 tracking-tight">
              Tu centro de comando para crear contenido viral
            </h2>
            
            <p className="text-lg text-[#A1A1AA] mb-10">
              Organiza ideas, planifica tu calendario y analiza el rendimiento de tu contenido en un solo lugar.
            </p>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Calendario inteligente</h3>
                  <p className="text-[#A1A1AA] text-sm">Planifica tu contenido con IA y distribuye en TOFU, MOFU y BOFU</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Organizador de ideas</h3>
                  <p className="text-[#A1A1AA] text-sm">Captura y puntúa ideas según su potencial viral</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Analytics unificados</h3>
                  <p className="text-[#A1A1AA] text-sm">Mide el rendimiento de todo tu contenido en un dashboard</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
