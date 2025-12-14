import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Shuffle, Zap, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/hooks/use-toast";

interface MorphKeyframe {
  id: string;
  timestamp: number;
  parameters: any;
  name: string;
}

interface MorphingParameter {
  path: string;
  label: string;
  type: 'number' | 'string' | 'color' | 'boolean';
  min?: number;
  max?: number;
  options?: string[];
}

const morphableParameters: MorphingParameter[] = [
  { path: 'photographic_characteristics.camera_angle', label: 'Camera Angle', type: 'string', 
    options: ['eye-level', 'low-angle', 'high-angle', 'bird\'s-eye', 'worm\'s-eye'] },
  { path: 'lighting.conditions', label: 'Lighting', type: 'string',
    options: ['golden hour', 'blue hour', 'harsh midday', 'dramatic', 'soft diffused'] },
  { path: 'aesthetics.mood_atmosphere', label: 'Mood', type: 'string',
    options: ['dramatic', 'peaceful', 'energetic', 'mysterious', 'romantic'] },
  { path: 'cinematic_controls.contrast', label: 'Contrast', type: 'number', min: 0, max: 1 },
  { path: 'cinematic_controls.saturation', label: 'Saturation', type: 'number', min: 0, max: 1 },
  { path: 'cinematic_controls.temperature', label: 'Temperature', type: 'number', min: 0, max: 1 },
  { path: 'cinematic_controls.filmGrain', label: 'Film Grain', type: 'number', min: 0, max: 1 },
];

const ParameterMorpher = () => {
  const { toast } = useToast();
  const { structuredPrompt, setStructuredPrompt } = useVideoStore();
  
  const [keyframes, setKeyframes] = useState<MorphKeyframe[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10); // seconds
  const [selectedParameters, setSelectedParameters] = useState<string[]>([
    'photographic_characteristics.camera_angle',
    'lighting.conditions',
    'cinematic_controls.contrast'
  ]);
  const [morphSpeed, setMorphSpeed] = useState(1);
  const [loopMode, setLoopMode] = useState(true);

  // Animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && keyframes.length >= 2) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + (0.1 * morphSpeed);
          
          if (newTime >= duration) {
            if (loopMode) {
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          
          return newTime;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, keyframes.length, duration, morphSpeed, loopMode]);

  // Update parameters based on current time
  useEffect(() => {
    if (keyframes.length >= 2 && isPlaying) {
      const interpolatedParams = interpolateParameters(currentTime);
      if (interpolatedParams) {
        setStructuredPrompt({
          ...structuredPrompt,
          ...interpolatedParams,
        });
      }
    }
  }, [currentTime, keyframes]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  const addKeyframe = () => {
    if (!structuredPrompt) {
      toast({
        title: "No Parameters",
        description: "Configure FIBO parameters first",
        variant: "destructive",
      });
      return;
    }

    const newKeyframe: MorphKeyframe = {
      id: Date.now().toString(),
      timestamp: currentTime,
      parameters: JSON.parse(JSON.stringify(structuredPrompt)),
      name: `Keyframe ${keyframes.length + 1}`,
    };

    const updatedKeyframes = [...keyframes, newKeyframe].sort((a, b) => a.timestamp - b.timestamp);
    setKeyframes(updatedKeyframes);
    
    toast({
      title: "Keyframe Added",
      description: `Added keyframe at ${currentTime.toFixed(1)}s`,
    });
  };

  const removeKeyframe = (id: string) => {
    setKeyframes(prev => prev.filter(k => k.id !== id));
  };

  const interpolateParameters = (time: number) => {
    if (keyframes.length < 2) return null;

    // Find surrounding keyframes
    let beforeFrame = keyframes[0];
    let afterFrame = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].timestamp && time <= keyframes[i + 1].timestamp) {
        beforeFrame = keyframes[i];
        afterFrame = keyframes[i + 1];
        break;
      }
    }

    const timeDiff = afterFrame.timestamp - beforeFrame.timestamp;
    const progress = timeDiff === 0 ? 0 : (time - beforeFrame.timestamp) / timeDiff;

    // Interpolate selected parameters
    const interpolated = JSON.parse(JSON.stringify(beforeFrame.parameters));

    selectedParameters.forEach(paramPath => {
      const beforeValue = getNestedValue(beforeFrame.parameters, paramPath);
      const afterValue = getNestedValue(afterFrame.parameters, paramPath);
      const param = morphableParameters.find(p => p.path === paramPath);

      if (!param || beforeValue === undefined || afterValue === undefined) return;

      let interpolatedValue;

      switch (param.type) {
        case 'number':
          interpolatedValue = beforeValue + (afterValue - beforeValue) * progress;
          break;
        case 'string':
          // For strings, switch at 50% progress
          interpolatedValue = progress < 0.5 ? beforeValue : afterValue;
          break;
        case 'color':
          // Simple color interpolation (could be enhanced)
          interpolatedValue = progress < 0.5 ? beforeValue : afterValue;
          break;
        case 'boolean':
          interpolatedValue = progress < 0.5 ? beforeValue : afterValue;
          break;
        default:
          interpolatedValue = beforeValue;
      }

      setNestedValue(interpolated, paramPath, interpolatedValue);
    });

    return interpolated;
  };

  const generateRandomKeyframes = () => {
    const randomKeyframes: MorphKeyframe[] = [];
    const numKeyframes = 4;

    for (let i = 0; i < numKeyframes; i++) {
      const timestamp = (i / (numKeyframes - 1)) * duration;
      const randomParams = JSON.parse(JSON.stringify(structuredPrompt || {}));

      // Randomize selected parameters
      selectedParameters.forEach(paramPath => {
        const param = morphableParameters.find(p => p.path === paramPath);
        if (!param) return;

        let randomValue;
        switch (param.type) {
          case 'number':
            randomValue = Math.random() * ((param.max || 1) - (param.min || 0)) + (param.min || 0);
            break;
          case 'string':
            if (param.options) {
              randomValue = param.options[Math.floor(Math.random() * param.options.length)];
            }
            break;
          default:
            return;
        }

        setNestedValue(randomParams, paramPath, randomValue);
      });

      randomKeyframes.push({
        id: `random-${i}`,
        timestamp,
        parameters: randomParams,
        name: `Random ${i + 1}`,
      });
    }

    setKeyframes(randomKeyframes);
    toast({
      title: "Random Keyframes Generated",
      description: `Generated ${numKeyframes} random keyframes`,
    });
  };

  const toggleParameterSelection = (paramPath: string) => {
    setSelectedParameters(prev => 
      prev.includes(paramPath) 
        ? prev.filter(p => p !== paramPath)
        : [...prev, paramPath]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold gradient-text">Parameter Morpher</h4>
            <p className="text-xs text-muted-foreground">
              Animate parameters over time for dynamic generation
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={keyframes.length < 2}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTime(0)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Timeline ({currentTime.toFixed(1)}s / {duration}s)
          </label>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <Slider
              value={[duration]}
              onValueChange={([value]) => setDuration(value)}
              min={5}
              max={60}
              step={1}
              className="w-20"
            />
          </div>
        </div>
        
        <div className="relative">
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => setCurrentTime(value)}
            max={duration}
            step={0.1}
            className="w-full"
          />
          
          {/* Keyframe markers */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {keyframes.map((keyframe) => (
              <div
                key={keyframe.id}
                className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full border border-white"
                style={{ left: `${(keyframe.timestamp / duration) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Morphable Parameters */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Morphable Parameters
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto scrollbar-thin">
          {morphableParameters.map((param) => (
            <button
              key={param.path}
              onClick={() => toggleParameterSelection(param.path)}
              className={`p-2 rounded text-xs text-left transition-all ${
                selectedParameters.includes(param.path)
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{param.label}</span>
                <span className="opacity-60">{param.type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addKeyframe}
          disabled={!structuredPrompt}
        >
          <Layers className="w-3 h-3 mr-1" />
          Add Keyframe
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={generateRandomKeyframes}
        >
          <Shuffle className="w-3 h-3 mr-1" />
          Random Keys
        </Button>
      </div>

      {/* Playback Settings */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Playback Settings
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Speed</label>
            <Slider
              value={[morphSpeed]}
              onValueChange={([value]) => setMorphSpeed(value)}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{morphSpeed}x</span>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Loop Mode</label>
            <button
              onClick={() => setLoopMode(!loopMode)}
              className={`w-full p-1.5 rounded text-xs font-medium transition-all ${
                loopMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
              }`}
            >
              {loopMode ? "Loop On" : "Loop Off"}
            </button>
          </div>
        </div>
      </div>

      {/* Keyframes List */}
      {keyframes.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Keyframes ({keyframes.length})
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
            {keyframes.map((keyframe) => (
              <div
                key={keyframe.id}
                className="flex items-center justify-between p-2 rounded bg-surface-1 border border-border"
              >
                <div>
                  <p className="text-xs font-medium">{keyframe.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {keyframe.timestamp.toFixed(1)}s
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeKeyframe(keyframe.id)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Parameter Morpher</span> creates smooth transitions between different parameter states over time for dynamic content generation.
        </p>
      </div>
    </div>
  );
};

export default ParameterMorpher;