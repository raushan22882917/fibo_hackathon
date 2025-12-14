import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface CameraControlNodeData {
  label: string;
  angle?: string;
  fov?: number;
  distance?: string;
  height?: string;
  movement?: string;
  focus?: string;
  depth_of_field?: number;
}

const CameraControlNode = memo(({ data, selected }: NodeProps<CameraControlNodeData>) => {
  const [settings, setSettings] = useState({
    angle: data.angle || "eye-level",
    fov: data.fov || 50,
    distance: data.distance || "medium",
    height: data.height || "eye-level",
    movement: data.movement || "static",
    focus: data.focus || "center",
    depth_of_field: data.depth_of_field || 0.5,
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
          📷 {data.label}
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
          <Label className="text-xs">Camera Angle</Label>
          <Select
            value={settings.angle}
            onValueChange={(value) => updateSettings("angle", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bird-eye">Bird's Eye View</SelectItem>
              <SelectItem value="high-angle">High Angle</SelectItem>
              <SelectItem value="eye-level">Eye Level</SelectItem>
              <SelectItem value="low-angle">Low Angle</SelectItem>
              <SelectItem value="worm-eye">Worm's Eye View</SelectItem>
              <SelectItem value="dutch-angle">Dutch Angle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Field of View: {settings.fov}mm</Label>
          <Slider
            value={[settings.fov]}
            onValueChange={([value]) => updateSettings("fov", value)}
            min={14}
            max={200}
            step={1}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.fov < 35 ? "Wide Angle" : 
             settings.fov < 85 ? "Normal" : "Telephoto"}
          </div>
        </div>

        <div>
          <Label className="text-xs">Camera Distance</Label>
          <Select
            value={settings.distance}
            onValueChange={(value) => updateSettings("distance", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="extreme-close-up">Extreme Close-up</SelectItem>
              <SelectItem value="close-up">Close-up</SelectItem>
              <SelectItem value="medium-close-up">Medium Close-up</SelectItem>
              <SelectItem value="medium">Medium Shot</SelectItem>
              <SelectItem value="medium-wide">Medium Wide</SelectItem>
              <SelectItem value="wide">Wide Shot</SelectItem>
              <SelectItem value="extreme-wide">Extreme Wide</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Camera Height</Label>
          <Select
            value={settings.height}
            onValueChange={(value) => updateSettings("height", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ground-level">Ground Level</SelectItem>
              <SelectItem value="low">Low Height</SelectItem>
              <SelectItem value="eye-level">Eye Level</SelectItem>
              <SelectItem value="high">High Position</SelectItem>
              <SelectItem value="aerial">Aerial View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Camera Movement</Label>
          <Select
            value={settings.movement}
            onValueChange={(value) => updateSettings("movement", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Static</SelectItem>
              <SelectItem value="pan-left">Pan Left</SelectItem>
              <SelectItem value="pan-right">Pan Right</SelectItem>
              <SelectItem value="tilt-up">Tilt Up</SelectItem>
              <SelectItem value="tilt-down">Tilt Down</SelectItem>
              <SelectItem value="zoom-in">Zoom In</SelectItem>
              <SelectItem value="zoom-out">Zoom Out</SelectItem>
              <SelectItem value="dolly-in">Dolly In</SelectItem>
              <SelectItem value="dolly-out">Dolly Out</SelectItem>
              <SelectItem value="tracking">Tracking Shot</SelectItem>
              <SelectItem value="handheld">Handheld</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Focus Point</Label>
          <Select
            value={settings.focus}
            onValueChange={(value) => updateSettings("focus", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center Focus</SelectItem>
              <SelectItem value="foreground">Foreground Focus</SelectItem>
              <SelectItem value="background">Background Focus</SelectItem>
              <SelectItem value="left-third">Left Third</SelectItem>
              <SelectItem value="right-third">Right Third</SelectItem>
              <SelectItem value="rack-focus">Rack Focus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Depth of Field: {settings.depth_of_field.toFixed(1)}</Label>
          <Slider
            value={[settings.depth_of_field]}
            onValueChange={([value]) => updateSettings("depth_of_field", value)}
            min={0}
            max={1}
            step={0.1}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.depth_of_field < 0.3 ? "Shallow (Bokeh)" : 
             settings.depth_of_field < 0.7 ? "Medium" : "Deep (Sharp)"}
          </div>
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

CameraControlNode.displayName = "CameraControlNode";

export default CameraControlNode;