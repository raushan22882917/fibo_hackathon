import { Wand2, Sliders, Sparkles, Shield, Zap, Code2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HomePanelProps {
  onNavigate: (tab: string) => void;
}

const HomePanel = ({ onNavigate }: HomePanelProps) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">BRIA FIBO Studio</h1>
            <p className="text-xs text-muted-foreground">
              Structured JSON Control for AI Generation
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
          <p className="text-sm text-foreground/90 leading-relaxed">
            FIBO represents a fundamental shift from text prompts to <span className="font-semibold text-primary">structured JSON control</span>. Get deterministic control over camera angles, FOV, lighting, color palettes, and composition.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Start
        </h3>
        
        <Button
          variant="glow"
          className="w-full justify-start gap-3"
          onClick={() => onNavigate("generate")}
        >
          <Wand2 className="w-4 h-4" />
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">Generate Content</p>
            <p className="text-xs opacity-80">Start with text prompts or structured JSON</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => onNavigate("fibo")}
        >
          <Sliders className="w-4 h-4" />
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">FIBO Editor</p>
            <p className="text-xs text-muted-foreground">Fine-tune with structured controls</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => onNavigate("showcase")}
        >
          <Sparkles className="w-4 h-4" />
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">Showcase</p>
            <p className="text-xs text-muted-foreground">Explore professional examples</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => navigate("/gallery")}
        >
          <ImageIcon className="w-4 h-4" />
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">Projects Gallery</p>
            <p className="text-xs text-muted-foreground">View all generated content</p>
          </div>
        </Button>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Key Features
        </h3>

        <div className="grid gap-2">
          <div className="p-3 rounded-lg bg-surface-1 border border-border">
            <div className="flex items-start gap-2">
              <Code2 className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Structured JSON Control</p>
                <p className="text-xs text-muted-foreground">
                  Deterministic parameters that work the same way every time
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-1 border border-border">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Production Workflows</p>
                <p className="text-xs text-muted-foreground">
                  Built for real commercial and creative production
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-1 border border-border">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Fully Licensed</p>
                <p className="text-xs text-muted-foreground">
                  1B+ licensed images with full commercial indemnity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Controls Overview */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Structured Controls
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-xs font-medium">Camera Angles & FOV</span>
            <span className="text-xs text-primary">8+ presets</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-xs font-medium">Lighting Conditions</span>
            <span className="text-xs text-primary">15+ options</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-xs font-medium">Color Palettes</span>
            <span className="text-xs text-primary">16+ schemes</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-xs font-medium">Composition Rules</span>
            <span className="text-xs text-primary">11+ rules</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-xs font-medium">Object Management</span>
            <span className="text-xs text-primary">Unlimited</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border">
            <span className="text-xs font-medium">Style & Medium</span>
            <span className="text-xs text-primary">20+ styles</span>
          </div>
        </div>
      </div>

      {/* Content Types */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Supported Content Types
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-surface-1 border border-border text-center">
            <p className="text-lg mb-1">🖼️</p>
            <p className="text-xs font-medium">Images</p>
          </div>
          <div className="p-2 rounded-lg bg-surface-1 border border-border text-center">
            <p className="text-lg mb-1">🎬</p>
            <p className="text-xs font-medium">Videos</p>
          </div>
          <div className="p-2 rounded-lg bg-surface-1 border border-border text-center">
            <p className="text-lg mb-1">📢</p>
            <p className="text-xs font-medium">Ads</p>
          </div>
          <div className="p-2 rounded-lg bg-surface-1 border border-border text-center">
            <p className="text-lg mb-1">🎯</p>
            <p className="text-xs font-medium">Custom</p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h3 className="text-sm font-semibold text-primary mb-2">
          🚀 Getting Started
        </h3>
        <ol className="space-y-1.5 text-xs text-foreground/80">
          <li className="flex gap-2">
            <span className="font-semibold text-primary">1.</span>
            <span>Click "Generate Content" to start with a text prompt</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">2.</span>
            <span>Convert to structured JSON for precise control</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">3.</span>
            <span>Use FIBO Editor to fine-tune all parameters</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">4.</span>
            <span>Generate with deterministic, repeatable results</span>
          </li>
        </ol>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Powered by <span className="font-semibold gradient-text">BRIA FIBO</span>
        </p>
      </div>
    </div>
  );
};

export default HomePanel;
