import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileJson, Image, Download, Copy } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

interface JsonToImageNodeProps {
  data: {
    label: string;
    jsonData?: string;
    visualStyle?: string;
    colorScheme?: string;
    layout?: string;
  };
  id: string;
}

const JsonToImageNode: React.FC<JsonToImageNodeProps> = ({ data, id }) => {
  const [jsonInput, setJsonInput] = useState(data.jsonData || '');
  const [visualStyle, setVisualStyle] = useState(data.visualStyle || 'modern');
  const [colorScheme, setColorScheme] = useState(data.colorScheme || 'blue');
  const [layout, setLayout] = useState(data.layout || 'tree');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const generateImage = async () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      return;
    }

    if (!validateJson(jsonInput)) {
      setError('Invalid JSON format');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.JSON_TO_IMAGE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonData: jsonInput,
          visualStyle,
          colorScheme,
          layout,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setGeneratedImage(result.image.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `json-visualization-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <Card className="w-96 shadow-lg border-2 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <FileJson className="w-5 h-5" />
          {data.label}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* JSON Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="json-input">JSON Data</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <Textarea
            id="json-input"
            placeholder='{"name": "example", "value": 123}'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />
        </div>

        {/* Visual Style */}
        <div className="space-y-2">
          <Label>Visual Style</Label>
          <Select value={visualStyle} onValueChange={setVisualStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="artistic">Artistic</SelectItem>
              <SelectItem value="infographic">Infographic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color Scheme */}
        <div className="space-y-2">
          <Label>Color Scheme</Label>
          <Select value={colorScheme} onValueChange={setColorScheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="monochrome">Monochrome</SelectItem>
              <SelectItem value="rainbow">Rainbow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Layout */}
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select value={layout} onValueChange={setLayout}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tree">Tree</SelectItem>
              <SelectItem value="graph">Graph</SelectItem>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="chart">Chart</SelectItem>
              <SelectItem value="mindmap">Mind Map</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateImage}
          disabled={isGenerating || !jsonInput.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generated Image */}
        {generatedImage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Image</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadImage}
                className="h-6 px-2"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
            <div className="border rounded-md overflow-hidden">
              <img
                src={generatedImage}
                alt="JSON Visualization"
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Node Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-purple-500"
      />
    </Card>
  );
};

export default JsonToImageNode;