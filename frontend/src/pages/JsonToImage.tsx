import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileJson, Image, Download, Copy, RefreshCw, Sparkles, ArrowLeft, Palette, Layout, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { useNavigate } from 'react-router-dom';

const JsonToImage: React.FC = () => {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState(`{
  "name": "Product Analytics Dashboard",
  "metrics": {
    "users": 15420,
    "revenue": 89750,
    "conversion_rate": 3.2
  },
  "categories": [
    {"name": "Electronics", "sales": 45000},
    {"name": "Clothing", "sales": 32000},
    {"name": "Books", "sales": 12750}
  ],
  "trends": {
    "monthly_growth": 12.5,
    "user_retention": 78.3,
    "satisfaction_score": 4.6
  }
}`);
  const [visualStyle, setVisualStyle] = useState('modern');
  const [colorScheme, setColorScheme] = useState('blue');
  const [layout, setLayout] = useState('tree');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

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
      setAnalysis(result.analysis);
      toast.success('JSON visualization generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput);
    toast.success('JSON copied to clipboard');
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `json-visualization-${Date.now()}.png`;
      link.click();
      toast.success('Image downloaded');
    }
  };

  const loadSampleData = (sample: string) => {
    const samples = {
      dashboard: `{
  "name": "Product Analytics Dashboard",
  "metrics": {
    "users": 15420,
    "revenue": 89750,
    "conversion_rate": 3.2
  },
  "categories": [
    {"name": "Electronics", "sales": 45000},
    {"name": "Clothing", "sales": 32000},
    {"name": "Books", "sales": 12750}
  ],
  "trends": {
    "monthly_growth": 12.5,
    "user_retention": 78.3,
    "satisfaction_score": 4.6
  }
}`,
      api: `{
  "api": "User Management API",
  "version": "2.1.0",
  "endpoints": [
    {
      "path": "/users",
      "methods": ["GET", "POST"],
      "auth": "required"
    },
    {
      "path": "/users/{id}",
      "methods": ["GET", "PUT", "DELETE"],
      "auth": "required"
    }
  ],
  "models": {
    "User": {
      "id": "string",
      "name": "string",
      "email": "string",
      "created_at": "datetime"
    }
  }
}`,
      config: `{
  "application": "E-commerce Platform",
  "environment": "production",
  "database": {
    "host": "db.example.com",
    "port": 5432,
    "name": "ecommerce_prod",
    "ssl": true
  },
  "cache": {
    "type": "redis",
    "ttl": 3600,
    "max_connections": 100
  },
  "features": {
    "payment_gateway": true,
    "inventory_tracking": true,
    "analytics": true,
    "notifications": false
  }
}`
    };
    setJsonInput(samples[sample as keyof typeof samples]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Studio
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg">
                  <FileJson className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    JSON to Image
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">Data Visualization Studio</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Styles</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Layouts</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Transform your JSON data into beautiful visual representations using FIBO. 
              For technical architecture diagrams, visit our{" "}
              <button 
                onClick={() => navigate("/system-architecture")} 
                className="text-primary hover:underline font-medium"
              >
                System Architecture Generator
              </button>
            </p>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                JSON Input & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sample Data Buttons */}
              <div className="space-y-2">
                <Label>Sample Data</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleData('dashboard')}
                  >
                    📊 Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleData('api')}
                  >
                    🔌 API Schema
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleData('config')}
                  >
                    ⚙️ Configuration
                  </Button>
                </div>
              </div>

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
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              {/* Configuration Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateImage}
                disabled={isGenerating || !jsonInput.trim()}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating Visualization...
                  </>
                ) : (
                  <>
                    <Image className="w-5 h-5 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Generated Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <img
                      src={generatedImage}
                      alt="JSON Visualization"
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadImage}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(generatedImage, '_blank')}
                    >
                      Open Full Size
                    </Button>
                  </div>

                  {/* Analysis Info */}
                  {analysis && (
                    <Card className="bg-gray-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <div>Structure: {analysis.structure_type}</div>
                        <div>Elements: {analysis.element_count}</div>
                        <div>Complexity: {analysis.complexity}</div>
                        <div>Max Depth: {analysis.max_depth}</div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileJson className="w-12 h-12 mb-4" />
                  <p className="text-lg font-medium">No visualization yet</p>
                  <p className="text-sm">Enter JSON data and click generate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileJson className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Smart JSON Analysis</h3>
                <p className="text-sm text-gray-600">
                  Automatically analyzes your JSON structure and creates appropriate visualizations
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Multiple Styles</h3>
                <p className="text-sm text-gray-600">
                  Choose from modern, minimal, technical, artistic, and infographic styles
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Export Ready</h3>
                <p className="text-sm text-gray-600">
                  Download high-quality images perfect for presentations and documentation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonToImage;