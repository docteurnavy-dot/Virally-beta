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
import { CheckCircle, XCircle } from "lucide-react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { AppleIcon } from "@/components/icons/AppleIcon";
import { VirallyLogo } from "@/components/VirallyLogo";
import { useAuthActions } from "@convex-dev/auth/react";

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
    <div className="space-y-1.5">
      <Label htmlFor="name" className="text-white/80 text-sm font-normal">Nombre</Label>
      <Input
        id="name"
        type="text"
        placeholder="Tu nombre"
        value={data.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
        disabled={isLoading}
        className="h-12 bg-white/5 border border-white/[0.18] text-white placeholder:text-white/40 rounded-2xl backdrop-blur-xl focus:border-white/40 focus:ring-0 transition-all duration-300"
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
    <div className="space-y-1.5">
      <Label htmlFor="password" className="text-white/80 text-sm font-normal">Contraseña</Label>
      <PasswordInput
        id="password"
        placeholder="Tu contraseña"
        value={data.password}
        onChange={(e) => updateField("password", e.target.value)}
        onBlur={setPasswordTouched}
        validationState={getValidationState()}
        required
        disabled={isLoading}
        className="h-12 bg-white/5 border border-white/[0.18] text-white placeholder:text-white/40 rounded-2xl backdrop-blur-xl focus:border-white/40 focus:ring-0 transition-all duration-300"
      />
      {showError && (
        <p className="text-xs text-red-400/90 font-normal mt-1">
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
    <div className="space-y-1.5">
      <Label htmlFor="confirmPassword" className="text-white/80 text-sm font-normal">Confirmar contraseña</Label>
      <PasswordInput
        id="confirmPassword"
        placeholder="Confirma tu contraseña"
        value={data.confirmPassword}
        onChange={(e) => updateField("confirmPassword", e.target.value)}
        validationState={getValidationState()}
        required
        disabled={isLoading}
        className="h-12 bg-white/5 border border-white/[0.18] text-white placeholder:text-white/40 rounded-2xl backdrop-blur-xl focus:border-white/40 focus:ring-0 transition-all duration-300"
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
    <div className="space-y-1.5">
      <Label htmlFor="email" className="text-white/80 text-sm font-normal">Email</Label>
      <div className="relative">
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={setEmailTouched}
          className={cn(
            "h-12 pr-10 bg-white/5 border border-white/[0.18] text-white placeholder:text-white/40 rounded-2xl backdrop-blur-xl transition-all duration-300",
            validationState === "valid" && "border-emerald-500/50 focus:border-emerald-500/70",
            validationState === "invalid" && "border-red-500/50 focus:border-red-500/70",
            validationState === "neutral" && "focus:border-white/40"
          )}
          required
          disabled={isLoading}
        />
        {validationState === "valid" && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
        )}
        {validationState === "invalid" && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
        )}
      </div>
      {showError && (
        <p className="text-xs text-red-400/90 font-normal mt-1">
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

  const { signIn } = useAuthActions();

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Shader Gradient Background */}
      <ShaderGradientCanvas
        style={{ position: "absolute", inset: 0 }}
        pixelDensity={1}
        fov={45}
      >
        <ShaderGradient
          animate="on"
          brightness={1.1}
          cAzimuthAngle={180}
          cDistance={3.9}
          cPolarAngle={115}
          cameraZoom={1}
          color1="#5606ff"
          color2="#fe8989"
          color3="#000000"
          envPreset="city"
          grain="off"
          lightType="3d"
          positionX={-0.5}
          positionY={0.1}
          positionZ={0}
          reflection={0.1}
          rotationX={0}
          rotationY={0}
          rotationZ={235}
          type="waterPlane"
          uAmplitude={0}
          uDensity={1.1}
          uFrequency={5.5}
          uSpeed={0.1}
          uStrength={2.4}
          uTime={0.2}
          wireframe={false}
        />
      </ShaderGradientCanvas>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        {/* Glassmorphism Card */}
        <div 
          className="w-full max-w-md p-8 rounded-3xl animate-fade-in-up"
          style={{
            background: "rgba(50, 50, 50, 0.4)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
              style={{
                background: "linear-gradient(135deg, rgba(86, 6, 255, 0.9), rgba(254, 137, 137, 0.7))",
              }}
            >
              <VirallyLogo size={48} variant="icon" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
              {isSignUp ? "Únete a Virally" : "Bienvenido a Virally"}
            </h1>
            <p className="text-white/60 text-sm font-normal">
              {isSignUp
                ? "Crea tu cuenta y empieza a dominar las redes"
                : "¿Listo para crear un imperio digital?"}
            </p>
          </div>

          {/* Form */}
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

            {/* Submit Button - Apple style */}
            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full h-12 rounded-2xl text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] btn-hover"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))",
                color: "#000",
                boxShadow: "0 4px 24px rgba(255, 255, 255, 0.2)",
              }}
            >
              {isLoading
                ? isSignUp
                  ? "Creando..."
                  : "Entrando..."
                : isSignUp
                  ? "Crear cuenta"
                  : "Continuar"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-white/40">O continúa con</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => void signIn("google")}
              variant="outline"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-white/5 border-white/[0.18] text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              Google
            </Button>

            <Button
              type="button"
              onClick={() => void signIn("apple")}
              variant="outline"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-white/5 border-white/[0.18] text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <AppleIcon className="mr-2 h-5 w-5" />
              Apple
            </Button>
          </div>

          {/* Toggle */}
          <div className="text-center mt-6">
            <span className="text-sm text-white/50">
              {isSignUp ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? "Inicia sesión" : "Regístrate"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Dock - macOS style */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div 
          className="flex items-center gap-3 px-5 py-3 rounded-3xl"
          style={{
            background: "rgba(50, 50, 50, 0.7)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
          }}
        >
          <Sparkles className="size-4 text-white/70" strokeWidth={2} />
          <span className="text-white/80 text-sm font-medium">Virally</span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-white/40 text-xs">Tu centro de contenido viral</span>
        </div>
      </div>
    </div>
  );
}
