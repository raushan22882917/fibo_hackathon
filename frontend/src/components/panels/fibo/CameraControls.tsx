import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";

const cameraAngles = [
  "eye-level", "low-angle", "high-angle", "bird's-eye", "worm's-eye",
  "dutch-angle", "over-the-shoulder", "point-of-view"
];

const focalLengths = [
  "ultra-wide (14-24mm)", "wide (24-35mm)", "standard (35-70mm)",
  "portrait (70-135mm)", "telephoto (135-300mm)", "super-telephoto (300mm+)"
];

const depthOfField = ["shallow", "medium", "deep"];
const focusTypes = ["sharp", "soft", "selective", "rack-focus"];

const CameraControls = () => {
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();

  const updateCamera = (field: string, value: any) => {
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
    <div className="space-y-4">
      {/* Camera Angle */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Camera Angle
        </label>
        <div className="grid grid-cols-2 gap-2">
          {cameraAngles.map((angle) => (
            <button
              key={angle}
              onClick={() => updateCamera("camera_angle", angle)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentCamera.camera_angle === angle
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {angle}
            </button>
          ))}
        </div>
      </div>

      {/* Focal Length */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Lens / Focal Length
        </label>
        <select
          value={currentCamera.lens_focal_length || ""}
          onChange={(e) => updateCamera("lens_focal_length", e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Select focal length...</option>
          {focalLengths.map((lens) => (
            <option key={lens} value={lens}>
              {lens}
            </option>
          ))}
        </select>
      </div>

      {/* Depth of Field */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Depth of Field
        </label>
        <div className="flex gap-2">
          {depthOfField.map((dof) => (
            <button
              key={dof}
              onClick={() => updateCamera("depth_of_field", dof)}
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

      {/* Focus */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Focus Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {focusTypes.map((focus) => (
            <button
              key={focus}
              onClick={() => updateCamera("focus", focus)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentCamera.focus === focus
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {focus}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Camera controls</span> define the perspective and technical characteristics of your shot. These parameters directly control how FIBO renders the scene.
        </p>
      </div>
    </div>
  );
};

export default CameraControls;
