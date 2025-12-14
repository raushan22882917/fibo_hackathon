import { useVideoStore } from "@/store/videoStore";

const styleMediums = [
  "Photography", "Digital Art", "Oil Painting", "Watercolor",
  "Pencil Sketch", "Ink Drawing", "3D Render", "Vector Art",
  "Pixel Art", "Collage", "Mixed Media", "Photorealistic CGI"
];

const artisticStyles = [
  "Realistic", "Impressionist", "Expressionist", "Surrealist",
  "Abstract", "Minimalist", "Art Nouveau", "Art Deco",
  "Cubist", "Pop Art", "Street Art", "Concept Art",
  "Anime", "Comic Book", "Film Noir", "Cyberpunk",
  "Steampunk", "Fantasy", "Sci-Fi", "Retro"
];

const contexts = [
  "Commercial Photography", "Editorial", "Fine Art", "Documentary",
  "Fashion", "Product Photography", "Architectural", "Landscape",
  "Portrait", "Street Photography", "Advertising", "Cinematic"
];

const StyleControls = () => {
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateStyle = (field: string, value: string) => {
    setStructuredPrompt({
      ...structuredPrompt,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Style Medium */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Style Medium
        </label>
        <div className="grid grid-cols-2 gap-2">
          {styleMediums.map((medium) => (
            <button
              key={medium}
              onClick={() => updateStyle("style_medium", medium)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                structuredPrompt?.style_medium === medium
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {medium}
            </button>
          ))}
        </div>
      </div>

      {/* Artistic Style */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Artistic Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {artisticStyles.map((style) => (
            <button
              key={style}
              onClick={() => updateStyle("artistic_style", style)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                structuredPrompt?.artistic_style === style
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Context */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Context / Use Case
        </label>
        <div className="grid grid-cols-2 gap-2">
          {contexts.map((context) => (
            <button
              key={context}
              onClick={() => updateStyle("context", context)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                structuredPrompt?.context === context
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {context}
            </button>
          ))}
        </div>
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Short Description
        </label>
        <textarea
          value={structuredPrompt?.short_description || ""}
          onChange={(e) => updateStyle("short_description", e.target.value)}
          placeholder="Brief summary of the image concept..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Style parameters</span> define the overall aesthetic and medium. These settings work consistently across all FIBO generations.
        </p>
      </div>

      {/* FIBO Badge */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
        <div className="flex items-start gap-2">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="text-sm font-semibold text-primary mb-1">
              Fully Licensed Content
            </p>
            <p className="text-xs text-foreground/80">
              FIBO was trained on 1+ billion fully licensed images, ensuring commercial safety and full indemnity for your productions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleControls;
