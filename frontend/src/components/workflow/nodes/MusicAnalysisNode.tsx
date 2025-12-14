import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "@/config/api";

interface MusicAnalysisNodeData {
  label: string;
  file?: File;
  analysis?: any;
}

const MusicAnalysisNode = memo(({ data, selected }: NodeProps<MusicAnalysisNodeData>) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    data.file = file;
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(buildApiUrl(API_ENDPOINTS.MUSIC_ANALYZE), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const analysis = await response.json();
        data.analysis = analysis;
      }
    } catch (error) {
      console.error("Music analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🎵 {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Upload Music File</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="text-xs"
              disabled={isAnalyzing}
            />
            <Button size="sm" variant="outline" disabled={isAnalyzing}>
              <Upload className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {data.file && (
          <div className="text-xs text-muted-foreground">
            File: {data.file.name}
          </div>
        )}

        {isAnalyzing && (
          <div className="text-xs text-blue-600">
            Analyzing music...
          </div>
        )}

        {data.analysis && (
          <div className="space-y-1 text-xs">
            <div><strong>Duration:</strong> {data.analysis.duration?.toFixed(1)}s</div>
            <div><strong>Tempo:</strong> {data.analysis.tempo?.toFixed(0)} BPM</div>
            <div><strong>Mood:</strong> {data.analysis.mood}</div>
            <div><strong>Energy:</strong> {data.analysis.energy}</div>
            <div><strong>Genre:</strong> {data.analysis.genre}</div>
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

MusicAnalysisNode.displayName = "MusicAnalysisNode";

export default MusicAnalysisNode;