import { useVideoStore } from "@/store/videoStore";

const lightingConditions = [
  "golden hour", "blue hour", "harsh midday", "overcast", "dramatic",
  "soft diffused", "studio", "natural window", "backlit", "rim-lit",
  "low-key", "high-key", "chiaroscuro", "neon", "candlelit"
];

const lightingDirections = [
  "front", "side", "back", "top", "bottom", "three-point", "split"
];

const shadowTypes = [
  "soft", "hard", "long", "short", "dramatic", "minimal", "none"
];

const LightingControls = () => {
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateLighting = (field: string, value: string) => {
    setStructuredPrompt({
      ...structuredPrompt,
      lighting: {
        ...structuredPrompt?.lighting,
        [field]: value,
      },
    });
  };

  const currentLighting = structuredPrompt?.lighting || {};

  return (
    <div className="space-y-4">
      {/* Lighting Conditions */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Lighting Conditions
        </label>
        <div className="grid grid-cols-2 gap-2">
          {lightingConditions.map((condition) => (
            <button
              key={condition}
              onClick={() => updateLighting("conditions", condition)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentLighting.conditions === condition
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      {/* Light Direction */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Light Direction
        </label>
        <div className="grid grid-cols-3 gap-2">
          {lightingDirections.map((direction) => (
            <button
              key={direction}
              onClick={() => updateLighting("direction", direction)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentLighting.direction === direction
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {direction}
            </button>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Shadow Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {shadowTypes.map((shadow) => (
            <button
              key={shadow}
              onClick={() => updateLighting("shadows", shadow)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentLighting.shadows === shadow
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {shadow}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Lighting Description */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Custom Lighting Description
        </label>
        <textarea
          value={currentLighting.custom || ""}
          onChange={(e) => updateLighting("custom", e.target.value)}
          placeholder="Describe specific lighting setup..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Lighting</span> is crucial for mood and atmosphere. FIBO's structured lighting controls ensure consistent results across generations.
        </p>
      </div>
    </div>
  );
};

export default LightingControls;
