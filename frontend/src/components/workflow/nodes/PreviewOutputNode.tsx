import { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Edit, Maximize2, RotateCcw, Share2 } from "lucide-react";

interface PreviewOutputNodeData {
  label: string;
  format?: string;
  quality?: string;
  result?: any;
  showPreview?: boolean;
}

const PreviewOutputNode = memo(({ data, selected }: NodeProps<PreviewOutputNodeData>) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  const handlePreview = () => {
    if (data.result?.url) {
      setIsPreviewOpen(true);
    }
  };

  const handleDownload = () => {
    if (data.result?.url) {
      const link = document.createElement('a');
      link.href = data.result.url;
      link.download = `workflow-output-${Date.now()}.${data.format || 'png'}`;
      link.click();
    }
  };

  const handleModify = () => {
    setIsModifying(true);
    // This would trigger a modification workflow
  };

  const handleShare = () => {
    if (data.result?.url && navigator.share) {
      navigator.share({
        title: 'Generated Image',
        url: data.result.url,
      });
    } else if (data.result?.url) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(data.result.url);
    }
  };

  const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = url;
    });
  };

  return (
    <>
      <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            👁️ {data.label}
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
                <SelectItem value="png">PNG (Lossless)</SelectItem>
                <SelectItem value="jpg">JPG (Compressed)</SelectItem>
                <SelectItem value="webp">WebP (Modern)</SelectItem>
                <SelectItem value="svg">SVG (Vector)</SelectItem>
                <SelectItem value="pdf">PDF (Document)</SelectItem>
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
                <SelectItem value="low">Low (Fast)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
                <SelectItem value="high">High (Quality)</SelectItem>
                <SelectItem value="ultra">Ultra (Maximum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview Area */}
          {data.result?.url && (
            <div className="border rounded-lg p-2 bg-muted/30">
              <div className="aspect-square w-full bg-checkered rounded overflow-hidden mb-2">
                <img
                  src={data.result.url}
                  alt="Generated output"
                  className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handlePreview}
                />
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                <div>Status: ✅ Ready</div>
                <div>Size: {data.result.width || 'Auto'} × {data.result.height || 'Auto'}</div>
                <div>Format: {data.format?.toUpperCase() || 'PNG'}</div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <Button size="sm" variant="outline" onClick={handlePreview}>
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={handleModify}>
                  <Edit className="w-3 h-3 mr-1" />
                  Modify
                </Button>
                <Button size="sm" variant="outline" onClick={handleShare}>
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          )}

          {!data.result && (
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground">
                Waiting for input...
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Connect nodes and execute workflow
              </div>
            </div>
          )}

          {isModifying && (
            <div className="border rounded-lg p-2 bg-blue-50">
              <div className="text-xs font-medium mb-2">Quick Modifications</div>
              <div className="grid grid-cols-2 gap-1">
                <Button size="sm" variant="outline">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Rotate
                </Button>
                <Button size="sm" variant="outline">
                  Crop
                </Button>
                <Button size="sm" variant="outline">
                  Resize
                </Button>
                <Button size="sm" variant="outline">
                  Filter
                </Button>
              </div>
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

      {/* Full Preview Modal */}
      {isPreviewOpen && data.result?.url && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-[90vw] max-h-[90vh] p-4">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕
              </Button>
            </div>
            
            <img
              src={data.result.url}
              alt="Generated output preview"
              className="max-w-full max-h-full object-contain rounded shadow-2xl"
            />
            
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
              {data.result.width || 'Auto'} × {data.result.height || 'Auto'} • {data.format?.toUpperCase() || 'PNG'}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </>
  );
});

PreviewOutputNode.displayName = "PreviewOutputNode";

export default PreviewOutputNode;