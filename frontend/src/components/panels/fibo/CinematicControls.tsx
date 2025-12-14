import { useState } from "react";
import { Film, Camera, Palette, Lightbulb, Volume2, Clock, Layers, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/store/videoStore";

const cinematicPresets = [
  {
    name: "Blade Runner 2049",
    description: "Cyberpunk neo-noir with orange/teal palette",
    settings: {
      colorGrading: { shadows: "#1a2332", midtones: "#ff6b35", highlights: "#00d4ff" },
      cameraMovement: "slow-push-in",
      lighting: "dramatic-rim",
      atmosphere: "foggy-neon",
      filmGrain: 0.3,
      vignette: 0.4,
    }
  },
  {
    name: "Mad Max: Fury Road",
    description: "High-contrast desert action with warm tones",
    settings: {
      colorGrading: { shadows: "#2d1810", midtones: "#ff8c42", highlights: "#fff3e0" },
      cameraMovement: "dynamic-tracking",
      lighting: "harsh-sun",
      atmosphere: "dusty-heat",
      filmGrain: 0.5,
      vignette: 0.2,
    }
  },
  {
    name: "Her (2013)",
    description: "Warm, intimate, soft romantic aesthetic",
    settings: {
      colorGrading: { shadows: "#3d2914", midtones: "#ff9a56", highlights: "#fff8f0" },
      cameraMovement: "gentle-float",
      lighting: "soft-natural",
      atmosphere: "dreamy-warm",
      filmGrain: 0.1,
      vignette: 0.1,
    }
  },
  {
    name: "The Matrix",
    description: "Green-tinted digital reality aesthetic",
    settings: {
      colorGrading: { shadows: "#0d1b0d", midtones: "#00ff41", highlights: "#c8ffc8" },
      cameraMovement: "bullet-time",
      lighting: "digital-green",
      atmosphere: "code-rain",
      filmGrain: 0.2,
      vignette: 0.3,
    }
  }
];

const cameraMovements = [
  "static", "slow-push-in", "pull-out", "pan-left", "pan-right",
  "tilt-up", "tilt-down", "dolly-zoom", "handheld", "steadicam",
  "crane-up", "crane-down", "tracking-shot", "orbit", "dutch-angle"
];

const lightingMoods = [
  "golden-hour", "blue-hour", "harsh-midday", "overcast-soft",
  "dramatic-rim", "chiaroscuro", "neon-noir", "candlelit",
  "studio-portrait", "natural-window", "moonlight", "firelight"
];

const atmosphericEffects = [
  "clear", "foggy", "misty", "smoky", "dusty", "rainy",
  "snowy", "hazy", "steamy", "particle-filled", "lens-flare"
];

const CinematicControls = () => {
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const cinematicSettings = structuredPrompt?.cinematic_controls || {
    colorGrading: { shadows: "#000000", midtones: "#808080", highlights: "#ffffff" },
    cameraMovement: "static",
    lighting: "natural-window",
    atmosphere: "clear",
    filmGrain: 0.2,
    vignette: 0.1,
    contrast: 0.5,
    saturation: 0.5,
    temperature: 0.5,
    exposure: 0.5,
  };

  const updateCinematicSetting = (field: string, value: any) => {
    const updated = {
      ...structuredPrompt,
      cinematic_controls: {
        ...cinematicSettings,
        [field]: value,
      },
    };
    setStructuredPrompt(updated);
  };

  const applyPreset = (preset: typeof cinematicPresets[0]) => {
    setSelectedPreset(preset.name);
    updateCinematicSetting("preset_applied", preset.name);
    
    // Apply all preset settings
    Object.entries(preset.settings).forEach(([key, value]) => {
      updateCinematicSetting(key, value);
    });
  };

  const ColorGradingWheel = ({ color, onChange, label }: { 
    color: string; 
    onChange: (color: string) => void; 
    label: string;
  }) => (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-border cursor-pointer"
        />
        <span className="text-xs font-mono text-muted-foreground">
          {color.toUpperCase()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cinematic Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Cinematic Presets</h4>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {cinematicPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedPreset === preset.name
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 hover:bg-surface-2 border border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{preset.name}</p>
                <div className="flex gap-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.settings.colorGrading.shadows }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.settings.colorGrading.midtones }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.settings.colorGrading.highlights }}
                  />
                </div>
              </div>
              <p className="text-xs opacity-80">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Grading */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Professional Color Grading</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <ColorGradingWheel
            color={cinematicSettings.colorGrading?.shadows || "#000000"}
            onChange={(color) => updateCinematicSetting("colorGrading", {
              ...cinematicSettings.colorGrading,
              shadows: color
            })}
            label="Shadows"
          />
          <ColorGradingWheel
            color={cinematicSettings.colorGrading?.midtones || "#808080"}
            onChange={(color) => updateCinematicSetting("colorGrading", {
              ...cinematicSettings.colorGrading,
              midtones: color
            })}
            label="Midtones"
          />
          <ColorGradingWheel
            color={cinematicSettings.colorGrading?.highlights || "#ffffff"}
            onChange={(color) => updateCinematicSetting("colorGrading", {
              ...cinematicSettings.colorGrading,
              highlights: color
            })}
            label="Highlights"
          />
        </div>

        {/* Color Adjustment Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Contrast</label>
            <Slider
              value={[cinematicSettings.contrast * 100]}
              onValueChange={([value]) => updateCinematicSetting("contrast", value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Saturation</label>
            <Slider
              value={[cinematicSettings.saturation * 100]}
              onValueChange={([value]) => updateCinematicSetting("saturation", value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Temperature</label>
            <Slider
              value={[cinematicSettings.temperature * 100]}
              onValueChange={([value]) => updateCinematicSetting("temperature", value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Exposure</label>
            <Slider
              value={[cinematicSettings.exposure * 100]}
              onValueChange={([value]) => updateCinematicSetting("exposure", value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Camera Movement */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Camera Movement</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {cameraMovements.map((movement) => (
            <button
              key={movement}
              onClick={() => updateCinematicSetting("cameraMovement", movement)}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                cinematicSettings.cameraMovement === movement
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {movement}
            </button>
          ))}
        </div>
      </div>

      {/* Lighting Mood */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Lighting Mood</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {lightingMoods.map((mood) => (
            <button
              key={mood}
              onClick={() => updateCinematicSetting("lighting", mood)}
              className={`px-3 py-2 rounded text-xs font-medium transition-all ${
                cinematicSettings.lighting === mood
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Atmospheric Effects */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Atmospheric Effects</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {atmosphericEffects.map((effect) => (
            <button
              key={effect}
              onClick={() => updateCinematicSetting("atmosphere", effect)}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                cinematicSettings.atmosphere === effect
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Film Effects */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Film Effects</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Film Grain</label>
            <Slider
              value={[cinematicSettings.filmGrain * 100]}
              onValueChange={([value]) => updateCinematicSetting("filmGrain", value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Vignette</label>
            <Slider
              value={[cinematicSettings.vignette * 100]}
              onValueChange={([value]) => updateCinematicSetting("vignette", value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Cinematic controls</span> provide professional color grading, camera movements, and atmospheric effects for film-quality results.
        </p>
      </div>
    </div>
  );
};

export default CinematicControls;