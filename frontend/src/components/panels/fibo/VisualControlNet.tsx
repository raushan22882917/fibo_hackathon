import { useState, useRef, useCallback } from "react";
import { Camera, Palette, Lightbulb, Move3D, Eye, Layers, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/hooks/use-toast";

interface ControlPoint {
  x: number;
  y: number;
  type: 'camera' | 'light' | 'object' | 'color' | 'composition';
  intensity: number;
  id: string;
}

const VisualControlNet = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();
  
  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [activeControlType, setActiveControlType] = useState<ControlPoint['type']>('camera');
  const [showHeatmap, setShowHeatmap] = useState(true);

  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });

  const controlTypes = [
    { type: 'camera' as const, icon: Camera, color: '#3B82F6', label: 'Camera Focus' },
    { type: 'light' as const, icon: Lightbulb, color: '#F59E0B', label: 'Light Source' },
    { type: 'object' as const, icon: Layers, color: '#10B981', label: 'Object Placement' },
    { type: 'color' as const, icon: Palette, color: '#8B5CF6', label: 'Color Emphasis' },
    { type: 'composition' as const, icon: Move3D, color: '#EF4444', label: 'Composition Guide' },
  ];

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newControlPoint: ControlPoint = {
      x,
      y,
      type: activeControlType,
      intensity: 0.8,
      id: `${activeControlType}-${Date.now()}`,
    };

    setControlPoints(prev => [...prev, newControlPoint]);
    updateStructuredPromptFromControlNet([...controlPoints, newControlPoint]);
  }, [activeControlType, controlPoints]);

  const updateStructuredPromptFromControlNet = (points: ControlPoint[]) => {
    const cameraPoints = points.filter(p => p.type === 'camera');
    const lightPoints = points.filter(p => p.type === 'light');
    const objectPoints = points.filter(p => p.type === 'object');
    const colorPoints = points.filter(p => p.type === 'color');
    const compositionPoints = points.filter(p => p.type === 'composition');

    // Generate camera focus based on control points
    const cameraFocus = cameraPoints.length > 0 
      ? `Focus on region at ${Math.round(cameraPoints[0].x)}%, ${Math.round(cameraPoints[0].y)}% with ${cameraPoints[0].intensity} intensity`
      : undefined;

    // Generate lighting setup
    const lightingSetup = lightPoints.map(point => 
      `Light source at ${Math.round(point.x)}%, ${Math.round(point.y)}% with ${point.intensity} intensity`
    ).join('; ');

    // Generate object placement
    const objectPlacement = objectPoints.map(point => 
      `Object positioned at ${Math.round(point.x)}%, ${Math.round(point.y)}% with ${point.intensity} prominence`
    ).join('; ');

    // Generate color emphasis
    const colorEmphasis = colorPoints.map(point => 
      `Color emphasis at ${Math.round(point.x)}%, ${Math.round(point.y)}% with ${point.intensity} saturation`
    ).join('; ');

    // Generate composition guides
    const compositionGuides = compositionPoints.map(point => 
      `Composition anchor at ${Math.round(point.x)}%, ${Math.round(point.y)}% with ${point.intensity} weight`
    ).join('; ');

    setStructuredPrompt({
      ...structuredPrompt,
      visual_control_net: {
        camera_focus: cameraFocus,
        lighting_setup: lightingSetup,
        object_placement: objectPlacement,
        color_emphasis: colorEmphasis,
        composition_guides: compositionGuides,
        control_points: points,
      },
      photographic_characteristics: {
        ...structuredPrompt?.photographic_characteristics,
        focus_control: cameraFocus,
      },
      lighting: {
        ...structuredPrompt?.lighting,
        spatial_setup: lightingSetup,
      },
    });
  };

  const clearControlPoints = () => {
    setControlPoints([]);
    updateStructuredPromptFromControlNet([]);
  };

  const removeControlPoint = (id: string) => {
    const updated = controlPoints.filter(p => p.id !== id);
    setControlPoints(updated);
    updateStructuredPromptFromControlNet(updated);
  };

  const updateControlPointIntensity = (id: string, intensity: number) => {
    const updated = controlPoints.map(p => 
      p.id === id ? { ...p, intensity: intensity / 100 } : p
    );
    setControlPoints(updated);
    updateStructuredPromptFromControlNet(updated);
  };

  const generateHeatmapVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * canvas.width;
      const y = (i / 10) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw rule of thirds lines
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    for (let i = 1; i <= 2; i++) {
      const x = (i / 3) * canvas.width;
      const y = (i / 3) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw control points
    controlPoints.forEach(point => {
      const x = (point.x / 100) * canvas.width;
      const y = (point.y / 100) * canvas.height;
      const controlType = controlTypes.find(t => t.type === point.type);
      
      if (showHeatmap) {
        // Draw influence area
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50 * point.intensity);
        gradient.addColorStop(0, `${controlType?.color}40`);
        gradient.addColorStop(1, `${controlType?.color}00`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw control point
      ctx.fillStyle = controlType?.color || '#6B7280';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw intensity ring
      ctx.strokeStyle = controlType?.color || '#6B7280';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8 + (point.intensity * 20), 0, 2 * Math.PI);
      ctx.stroke();

      // Draw type indicator
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(point.type[0].toUpperCase(), x, y + 4);
    });
  };

  // Redraw canvas when control points change
  React.useEffect(() => {
    generateHeatmapVisualization();
  }, [controlPoints, showHeatmap]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold gradient-text">Visual ControlNet</h4>
            <p className="text-xs text-muted-foreground">
              Click on the canvas to place control points
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={showHeatmap ? "bg-primary/20" : ""}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearControlPoints}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Control Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Active Control Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {controlTypes.map(({ type, icon: Icon, color, label }) => (
            <button
              key={type}
              onClick={() => setActiveControlType(type)}
              className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeControlType === type
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              <Icon className="w-3 h-3" style={{ color: activeControlType === type ? 'currentColor' : color }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Visual Control Canvas
        </label>
        <div className="relative border border-border rounded-lg overflow-hidden bg-surface-1">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onClick={handleCanvasClick}
            className="cursor-crosshair w-full h-auto"
            style={{ aspectRatio: '4/3' }}
          />
          
          {/* Canvas Overlay Info */}
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {controlPoints.length} control points • Click to add {activeControlType}
          </div>
        </div>
      </div>

      {/* Control Points List */}
      {controlPoints.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Active Control Points ({controlPoints.length})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {controlPoints.map((point) => {
              const controlType = controlTypes.find(t => t.type === point.type);
              const Icon = controlType?.icon || Layers;
              
              return (
                <div
                  key={point.id}
                  className="p-2 rounded-lg bg-surface-1 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon 
                        className="w-3 h-3" 
                        style={{ color: controlType?.color }} 
                      />
                      <span className="text-xs font-medium">
                        {controlType?.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round(point.x)}%, {Math.round(point.y)}%)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeControlPoint(point.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">
                        Intensity:
                      </span>
                      <Slider
                        value={[point.intensity * 100]}
                        onValueChange={([value]) => updateControlPointIntensity(point.id, value)}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-8">
                        {Math.round(point.intensity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => {
            const dataStr = JSON.stringify(controlPoints, null, 2);
            navigator.clipboard.writeText(dataStr);
            toast({ title: "Control points copied to clipboard" });
          }}
        >
          <Download className="w-3 h-3 mr-1" />
          Export Control Points
        </Button>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Visual ControlNet</span> allows you to place control points directly on a canvas to influence generation parameters spatially.
        </p>
      </div>
    </div>
  );
};

export default VisualControlNet;