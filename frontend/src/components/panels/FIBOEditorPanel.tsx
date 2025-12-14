import { useState } from "react";
import { Camera, Lightbulb, Palette, Layout, Layers, Sparkles, Save, Undo2, Code2, BookmarkPlus, Wand2, Loader2, Target, Film, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/hooks/use-toast";
import { generateFromStructured } from "@/lib/bria-api";
import CameraControls from "./fibo/CameraControls";
import LightingControls from "./fibo/LightingControls";
import CompositionControls from "./fibo/CompositionControls";
import ColorControls from "./fibo/ColorControls";
import ObjectControls from "./fibo/ObjectControls";
import StyleControls from "./fibo/StyleControls";
import PresetManager from "./fibo/PresetManager";
import VisualControlNet from "./fibo/VisualControlNet";
import CinematicControls from "./fibo/CinematicControls";
import ParameterMorpher from "./fibo/ParameterMorpher";
import GeneratedContentInfo from "./GeneratedContentInfo";

const FIBOEditorPanel = () => {
  const { toast } = useToast();
  const [showJson, setShowJson] = useState(false);
  const { 
    structuredPrompt, 
    setStructuredPrompt,
    seed,
    stepsNum,
    aspectRatio,
    guidanceScale,
    isGenerating,
    setIsGenerating,
    setGeneratedImageUrl,
    setGenerationError,
    setGenerationProgress,
    setDetectedCategory,
    setVideoTimeline,
    setFramesGenerated,
  } = useVideoStore();

  const handleSave = () => {
    toast({
      title: "FIBO Settings Saved",
      description: "Your structured parameters have been saved",
    });
  };

  const handleReset = () => {
    setStructuredPrompt(null);
    toast({
      title: "Reset Complete",
      description: "All FIBO parameters have been reset",
    });
  };

  const handleGenerate = async () => {
    if (!structuredPrompt) {
      toast({
        title: "No Structured Prompt",
        description: "Please configure FIBO parameters before generating",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    try {
      setGenerationProgress("Generating from FIBO structured prompt...");
      
      const result = await generateFromStructured(structuredPrompt, {
        seed,
        steps_num: stepsNum,
        aspect_ratio: aspectRatio,
        guidance_scale: guidanceScale,
      });

      const resultImageUrl = result.image?.url || result.url || result.result_url;
      
      if (resultImageUrl) {
        setGeneratedImageUrl(resultImageUrl);
        if (result.category) {
          setDetectedCategory(result.category, result.confidence);
        }
        if (result.timeline) {
          setVideoTimeline(result.timeline);
        }
        if (result.frames_generated) {
          setFramesGenerated(result.frames_generated);
        }
        toast({
          title: "Generation Complete!",
          description: "Your FIBO structured prompt has been generated successfully",
        });
      } else {
        throw new Error("No image URL returned from API");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate image";
      setGenerationError(message);
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold gradient-text">FIBO Editor</h3>
            <p className="text-xs text-muted-foreground">
              Structured JSON control for deterministic generation
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJson(!showJson)}
          >
            <Code2 className="w-4 h-4" />
          </Button>
        </div>

        {showJson && structuredPrompt && (
          <pre className="p-3 rounded-lg bg-surface-1 border border-border text-xs font-mono text-muted-foreground overflow-auto max-h-48 scrollbar-thin">
            {JSON.stringify(structuredPrompt, null, 2)}
          </pre>
        )}
      </div>

      {/* FIBO Controls Tabs */}
      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1">
          <TabsTrigger value="camera" className="text-xs">
            <Camera className="w-3 h-3 mr-1" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="lighting" className="text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            Lighting
          </TabsTrigger>
          <TabsTrigger value="composition" className="text-xs">
            <Layout className="w-3 h-3 mr-1" />
            Composition
          </TabsTrigger>
        </TabsList>

        <TabsList className="grid w-full grid-cols-3 gap-1 mt-2">
          <TabsTrigger value="colors" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="objects" className="text-xs">
            <Layers className="w-3 h-3 mr-1" />
            Objects
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Style
          </TabsTrigger>
        </TabsList>

        <TabsList className="grid w-full grid-cols-4 gap-1 mt-2">
          <TabsTrigger value="controlnet" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            ControlNet
          </TabsTrigger>
          <TabsTrigger value="cinematic" className="text-xs">
            <Film className="w-3 h-3 mr-1" />
            Cinematic
          </TabsTrigger>
          <TabsTrigger value="morpher" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Morpher
          </TabsTrigger>
          <TabsTrigger value="presets" className="text-xs">
            <BookmarkPlus className="w-3 h-3 mr-1" />
            Presets
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="camera" className="space-y-4">
            <CameraControls />
          </TabsContent>

          <TabsContent value="lighting" className="space-y-4">
            <LightingControls />
          </TabsContent>

          <TabsContent value="composition" className="space-y-4">
            <CompositionControls />
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <ColorControls />
          </TabsContent>

          <TabsContent value="objects" className="space-y-4">
            <ObjectControls />
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <StyleControls />
          </TabsContent>

          <TabsContent value="controlnet" className="space-y-4">
            <VisualControlNet />
          </TabsContent>

          <TabsContent value="cinematic" className="space-y-4">
            <CinematicControls />
          </TabsContent>

          <TabsContent value="morpher" className="space-y-4">
            <ParameterMorpher />
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <PresetManager />
          </TabsContent>
        </div>
      </Tabs>

      {/* Generate Button */}
      <Button
        variant="glow"
        size="lg"
        className="w-full gap-2"
        onClick={handleGenerate}
        disabled={!structuredPrompt || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate from FIBO
          </>
        )}
      </Button>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleReset}
          disabled={isGenerating}
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleSave}
          disabled={isGenerating}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Generated Content Info */}
      <GeneratedContentInfo />

      {/* Info Box */}
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
        <p className="text-xs text-primary/90 font-medium mb-1">
          💡 About FIBO Structured Control
        </p>
        <p className="text-xs text-foreground/70">
          FIBO uses structured JSON instead of text prompts, giving you deterministic control over camera angles, FOV, lighting, color palettes, and composition. Every parameter works the same way, every time.
        </p>
      </div>
    </div>
  );
};

export default FIBOEditorPanel;
