import { useVideoStore } from "@/store/videoStore";

const compositionRules = [
  "rule of thirds", "golden ratio", "centered", "symmetrical",
  "leading lines", "frame within frame", "negative space",
  "diagonal", "triangular", "radial", "pattern"
];

const moods = [
  "dramatic", "peaceful", "energetic", "mysterious", "romantic",
  "melancholic", "joyful", "tense", "serene", "epic", "intimate"
];

const CompositionControls = () => {
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateAesthetics = (field: string, value: string) => {
    setStructuredPrompt({
      ...structuredPrompt,
      aesthetics: {
        ...structuredPrompt?.aesthetics,
        [field]: value,
      },
    });
  };

  const currentAesthetics = structuredPrompt?.aesthetics || {};

  return (
    <div className="space-y-4">
      {/* Composition Rule */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Composition Rule
        </label>
        <div className="grid grid-cols-2 gap-2">
          {compositionRules.map((rule) => (
            <button
              key={rule}
              onClick={() => updateAesthetics("composition", rule)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentAesthetics.composition === rule
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {rule}
            </button>
          ))}
        </div>
      </div>

      {/* Mood & Atmosphere */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Mood & Atmosphere
        </label>
        <div className="grid grid-cols-3 gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => updateAesthetics("mood_atmosphere", mood)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentAesthetics.mood_atmosphere === mood
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Composition Notes */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Additional Composition Notes
        </label>
        <textarea
          value={currentAesthetics.notes || ""}
          onChange={(e) => updateAesthetics("notes", e.target.value)}
          placeholder="Describe specific composition details..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Composition</span> controls the visual structure and emotional impact. Use these parameters to create professional, well-balanced images.
        </p>
      </div>
    </div>
  );
};

export default CompositionControls;
