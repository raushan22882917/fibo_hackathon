import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye } from "lucide-react";

interface OutputNodeData {
  label: string;
  format?: string;
  quality?: string;
  result?: any;
}

const OutputNode = memo(({ data, selected }: NodeProps<OutputNodeData>) => {
  const handlePreview = () => {
    if (data.result?.url) {
      window.open(data.result.url, '_blank');
    }
  };

  const handleDownload = () => {
    if (data.result?.url) {
      const link = document.createElement('a');
      link.href = data.result.url;
      link.download = `workflow-output.${data.format || 'png'}`;
      link.click();
    }
  };

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          📤 {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="w-3 h-3"
        />
        
        <div>
          <Label className="text-xs">Output Format</Label>
          <Select
            value={data.format || "png"}
            onValueChange={(value) => {
              data.format = value;
            }}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG Image</SelectItem>
              <SelectItem value="jpg">JPG Image</SelectItem>
              <SelectItem value="mp4">MP4 Video</SelectItem>
              <SelectItem value="gif">GIF Animation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Quality</Label>
          <Select
            value={data.quality || "high"}
            onValueChange={(value) => {
              data.quality = value;
            }}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (720p)</SelectItem>
              <SelectItem value="medium">Medium (1080p)</SelectItem>
              <SelectItem value="high">High (1440p)</SelectItem>
              <SelectItem value="ultra">Ultra (4K)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.result && (
          <div className="space-y-2">
            <div className="text-xs text-green-600">
              ✅ Output ready
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePreview}>
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}

        {!data.result && (
          <div className="text-xs text-muted-foreground">
            Waiting for input...
          </div>
        )}
      </CardContent>
    </Card>
  );
});

OutputNode.displayName = "OutputNode";

export default OutputNode;