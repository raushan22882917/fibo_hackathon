import { useState, useEffect } from "react";
import { Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopNavbar from "@/components/layout/TopNavbar";
import EditorSidebar from "@/components/layout/EditorSidebar";
import VideoCanvas from "@/components/canvas/VideoCanvas";
import Timeline from "@/components/timeline/Timeline";
import HomePanel from "@/components/panels/HomePanel";
import GeneratePanel from "@/components/panels/GeneratePanel";
import FIBOEditorPanel from "@/components/panels/FIBOEditorPanel";
import ShowcasePanel from "@/components/panels/ShowcasePanel";
import CharacterPanel from "@/components/panels/CharacterPanel";
import CameraPanel from "@/components/panels/CameraPanel";
import ScenePanel from "@/components/panels/ScenePanel";
import MotionPanel from "@/components/panels/MotionPanel";
import ColorsPanel from "@/components/panels/ColorsPanel";
import TimelinePanel from "@/components/panels/TimelinePanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(false);

  useEffect(() => {
    const handleNavigateToFibo = () => {
      setActiveTab("fibo");
    };

    window.addEventListener('navigate-to-fibo', handleNavigateToFibo);
    return () => window.removeEventListener('navigate-to-fibo', handleNavigateToFibo);
  }, []);

  const renderRightPanel = () => {
    switch (activeTab) {
      case "home":
        return <HomePanel onNavigate={setActiveTab} />;
      case "generate":
        return <GeneratePanel />;
      case "fibo":
        return <FIBOEditorPanel />;
      case "showcase":
        return <ShowcasePanel onNavigate={setActiveTab} />;
      case "characters":
        return <CharacterPanel />;
      case "camera":
        return <CameraPanel />;
      case "scene":
        return <ScenePanel />;
      case "motion":
        return <MotionPanel />;
      case "colors":
        return <ColorsPanel />;
      case "timeline":
        return <TimelinePanel />;
      default:
        return <HomePanel onNavigate={setActiveTab} />;
    }
  };

  const getPanelTitle = () => {
    switch (activeTab) {
      case "home":
        return "Dashboard";
      case "generate":
        return "BRIA FIBO Generator";
      case "fibo":
        return "FIBO Structured Editor";
      case "characters":
        return "Character Editor";
      case "camera":
        return "Camera Settings";
      case "scene":
        return "Scene Editor";
      case "motion":
        return "Motion Editor";
      case "colors":
        return "Color Grading";
      case "timeline":
        return "Timeline Controls";
      default:
        return "Dashboard";
    }
  };

  const getPanelIcon = () => {
    switch (activeTab) {
      case "fibo":
        return <Sparkles className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <TopNavbar />
      
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Canvas Area */}
            <div className="flex-1 relative">
              <VideoCanvas />
              
              {/* Floating Action Button */}
              <div className="absolute bottom-6 right-6 z-10">
                <Button
                  variant="glow"
                  size="lg"
                  className="rounded-full shadow-2xl gap-2"
                  onClick={() => setActiveTab("fibo")}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="hidden sm:inline">FIBO Studio</span>
                </Button>
              </div>
            </div>
            
            {/* Right Panel */}
            <aside className={`${isRightPanelExpanded ? 'w-96' : 'w-80'} border-l border-border/50 bg-card/80 backdrop-blur-xl flex flex-col transition-all duration-300 shadow-xl`}>
              {/* Panel Header */}
              <div className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-gradient-to-r from-card to-card/50">
                <div className="flex items-center gap-2">
                  {getPanelIcon()}
                  <h2 className="text-sm font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {getPanelTitle()}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsRightPanelExpanded(!isRightPanelExpanded)}
                  className="rounded-full"
                >
                  {isRightPanelExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
                <div className="p-1">
                  {renderRightPanel()}
                </div>
              </div>
              
              {/* Panel Footer */}
              {activeTab === "fibo" && (
                <div className="h-12 border-t border-border/50 flex items-center justify-center px-4 bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>FIBO Model Active</span>
                  </div>
                </div>
              )}
            </aside>
          </div>
          
          {/* Timeline */}
          <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
            <Timeline />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
