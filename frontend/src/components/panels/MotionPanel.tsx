import { Move, Spline, Gauge, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const motionPresets = [
  { id: "walk", name: "Walk", icon: "🚶" },
  { id: "run", name: "Run", icon: "🏃" },
  { id: "sit", name: "Sit", icon: "🪑" },
  { id: "gesture", name: "Gesture", icon: "🖐️" },
  { id: "custom", name: "Custom", icon: "✨" },
];

const MotionPanel = () => {
  const [selectedPreset, setSelectedPreset] = useState("walk");
  const [pathSmoothing, setPathSmoothing] = useState([50]);
  const [speedCurve, setSpeedCurve] = useState([1.0]);
  const [keyframes, setKeyframes] = useState([
    { frame: 0, position: "Start" },
    { frame: 60, position: "Mid" },
    { frame: 120, position: "End" },
  ]);

  return (
    <div className="p-4 space-y-5 animate-slide-in-right">
      {/* Motion Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Move className="w-4 h-4" />
          <span>Motion Presets</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {motionPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                selectedPreset === preset.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-1 hover:bg-surface-2"
              }`}
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="text-xs font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Draw Path */}
      <div className="p-4 rounded-lg bg-surface-1 border border-dashed border-primary/30 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Spline className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Draw Motion Path</p>
          <p className="text-xs text-muted-foreground">
            Click on canvas to define path points
          </p>
        </div>
        <Button variant="glow" size="sm">
          Start Drawing
        </Button>
      </div>

      {/* Path Smoothing */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Spline className="w-4 h-4" />
          <span>Path Smoothing: {pathSmoothing[0]}%</span>
        </div>
        <Slider
          value={pathSmoothing}
          onValueChange={setPathSmoothing}
          min={0}
          max={100}
          step={1}
        />
      </div>

      {/* Speed Curve */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Gauge className="w-4 h-4" />
          <span>Speed: {speedCurve[0].toFixed(1)}x</span>
        </div>
        <Slider
          value={speedCurve}
          onValueChange={setSpeedCurve}
          min={0.1}
          max={3.0}
          step={0.1}
        />
      </div>

      {/* Keyframes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Keyframes
          </span>
          <Button variant="ghost" size="icon-sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {keyframes.map((kf, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 rounded-lg bg-surface-1 border border-border"
            >
              <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-accent">
                  {kf.frame}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{kf.position}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MotionPanel;
