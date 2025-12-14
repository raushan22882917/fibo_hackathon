import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/store/videoStore";

const locations = ["foreground", "midground", "background", "center", "left", "right", "top", "bottom"];
const sizes = ["tiny", "small", "medium", "large", "dominant", "life-size"];
const relationships = ["next to", "behind", "in front of", "above", "below", "surrounding", "inside"];

const ObjectControls = () => {
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const objects = structuredPrompt?.objects || [];

  const addObject = () => {
    const newObject = {
      description: "",
      location: "center",
      relationship: "in the scene",
      relative_size: "medium",
      shape_and_color: "",
      texture: "",
      appearance_details: "",
    };

    setStructuredPrompt({
      ...structuredPrompt,
      objects: [...objects, newObject],
    });
    setEditingIndex(objects.length);
  };

  const updateObject = (index: number, field: string, value: any) => {
    const updatedObjects = [...objects];
    updatedObjects[index] = {
      ...updatedObjects[index],
      [field]: value,
    };

    setStructuredPrompt({
      ...structuredPrompt,
      objects: updatedObjects,
    });
  };

  const removeObject = (index: number) => {
    const updatedObjects = objects.filter((_, i) => i !== index);
    setStructuredPrompt({
      ...structuredPrompt,
      objects: updatedObjects,
    });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Object List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Scene Objects ({objects.length})
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={addObject}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Object
          </Button>
        </div>

        {objects.length === 0 && (
          <div className="p-4 rounded-lg bg-surface-1 border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No objects defined. Click "Add Object" to start building your scene.
            </p>
          </div>
        )}

        {objects.map((obj, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-all ${
              editingIndex === index
                ? "bg-primary/5 border-primary"
                : "bg-surface-1 border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <button
                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                className="flex-1 text-left"
              >
                <p className="text-sm font-medium text-foreground">
                  {obj.description || `Object ${index + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {obj.location} • {obj.relative_size}
                </p>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeObject(index)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {editingIndex === index && (
              <div className="space-y-3 mt-3 pt-3 border-t border-border">
                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Description</label>
                  <input
                    type="text"
                    value={obj.description || ""}
                    onChange={(e) => updateObject(index, "description", e.target.value)}
                    placeholder="e.g., red sports car, ancient tree, modern building"
                    className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Location</label>
                  <select
                    value={obj.location || ""}
                    onChange={(e) => updateObject(index, "location", e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Relative Size</label>
                  <select
                    value={obj.relative_size || ""}
                    onChange={(e) => updateObject(index, "relative_size", e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {sizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Relationship */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Spatial Relationship</label>
                  <input
                    type="text"
                    value={obj.relationship || ""}
                    onChange={(e) => updateObject(index, "relationship", e.target.value)}
                    placeholder="e.g., next to the building, behind the tree"
                    className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Appearance */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Appearance Details</label>
                  <textarea
                    value={obj.appearance_details || ""}
                    onChange={(e) => updateObject(index, "appearance_details", e.target.value)}
                    placeholder="Detailed visual description..."
                    className="w-full h-16 px-2 py-1.5 rounded bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Background Setting */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Background Setting
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

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Objects</span> define what's in your scene and their spatial relationships. This structured approach ensures precise control over scene composition.
        </p>
      </div>
    </div>
  );
};

export default ObjectControls;
