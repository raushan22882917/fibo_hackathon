import { useState } from "react";
import { Wand2, ChevronDown, Code2, Loader2, Sparkles, AlertCircle, Sliders, Music, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useVideoStore } from "@/store/videoStore";
import { convertToStructuredPrompt, generateFromStructured } from "@/lib/bria-api";
import { useToast } from "@/hooks/use-toast";
import GeneratedContentInfo from "./GeneratedContentInfo";
import { buildApiUrl, API_ENDPOINTS } from "@/config/api";

const styles = [
  "Cinematic",
  "Documentary",
  "Commercial",
  "Animated",
  "Artistic",
  "Photorealistic",
  "Abstract",
];

const aspectRatios = ["16:9", "9:16", "1:1", "4:5", "4:3", "3:2"];

const contentTypes = [
  { value: "image", label: "Image", icon: "🖼️" },
  { value: "video", label: "Video", icon: "🎬" },
];

const GeneratePanel = () => {
  const { toast } = useToast();
  const [showJson, setShowJson] = useState(false);
  const [isConvertingPrompt, setIsConvertingPrompt] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState("image");
  const [tailoredModelId, setTailoredModelId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showRewrittenPrompts, setShowRewrittenPrompts] = useState(false);
  const [rewrittenPrompts, setRewrittenPrompts] = useState<Array<{
    frame: number;
    original: string;
    rewritten: string;
    editable: string;
  }>>([]);
  
  // Music integration
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicType, setMusicType] = useState("background");
  const [showMusicOptions, setShowMusicOptions] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isDownloadingYoutube, setIsDownloadingYoutube] = useState(false);
  const [youtubeInfo, setYoutubeInfo] = useState<{title: string; duration: number} | null>(null);
  
  const {
    prompt,
    style,
    aspectRatio,
    seed,
    stepsNum,
    guidanceScale,
    structuredPrompt,
    isGenerating,
    generationError,
    generationProgress,
    detectedCategory,
    categoryConfidence,
    videoTimeline,
    framesGenerated,
    totalFramesToGenerate,
    setPrompt,
    setStyle,
    setAspectRatio,
    setSeed,
    setStepsNum,
    setGuidanceScale,
    setStructuredPrompt,
    setGeneratedImageUrl,
    setIsGenerating,
    setGenerationError,
    setGenerationProgress,
    setDetectedCategory,
    setVideoTimeline,
    setFramesGenerated,
    setTotalFramesToGenerate,
  } = useVideoStore();

  // Download audio from YouTube
  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Empty URL",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadingYoutube(true);
    setGenerationError(null);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_DOWNLOAD_YOUTUBE), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to download audio");
      }

      const result = await response.json();
      
      // Convert base64 to File object
      const audioData = result.audio_data.split(',')[1];
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const file = new File([blob], `${result.title}.mp3`, { type: 'audio/mp3' });
      
      setMusicFile(file);
      setYoutubeInfo({ title: result.title, duration: result.duration });
      
      toast({
        title: "Download Complete!",
        description: `Downloaded: ${result.title}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to download audio";
      setGenerationError(message);
      toast({
        title: "Download Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingYoutube(false);
    }
  };

  // Convert prompt to structured JSON
  const handleConvertPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to convert",
        variant: "destructive",
      });
      return;
    }

    setIsConvertingPrompt(true);
    setGenerationError(null);

    try {
      setGenerationProgress("Converting prompt to structured JSON...");
      const result = await convertToStructuredPrompt(prompt, seed);
      setStructuredPrompt(result.structured_prompt);
      setShowJson(true);
      toast({
        title: "Prompt Converted",
        description: "Your prompt has been converted to structured JSON format",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to convert prompt";
      setGenerationError(message);
      toast({
        title: "Conversion Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConvertingPrompt(false);
      setGenerationProgress("");
    }
  };

  // Preview video prompts
  const handlePreviewPrompts = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to preview",
        variant: "destructive",
      });
      return;
    }

    if (selectedContentType !== "video") {
      toast({
        title: "Video Only",
        description: "Prompt preview is only available for video generation",
        variant: "destructive",
      });
      return;
    }

    setIsConvertingPrompt(true);
    setGenerationError(null);

    try {
      setGenerationProgress("Analyzing prompt and generating frame descriptions...");
      
      const { previewVideoPrompts } = await import("@/lib/bria-api");
      const preview = await previewVideoPrompts(prompt, { seed, aspect_ratio: aspectRatio });
      
      // Convert to editable format
      const editablePrompts = preview.frames.map((frame: any) => ({
        frame: frame.frame_number,
        original: frame.original_description,
        rewritten: frame.rewritten_prompt,
        editable: frame.rewritten_prompt, // User can edit this
      }));
      
      setRewrittenPrompts(editablePrompts);
      setShowRewrittenPrompts(true);
      
      toast({
        title: "Prompts Generated!",
        description: `${editablePrompts.length} frame prompts ready for review`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to preview prompts";
      setGenerationError(message);
      toast({
        title: "Preview Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConvertingPrompt(false);
      setGenerationProgress("");
    }
  };

  // Generate image from structured prompt
  const handleGenerate = async () => {
    if (!prompt.trim() && !structuredPrompt) {
      toast({
        title: "No Input",
        description: "Please enter a prompt or convert to structured JSON first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    try {
      // If no structured prompt yet, convert first
      let finalStructuredPrompt = structuredPrompt;
      if (!finalStructuredPrompt && prompt.trim()) {
        setGenerationProgress("Converting prompt to structured JSON...");
        const convertResult = await convertToStructuredPrompt(prompt, seed);
        finalStructuredPrompt = convertResult.structured_prompt;
        setStructuredPrompt(finalStructuredPrompt);
      }

      if (!finalStructuredPrompt) {
        throw new Error("Failed to generate structured prompt");
      }

      // Inject style into the structured prompt
      const enhancedPrompt = {
        ...finalStructuredPrompt,
        artistic_style: style,
        style_medium: style === "Animated" ? "Digital illustration" : "Photography",
      };

      setGenerationProgress("Submitting to BRIA API...");
      
      const result = await generateFromStructured(enhancedPrompt, {
        seed,
        steps_num: stepsNum,
        aspect_ratio: aspectRatio,
        guidance_scale: guidanceScale,
        force_category: selectedContentType,
        tailored_model_id: tailoredModelId || undefined,
        image_url: imageUrl || undefined,
      });
      
      if (selectedContentType === "video") {
        setGenerationProgress("Creating video timeline and generating frames... (this may take 2-3 minutes)");
      } else {
        setGenerationProgress("Processing... (this may take 30-60 seconds)");
      }

      console.log("Generation result:", result);
      console.log("Result keys:", Object.keys(result));
      console.log("Result.image:", result.image);
      console.log("Result.image?.url:", result.image?.url);

      // Check if we have an image URL in any format
      const resultImageUrl = result.image?.url || result.url || result.result_url;
      
      if (resultImageUrl) {
        console.log("Setting image URL:", resultImageUrl);
        setGeneratedImageUrl(resultImageUrl);
        if (result.structured_prompt) {
          setStructuredPrompt(result.structured_prompt);
        }
        if (result.category) {
          setDetectedCategory(result.category, result.confidence);
        }
        if (result.timeline) {
          setVideoTimeline(result.timeline);
        }
        if (result.frames_generated) {
          setFramesGenerated(result.frames_generated);
        }
        // Save to gallery
        const { saveToGallery } = await import("@/lib/gallery");
        saveToGallery({
          type: result.category === "video" ? "video" : "image",
          url: resultImageUrl,
          prompt: prompt,
          category: result.category || "image",
          metadata: {
            aspectRatio: aspectRatio,
            style: style,
            frames: result.frames_generated,
            duration: result.timeline?.duration,
            seed: seed,
          },
        });

        toast({
          title: "Generation Complete!",
          description: result.method === "multi-frame-assembly" 
            ? `Generated video from ${result.frames_generated} frames!`
            : `Generated ${result.category || 'content'} successfully`,
        });
      } else {
        console.error("No image URL in result:", result);
        console.error("Full result structure:", JSON.stringify(result, null, 2));
        throw new Error(`No image URL returned from API. Got: ${JSON.stringify(result)}`);
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

  const blueprint = structuredPrompt || {
    prompt,
    style,
    aspect_ratio: aspectRatio,
    seed,
    steps_num: stepsNum,
    guidance_scale: guidanceScale,
  };

  return (
    <div className="p-4 space-y-5 animate-fade-in">
      {/* Content Type Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Content Type
        </label>
        <div className="relative">
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface-1 border border-border text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
          >
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {selectedContentType === "video" && (
          <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
            <div className="flex items-start gap-2">
              <span className="text-2xl">🎬</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary mb-1">
                  Multi-Frame Cinematic Video Generation
                </p>
                <p className="text-xs text-foreground/80 mb-2">
                  Your prompt will be analyzed by Gemini AI and broken into 8 cinematic keyframes over 10 seconds. Each frame is generated as a high-quality BRIA image, then assembled into a smooth 30 FPS video.
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-primary/90">💡 Pro Tips for Best Results:</p>
                  <ul className="text-xs text-foreground/70 space-y-0.5 ml-4">
                    <li>• Describe camera movements (drone shot, tracking, close-up, wide angle)</li>
                    <li>• Include lighting details (golden hour, dramatic, soft, backlit)</li>
                    <li>• Specify actions and transitions (slow motion, time-lapse, panning)</li>
                    <li>• Mention specific shots (establishing, detail, hero shot)</li>
                  </ul>
                </div>
                <div className="mt-2 pt-2 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    ⏱️ Generation time: ~2-3 minutes | 📁 Saved to: generated_videos/
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Music Upload Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Music className="w-4 h-4" />
            Add Music (Optional)
          </label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowMusicOptions(!showMusicOptions)}
          >
            {showMusicOptions ? "Hide" : "Show"} Options
          </Button>
        </div>

        {showMusicOptions && (
          <div className="space-y-3 p-3 rounded-lg bg-surface-1 border border-border">
            {/* Music Type Dropdown (only for video) */}
            {selectedContentType === "video" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Music Type
                </label>
                <div className="relative">
                  <select
                    value={musicType}
                    onChange={(e) => setMusicType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-background border border-border text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                  >
                    <option value="background">Background Music</option>
                    <option value="sync">Sync to Music (AI Analysis)</option>
                    <option value="visualizer">Audio Visualizer</option>
                    <option value="lyric-video">Lyric Video</option>
                    <option value="music-video">Full Music Video</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {musicType === "background" && "Add music as background audio to your generated video"}
                  {musicType === "sync" && "AI analyzes music and syncs visuals to beats and mood"}
                  {musicType === "visualizer" && "Create audio-reactive visualizations"}
                  {musicType === "lyric-video" && "Generate backgrounds for lyric display"}
                  {musicType === "music-video" && "Full AI-generated music video with story"}
                </p>
              </div>
            )}

            {/* YouTube URL Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                YouTube URL
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isDownloadingYoutube || !!musicFile}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleYoutubeDownload}
                  disabled={!youtubeUrl.trim() || isDownloadingYoutube || !!musicFile}
                  className="gap-2"
                >
                  {isDownloadingYoutube ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a YouTube video URL to extract audio
              </p>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Upload Audio File
              </label>
              <div className="relative">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    setMusicFile(e.target.files?.[0] || null);
                    setYoutubeUrl("");
                    setYoutubeInfo(null);
                  }}
                  disabled={!!youtubeUrl.trim()}
                  className="cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported: MP3, WAV, M4A, OGG, FLAC
              </p>
            </div>

            {/* Music File Info */}
            {musicFile && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {youtubeInfo ? youtubeInfo.title : musicFile.name}
                    </p>
                    <p className="text-xs text-primary/70">
                      {youtubeInfo 
                        ? `${Math.floor(youtubeInfo.duration / 60)}:${(youtubeInfo.duration % 60).toString().padStart(2, '0')}`
                        : `${(musicFile.size / 1024 / 1024).toFixed(2)} MB`
                      }
                      {youtubeInfo && " • From YouTube"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMusicFile(null);
                    setYoutubeUrl("");
                    setYoutubeInfo(null);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Music Type Info */}
            {musicFile && selectedContentType === "video" && musicType !== "background" && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-primary mb-1">
                      AI Music Analysis Enabled
                    </p>
                    <p className="text-xs text-foreground/80">
                      {musicType === "sync" && "AI will analyze tempo, mood, and energy to sync visuals with your music"}
                      {musicType === "visualizer" && "Creates abstract patterns that react to audio frequencies and beats"}
                      {musicType === "lyric-video" && "Generates beautiful backgrounds optimized for text overlay"}
                      {musicType === "music-video" && "Creates a complete narrative story matching your music's emotional journey"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            Prompt
          </label>
          <div className="flex gap-2">
            {selectedContentType === "video" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handlePreviewPrompts}
                disabled={isConvertingPrompt || !prompt.trim()}
              >
                {isConvertingPrompt ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Preview Frames
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={handleConvertPrompt}
              disabled={isConvertingPrompt || !prompt.trim()}
            >
              {isConvertingPrompt ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              To JSON
            </Button>
          </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            selectedContentType === "image" 
              ? "Describe the image you want to create..."
              : "Describe the video scene with motion and action..."
          }
          className="w-full h-32 px-3 py-2 rounded-lg bg-surface-1 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Rewritten Prompts Preview */}
      {showRewrittenPrompts && rewrittenPrompts.length > 0 && (
        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary">
                AI-Enhanced Frame Prompts ({rewrittenPrompts.length} frames)
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRewrittenPrompts(false)}
              className="h-6 text-xs"
            >
              Hide
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            AI has rewritten each frame for visual consistency. You can edit any prompt before generating.
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {rewrittenPrompts.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-surface-1 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">
                    Frame {item.frame + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {((item.frame / rewrittenPrompts.length) * 10).toFixed(1)}s
                  </span>
                </div>
                
                {/* Original Description */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Original:</label>
                  <p className="text-xs text-foreground/70 italic">
                    {item.original}
                  </p>
                </div>

                {/* Editable Rewritten Prompt */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    AI-Enhanced (editable):
                  </label>
                  <textarea
                    value={item.editable}
                    onChange={(e) => {
                      const updated = [...rewrittenPrompts];
                      updated[idx].editable = e.target.value;
                      setRewrittenPrompts(updated);
                    }}
                    className="w-full h-20 px-2 py-1.5 rounded bg-background border border-border text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                // Reset to original rewritten prompts
                setRewrittenPrompts(rewrittenPrompts.map(p => ({
                  ...p,
                  editable: p.rewritten
                })));
                toast({
                  title: "Reset Complete",
                  description: "All prompts reset to AI-generated versions",
                });
              }}
            >
              Reset All
            </Button>
            <Button
              variant="glow"
              size="sm"
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Prompts Ready!",
                  description: "Click Generate to create video with these prompts",
                });
              }}
            >
              Use These Prompts
            </Button>
          </div>
        </div>
      )}

      {/* Style */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Style
        </label>
        <div className="relative">
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface-1 border border-border text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
          >
            {styles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Aspect Ratio
        </label>
        <div className="flex flex-wrap gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                aspectRatio === ratio
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground border border-border"
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-3 p-3 rounded-lg bg-surface-1 border border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Advanced
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Steps</span>
            <span className="font-mono">{stepsNum}</span>
          </div>
          <Slider
            value={[stepsNum]}
            onValueChange={([v]) => setStepsNum(v)}
            min={20}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Guidance</span>
            <span className="font-mono">{guidanceScale}</span>
          </div>
          <Slider
            value={[guidanceScale]}
            onValueChange={([v]) => setGuidanceScale(v)}
            min={1}
            max={20}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Seed</span>
            <span className="font-mono">{seed}</span>
          </div>
          <Slider
            value={[seed]}
            onValueChange={([v]) => setSeed(v)}
            min={0}
            max={99999}
            step={1}
          />
        </div>
      </div>

      {/* JSON Blueprint */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span>Structured JSON {structuredPrompt ? "(BRIA)" : "(Preview)"}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showJson ? "rotate-180" : ""}`} />
          </button>
          {structuredPrompt && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // This would need to be passed as a prop from Index
                window.dispatchEvent(new CustomEvent('navigate-to-fibo'));
              }}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              Edit in FIBO
            </a>
          )}
        </div>
        {showJson && (
          <pre className="p-3 rounded-lg bg-surface-1 border border-border text-xs font-mono text-muted-foreground overflow-auto max-h-48 scrollbar-thin">
            {JSON.stringify(blueprint, null, 2)}
          </pre>
        )}
      </div>

      {/* Category Detection & Result Info */}
      {detectedCategory && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">
                  Detected: {detectedCategory.toUpperCase()}
                </p>
                {categoryConfidence && (
                  <p className="text-xs text-primary/70">
                    Confidence: {(categoryConfidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Content Type Info */}
          <div className="p-3 rounded-lg bg-surface-1 border border-border">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Content Type
                </p>
                <p className="text-sm text-foreground">
                  {detectedCategory === "image" && "Static Image - Perfect for photos, illustrations, and artwork"}
                  {detectedCategory === "video" && "Video Content - Animated sequences with motion"}
                  {detectedCategory === "ads" && "Advertisement - Marketing and promotional material"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {generationError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{generationError}</p>
        </div>
      )}

      {/* Progress */}
      {generationProgress && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <p className="text-sm text-primary">{generationProgress}</p>
          </div>
          
          {/* Frame Progress for Video */}
          {totalFramesToGenerate > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Generating Frames</span>
                <span>{framesGenerated} / {totalFramesToGenerate}</span>
              </div>
              <div className="h-2 bg-surface-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(framesGenerated / totalFramesToGenerate) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Timeline Preview */}
          {videoTimeline && videoTimeline.frames && videoTimeline.frames.length > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-surface-1 to-surface-2 border border-border shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-semibold text-foreground">
                    Video Timeline
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    🎬 {videoTimeline.total_frames || videoTimeline.frames.length} frames
                  </span>
                  <span className="flex items-center gap-1">
                    ⚡ {videoTimeline.fps || 30} FPS
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ {((videoTimeline.total_frames || videoTimeline.frames.length) / (videoTimeline.fps || 30)).toFixed(1)}s
                  </span>
                </div>
              </div>
              
              {/* Timeline Progress Bar */}
              <div className="space-y-2 mb-3">
                <div className="flex gap-1">
                  {videoTimeline.frames.map((frame: any, idx: number) => (
                    <div 
                      key={idx}
                      className={`group relative flex-1 h-8 rounded transition-all duration-300 ${
                        idx < framesGenerated 
                          ? 'bg-gradient-to-t from-primary to-primary/70 shadow-md' 
                          : 'bg-surface-2 border border-border/50'
                      }`}
                      title={frame.description || `Frame ${idx + 1}`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-[10px] font-mono font-bold ${
                          idx < framesGenerated ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-xl border border-border max-w-[200px] whitespace-normal">
                          <p className="font-semibold mb-1">Frame {idx + 1}</p>
                          <p className="text-muted-foreground">{frame.description || 'No description'}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {frame.timestamp ? `${frame.timestamp.toFixed(2)}s` : `~${(idx / (videoTimeline.fps || 30)).toFixed(2)}s`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Frame Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-surface-2/50 border border-border/30">
                  <p className="text-muted-foreground mb-1">Progress</p>
                  <p className="font-semibold text-foreground">
                    {framesGenerated} / {videoTimeline.frames.length} frames
                  </p>
                </div>
                <div className="p-2 rounded bg-surface-2/50 border border-border/30">
                  <p className="text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold text-primary">
                    {framesGenerated === videoTimeline.frames.length ? '✓ Complete' : '⏳ Generating...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Video Timeline (shown after generation) */}
      {!isGenerating && videoTimeline && videoTimeline.frames && videoTimeline.frames.length > 0 && framesGenerated === videoTimeline.frames.length && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-2 border-primary/30 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-primary">
              ✓ Video Timeline Complete
            </p>
          </div>
          
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-surface-1 border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Frames</p>
                <p className="text-lg font-bold text-primary">{videoTimeline.total_frames || videoTimeline.frames.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-1 border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">FPS</p>
                <p className="text-lg font-bold text-primary">{videoTimeline.fps || 30}</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-1 border border-border text-center">
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-lg font-bold text-primary">{((videoTimeline.total_frames || videoTimeline.frames.length) / (videoTimeline.fps || 30)).toFixed(1)}s</p>
              </div>
            </div>
            
            {/* Timeline visualization */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Frame Sequence</p>
              <div className="flex gap-1">
                {videoTimeline.frames.map((frame: any, idx: number) => (
                  <div 
                    key={idx}
                    className="group relative flex-1 h-10 rounded-lg bg-gradient-to-t from-primary to-primary/70 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    title={frame.description || `Frame ${idx + 1}`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-mono font-bold text-primary-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-[8px] text-primary-foreground/70">
                        {frame.timestamp ? `${frame.timestamp.toFixed(1)}s` : `${(idx / (videoTimeline.fps || 30)).toFixed(1)}s`}
                      </span>
                    </div>
                    
                    {/* Enhanced tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-xl border border-border max-w-[220px] whitespace-normal">
                        <p className="font-bold mb-1 text-primary">Frame {idx + 1}</p>
                        <p className="text-muted-foreground leading-relaxed">{frame.description || 'No description'}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground">
                            ⏱️ {frame.timestamp ? `${frame.timestamp.toFixed(2)}s` : `~${(idx / (videoTimeline.fps || 30)).toFixed(2)}s`}
                          </span>
                          {frame.image_url && (
                            <span className="text-[10px] text-green-500">✓ Generated</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button
        variant="glow"
        size="lg"
        className="w-full gap-2"
        onClick={handleGenerate}
        disabled={(!prompt.trim() && !structuredPrompt) || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate with BRIA FIBO
          </>
        )}
      </Button>

      {/* BRIA Badge */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="text-xs text-muted-foreground">Powered by</span>
        <span className="text-xs font-semibold gradient-text">BRIA FIBO</span>
      </div>

      {/* Generated Content Info */}
      <GeneratedContentInfo />
    </div>
  );
};

export default GeneratePanel;
