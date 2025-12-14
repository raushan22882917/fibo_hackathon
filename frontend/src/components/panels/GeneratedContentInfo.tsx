import { Image as ImageIcon, Video, Sparkles, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoStore } from "@/store/videoStore";

const GeneratedContentInfo = () => {
  const { 
    generatedImageUrl, 
    detectedCategory,
    categoryConfidence,
    prompt,
    structuredPrompt,
  } = useVideoStore();

  if (!generatedImageUrl) return null;

  const isVideo = detectedCategory === "video";
  const isAds = detectedCategory === "ads";

  const handleOpenInNewTab = () => {
    if (generatedImageUrl) {
      window.open(generatedImageUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    
    try {
      // Check if it's a data URL (base64 encoded)
      if (generatedImageUrl.startsWith('data:')) {
        // Direct download from data URL
        const a = document.createElement("a");
        a.href = generatedImageUrl;
        const extension = isVideo ? "mp4" : "png";
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.download = `bria-${detectedCategory || 'content'}-${timestamp}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fetch from URL and download
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const extension = isVideo ? "mp4" : "png";
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.download = `bria-${detectedCategory || 'content'}-${timestamp}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download:", error);
      alert("Download failed. Please try opening in a new tab and saving manually.");
    }
  };

  return (
    <div className="p-4 space-y-4 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Generated Content</h3>
        <div className="flex items-center gap-1">
          {isVideo ? (
            <Video className="w-4 h-4 text-primary" />
          ) : isAds ? (
            <Sparkles className="w-4 h-4 text-accent" />
          ) : (
            <ImageIcon className="w-4 h-4 text-primary" />
          )}
        </div>
      </div>

      {/* Preview Thumbnail */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-1 border border-border">
        {isVideo ? (
          <video
            src={generatedImageUrl}
            className="w-full h-full object-cover"
            muted
            loop
            autoPlay
          />
        ) : (
          <img 
            src={generatedImageUrl} 
            alt="Generated content"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 rounded bg-primary/90 backdrop-blur-sm text-xs font-semibold text-primary-foreground">
            {detectedCategory?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content Details - Real Data */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium text-foreground">
            {isVideo ? "Video" : isAds ? "Advertisement" : "Image"}
          </span>
        </div>
        
        {categoryConfidence && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">AI Confidence</span>
            <span className="font-medium text-foreground">
              {(categoryConfidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {structuredPrompt?.photographic_characteristics?.camera_angle && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Camera Angle</span>
            <span className="font-medium text-foreground">
              {structuredPrompt.photographic_characteristics.camera_angle}
            </span>
          </div>
        )}

        {structuredPrompt?.lighting?.conditions && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Lighting</span>
            <span className="font-medium text-foreground">
              {structuredPrompt.lighting.conditions}
            </span>
          </div>
        )}

        {structuredPrompt?.aesthetics?.composition && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Composition</span>
            <span className="font-medium text-foreground">
              {structuredPrompt.aesthetics.composition}
            </span>
          </div>
        )}

        {prompt && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Original Prompt</p>
            <p className="text-xs text-foreground line-clamp-2">
              {prompt}
            </p>
          </div>
        )}

        {structuredPrompt?.short_description && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Structured Description</p>
            <p className="text-xs text-foreground line-clamp-3">
              {structuredPrompt.short_description}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2"
          onClick={handleDownload}
        >
          <Download className="w-3 h-3" />
          Download
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2"
          onClick={handleOpenInNewTab}
        >
          <ExternalLink className="w-3 h-3" />
          Open
        </Button>
      </div>
    </div>
  );
};

export default GeneratedContentInfo;
