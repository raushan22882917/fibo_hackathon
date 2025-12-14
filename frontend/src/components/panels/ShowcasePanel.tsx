import { Sparkles, Camera, Lightbulb, Palette, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/store/videoStore";

interface ShowcasePanelProps {
  onNavigate: (tab: string) => void;
}

const showcaseExamples = [
  {
    id: "product",
    title: "Product Photography",
    description: "Professional product shots with studio lighting",
    icon: "📦",
    prompt: "Luxury watch on a marble pedestal",
    config: {
      photographic_characteristics: {
        camera_angle: "eye-level",
        lens_focal_length: "portrait (70-135mm)",
        depth_of_field: "shallow",
        focus: "sharp"
      },
      lighting: {
        conditions: "studio",
        direction: "three-point",
        shadows: "soft"
      },
      aesthetics: {
        composition: "rule of thirds",
        color_scheme: "complementary",
        mood_atmosphere: "elegant"
      },
      style_medium: "Photography",
      context: "Commercial Photography"
    }
  },
  {
    id: "landscape",
    title: "Cinematic Landscape",
    description: "Epic landscape with dramatic lighting",
    icon: "🏔️",
    prompt: "Mountain range at golden hour with dramatic clouds",
    config: {
      photographic_characteristics: {
        camera_angle: "eye-level",
        lens_focal_length: "wide (24-35mm)",
        depth_of_field: "deep",
        focus: "sharp"
      },
      lighting: {
        conditions: "golden hour",
        direction: "side",
        shadows: "long"
      },
      aesthetics: {
        composition: "rule of thirds",
        color_scheme: "warm",
        mood_atmosphere: "epic"
      },
      style_medium: "Photography",
      context: "Landscape"
    }
  },
  {
    id: "portrait",
    title: "Professional Portrait",
    description: "Studio portrait with soft lighting",
    icon: "👤",
    prompt: "Professional headshot of a business executive",
    config: {
      photographic_characteristics: {
        camera_angle: "eye-level",
        lens_focal_length: "portrait (70-135mm)",
        depth_of_field: "shallow",
        focus: "sharp"
      },
      lighting: {
        conditions: "soft diffused",
        direction: "front",
        shadows: "soft"
      },
      aesthetics: {
        composition: "centered",
        color_scheme: "muted",
        mood_atmosphere: "professional"
      },
      style_medium: "Photography",
      context: "Portrait"
    }
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk Scene",
    description: "Futuristic cityscape with neon lights",
    icon: "🌃",
    prompt: "Futuristic city street with neon signs and rain",
    config: {
      photographic_characteristics: {
        camera_angle: "low-angle",
        lens_focal_length: "wide (24-35mm)",
        depth_of_field: "medium",
        focus: "sharp"
      },
      lighting: {
        conditions: "neon",
        direction: "back",
        shadows: "dramatic"
      },
      aesthetics: {
        composition: "leading lines",
        color_scheme: "Cyberpunk palette: #FF006E, #8338EC, #3A86FF, #FB5607",
        mood_atmosphere: "mysterious"
      },
      style_medium: "Digital Art",
      artistic_style: "Cyberpunk",
      context: "Cinematic"
    }
  },
  {
    id: "commercial",
    title: "Advertisement",
    description: "High-impact commercial photography",
    icon: "📢",
    prompt: "Luxury car on a mountain road at sunset",
    config: {
      photographic_characteristics: {
        camera_angle: "low-angle",
        lens_focal_length: "wide (24-35mm)",
        depth_of_field: "medium",
        focus: "sharp"
      },
      lighting: {
        conditions: "golden hour",
        direction: "back",
        shadows: "long"
      },
      aesthetics: {
        composition: "rule of thirds",
        color_scheme: "cinematic teal-orange",
        mood_atmosphere: "dramatic"
      },
      style_medium: "Photography",
      context: "Advertising"
    }
  },
  {
    id: "artistic",
    title: "Fine Art",
    description: "Artistic interpretation with unique style",
    icon: "🎨",
    prompt: "Abstract interpretation of a city skyline",
    config: {
      photographic_characteristics: {
        camera_angle: "bird's-eye",
        lens_focal_length: "wide (24-35mm)",
        depth_of_field: "deep",
        focus: "soft"
      },
      lighting: {
        conditions: "dramatic",
        direction: "top",
        shadows: "dramatic"
      },
      aesthetics: {
        composition: "abstract",
        color_scheme: "vibrant",
        mood_atmosphere: "energetic"
      },
      style_medium: "Digital Art",
      artistic_style: "Abstract",
      context: "Fine Art"
    }
  }
];

const ShowcasePanel = ({ onNavigate }: ShowcasePanelProps) => {
  const { setPrompt, setStructuredPrompt } = useVideoStore();

  const loadExample = (example: typeof showcaseExamples[0]) => {
    setPrompt(example.prompt);
    setStructuredPrompt(example.config);
    onNavigate("fibo");
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold gradient-text">FIBO Showcase</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Explore professional presets demonstrating FIBO's structured control capabilities
        </p>
      </div>

      {/* Examples Grid */}
      <div className="space-y-3">
        {showcaseExamples.map((example) => (
          <div
            key={example.id}
            className="p-4 rounded-lg bg-surface-1 border border-border hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{example.icon}</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {example.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {example.description}
                </p>
                
                {/* Configuration Preview */}
                <div className="space-y-1 mb-3">
                  {example.config.photographic_characteristics && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Camera className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground">
                        {example.config.photographic_characteristics.camera_angle} • {example.config.photographic_characteristics.lens_focal_length}
                      </span>
                    </div>
                  )}
                  {example.config.lighting && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Lightbulb className="w-3 h-3 text-accent" />
                      <span className="text-muted-foreground">
                        {example.config.lighting.conditions} • {example.config.lighting.direction}
                      </span>
                    </div>
                  )}
                  {example.config.aesthetics && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Layout className="w-3 h-3 text-green-500" />
                      <span className="text-muted-foreground">
                        {example.config.aesthetics.composition}
                      </span>
                    </div>
                  )}
                  {example.config.aesthetics?.color_scheme && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Palette className="w-3 h-3 text-pink-500" />
                      <span className="text-muted-foreground">
                        {example.config.aesthetics.color_scheme.split(':')[0]}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  onClick={() => loadExample(example)}
                >
                  Load & Edit in FIBO
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
        <p className="text-sm text-foreground/90 leading-relaxed">
          <span className="font-semibold text-primary">💡 Pro Tip:</span> Load any example to see how professional configurations are structured. Modify parameters in the FIBO Editor to create your own variations.
        </p>
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <Button
          variant="glow"
          className="w-full"
          onClick={() => onNavigate("fibo")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Open FIBO Editor
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onNavigate("generate")}
        >
          Start from Scratch
        </Button>
      </div>
    </div>
  );
};

export default ShowcasePanel;
