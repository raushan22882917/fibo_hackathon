import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, RotateCw, Crop } from "lucide-react";

interface ImageFilterNodeData {
  label: string;
  filter_type?: string;
  intensity?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  sharpen?: number;
  rotation?: number;
}

const ImageFilterNode = memo(({ data, selected }: NodeProps<ImageFilterNodeData>) => {
  const [settings, setSettings] = useState({
    filter_type: data.filter_type || "enhance",
    intensity: data.intensity || 0.5,
    brightness: data.brightness || 0,
    contrast: data.contrast || 0,
    saturation: data.saturation || 0,
    blur: data.blur || 0,
    sharpen: data.sharpen || 0,
    rotation: data.rotation || 0,
  });

  const updateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    data[key] = value;
  }, [settings, data]);

  const resetFilters = useCallback(() => {
    const resetSettings = {
      filter_type: "enhance",
      intensity: 0.5,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      sharpen: 0,
      rotation: 0,
    };
    setSettings(resetSettings);
    Object.assign(data, resetSettings);
  }, [data]);

  const filterTypes = [
    { value: "enhance", label: "Auto Enhance" },
    { value: "vintage", label: "Vintage" },
    { value: "black-white", label: "Black & White" },
    { value: "sepia", label: "Sepia" },
    { value: "warm", label: "Warm Filter" },
    { value: "cool", label: "Cool Filter" },
    { value: "dramatic", label: "Dramatic" },
    { value: "soft", label: "Soft Focus" },
    { value: "vivid", label: "Vivid Colors" },
    { value: "matte", label: "Matte Finish" },
    { value: "film", label: "Film Grain" },
    { value: "hdr", label: "HDR Effect" },
  ];

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {data.label}
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
          <Label className="text-xs">Filter Type</Label>
          <Select
            value={settings.filter_type}
            onValueChange={(value) => updateSettings("filter_type", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterTypes.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Filter Intensity: {(settings.intensity * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.intensity]}
            onValueChange={([value]) => updateSettings("intensity", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Brightness: {settings.brightness > 0 ? '+' : ''}{(settings.brightness * 100).toFixed(0)}</Label>
            <Slider
              value={[settings.brightness]}
              onValueChange={([value]) => updateSettings("brightness", value)}
              min={-0.5}
              max={0.5}
              step={0.05}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Contrast: {settings.contrast > 0 ? '+' : ''}{(settings.contrast * 100).toFixed(0)}</Label>
            <Slider
              value={[settings.contrast]}
              onValueChange={([value]) => updateSettings("contrast", value)}
              min={-0.5}
              max={0.5}
              step={0.05}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Saturation: {settings.saturation > 0 ? '+' : ''}{(settings.saturation * 100).toFixed(0)}</Label>
            <Slider
              value={[settings.saturation]}
              onValueChange={([value]) => updateSettings("saturation", value)}
              min={-0.5}
              max={0.5}
              step={0.05}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Blur: {(settings.blur * 10).toFixed(1)}px</Label>
            <Slider
              value={[settings.blur]}
              onValueChange={([value]) => updateSettings("blur", value)}
              min={0}
              max={1}
              step={0.05}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Sharpen: {(settings.sharpen * 100).toFixed(0)}%</Label>
            <Slider
              value={[settings.sharpen]}
              onValueChange={([value]) => updateSettings("sharpen", value)}
              min={0}
              max={1}
              step={0.05}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Rotation: {settings.rotation}°</Label>
            <Slider
              value={[settings.rotation]}
              onValueChange={([value]) => updateSettings("rotation", value)}
              min={-180}
              max={180}
              step={15}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={resetFilters} className="flex-1">
            <RotateCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Crop className="w-3 h-3 mr-1" />
            Crop
          </Button>
        </div>

        <div className="bg-muted/30 p-2 rounded text-xs">
          <div className="font-medium mb-1">Filter Preview</div>
          <div>Type: {filterTypes.find(f => f.value === settings.filter_type)?.label}</div>
          <div>Intensity: {(settings.intensity * 100).toFixed(0)}%</div>
          <div>Adjustments: B{settings.brightness > 0 ? '+' : ''}{(settings.brightness * 100).toFixed(0)} C{settings.contrast > 0 ? '+' : ''}{(settings.contrast * 100).toFixed(0)} S{settings.saturation > 0 ? '+' : ''}{(settings.saturation * 100).toFixed(0)}</div>
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

ImageFilterNode.displayName = "ImageFilterNode";

export default ImageFilterNode;