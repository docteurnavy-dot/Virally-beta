/**
 * LOGIN PAGE TEMPLATE FOR AI AGENTS
 *
 * This is a customizable split-screen login template.
 *
 * Key customization points (marked with comments throughout):
 * 1. Logo: Background color, icon color, and Lucide icon component
 * 2. Primary button: Background and hover colors
 * 3. Toggle link: Text and hover colors
 * 4. Right side panel: Gradient colors and content
 *
 * Import Lucide icons from 'lucide-react' and replace the Globe icon as needed.
 */

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
import { CheckCircle, XCircle, Globe } from "lucide-react";

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
      <Label htmlFor="name">Name</Label>
      <Input
        id="name"
        type="text"
        placeholder="Enter your name"
        value={data.name}
        onChange={(e) => updateField("name", e.target.value)}
        required
        disabled={isLoading}
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
      <Label htmlFor="password">Password</Label>
      <PasswordInput
        id="password"
        placeholder="Enter your password"
        value={data.password}
        onChange={(e) => updateField("password", e.target.value)}
        onBlur={setPasswordTouched}
        validationState={getValidationState()}
        required
        disabled={isLoading}
      />
      {showError && (
        <p className="text-xs text-red-500 font-medium">
          Password must be at least 6 characters with a letter and number
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
      <Label htmlFor="confirmPassword">Confirm Password</Label>
      <PasswordInput
        id="confirmPassword"
        placeholder="Confirm your password"
        value={data.confirmPassword}
        onChange={(e) => updateField("confirmPassword", e.target.value)}
        validationState={getValidationState()}
        required
        disabled={isLoading}
      />
      <ValidationMessage
        type="error"
        show={!!data.confirmPassword && !passwordsMatch}
      >
        Passwords do not match
      </ValidationMessage>
      <ValidationMessage
        type="success"
        show={!!data.confirmPassword && passwordsMatch && !!data.password}
      >
        Passwords match
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
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
          onBlur={setEmailTouched}
          className={cn(
            "pr-9 transition-all duration-200",
            validationState === "valid" &&
              "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/20",
            validationState === "invalid" &&
              "border-red-300 focus:border-red-400 focus:ring-red-400/20",
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
        <p className="text-xs text-red-500 font-medium">
          Please enter a valid email address
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
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md space-y-8">
          {/* TODO: Logo - Customize the background color (bg-blue-100), icon color (text-blue-700), and icon component (Globe) */}
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Globe className="size-6 text-blue-700" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-medium tracking-tight">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground font-normal">
              {isSignUp
                ? "Create a new account to get started"
                : "Enter your existing account"}
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !isFormValid}
            >
              {isLoading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                  ? "Sign up"
                  : "Sign in"}
            </Button>
          </form>
          {/* TODO: Toggle mode - Customize the link colors (text-blue-600, hover:text-blue-700) */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
      {/* 
        TODO: Right side panel - Customize color and add content 
        Example color: bg-blue-950
        Example text: "Plan your team's vacation from one place"
        Example features:
          - Request vacation with just a few clicks
          - Managers review and approve leave instantly
          - Stay informed on team availability at a glance
      */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900">
        <div className="absolute top-0 left-0 w-full p-24 flex justify-start items-start">
          <div className="max-w-xl">
            <h2 className="text-2xl text-white leading-tight mb-8">
              {/* Example: Plan your team's vacation from one place */}
              Placeholder hero text
            </h2>
            {/* Example features listed below */}
            <ul className="space-y-5 text-lg text-white/80">
              <li className="flex items-center">
                {/* Example: <CheckCircle className="text-emerald-400 w-6 h-6 mr-3" /> */}
                <CheckCircle className="w-6 h-6 mr-3" />
                Placeholder feature 1
              </li>
              <li className="flex items-center">
                {/* Example: <Globe className="text-blue-400 w-6 h-6 mr-3" /> */}
                <Globe className="w-6 h-6 mr-3" />
                Placeholder feature 2
              </li>
              <li className="flex items-center">
                {/* Example: <XCircle className="text-orange-400 w-6 h-6 mr-3" /> */}
                <XCircle className="w-6 h-6 mr-3" />
                Placeholder feature 3
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
