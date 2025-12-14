import { Camera, Sun, Focus, Move3d } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";

const lensOptions = [
  "ultra-wide (14-24mm)",
  "wide (24-35mm)",
  "standard (35-70mm)",
  "portrait (70-135mm)",
  "telephoto (135-300mm)",
];

const anglePresets = [
  { id: "eye-level", label: "Eye Level", icon: "👁️" },
  { id: "low-angle", label: "Low Angle", icon: "⬆️" },
  { id: "high-angle", label: "High Angle", icon: "⬇️" },
  { id: "dutch-angle", label: "Dutch Tilt", icon: "↗️" },
  { id: "bird's-eye", label: "Bird's Eye", icon: "🦅" },
  { id: "worm's-eye", label: "Worm's Eye", icon: "🐛" },
];

const depthOfField = ["shallow", "medium", "deep"];

const CameraPanel = () => {
  const { camera, updateCamera, structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateCameraCharacteristics = (field: string, value: any) => {
    setStructuredPrompt({
      ...structuredPrompt,
      photographic_characteristics: {
        ...structuredPrompt?.photographic_characteristics,
        [field]: value,
      },
    });
  };

  const currentCamera = structuredPrompt?.photographic_characteristics || {};

  return (
    <div className="p-4 space-y-5 animate-slide-in-right">
      {/* FOV */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Camera className="w-4 h-4" />
          <span>Field of View: {camera.fov}°</span>
        </div>
        <Slider
          value={[camera.fov]}
          onValueChange={([v]) => updateCamera({ fov: v })}
          min={15}
          max={120}
          step={1}
          className="py-2"
        />
      </div>

      {/* Lens / Focal Length */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Lens / Focal Length
        </label>
        <div className="grid grid-cols-1 gap-2">
          {lensOptions.map((l) => (
            <button
              key={l}
              onClick={() => {
                updateCamera({ lens: l });
                updateCameraCharacteristics("lens_focal_length", l);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentCamera.lens_focal_length === l
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Exposure */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sun className="w-4 h-4" />
          <span>Exposure: {camera.exposure > 0 ? "+" : ""}{camera.exposure.toFixed(1)}</span>
        </div>
        <Slider
          value={[camera.exposure]}
          onValueChange={([v]) => updateCamera({ exposure: v })}
          min={-3}
          max={3}
          step={0.1}
          className="py-2"
        />
      </div>

      {/* Depth of Field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Focus className="w-4 h-4" />
          <span>Depth of Field</span>
        </div>
        <div className="flex gap-2">
          {depthOfField.map((dof) => (
            <button
              key={dof}
              onClick={() => {
                updateCamera({ dof: depthOfField.indexOf(dof) * 50 });
                updateCameraCharacteristics("depth_of_field", dof);
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentCamera.depth_of_field === dof
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {dof}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Angle Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Move3d className="w-4 h-4" />
          <span>Camera Angle</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {anglePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                updateCamera({ angle: preset.id });
                updateCameraCharacteristics("camera_angle", preset.id);
              }}
              className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                currentCamera.camera_angle === preset.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-1 hover:bg-surface-2"
              }`}
            >
              <span className="text-lg">{preset.icon}</span>
              <span className="text-xs font-medium">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Camera settings</span> update both the editor state and structured prompt. Use FIBO Editor to generate with these parameters.
        </p>
      </div>
    </div>
  );
};

export default CameraPanel;
