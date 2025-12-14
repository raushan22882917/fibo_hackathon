import { Film, Clock, Layers, Zap, Play, Pause, SkipBack, SkipForward, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useVideoStore } from "@/store/videoStore";
import { useState } from "react";

const TimelinePanel = () => {
  const { 
    currentFrame, 
    totalFrames,
    videoTimeline,
    framesGenerated,
    totalFramesToGenerate,
    isGenerating,
    setCurrentFrame,
  } = useVideoStore();

  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const hasVideo = videoTimeline && videoTimeline.frames && videoTimeline.frames.length > 0;
  const fps = videoTimeline?.fps || 30;
  const displayFrames = hasVideo ? videoTimeline.frames.length : totalFrames;
  const duration = hasVideo ? displayFrames / fps : 0;

  const handleSkipBack = () => {
    setCurrentFrame(Math.max(0, currentFrame - 1));
  };

  const handleSkipForward = () => {
    setCurrentFrame(Math.min(displayFrames - 1, currentFrame + 1));
  };

  const handleGoToStart = () => {
    setCurrentFrame(0);
  };

  const handleGoToEnd = () => {
    setCurrentFrame(displayFrames - 1);
  };

  return (
    <div className="p-4 space-y-5 animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Film className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Timeline Controls</span>
      </div>

      {hasVideo ? (
        <>
          {/* Video Info */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="w-3 h-3" />
                  <span>Total Frames</span>
                </div>
                <p className="text-lg font-bold text-primary">{displayFrames}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>Frame Rate</span>
                </div>
                <p className="text-lg font-bold text-primary">{fps} FPS</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Duration</span>
                </div>
                <p className="text-lg font-bold text-primary">{duration.toFixed(2)}s</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Film className="w-3 h-3" />
                  <span>Current Frame</span>
                </div>
                <p className="text-lg font-bold text-primary">{currentFrame + 1}</p>
              </div>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && totalFramesToGenerate > 0 && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary">Generating Frames</span>
                <span className="text-xs font-mono text-primary">
                  {framesGenerated} / {totalFramesToGenerate}
                </span>
              </div>
              <div className="h-2 bg-surface-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(framesGenerated / totalFramesToGenerate) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Frame Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Frame Position</span>
              <span className="font-mono text-foreground">
                {currentFrame + 1} / {displayFrames}
              </span>
            </div>
            <Slider
              value={[currentFrame]}
              onValueChange={([v]) => setCurrentFrame(v)}
              min={0}
              max={displayFrames - 1}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{(currentFrame / fps).toFixed(2)}s</span>
              <span>{duration.toFixed(2)}s</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Playback Controls
            </label>
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="surface" 
                size="sm" 
                onClick={handleGoToStart}
                disabled={currentFrame === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                variant="surface" 
                size="sm" 
                onClick={handleSkipBack}
                disabled={currentFrame === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                variant="surface" 
                size="sm" 
                onClick={handleSkipForward}
                disabled={currentFrame >= displayFrames - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button 
                variant="surface" 
                size="sm" 
                onClick={handleGoToEnd}
                disabled={currentFrame >= displayFrames - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Playback Speed */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Playback Speed
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    playbackSpeed === speed
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-1 text-muted-foreground hover:bg-surface-2 border border-border"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Current Frame Info */}
          {videoTimeline.frames[currentFrame] && (
            <div className="p-3 rounded-lg bg-surface-1 border border-border">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground mb-1">
                    Frame {currentFrame + 1} Details
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {videoTimeline.frames[currentFrame].description || 'No description available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>Timestamp: {(currentFrame / fps).toFixed(2)}s</span>
                {videoTimeline.frames[currentFrame].image_url && (
                  <span className="text-green-500">✓ Generated</span>
                )}
              </div>
            </div>
          )}

          {/* Frame List */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              All Frames ({displayFrames})
            </label>
            <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
              {videoTimeline.frames.map((frame: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentFrame(idx)}
                  className={`w-full p-2 rounded-lg text-left transition-all ${
                    currentFrame === idx
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-surface-1 border border-border hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">Frame {idx + 1}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {(idx / fps).toFixed(2)}s
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {frame.description || 'No description'}
                  </p>
                  {idx < framesGenerated && (
                    <div className="mt-1 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] text-green-500">Generated</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* No Video State */
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-2">
            No Video Timeline
          </p>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
            Generate video content to access timeline controls. Select "Video" as content type in the Generate panel.
          </p>
          <div className="p-3 rounded-lg bg-surface-1 border border-border text-left">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span> Video generation creates multiple frames that you can scrub through, edit, and export as a video file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePanel;
