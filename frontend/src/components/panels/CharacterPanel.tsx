import { Plus, User, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/hooks/use-toast";

const outfits = ["Casual", "Business", "Athletic", "Formal", "Elegant", "Streetwear"];
const poses = ["Standing", "Sitting", "Walking", "Running", "Dancing", "Action"];
const expressions = ["Neutral", "Happy", "Serious", "Surprised", "Thoughtful", "Confident"];

const CharacterPanel = () => {
  const { toast } = useToast();
  const { 
    characters, 
    selectedCharacter, 
    setSelectedCharacter,
    structuredPrompt,
    setStructuredPrompt,
  } = useVideoStore();

  const currentChar = characters.find(c => c.id === selectedCharacter);
  const charObject = structuredPrompt?.objects?.find((obj: any) => 
    obj.description?.toLowerCase().includes('person') || 
    obj.description?.toLowerCase().includes('character')
  );

  const updateCharacter = (field: string, value: string) => {
    const objects = structuredPrompt?.objects || [];
    const charIndex = objects.findIndex((obj: any) => 
      obj.description?.toLowerCase().includes('person') || 
      obj.description?.toLowerCase().includes('character')
    );

    if (charIndex >= 0) {
      const updatedObjects = [...objects];
      updatedObjects[charIndex] = {
        ...updatedObjects[charIndex],
        [field]: value,
      };
      setStructuredPrompt({
        ...structuredPrompt,
        objects: updatedObjects,
      });
    } else {
      // Create new character object
      setStructuredPrompt({
        ...structuredPrompt,
        objects: [
          ...objects,
          {
            description: "person",
            location: "center",
            relationship: "in the scene",
            [field]: value,
          },
        ],
      });
    }
  };

  return (
    <div className="p-4 space-y-5 animate-slide-in-right">
      {/* Character Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            Characters
          </label>
          <Button variant="ghost" size="icon-sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char.id)}
              className={`flex-1 p-3 rounded-lg border transition-all ${
                selectedCharacter === char.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-1 hover:bg-surface-2"
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${char.id === 'C1' ? 'bg-primary' : 'bg-accent'} mx-auto mb-2 flex items-center justify-center`}>
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-xs font-medium text-center">{char.id}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Face Identity Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Face Identity
        </label>
        <div className="p-4 rounded-lg bg-surface-1 border border-border flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-surface-2 flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Embedding loaded</p>
            <p className="text-xs text-muted-foreground">Click to replace</p>
          </div>
        </div>
      </div>

      {/* Outfit / Clothing */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Clothing
        </label>
        <div className="flex flex-wrap gap-2">
          {outfits.map((o) => (
            <button
              key={o}
              onClick={() => updateCharacter("clothing", o)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                charObject?.clothing === o
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Pose */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Pose
        </label>
        <div className="flex flex-wrap gap-2">
          {poses.map((p) => (
            <button
              key={p}
              onClick={() => updateCharacter("pose", p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                charObject?.pose === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Expression */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Expression
        </label>
        <div className="flex flex-wrap gap-2">
          {expressions.map((e) => (
            <button
              key={e}
              onClick={() => updateCharacter("expression", e)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                charObject?.expression === e
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Action / Activity
        </label>
        <input
          type="text"
          value={charObject?.action || ""}
          onChange={(e) => updateCharacter("action", e.target.value)}
          placeholder="e.g., walking, talking, gesturing..."
          className="w-full px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Character settings</span> update the structured prompt. Use the FIBO Editor to generate with these parameters.
        </p>
      </div>
    </div>
  );
};

export default CharacterPanel;
