import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Sparkles, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Animation */}
        <div className="relative">
          <div className="text-8xl font-bold text-gradient-primary animate-pulse">
            404
          </div>
          <div className="absolute -top-4 -right-4">
            <Sparkles className="w-8 h-8 text-accent animate-spin" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="text-sm text-muted-foreground/70 font-mono bg-muted/30 rounded-lg p-3 border border-border/50">
            {location.pathname}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            variant="glow"
            className="gap-2 rounded-full"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">
            Or explore these pages:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/gallery")}
              className="text-xs"
            >
              Gallery
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/workflow-builder")}
              className="text-xs"
            >
              Workflows
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/json-to-image")}
              className="text-xs"
            >
              JSON Editor
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/system-architecture")}
              className="text-xs"
            >
              Architecture
            </Button>
          </div>
        </div>

        {/* FIBO Branding */}
        <div className="pt-6">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>Powered by BRIA FIBO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
