import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ColorPaletteNodeData {
  label: string;
  scheme?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  saturation?: number;
  brightness?: number;
  contrast?: number;
  temperature?: string;
  harmony?: string;
}

const ColorPaletteNode = memo(({ data, selected }: NodeProps<ColorPaletteNodeData>) => {
  const [settings, setSettings] = useState({
    scheme: data.scheme || "complementary",
    primary_color: data.primary_color || "#3B82F6",
    secondary_color: data.secondary_color || "#EF4444",
    accent_color: data.accent_color || "#F59E0B",
    saturation: data.saturation || 0.7,
    brightness: data.brightness || 0.6,
    contrast: data.contrast || 0.5,
    temperature: data.temperature || "neutral",
    harmony: data.harmony || "balanced",
  });

  const updateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    Object.assign(data, newSettings);
    data[key] = value; // Ensure direct property is also updated
  }, [settings, data]);

  const colorSchemes = [
    { value: "monochromatic", label: "Monochromatic" },
    { value: "analogous", label: "Analogous" },
    { value: "complementary", label: "Complementary" },
    { value: "triadic", label: "Triadic" },
    { value: "tetradic", label: "Tetradic" },
    { value: "split-complementary", label: "Split Complementary" },
    { value: "warm", label: "Warm Palette" },
    { value: "cool", label: "Cool Palette" },
    { value: "earth-tones", label: "Earth Tones" },
    { value: "pastel", label: "Pastel Colors" },
    { value: "neon", label: "Neon/Vibrant" },
    { value: "muted", label: "Muted/Desaturated" },
  ];

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🎨 {data.label}
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
          <Label className="text-xs">Color Scheme</Label>
          <Select
            value={settings.scheme}
            onValueChange={(value) => updateSettings("scheme", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colorSchemes.map((scheme) => (
                <SelectItem key={scheme.value} value={scheme.value}>
                  {scheme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Primary</Label>
            <div className="flex items-center gap-1">
              <Input
                type="color"
                value={settings.primary_color}
                onChange={(e) => updateSettings("primary_color", e.target.value)}
                className="w-8 h-8 p-0 border-0"
              />
              <Input
                value={settings.primary_color}
                onChange={(e) => updateSettings("primary_color", e.target.value)}
                className="text-xs flex-1"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Secondary</Label>
            <div className="flex items-center gap-1">
              <Input
                type="color"
                value={settings.secondary_color}
                onChange={(e) => updateSettings("secondary_color", e.target.value)}
                className="w-8 h-8 p-0 border-0"
              />
              <Input
                value={settings.secondary_color}
                onChange={(e) => updateSettings("secondary_color", e.target.value)}
                className="text-xs flex-1"
                placeholder="#EF4444"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Accent</Label>
            <div className="flex items-center gap-1">
              <Input
                type="color"
                value={settings.accent_color}
                onChange={(e) => updateSettings("accent_color", e.target.value)}
                className="w-8 h-8 p-0 border-0"
              />
              <Input
                value={settings.accent_color}
                onChange={(e) => updateSettings("accent_color", e.target.value)}
                className="text-xs flex-1"
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs">Saturation: {(settings.saturation * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.saturation]}
            onValueChange={([value]) => updateSettings("saturation", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.saturation < 0.3 ? "Desaturated/Muted" :
             settings.saturation < 0.7 ? "Balanced" : "Highly Saturated"}
          </div>
        </div>

        <div>
          <Label className="text-xs">Brightness: {(settings.brightness * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.brightness]}
            onValueChange={([value]) => updateSettings("brightness", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.brightness < 0.3 ? "Dark/Moody" :
             settings.brightness < 0.7 ? "Balanced" : "Bright/Light"}
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
          <div className="text-xs text-muted-foreground mt-1">
            {settings.contrast < 0.3 ? "Low Contrast" :
             settings.contrast < 0.7 ? "Medium Contrast" : "High Contrast"}
          </div>
        </div>

        <div>
          <Label className="text-xs">Color Temperature</Label>
          <Select
            value={settings.temperature}
            onValueChange={(value) => updateSettings("temperature", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very-warm">Very Warm (2000K)</SelectItem>
              <SelectItem value="warm">Warm (3000K)</SelectItem>
              <SelectItem value="neutral">Neutral (5000K)</SelectItem>
              <SelectItem value="cool">Cool (6500K)</SelectItem>
              <SelectItem value="very-cool">Very Cool (8000K)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Color Harmony</Label>
          <Select
            value={settings.harmony}
            onValueChange={(value) => updateSettings("harmony", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced Harmony</SelectItem>
              <SelectItem value="dominant">Dominant Color</SelectItem>
              <SelectItem value="gradient">Gradient Transition</SelectItem>
              <SelectItem value="accent-pop">Accent Pop</SelectItem>
              <SelectItem value="tonal">Tonal Variation</SelectItem>
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

ColorPaletteNode.displayName = "ColorPaletteNode";

export default ColorPaletteNode;