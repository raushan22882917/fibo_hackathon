import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Shuffle, Layers } from "lucide-react";

interface ImageMergeNodeData {
  label: string;
  merge_mode?: string;
  blend_mode?: string;
  opacity?: number;
  layout?: string;
  spacing?: number;
  background_color?: string;
  output_size?: string;
  quality?: number;
}

const ImageMergeNode = memo(({ data, selected }: NodeProps<ImageMergeNodeData>) => {
  const [settings, setSettings] = useState({
    merge_mode: data.merge_mode || "composite",
    blend_mode: data.blend_mode || "normal",
    opacity: data.opacity || 1.0,
    layout: data.layout || "grid",
    spacing: data.spacing || 10,
    background_color: data.background_color || "#FFFFFF",
    output_size: data.output_size || "auto",
    quality: data.quality || 0.9,
  });

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    Object.assign(data, newSettings);
  };

  const mergeModes = [
    { value: "composite", label: "Composite Blend" },
    { value: "collage", label: "Photo Collage" },
    { value: "grid", label: "Grid Layout" },
    { value: "overlay", label: "Layer Overlay" },
    { value: "mosaic", label: "Mosaic Pattern" },
    { value: "panorama", label: "Panorama Stitch" },
    { value: "double-exposure", label: "Double Exposure" },
    { value: "split-screen", label: "Split Screen" },
  ];

  const blendModes = [
    { value: "normal", label: "Normal" },
    { value: "multiply", label: "Multiply" },
    { value: "screen", label: "Screen" },
    { value: "overlay", label: "Overlay" },
    { value: "soft-light", label: "Soft Light" },
    { value: "hard-light", label: "Hard Light" },
    { value: "color-dodge", label: "Color Dodge" },
    { value: "color-burn", label: "Color Burn" },
    { value: "darken", label: "Darken" },
    { value: "lighten", label: "Lighten" },
    { value: "difference", label: "Difference" },
    { value: "exclusion", label: "Exclusion" },
  ];

  const layouts = [
    { value: "grid", label: "Grid Layout" },
    { value: "horizontal", label: "Horizontal Strip" },
    { value: "vertical", label: "Vertical Strip" },
    { value: "circular", label: "Circular Arrangement" },
    { value: "spiral", label: "Spiral Pattern" },
    { value: "random", label: "Random Placement" },
    { value: "masonry", label: "Masonry Layout" },
    { value: "diagonal", label: "Diagonal Flow" },
  ];

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" />
          {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Handle
          type="target"
          position={Position.Left}
          id="images"
          className="w-3 h-3"
          style={{ top: '30%' }}
        />
        <div className="text-xs text-muted-foreground absolute left-4" style={{ top: '25%' }}>
          Images
        </div>
        
        <Handle
          type="target"
          position={Position.Left}
          id="style"
          className="w-3 h-3"
          style={{ top: '50%' }}
        />
        <div className="text-xs text-muted-foreground absolute left-4" style={{ top: '45%' }}>
          Style
        </div>
        
        <Handle
          type="target"
          position={Position.Left}
          id="mask"
          className="w-3 h-3"
          style={{ top: '70%' }}
        />
        <div className="text-xs text-muted-foreground absolute left-4" style={{ top: '65%' }}>
          Mask
        </div>
        
        <div>
          <Label className="text-xs">Merge Mode</Label>
          <Select
            value={settings.merge_mode}
            onValueChange={(value) => updateSettings("merge_mode", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mergeModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Blend Mode</Label>
          <Select
            value={settings.blend_mode}
            onValueChange={(value) => updateSettings("blend_mode", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blendModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Opacity: {(settings.opacity * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.opacity]}
            onValueChange={([value]) => updateSettings("opacity", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Layout</Label>
          <Select
            value={settings.layout}
            onValueChange={(value) => updateSettings("layout", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layouts.map((layout) => (
                <SelectItem key={layout.value} value={layout.value}>
                  {layout.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Spacing: {settings.spacing}px</Label>
          <Slider
            value={[settings.spacing]}
            onValueChange={([value]) => updateSettings("spacing", value)}
            min={0}
            max={50}
            step={1}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.background_color}
              onChange={(e) => updateSettings("background_color", e.target.value)}
              className="w-8 h-8 rounded border"
            />
            <span className="text-xs">{settings.background_color}</span>
          </div>
        </div>

        <div>
          <Label className="text-xs">Output Size</Label>
          <Select
            value={settings.output_size}
            onValueChange={(value) => updateSettings("output_size", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Fit Content)</SelectItem>
              <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
              <SelectItem value="1920x1080">HD (1920x1080)</SelectItem>
              <SelectItem value="1080x1920">Portrait (1080x1920)</SelectItem>
              <SelectItem value="2048x2048">Large Square</SelectItem>
              <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Quality: {(settings.quality * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.quality]}
            onValueChange={([value]) => updateSettings("quality", value)}
            min={0.1}
            max={1}
            step={0.05}
            className="mt-1"
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Shuffle className="w-3 h-3 mr-1" />
            Randomize
          </Button>
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

ImageMergeNode.displayName = "ImageMergeNode";

export default ImageMergeNode;