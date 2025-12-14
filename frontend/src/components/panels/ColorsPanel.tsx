import { Palette, Contrast, Droplets, Sparkles, Film, Focus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";

const lutPresets = [
  { id: "none", name: "None", preview: "linear-gradient(135deg, #888 0%, #666 100%)" },
  { id: "cinematic", name: "Cinematic", preview: "linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)" },
  { id: "vintage", name: "Vintage", preview: "linear-gradient(135deg, #d4a574 0%, #8b7355 100%)" },
  { id: "cold", name: "Cold", preview: "linear-gradient(135deg, #4a9eff 0%, #1e3a5f 100%)" },
  { id: "warm", name: "Warm", preview: "linear-gradient(135deg, #ff9f43 0%, #ee5a24 100%)" },
  { id: "bw", name: "B&W", preview: "linear-gradient(135deg, #ffffff 0%, #000000 100%)" },
];

const colorSchemes = [
  "monochromatic", "complementary", "analogous", "triadic", 
  "warm tones", "cool tones", "vibrant", "muted", "pastel"
];

const ColorsPanel = () => {
  const { colors, updateColors, structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateColorScheme = (scheme: string) => {
    setStructuredPrompt({
      ...structuredPrompt,
      aesthetics: {
        ...structuredPrompt?.aesthetics,
        color_scheme: scheme,
      },
    });
  };

  return (
    <div className="p-4 space-y-5 animate-slide-in-right">
      {/* Color Scheme */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Palette className="w-4 h-4" />
          <span>Color Scheme</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme}
              onClick={() => updateColorScheme(scheme)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                structuredPrompt?.aesthetics?.color_scheme === scheme
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {scheme}
            </button>
          ))}
        </div>
      </div>

      {/* LUT Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Color LUT
        </label>
        <div className="grid grid-cols-3 gap-2">
          {lutPresets.map((lut) => (
            <button
              key={lut.id}
              onClick={() => updateColors({ lut: lut.id })}
              className={`rounded-lg border overflow-hidden transition-all ${
                colors.lut === lut.id
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div
                className="h-10 w-full"
                style={{ background: lut.preview }}
              />
              <div className="p-2 bg-surface-1">
                <span className="text-xs font-medium">{lut.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contrast */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Contrast className="w-4 h-4" />
            <span>Contrast</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {colors.contrast > 0 ? "+" : ""}{colors.contrast}
          </span>
        </div>
        <Slider
          value={[colors.contrast]}
          onValueChange={([v]) => updateColors({ contrast: v })}
          min={-100}
          max={100}
          step={1}
        />
      </div>

      {/* Saturation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Droplets className="w-4 h-4" />
            <span>Saturation</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {colors.saturation > 0 ? "+" : ""}{colors.saturation}
          </span>
        </div>
        <Slider
          value={[colors.saturation]}
          onValueChange={([v]) => updateColors({ saturation: v })}
          min={-100}
          max={100}
          step={1}
        />
      </div>

      {/* Film Grain */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Film className="w-4 h-4" />
            <span>Film Grain</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {colors.filmGrain}%
          </span>
        </div>
        <Slider
          value={[colors.filmGrain]}
          onValueChange={([v]) => updateColors({ filmGrain: v })}
          min={0}
          max={100}
          step={1}
        />
      </div>

      {/* Bloom */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Bloom</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {colors.bloom}%
          </span>
        </div>
        <Slider
          value={[colors.bloom]}
          onValueChange={([v]) => updateColors({ bloom: v })}
          min={0}
          max={100}
          step={1}
        />
      </div>

      {/* Sharpness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Focus className="w-4 h-4" />
            <span>Sharpness</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {colors.sharpness}%
          </span>
        </div>
        <Slider
          value={[colors.sharpness]}
          onValueChange={([v]) => updateColors({ sharpness: v })}
          min={0}
          max={100}
          step={1}
        />
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Color settings</span> control the visual aesthetics. Color scheme updates the structured prompt for FIBO generation.
        </p>
      </div>
    </div>
  );
};

export default ColorsPanel;
