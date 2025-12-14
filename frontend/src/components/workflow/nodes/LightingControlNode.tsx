import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface LightingControlNodeData {
  label: string;
  setup?: string;
  direction?: string;
  intensity?: number;
  temperature?: number;
  contrast?: number;
  shadows?: string;
  highlights?: number;
  ambient?: number;
}

const LightingControlNode = memo(({ data, selected }: NodeProps<LightingControlNodeData>) => {
  const [settings, setSettings] = useState({
    setup: data.setup || "three-point",
    direction: data.direction || "front",
    intensity: data.intensity || 0.7,
    temperature: data.temperature || 5500,
    contrast: data.contrast || 0.5,
    shadows: data.shadows || "soft",
    highlights: data.highlights || 0.6,
    ambient: data.ambient || 0.3,
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
          💡 {data.label}
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
          <Label className="text-xs">Lighting Setup</Label>
          <Select
            value={settings.setup}
            onValueChange={(value) => updateSettings("setup", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="three-point">Three-Point Lighting</SelectItem>
              <SelectItem value="key-only">Key Light Only</SelectItem>
              <SelectItem value="rembrandt">Rembrandt Lighting</SelectItem>
              <SelectItem value="butterfly">Butterfly Lighting</SelectItem>
              <SelectItem value="split">Split Lighting</SelectItem>
              <SelectItem value="rim">Rim Lighting</SelectItem>
              <SelectItem value="silhouette">Silhouette</SelectItem>
              <SelectItem value="natural">Natural Light</SelectItem>
              <SelectItem value="studio">Studio Setup</SelectItem>
              <SelectItem value="dramatic">Dramatic Lighting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Light Direction</Label>
          <Select
            value={settings.direction}
            onValueChange={(value) => updateSettings("direction", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="front">Front Light</SelectItem>
              <SelectItem value="side">Side Light</SelectItem>
              <SelectItem value="back">Back Light</SelectItem>
              <SelectItem value="top">Top Light</SelectItem>
              <SelectItem value="bottom">Bottom Light</SelectItem>
              <SelectItem value="45-degree">45° Angle</SelectItem>
              <SelectItem value="cross">Cross Lighting</SelectItem>
              <SelectItem value="overhead">Overhead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Light Intensity: {(settings.intensity * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.intensity]}
            onValueChange={([value]) => updateSettings("intensity", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Color Temperature: {settings.temperature}K</Label>
          <Slider
            value={[settings.temperature]}
            onValueChange={([value]) => updateSettings("temperature", value)}
            min={2000}
            max={10000}
            step={100}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.temperature < 3000 ? "Warm (Candlelight)" :
             settings.temperature < 4000 ? "Warm (Tungsten)" :
             settings.temperature < 5500 ? "Neutral" :
             settings.temperature < 7000 ? "Cool (Daylight)" : "Cool (Sky)"}
          </div>
        </div>

        <div>
          <Label className="text-xs">Contrast: {(settings.contrast * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.contrast]}
            onValueChange={([value]) => updateSettings("contrast", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Shadow Type</Label>
          <Select
            value={settings.shadows}
            onValueChange={(value) => updateSettings("shadows", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">Soft Shadows</SelectItem>
              <SelectItem value="hard">Hard Shadows</SelectItem>
              <SelectItem value="dramatic">Dramatic Shadows</SelectItem>
              <SelectItem value="minimal">Minimal Shadows</SelectItem>
              <SelectItem value="long">Long Shadows</SelectItem>
              <SelectItem value="contact">Contact Shadows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Highlights: {(settings.highlights * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.highlights]}
            onValueChange={([value]) => updateSettings("highlights", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Ambient Light: {(settings.ambient * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.ambient]}
            onValueChange={([value]) => updateSettings("ambient", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
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

LightingControlNode.displayName = "LightingControlNode";

export default LightingControlNode;