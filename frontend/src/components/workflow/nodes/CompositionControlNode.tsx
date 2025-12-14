import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface CompositionControlNodeData {
  label: string;
  rule?: string;
  balance?: string;
  symmetry?: number;
  leading_lines?: string;
  framing?: string;
  negative_space?: number;
  focal_point?: string;
  depth_layers?: number;
}

const CompositionControlNode = memo(({ data, selected }: NodeProps<CompositionControlNodeData>) => {
  const [settings, setSettings] = useState({
    rule: data.rule || "rule-of-thirds",
    balance: data.balance || "asymmetrical",
    symmetry: data.symmetry || 0.5,
    leading_lines: data.leading_lines || "diagonal",
    framing: data.framing || "natural",
    negative_space: data.negative_space || 0.3,
    focal_point: data.focal_point || "center",
    depth_layers: data.depth_layers || 3,
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
          🎯 {data.label}
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
          <Label className="text-xs">Composition Rule</Label>
          <Select
            value={settings.rule}
            onValueChange={(value) => updateSettings("rule", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rule-of-thirds">Rule of Thirds</SelectItem>
              <SelectItem value="golden-ratio">Golden Ratio</SelectItem>
              <SelectItem value="center-composition">Center Composition</SelectItem>
              <SelectItem value="diagonal">Diagonal Composition</SelectItem>
              <SelectItem value="triangular">Triangular</SelectItem>
              <SelectItem value="s-curve">S-Curve</SelectItem>
              <SelectItem value="radial">Radial Composition</SelectItem>
              <SelectItem value="pattern">Pattern & Repetition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Visual Balance</Label>
          <Select
            value={settings.balance}
            onValueChange={(value) => updateSettings("balance", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="symmetrical">Symmetrical</SelectItem>
              <SelectItem value="asymmetrical">Asymmetrical</SelectItem>
              <SelectItem value="radial">Radial Balance</SelectItem>
              <SelectItem value="dynamic">Dynamic Balance</SelectItem>
              <SelectItem value="crystallographic">Crystallographic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Symmetry: {(settings.symmetry * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.symmetry]}
            onValueChange={([value]) => updateSettings("symmetry", value)}
            min={0}
            max={1}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.symmetry < 0.3 ? "Highly Asymmetric" :
             settings.symmetry < 0.7 ? "Balanced" : "Highly Symmetric"}
          </div>
        </div>

        <div>
          <Label className="text-xs">Leading Lines</Label>
          <Select
            value={settings.leading_lines}
            onValueChange={(value) => updateSettings("leading_lines", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diagonal">Diagonal Lines</SelectItem>
              <SelectItem value="horizontal">Horizontal Lines</SelectItem>
              <SelectItem value="vertical">Vertical Lines</SelectItem>
              <SelectItem value="curved">Curved Lines</SelectItem>
              <SelectItem value="converging">Converging Lines</SelectItem>
              <SelectItem value="zigzag">Zigzag Lines</SelectItem>
              <SelectItem value="implied">Implied Lines</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Framing Technique</Label>
          <Select
            value={settings.framing}
            onValueChange={(value) => updateSettings("framing", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Natural Framing</SelectItem>
              <SelectItem value="architectural">Architectural</SelectItem>
              <SelectItem value="foreground">Foreground Elements</SelectItem>
              <SelectItem value="shadow">Shadow Framing</SelectItem>
              <SelectItem value="geometric">Geometric Shapes</SelectItem>
              <SelectItem value="vignette">Vignette Effect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Negative Space: {(settings.negative_space * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.negative_space]}
            onValueChange={([value]) => updateSettings("negative_space", value)}
            min={0}
            max={0.8}
            step={0.05}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.negative_space < 0.2 ? "Minimal Space" :
             settings.negative_space < 0.5 ? "Balanced" : "Lots of Space"}
          </div>
        </div>

        <div>
          <Label className="text-xs">Focal Point</Label>
          <Select
            value={settings.focal_point}
            onValueChange={(value) => updateSettings("focal_point", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="left-third">Left Third</SelectItem>
              <SelectItem value="right-third">Right Third</SelectItem>
              <SelectItem value="upper-third">Upper Third</SelectItem>
              <SelectItem value="lower-third">Lower Third</SelectItem>
              <SelectItem value="golden-point">Golden Ratio Point</SelectItem>
              <SelectItem value="multiple">Multiple Focal Points</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Depth Layers: {settings.depth_layers}</Label>
          <Slider
            value={[settings.depth_layers]}
            onValueChange={([value]) => updateSettings("depth_layers", value)}
            min={1}
            max={5}
            step={1}
            className="mt-1"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {settings.depth_layers === 1 ? "Flat" :
             settings.depth_layers === 2 ? "Foreground + Background" :
             settings.depth_layers === 3 ? "Fore + Mid + Background" :
             settings.depth_layers === 4 ? "Complex Depth" : "Maximum Depth"}
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

CompositionControlNode.displayName = "CompositionControlNode";

export default CompositionControlNode;