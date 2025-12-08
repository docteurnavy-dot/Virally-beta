import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #0A0A0D 0%, #0F0F12 100%)" }}
    >
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white/10 mb-4">404</h1>
        <p className="text-xl text-white/60 mb-8">Página no encontrada</p>
        <Button
          onClick={() => navigate("/")}
          className="h-12 px-6 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
            boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
          }}
        >
          <Home className="size-4 mr-2" strokeWidth={2} />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
