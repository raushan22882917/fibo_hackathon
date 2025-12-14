import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Play, Pause, X } from "lucide-react";

interface AudioInputNodeData {
  label: string;
  audioFile?: File;
  audioUrl?: string;
  youtubeUrl?: string;
  duration?: number;
}

const AudioInputNode = memo(({ data, selected }: NodeProps<AudioInputNodeData>) => {
  const [audioFile, setAudioFile] = useState<File | null>(data.audioFile || null);
  const [audioUrl, setAudioUrl] = useState(data.audioUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(data.youtubeUrl || "");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      data.audioFile = file;
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      data.audioUrl = url;
      
      // Get duration
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        data.duration = audio.duration;
      });
    }
  }, [data]);

  const handleYoutubeUrlChange = useCallback((newUrl: string) => {
    setYoutubeUrl(newUrl);
    data.youtubeUrl = newUrl;
  }, [data]);

  const removeAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl("");
    data.audioFile = undefined;
    data.audioUrl = undefined;
  }, [audioUrl, data]);

  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying);
    // In a real implementation, you'd control audio playback here
  }, [isPlaying]);

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🎵 {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Upload Audio File</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="text-xs flex-1"
            />
            <Button size="sm" variant="outline">
              <Upload className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Supports MP3, WAV, M4A, OGG, FLAC
          </div>
        </div>

        <div>
          <Label className="text-xs">Or YouTube URL</Label>
          <Input
            value={youtubeUrl}
            onChange={(e) => handleYoutubeUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="text-xs"
          />
        </div>

        {audioFile && (
          <div className="border rounded-lg p-2 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium truncate" title={audioFile.name}>
                {audioFile.name}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={removeAudio}
                className="w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={togglePlayback}
                className="w-8 h-8 p-0"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              
              <div className="text-xs text-muted-foreground">
                {data.duration ? `${Math.floor(data.duration / 60)}:${Math.floor(data.duration % 60).toString().padStart(2, '0')}` : 'Loading...'}
              </div>
            </div>
          </div>
        )}

        {youtubeUrl && !audioFile && (
          <div className="text-xs text-green-600">
            ✅ YouTube URL ready for processing
          </div>
        )}
        
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

AudioInputNode.displayName = "AudioInputNode";

export default AudioInputNode;