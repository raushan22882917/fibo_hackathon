import { Play, SkipBack, SkipForward, Film, Clock, Layers, Zap, Image as ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";
import { cn } from "@/lib/utils";

const Timeline = () => {
  const { 
    currentFrame, 
    totalFrames,
    videoTimeline,
    framesGenerated,
    totalFramesToGenerate,
    generatedImageUrl,
    detectedCategory,
    isGenerating,
    setCurrentFrame,
  } = useVideoStore();

  // Calculate real values
  const hasVideo = videoTimeline && videoTimeline.frames && videoTimeline.frames.length > 0;
  const fps = videoTimeline?.fps || 30;
  const duration = hasVideo ? (videoTimeline.total_frames || videoTimeline.frames.length) / fps : 0;
  const displayFrames = hasVideo ? videoTimeline.frames.length : totalFrames;
  const currentTime = (currentFrame / fps).toFixed(2);
  const totalTime = (displayFrames / fps).toFixed(2);

  // Download video
  const handleDownloadVideo = async () => {
    if (!generatedImageUrl) return;
    
    try {
      if (generatedImageUrl.startsWith('data:')) {
        const a = document.createElement("a");
        a.href = generatedImageUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.download = `bria-video-${timestamp}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.download = `bria-video-${timestamp}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download video:", error);
    }
  };

  // Download individual frame
  const handleDownloadFrame = async (frameUrl: string, frameNumber: number) => {
    try {
      const response = await fetch(frameUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.download = `bria-frame-${frameNumber + 1}-${timestamp}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download frame:", error);
    }
  };

  // Playback controls
  const handlePlayPause = () => {
    // TODO: Implement playback
    console.log("Play/Pause");
  };

  const handleSkipBack = () => {
    setCurrentFrame(Math.max(0, currentFrame - 1));
  };

  const handleSkipForward = () => {
    setCurrentFrame(Math.min(displayFrames - 1, currentFrame + 1));
  };

  const handleFrameClick = (frameIndex: number) => {
    setCurrentFrame(frameIndex);
  };

  return (
    <div className="h-48 border-t border-border bg-surface-1 flex flex-col">
      {/* Timeline Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Timeline</span>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-3 text-xs">
            {/* Content Type */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-2 border border-border">
              {detectedCategory === "video" ? (
                <>
                  <Film className="w-3 h-3 text-primary" />
                  <span className="font-medium text-primary">Video</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 text-accent" />
                  <span className="font-medium text-accent">Image</span>
                </>
              )}
            </div>

            {/* Frame Info */}
            {hasVideo && (
              <>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Layers className="w-3 h-3" />
                  <span className="font-mono">{displayFrames} frames</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span className="font-mono">{fps} FPS</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono">{duration.toFixed(1)}s</span>
                </div>
              </>
            )}

            {/* Generation Progress */}
            {isGenerating && totalFramesToGenerate > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10 border border-primary/30">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-primary">
                  {framesGenerated}/{totalFramesToGenerate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleSkipBack}
            disabled={!hasVideo || currentFrame === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button 
            variant="surface" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handlePlayPause}
            disabled={!hasVideo}
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleSkipForward}
            disabled={!hasVideo || currentFrame >= displayFrames - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          {hasVideo && generatedImageUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 ml-2"
              onClick={handleDownloadVideo}
            >
              <Download className="w-3 h-3" />
              <span className="text-xs">Download Video</span>
            </Button>
          )}
          
          <div className="ml-2 flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>{currentTime}s</span>
            <span>/</span>
            <span>{totalTime}s</span>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex flex-col p-4">
        {hasVideo ? (
          <>
            {/* Frame Scrubber */}
            <div className="mb-3">
              <Slider
                value={[currentFrame]}
                onValueChange={([v]) => setCurrentFrame(v)}
                min={0}
                max={displayFrames - 1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Frame Thumbnails */}
            <div className="flex-1 overflow-x-auto scrollbar-thin">
              <div className="flex gap-2 pb-2">
                {videoTimeline.frames.map((frame: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleFrameClick(idx)}
                    className={cn(
                      "flex-shrink-0 w-24 h-16 rounded-lg border-2 transition-all relative group",
                      currentFrame === idx
                        ? "border-primary shadow-lg scale-105"
                        : "border-border hover:border-primary/50 hover:scale-102"
                    )}
                  >
                    {/* Frame Preview */}
                    <div className="w-full h-full rounded-md bg-surface-2 flex items-center justify-center overflow-hidden">
                      {frame.image_url ? (
                        <img 
                          src={frame.image_url} 
                          alt={`Frame ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : idx < framesGenerated ? (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Film className="w-6 h-6 text-primary/50" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                          <Film className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Frame Number */}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                      {idx + 1}
                    </div>

                    {/* Timestamp */}
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                      {(idx / fps).toFixed(1)}s
                    </div>

                    {/* Generation Status */}
                    {idx < framesGenerated && (
                      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-green-500" />
                    )}

                    {/* Download Button (on hover) */}
                    {frame.image_url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFrame(frame.image_url, idx);
                        }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Download className="w-4 h-4 text-white" />
                          <span className="text-[10px] text-white font-medium">Download</span>
                        </div>
                      </button>
                    )}

                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                      <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-xl border border-border max-w-[200px] whitespace-normal">
                        <p className="font-semibold mb-1">Frame {idx + 1}</p>
                        <p className="text-muted-foreground text-[10px]">
                          {frame.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Info */}
            {videoTimeline.frames[currentFrame] && (
              <div className="mt-2 p-3 rounded-lg bg-surface-2 border border-border">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground mb-1">
                      Frame {currentFrame + 1} of {displayFrames}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {videoTimeline.frames[currentFrame].description || 'No description available'}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {(currentFrame / fps).toFixed(2)}s
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Video State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-2">
                No Video Timeline
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {generatedImageUrl 
                  ? "This is a static image. Generate a video to see the timeline."
                  : "Generate content to see the timeline. Select 'Video' content type for multi-frame generation."}
              </p>
              {generatedImageUrl && detectedCategory === "image" && (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30">
                  <ImageIcon className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-accent">Static Image Generated</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
