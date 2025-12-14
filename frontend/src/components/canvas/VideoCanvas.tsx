import { useState, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Layers, RefreshCw, Download, ZoomIn, Image as ImageIcon, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/store/videoStore";

const VideoCanvas = () => {
  const { 
    generatedImageUrl, 
    isGenerating, 
    generationProgress,
    currentFrame,
    totalFrames,
    structuredPrompt,
    camera,
    detectedCategory,
  } = useVideoStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect if content is video based on category or data URL format
  const isVideo = detectedCategory === "video" || 
                  generatedImageUrl?.startsWith("data:video/mp4") || 
                  generatedImageUrl?.includes("video") || 
                  generatedImageUrl?.endsWith(".mp4");
  const isImage = !isVideo;

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const extension = isVideo ? "mp4" : "png";
      const filename = `bria-fibo-${detectedCategory || "content"}-${Date.now()}.${extension}`;
      
      // Handle base64 data URLs directly
      if (generatedImageUrl.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = generatedImageUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Handle regular URLs
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const getMediaDimensions = () => {
    if (!generatedImageUrl) return "No content";
    if (isVideo) return "Video • BRIA FIBO";
    return "Image • BRIA FIBO";
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Canvas Header - Real Data */}
      <div className="h-10 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3 text-xs">
          {detectedCategory && (
            <>
              <div className="flex items-center gap-1.5">
                {detectedCategory === "video" ? (
                  <Video className="w-3.5 h-3.5 text-primary" />
                ) : detectedCategory === "ads" ? (
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                )}
                <span className="text-xs font-semibold text-primary uppercase">
                  {detectedCategory}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          
          {structuredPrompt?.photographic_characteristics?.lens_focal_length && (
            <>
              <span className="text-muted-foreground font-mono">
                📷 {structuredPrompt.photographic_characteristics.lens_focal_length}
              </span>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          
          {structuredPrompt?.lighting?.conditions && (
            <>
              <span className="text-muted-foreground font-mono">
                💡 {structuredPrompt.lighting.conditions}
              </span>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          
          <span className="text-muted-foreground font-mono">
            {getMediaDimensions()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <Layers className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={handleFullscreen}
            disabled={!generatedImageUrl}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Media Preview Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div 
          ref={containerRef}
          className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden bg-surface-1 border border-border"
        >
          {generatedImageUrl ? (
            <>
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={generatedImageUrl}
                  className="w-full h-full object-contain"
                  controls={false}
                  loop
                  autoPlay
                  muted
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedData={() => {
                    // Auto-play when video loads
                    if (videoRef.current) {
                      videoRef.current.play().catch(err => {
                        console.log("Autoplay prevented:", err);
                      });
                    }
                  }}
                />
              ) : (
                <img 
                  src={generatedImageUrl} 
                  alt="Generated by BRIA FIBO"
                  className="w-full h-full object-contain"
                />
              )}
            </>
          ) : isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-foreground text-sm font-medium">
                  Generating with BRIA FIBO
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {generationProgress || "Processing..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground ml-1" />
              </div>
              <p className="text-muted-foreground text-sm">
                Enter a prompt and generate with BRIA FIBO
              </p>
            </div>
          )}

          {/* Overlay Metadata - Real Data */}
          {generatedImageUrl && (
            <>
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 max-w-[70%]">
                {detectedCategory && (
                  <span className="px-2 py-1 rounded bg-primary/90 backdrop-blur-sm text-xs font-semibold text-primary-foreground">
                    {detectedCategory.toUpperCase()}
                  </span>
                )}
                {structuredPrompt?.photographic_characteristics?.camera_angle && (
                  <span className="px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs font-mono text-muted-foreground">
                    📷 {structuredPrompt.photographic_characteristics.camera_angle}
                  </span>
                )}
                {structuredPrompt?.photographic_characteristics?.lens_focal_length && (
                  <span className="px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs font-mono text-muted-foreground">
                    🔍 {structuredPrompt.photographic_characteristics.lens_focal_length}
                  </span>
                )}
                {structuredPrompt?.lighting?.conditions && (
                  <span className="px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs font-mono text-muted-foreground">
                    💡 {structuredPrompt.lighting.conditions}
                  </span>
                )}
                {structuredPrompt?.artistic_style && (
                  <span className="px-2 py-1 rounded bg-accent/80 backdrop-blur-sm text-xs font-medium text-accent-foreground">
                    🎨 {structuredPrompt.artistic_style}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Button 
                  variant="surface" 
                  size="sm" 
                  className="gap-2 bg-background/90 backdrop-blur-sm hover:bg-background"
                  onClick={handleDownload}
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
                {isVideo && (
                  <Button 
                    variant="surface" 
                    size="icon-sm"
                    className="bg-background/90 backdrop-blur-sm hover:bg-background"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                )}
              </div>

              {/* Video Progress Indicator */}
              {isVideo && isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
                  <div className="h-full bg-primary transition-all" style={{ width: "0%" }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Real Data Display Panel */}
      {generatedImageUrl && structuredPrompt && (
        <div className="border-t border-border bg-surface-1 p-3">
          <div className="grid grid-cols-4 gap-4 text-xs">
            {/* Camera Info */}
            {structuredPrompt.photographic_characteristics && (
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Camera</p>
                {structuredPrompt.photographic_characteristics.camera_angle && (
                  <p className="text-foreground">Angle: {structuredPrompt.photographic_characteristics.camera_angle}</p>
                )}
                {structuredPrompt.photographic_characteristics.lens_focal_length && (
                  <p className="text-foreground">Lens: {structuredPrompt.photographic_characteristics.lens_focal_length}</p>
                )}
                {structuredPrompt.photographic_characteristics.depth_of_field && (
                  <p className="text-foreground">DOF: {structuredPrompt.photographic_characteristics.depth_of_field}</p>
                )}
              </div>
            )}
            
            {/* Lighting Info */}
            {structuredPrompt.lighting && (
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Lighting</p>
                {structuredPrompt.lighting.conditions && (
                  <p className="text-foreground">Type: {structuredPrompt.lighting.conditions}</p>
                )}
                {structuredPrompt.lighting.direction && (
                  <p className="text-foreground">Direction: {structuredPrompt.lighting.direction}</p>
                )}
                {structuredPrompt.lighting.shadows && (
                  <p className="text-foreground">Shadows: {structuredPrompt.lighting.shadows}</p>
                )}
              </div>
            )}
            
            {/* Aesthetics Info */}
            {structuredPrompt.aesthetics && (
              <div>
                <p className="text-muted-foreground mb-1 font-semibold">Aesthetics</p>
                {structuredPrompt.aesthetics.composition && (
                  <p className="text-foreground">Comp: {structuredPrompt.aesthetics.composition}</p>
                )}
                {structuredPrompt.aesthetics.color_scheme && (
                  <p className="text-foreground">Colors: {structuredPrompt.aesthetics.color_scheme}</p>
                )}
                {structuredPrompt.aesthetics.mood_atmosphere && (
                  <p className="text-foreground">Mood: {structuredPrompt.aesthetics.mood_atmosphere}</p>
                )}
              </div>
            )}
            
            {/* Style Info */}
            <div>
              <p className="text-muted-foreground mb-1 font-semibold">Style</p>
              {structuredPrompt.artistic_style && (
                <p className="text-foreground">Artistic: {structuredPrompt.artistic_style}</p>
              )}
              {structuredPrompt.style_medium && (
                <p className="text-foreground">Medium: {structuredPrompt.style_medium}</p>
              )}
              {detectedCategory && (
                <p className="text-foreground">Type: {detectedCategory}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="h-14 border-t border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {isVideo && generatedImageUrl ? (
            <>
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                variant="glow" 
                size="icon"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = videoRef.current.duration;
                  }
                }}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon-sm" disabled>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                variant="glow" 
                size="icon"
                disabled={!generatedImageUrl}
              >
                <Play className="w-5 h-5 ml-0.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" disabled>
                <SkipForward className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Media Info */}
        <div className="flex items-center gap-4">
          {generatedImageUrl && (
            <>
              <div className="flex items-center gap-2">
                {isVideo ? (
                  <Video className="w-4 h-4 text-primary" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-primary" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isVideo ? "Video Content" : "Image Content"}
                </span>
              </div>
              {detectedCategory && (
                <>
                  <div className="h-4 w-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    Category: <span className="text-primary font-medium">{detectedCategory}</span>
                  </span>
                </>
              )}
            </>
          )}
        </div>

        <span className="text-sm text-muted-foreground font-mono min-w-[80px]">
          {isVideo && videoRef.current ? "Video" : "Ready"}
        </span>
      </div>
    </div>
  );
};

export default VideoCanvas;
