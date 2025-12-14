import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface StyleControlNodeData {
  label: string;
  style?: string;
  intensity?: number;
  color_palette?: string;
}

const StyleControlNode = memo(({ data, selected }: NodeProps<StyleControlNodeData>) => {
  const [settings, setSettings] = useState({
    style: data.style || "cinematic",
    intensity: data.intensity || 0.7,
    color_palette: data.color_palette || "vibrant",
  });

  const updateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    Object.assign(data, newSettings);
    data[key] = value; // Ensure direct property is also updated
  }, [settings, data]);

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🎭 {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="w-3 h-3"
        />
        
        <div>
          <Label className="text-xs">Style</Label>
          <Select
            value={settings.style}
            onValueChange={(value) => updateSettings("style", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cinematic">Cinematic</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="realistic">Realistic</SelectItem>
              <SelectItem value="artistic">Artistic</SelectItem>
              <SelectItem value="abstract">Abstract</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="futuristic">Futuristic</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Intensity: {settings.intensity}</Label>
          <Slider
            value={[settings.intensity]}
            onValueChange={([value]) => updateSettings("intensity", value)}
            min={0}
            max={1}
            step={0.1}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Color Palette</Label>
          <Select
            value={settings.color_palette}
            onValueChange={(value) => updateSettings("color_palette", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vibrant">Vibrant</SelectItem>
              <SelectItem value="muted">Muted</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cool">Cool</SelectItem>
              <SelectItem value="monochrome">Monochrome</SelectItem>
              <SelectItem value="pastel">Pastel</SelectItem>
              <SelectItem value="neon">Neon</SelectItem>
              <SelectItem value="earth">Earth Tones</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3"
        />
      </CardContent>
    </Card>
  );
});

StyleControlNode.displayName = "StyleControlNode";

export default StyleControlNode;