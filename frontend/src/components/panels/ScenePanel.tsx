import { Mountain, Sun, Box, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";

const environments = [
  { id: "studio", name: "Studio", emoji: "🎬" },
  { id: "outdoor", name: "Outdoor", emoji: "🌳" },
  { id: "urban", name: "Urban", emoji: "🏙️" },
  { id: "abstract", name: "Abstract", emoji: "✨" },
  { id: "indoor", name: "Indoor", emoji: "🏠" },
];

const timeOfDay = ["Dawn", "Morning", "Noon", "Afternoon", "Evening", "Night"];

const lightingConditions = [
  "natural daylight",
  "golden hour",
  "blue hour",
  "overcast",
  "dramatic lighting",
  "soft diffused",
  "studio lighting",
  "neon lights",
];

const ScenePanel = () => {
  const { scene, updateScene, structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateLighting = (field: string, value: any) => {
    setStructuredPrompt({
      ...structuredPrompt,
      lighting: {
        ...structuredPrompt?.lighting,
        [field]: value,
      },
    });
  };

  return (
    <div className="p-4 space-y-5 animate-slide-in-right">
      {/* Environment */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Mountain className="w-4 h-4" />
          <span>Environment</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => updateScene({ environment: env.id })}
              className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                scene.environment === env.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-1 hover:bg-surface-2"
              }`}
            >
              <span className="text-xl">{env.emoji}</span>
              <span className="text-xs font-medium">{env.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Setting */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Background Description
        </label>
        <textarea
          value={structuredPrompt?.background_setting || ""}
          onChange={(e) =>
            setStructuredPrompt({
              ...structuredPrompt,
              background_setting: e.target.value,
            })
          }
          placeholder="Describe the background environment..."
          className="w-full h-20 px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Time of Day */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Time of Day</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {timeOfDay.map((t) => (
            <button
              key={t}
              onClick={() => updateScene({ timeOfDay: t })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                scene.timeOfDay === t
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Lighting */}
      <div className="space-y-4 p-4 rounded-lg bg-surface-1 border border-border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sun className="w-4 h-4 text-yellow-400" />
          <span>Lighting</span>
        </div>
        
        {/* Lighting Conditions */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Conditions</label>
          <select
            value={structuredPrompt?.lighting?.conditions || ""}
            onChange={(e) => updateLighting("conditions", e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select lighting...</option>
            {lightingConditions.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Intensity</span>
            <span>{scene.lightIntensity}%</span>
          </div>
          <Slider
            value={[scene.lightIntensity]}
            onValueChange={([v]) => updateScene({ lightIntensity: v })}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Temperature</span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <span>{scene.lightTemperature}%</span>
              <span className="w-3 h-3 rounded-full bg-orange-400" />
            </span>
          </div>
          <Slider
            value={[scene.lightTemperature]}
            onValueChange={([v]) => updateScene({ lightTemperature: v })}
            min={0}
            max={100}
            step={1}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Scene settings</span> control the environment, lighting, and atmosphere. These update the structured prompt for FIBO generation.
        </p>
      </div>
    </div>
  );
};

export default ScenePanel;
