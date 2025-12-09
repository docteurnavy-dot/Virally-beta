import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/convex/_generated/api";
import { VALID_ROLES } from "@/convex/lib/internal_schema";
import Index from "@/pages";
import { LoginPage } from "@/pages/login-screen";
import { WorkspaceCreationOverlay } from "@/components/WorkspaceCreationOverlay";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
  useConvexAuth,
} from "convex/react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import AdminPage from "./pages/admin";
import { LoadingLoginScreen } from "./pages/loading-login-screen";
import NotFound from "./pages/not-found";
import ProfilePage from "./pages/profile";
import OnboardingPage from "./pages/onboarding";
import { useState, useEffect, useMemo } from "react";

// RequireAuth wrapper for protected routes
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingLoginScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AuthenticatedRouter() {
  const currentUser = useQuery(api.users.me);
  const workspaces = useQuery(api.workspaces.listMyWorkspaces);
  const [showWorkspaceOverlay, setShowWorkspaceOverlay] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading spinner while fetching user data
  if (currentUser === undefined || workspaces === undefined) {
    return <LoadingLoginScreen />;
  }

  const isAdmin = currentUser?.role === VALID_ROLES.ADMIN;

  const hasWorkspaces = useMemo(() => {
    return (
      (workspaces?.owned?.length ?? 0) > 0 ||
      (workspaces?.invited?.length ?? 0) > 0
    );
  }, [workspaces]);

  // Trigger overlay if user doesn't have workspaces (except on profile page)
  useEffect(() => {
    if (
      workspaces !== undefined &&
      !hasWorkspaces &&
      location.pathname !== "/profile" &&
      location.pathname !== "/onboarding"
    ) {
      setShowWorkspaceOverlay(true);
    }
  }, [workspaces, hasWorkspaces, location.pathname]);

  const handleWorkspaceCreated = () => {
    setShowWorkspaceOverlay(false);
    // Redirect to dashboard if on login or other page
    if (location.pathname === "/login" || location.pathname === "/") {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <Routes>
        {/* Main dashboard */}
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Index />} />

        {/* Profile page - accessible to all authenticated users */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Admin route - only accessible to admins */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
        />

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Workspace Creation Overlay */}
      <WorkspaceCreationOverlay
        isOpen={showWorkspaceOverlay}
        onClose={() => setShowWorkspaceOverlay(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
        isManualCreation={false}
      />
    </>
  );
}

export function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route - Login */}
          <Route
            path="/login"
            element={
              <Unauthenticated>
                <LoginPage />
              </Unauthenticated>
            }
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <Authenticated>
                  <AuthenticatedRouter />
                </Authenticated>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>

      {/* Loading state */}
      <AuthLoading>
        <LoadingLoginScreen />
      </AuthLoading>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </TooltipProvider>
  );
}
