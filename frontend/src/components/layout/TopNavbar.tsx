import { Sparkles, FolderOpen, Image, Workflow, FileJson, Network, Settings, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const TopNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Studio", icon: Sparkles },
    { path: "/gallery", label: "Gallery", icon: Image },
    { path: "/workflow-builder", label: "Workflows", icon: Workflow },
    { path: "/json-to-image", label: "JSON Editor", icon: FileJson },
    { path: "/system-architecture", label: "Architecture", icon: Network },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-xl tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Vision Weaver
              </span>
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">FIBO Studio</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-muted/30 rounded-full p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={`gap-2 rounded-full transition-all duration-200 ${
                  isActive(item.path) 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-background/50"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="hidden md:flex rounded-full relative">
            <Bell className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="hidden md:flex rounded-full">
            <Settings className="w-4 h-4" />
          </Button>

          {/* Mobile Menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Upgrade Button */}
          <Button variant="glow" size="sm" className="gap-2 rounded-full hidden sm:flex">
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">Pro</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="gap-2 justify-start"
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
