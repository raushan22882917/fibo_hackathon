import { Home, Wand2, Sliders, Users, Camera, Mountain, Move, Palette, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "generate", icon: Wand2, label: "Generate" },
  { id: "fibo", icon: Sliders, label: "FIBO" },
  { id: "characters", icon: Users, label: "Characters" },
  { id: "camera", icon: Camera, label: "Camera" },
  { id: "scene", icon: Mountain, label: "Scene" },
  { id: "motion", icon: Move, label: "Motion" },
  { id: "colors", icon: Palette, label: "Colors" },
  { id: "timeline", icon: Clock, label: "Timeline" },
];

const EditorSidebar = ({ activeTab, onTabChange }: EditorSidebarProps) => {
  return (
    <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-200",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/30" 
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default EditorSidebar;
