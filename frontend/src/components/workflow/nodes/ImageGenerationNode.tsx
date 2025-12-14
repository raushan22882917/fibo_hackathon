import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ImageGenerationNodeData {
  label: string;
  prompt?: string;
  aspect_ratio?: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
  settings?: any;
}

const ImageGenerationNode = memo(({ data, selected }: NodeProps<ImageGenerationNodeData>) => {
  const [promptValue, setPromptValue] = useState(data.prompt || "");
  const [settings, setSettings] = useState({
    aspect_ratio: data.aspect_ratio || "1:1",
    guidance_scale: data.guidance_scale || 7.5,
    num_inference_steps: data.num_inference_steps || 30,
    seed: data.seed || 5555,
  });

  const handlePromptChange = useCallback((newPrompt: string) => {
    setPromptValue(newPrompt);
    data.prompt = newPrompt;
  }, [data]);

  const updateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    data.settings = newSettings;
    data[key] = value; // Also update the direct property
  }, [settings, data]);

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
          <Label className="text-xs">Prompt</Label>
          <Input
            value={promptValue}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Image generation prompt..."
            className="text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Aspect Ratio</Label>
          <Select
            value={settings.aspect_ratio}
            onValueChange={(value) => updateSettings("aspect_ratio", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">Square (1:1)</SelectItem>
              <SelectItem value="16:9">Landscape (16:9)</SelectItem>
              <SelectItem value="9:16">Portrait (9:16)</SelectItem>
              <SelectItem value="4:3">Classic (4:3)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Guidance Scale: {settings.guidance_scale}</Label>
          <Slider
            value={[settings.guidance_scale]}
            onValueChange={([value]) => updateSettings("guidance_scale", value)}
            min={1}
            max={20}
            step={0.5}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Steps: {settings.num_inference_steps}</Label>
          <Slider
            value={[settings.num_inference_steps]}
            onValueChange={([value]) => updateSettings("num_inference_steps", value)}
            min={10}
            max={50}
            step={5}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Seed</Label>
          <Input
            type="number"
            value={settings.seed}
            onChange={(e) => updateSettings("seed", parseInt(e.target.value) || 5555)}
            className="text-xs"
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

ImageGenerationNode.displayName = "ImageGenerationNode";

export default ImageGenerationNode;