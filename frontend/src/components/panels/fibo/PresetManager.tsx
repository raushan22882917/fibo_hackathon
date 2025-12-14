import { useState } from "react";
import { Save, FolderOpen, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/hooks/use-toast";

interface Preset {
  id: string;
  name: string;
  description: string;
  structuredPrompt: any;
  createdAt: string;
}

const PresetManager = () => {
  const { toast } = useToast();
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem("fibo-presets");
    return saved ? JSON.parse(saved) : [];
  });
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const savePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your preset",
        variant: "destructive",
      });
      return;
    }

    if (!structuredPrompt) {
      toast({
        title: "No Configuration",
        description: "Please configure FIBO parameters first",
        variant: "destructive",
      });
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      description: presetDescription,
      structuredPrompt,
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem("fibo-presets", JSON.stringify(updatedPresets));

    toast({
      title: "Preset Saved",
      description: `"${presetName}" has been saved successfully`,
    });

    setPresetName("");
    setPresetDescription("");
    setShowSaveForm(false);
  };

  const loadPreset = (preset: Preset) => {
    setStructuredPrompt(preset.structuredPrompt);
    toast({
      title: "Preset Loaded",
      description: `"${preset.name}" has been loaded`,
    });
  };

  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter((p) => p.id !== id);
    setPresets(updatedPresets);
    localStorage.setItem("fibo-presets", JSON.stringify(updatedPresets));
    toast({
      title: "Preset Deleted",
      description: "Preset has been removed",
    });
  };

  const exportPreset = (preset: Preset) => {
    const dataStr = JSON.stringify(preset, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fibo-preset-${preset.name.replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPreset = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const preset = JSON.parse(event.target?.result as string);
            const updatedPresets = [...presets, preset];
            setPresets(updatedPresets);
            localStorage.setItem("fibo-presets", JSON.stringify(updatedPresets));
            toast({
              title: "Preset Imported",
              description: `"${preset.name}" has been imported`,
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid preset file",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      {/* Save New Preset */}
      <div className="space-y-2">
        {!showSaveForm ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowSaveForm(true)}
            disabled={!structuredPrompt}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Current Configuration
          </Button>
        ) : (
          <div className="p-3 rounded-lg bg-surface-1 border border-border space-y-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <textarea
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="w-full h-16 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowSaveForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={savePreset}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={importPreset}
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
      </div>

      {/* Preset List */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Saved Presets ({presets.length})
        </label>

        {presets.length === 0 && (
          <div className="p-4 rounded-lg bg-surface-1 border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No saved presets yet. Configure FIBO parameters and save them for reuse.
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="p-3 rounded-lg bg-surface-1 border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {preset.name}
                  </p>
                  {preset.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {preset.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(preset.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => loadPreset(preset)}
                >
                  <FolderOpen className="w-3 h-3 mr-1" />
                  Load
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => exportPreset(preset)}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => deletePreset(preset.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Presets</span> save your complete FIBO configuration for reuse. Export presets to share with your team or use across projects.
        </p>
      </div>
    </div>
  );
};

export default PresetManager;
