import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Eye } from "lucide-react";

interface ImageInputNodeData {
  label: string;
  images?: File[];
  imageUrls?: string[];
  maxImages?: number;
}

const ImageInputNode = memo(({ data, selected }: NodeProps<ImageInputNodeData>) => {
  const [images, setImages] = useState<File[]>(data.images || []);
  const [imageUrls, setImageUrls] = useState<string[]>(data.imageUrls || []);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxImages = data.maxImages || 10;
    
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = [...images, ...files];
    const newUrls = [...imageUrls];

    // Create preview URLs for new files
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      newUrls.push(url);
    });

    setImages(newImages);
    setImageUrls(newUrls);
    
    // Update node data
    data.images = newImages;
    data.imageUrls = newUrls;
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    if (imageUrls[index]) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    
    setImages(newImages);
    setImageUrls(newUrls);
    
    // Update node data
    data.images = newImages;
    data.imageUrls = newUrls;
  };

  const openPreview = (index: number) => {
    setPreviewIndex(index);
  };

  const closePreview = () => {
    setPreviewIndex(null);
  };

  return (
    <>
      <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            🖼️ {data.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Upload Images</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="text-xs"
              />
              <Button size="sm" variant="outline">
                <Upload className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {images.length}/{data.maxImages || 10} images
            </div>
          </div>

          {images.length > 0 && (
            <div>
              <Label className="text-xs">Uploaded Images</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
                {images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrls[index]}
                      alt={file.name}
                      className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => openPreview(index)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-6 h-6 p-0"
                          onClick={() => openPreview(index)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs truncate mt-1" title={file.name}>
                      {file.name}
                    </div>
                  </div>
                ))}
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

      {/* Image Preview Modal */}
      {previewIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-4xl p-4">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={closePreview}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={imageUrls[previewIndex]}
              alt={images[previewIndex]?.name}
              className="max-w-full max-h-full object-contain rounded"
            />
            <div className="text-white text-center mt-2">
              {images[previewIndex]?.name}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ImageInputNode.displayName = "ImageInputNode";

export default ImageInputNode;