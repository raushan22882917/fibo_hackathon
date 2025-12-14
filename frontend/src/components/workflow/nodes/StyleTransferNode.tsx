import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Upload } from "lucide-react";

interface StyleTransferNodeData {
  label: string;
  style_type?: string;
  style_strength?: number;
  preserve_content?: number;
  color_preservation?: number;
  detail_enhancement?: number;
  style_image?: File;
  preset_style?: string;
}

const StyleTransferNode = memo(({ data, selected }: NodeProps<StyleTransferNodeData>) => {
  const [settings, setSettings] = useState({
    style_type: data.style_type || "artistic",
    style_strength: data.style_strength || 0.7,
    preserve_content: data.preserve_content || 0.8,
    color_preservation: data.color_preservation || 0.5,
    detail_enhancement: data.detail_enhancement || 0.6,
    preset_style: data.preset_style || "van-gogh",
  });

  const [styleImage, setStyleImage] = useState<File | null>(data.style_image || null);
  const [styleImageUrl, setStyleImageUrl] = useState<string>("");

  const updateSettings = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    Object.assign(data, newSettings);
  };

  const handleStyleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setStyleImage(file);
      data.style_image = file;
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setStyleImageUrl(url);
    }
  };

  const styleTypes = [
    { value: "artistic", label: "Artistic Style" },
    { value: "photographic", label: "Photographic Style" },
    { value: "texture", label: "Texture Transfer" },
    { value: "color-grading", label: "Color Grading" },
    { value: "vintage", label: "Vintage Effect" },
    { value: "modern", label: "Modern Style" },
    { value: "abstract", label: "Abstract Art" },
    { value: "realistic", label: "Realistic Enhancement" },
  ];

  const presetStyles = [
    { value: "van-gogh", label: "Van Gogh (Starry Night)" },
    { value: "picasso", label: "Picasso (Cubist)" },
    { value: "monet", label: "Monet (Impressionist)" },
    { value: "kandinsky", label: "Kandinsky (Abstract)" },
    { value: "hokusai", label: "Hokusai (Japanese)" },
    { value: "basquiat", label: "Basquiat (Street Art)" },
    { value: "pollock", label: "Pollock (Abstract Expressionist)" },
    { value: "warhol", label: "Warhol (Pop Art)" },
    { value: "dali", label: "Dalí (Surrealist)" },
    { value: "rothko", label: "Rothko (Color Field)" },
    { value: "anime", label: "Anime Style" },
    { value: "comic", label: "Comic Book Style" },
    { value: "watercolor", label: "Watercolor Painting" },
    { value: "oil-painting", label: "Oil Painting" },
    { value: "pencil-sketch", label: "Pencil Sketch" },
  ];

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="w-4 h-4" />
          {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Handle
          type="target"
          position={Position.Left}
          id="content"
          className="w-3 h-3"
          style={{ top: '30%' }}
        />
        <div className="text-xs text-muted-foreground absolute left-4" style={{ top: '25%' }}>
          Content
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
        
        <div>
          <Label className="text-xs">Style Type</Label>
          <Select
            value={settings.style_type}
            onValueChange={(value) => updateSettings("style_type", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styleTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Preset Style</Label>
          <Select
            value={settings.preset_style}
            onValueChange={(value) => updateSettings("preset_style", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presetStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Custom Style Image</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleStyleImageUpload}
              className="text-xs flex-1"
            />
            <Button size="sm" variant="outline">
              <Upload className="w-3 h-3" />
            </Button>
          </div>
          {styleImageUrl && (
            <div className="mt-2">
              <img
                src={styleImageUrl}
                alt="Style reference"
                className="w-full h-20 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <div>
          <Label className="text-xs">Style Strength: {(settings.style_strength * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.style_strength]}
            onValueChange={([value]) => updateSettings("style_strength", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.style_strength < 0.3 ? "Subtle Style" :
             settings.style_strength < 0.7 ? "Balanced" : "Strong Style"}
          </div>
        </div>

        <div>
          <Label className="text-xs">Preserve Content: {(settings.preserve_content * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.preserve_content]}
            onValueChange={([value]) => updateSettings("preserve_content", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            How much to preserve original content structure
          </div>
        </div>

        <div>
          <Label className="text-xs">Color Preservation: {(settings.color_preservation * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.color_preservation]}
            onValueChange={([value]) => updateSettings("color_preservation", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Keep original colors vs. adopt style colors
          </div>
        </div>

        <div>
          <Label className="text-xs">Detail Enhancement: {(settings.detail_enhancement * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.detail_enhancement]}
            onValueChange={([value]) => updateSettings("detail_enhancement", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Enhance fine details and textures
          </div>
        </div>

        <div className="bg-muted/30 p-2 rounded text-xs">
          <div className="font-medium mb-1">Style Preview</div>
          <div>Type: {styleTypes.find(t => t.value === settings.style_type)?.label}</div>
          <div>Preset: {presetStyles.find(s => s.value === settings.preset_style)?.label}</div>
          <div>Strength: {(settings.style_strength * 100).toFixed(0)}%</div>
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

StyleTransferNode.displayName = "StyleTransferNode";

export default StyleTransferNode;