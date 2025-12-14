import { useVideoStore } from "@/store/videoStore";

const colorSchemes = [
  "monochromatic", "analogous", "complementary", "triadic",
  "split-complementary", "tetradic", "warm", "cool",
  "vibrant", "muted", "pastel", "earth tones", "neon",
  "black and white", "sepia", "cinematic teal-orange"
];

const predefinedPalettes = [
  { name: "Sunset", colors: ["#FF6B35", "#F7931E", "#FDC830", "#F37335"] },
  { name: "Ocean", colors: ["#006994", "#0892A5", "#1AC9E6", "#6DD3CE"] },
  { name: "Forest", colors: ["#2D4A2B", "#5C8D4E", "#8FBC8F", "#C1E1C1"] },
  { name: "Cyberpunk", colors: ["#FF006E", "#8338EC", "#3A86FF", "#FB5607"] },
  { name: "Vintage", colors: ["#8B4513", "#D2691E", "#F4A460", "#DEB887"] },
  { name: "Nordic", colors: ["#2E3440", "#3B4252", "#88C0D0", "#ECEFF4"] },
];

const ColorControls = () => {
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateColorScheme = (scheme: string) => {
    setStructuredPrompt({
      ...structuredPrompt,
      aesthetics: {
        ...structuredPrompt?.aesthetics,
        color_scheme: scheme,
      },
    });
  };

  const applyPalette = (palette: typeof predefinedPalettes[0]) => {
    const paletteDescription = `${palette.name} palette: ${palette.colors.join(", ")}`;
    setStructuredPrompt({
      ...structuredPrompt,
      aesthetics: {
        ...structuredPrompt?.aesthetics,
        color_scheme: paletteDescription,
      },
    });
  };

  const currentColorScheme = structuredPrompt?.aesthetics?.color_scheme || "";

  return (
    <div className="space-y-4">
      {/* Color Scheme */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Color Scheme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme}
              onClick={() => updateColorScheme(scheme)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentColorScheme === scheme
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {scheme}
            </button>
          ))}
        </div>
      </div>

      {/* Predefined Palettes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quick Palettes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {predefinedPalettes.map((palette) => (
            <button
              key={palette.name}
              onClick={() => applyPalette(palette)}
              className="p-2 rounded-lg bg-surface-1 border border-border hover:border-primary transition-all group"
            >
              <div className="flex gap-1 mb-1">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-6 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {palette.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Description */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Custom Color Description
        </label>
        <textarea
          value={currentColorScheme}
          onChange={(e) => updateColorScheme(e.target.value)}
          placeholder="Describe your color palette in detail..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Color palettes</span> define the visual tone. FIBO's structured color control ensures consistent color grading across all generations.
        </p>
      </div>
    </div>
  );
};

export default ColorControls;
