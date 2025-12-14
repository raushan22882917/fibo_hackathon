import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Database, 
  Server, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Eye,
  Code,
  Layers,
  Zap,
  GitBranch,
  Cloud,
  ArrowLeft,
  Settings,
  Maximize2,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { useNavigate } from 'react-router-dom';

interface SystemComponent {
  name: string;
  type: string;
  category: string;
  description: string;
  technologies: string[];
  connections: string[];
}

interface SystemArchitecture {
  systemName: string;
  description: string;
  systemType: string;
  scale: string;
  components: {
    frontend: SystemComponent[];
    backend: SystemComponent[];
    database: SystemComponent[];
    infrastructure: SystemComponent[];
    external: SystemComponent[];
  };
  dataFlow: {
    source: string;
    target: string;
    description: string;
    type: string;
  }[];
  technologies: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    infrastructure: string[];
    tools: string[];
  };
  architecture_patterns: string[];
  scalability_features: string[];
  security_measures: string[];
  flow_diagram: {
    steps: {
      id: string;
      name: string;
      description: string;
      type: 'user' | 'frontend' | 'backend' | 'database' | 'external' | 'infrastructure';
      position: { x: number; y: number };
    }[];
    connections: {
      from: string;
      to: string;
      label: string;
      type: 'request' | 'response' | 'data' | 'event';
    }[];
  };
}

const SystemArchitectureGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [userPrompt, setUserPrompt] = useState('');
  const [systemType, setSystemType] = useState('web-application');
  const [architectureStyle, setArchitectureStyle] = useState('microservices');
  const [scale, setScale] = useState('medium');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzedPrompt, setAnalyzedPrompt] = useState('');
  const [systemArchitecture, setSystemArchitecture] = useState<SystemArchitecture | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Flow Diagram Component
  const FlowDiagram = ({ flowData }: { flowData: SystemArchitecture['flow_diagram'] }) => {
    const getNodeColor = (type: string) => {
      switch (type) {
        case 'user': return 'bg-blue-100 border-blue-300 text-blue-800';
        case 'frontend': return 'bg-green-100 border-green-300 text-green-800';
        case 'backend': return 'bg-purple-100 border-purple-300 text-purple-800';
        case 'database': return 'bg-orange-100 border-orange-300 text-orange-800';
        case 'external': return 'bg-red-100 border-red-300 text-red-800';
        case 'infrastructure': return 'bg-gray-100 border-gray-300 text-gray-800';
        default: return 'bg-gray-100 border-gray-300 text-gray-800';
      }
    };

    const getNodeIcon = (type: string) => {
      switch (type) {
        case 'user': return '👤';
        case 'frontend': return '🖥️';
        case 'backend': return '⚙️';
        case 'database': return '🗄️';
        case 'external': return '🌐';
        case 'infrastructure': return '☁️';
        default: return '📦';
      }
    };

    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl border border-border/50 overflow-hidden">
        <div className="absolute inset-0 p-4">
          {/* Render connections first (behind nodes) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {flowData.connections.map((connection, index) => {
              const fromStep = flowData.steps.find(s => s.id === connection.from);
              const toStep = flowData.steps.find(s => s.id === connection.to);
              
              if (!fromStep || !toStep) return null;
              
              const fromX = fromStep.position.x * 100 + 50;
              const fromY = fromStep.position.y * 100 + 25;
              const toX = toStep.position.x * 100 + 50;
              const toY = toStep.position.y * 100 + 25;
              
              return (
                <g key={index}>
                  <defs>
                    <marker
                      id={`arrowhead-${index}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="hsl(var(--primary))"
                        opacity="0.7"
                      />
                    </marker>
                  </defs>
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeOpacity="0.7"
                    markerEnd={`url(#arrowhead-${index})`}
                  />
                  {/* Connection label */}
                  <text
                    x={(fromX + toX) / 2}
                    y={(fromY + toY) / 2 - 5}
                    textAnchor="middle"
                    className="fill-primary text-xs font-medium"
                    style={{ fontSize: '10px' }}
                  >
                    {connection.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Render nodes */}
          {flowData.steps.map((step) => (
            <div
              key={step.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getNodeColor(step.type)} rounded-lg border-2 p-3 min-w-[100px] text-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group`}
              style={{
                left: `${step.position.x * 100}px`,
                top: `${step.position.y * 100}px`,
              }}
            >
              <div className="text-lg mb-1">{getNodeIcon(step.type)}</div>
              <div className="text-xs font-semibold">{step.name}</div>
              <div className="text-xs opacity-75 mt-1 hidden group-hover:block absolute bg-black/80 text-white p-2 rounded z-10 -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const analyzeSystemPrompt = async () => {
    if (!userPrompt.trim()) {
      setError('Please describe your system');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SYSTEM_ARCHITECTURE_ANALYZE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          systemType,
          architectureStyle,
          scale
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalyzedPrompt(result.analyzed_prompt);
      setSystemArchitecture(result.system_architecture);
      toast.success('System architecture analyzed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze system';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateArchitectureDiagrams = async () => {
    if (!systemArchitecture) {
      setError('Please analyze the system first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SYSTEM_ARCHITECTURE_GENERATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_architecture: systemArchitecture,
          analyzed_prompt: analyzedPrompt,
          diagram_types: ['overview', 'data-flow', 'component', 'deployment', 'tech-stack']
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setGeneratedImages(result.images);
      toast.success('Architecture diagrams generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate diagrams';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadArchitecture = () => {
    if (systemArchitecture) {
      const dataStr = JSON.stringify(systemArchitecture, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${systemArchitecture.systemName.replace(/\s+/g, '-').toLowerCase()}-architecture.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Architecture JSON downloaded');
    }
  };

  const loadSampleSystem = (sample: string) => {
    const samples = {
      'social-media': 'Create a social media platform like Instagram with photo/video sharing, real-time messaging, recommendation system, and content discovery. Support millions of users with high availability and global distribution.',
      'e-commerce': 'Build a large-scale e-commerce platform like Amazon with product catalog, shopping cart, payment processing, order management, inventory tracking, and recommendation engine. Handle Black Friday traffic spikes.',
      'streaming': 'Design a video streaming service like Netflix with content delivery, user profiles, recommendation algorithms, video processing pipeline, and global CDN. Support 4K streaming for millions of concurrent users.',
      'fintech': 'Create a digital banking platform with account management, real-time transactions, fraud detection, regulatory compliance, mobile payments, and integration with external financial systems.',
      'ride-sharing': 'Build a ride-sharing app like Uber with real-time GPS tracking, driver-rider matching, dynamic pricing, payment processing, trip history, and surge pricing algorithms.',
      'messaging': 'Design a messaging platform like WhatsApp with real-time chat, group messaging, file sharing, end-to-end encryption, voice/video calls, and status updates for billions of users.'
    };
    setUserPrompt(samples[sample as keyof typeof samples]);
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
                  <Network className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                    System Architecture Generator
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">AI-Powered Architecture Design</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
              Describe any technical system and get professional architecture diagrams with detailed 
              component breakdowns and technology recommendations powered by FIBO.
            </p>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Description */}
            <Card className="glass-card hover-lift">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gradient-primary">
                  <Eye className="w-5 h-5" />
                  System Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Systems */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Quick Start Templates</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['social-media', 'e-commerce', 'streaming', 'fintech', 'ride-sharing', 'messaging'].map((sample) => (
                      <Button
                        key={sample}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs hover-glow rounded-full"
                        onClick={() => loadSampleSystem(sample)}
                      >
                        <Sparkles className="w-3 h-3 mr-2" />
                        {sample.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">System Description</Label>
                  <Textarea
                    placeholder="Describe your system: features, scale, requirements, user base, performance needs..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="min-h-[120px] rounded-xl bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">System Type</Label>
                    <Select value={systemType} onValueChange={setSystemType}>
                      <SelectTrigger className="rounded-full bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-application">Web Application</SelectItem>
                        <SelectItem value="mobile-app">Mobile App</SelectItem>
                        <SelectItem value="api-service">API Service</SelectItem>
                        <SelectItem value="data-platform">Data Platform</SelectItem>
                        <SelectItem value="iot-system">IoT System</SelectItem>
                        <SelectItem value="ml-platform">ML Platform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Architecture Style</Label>
                    <Select value={architectureStyle} onValueChange={setArchitectureStyle}>
                      <SelectTrigger className="rounded-full bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="microservices">Microservices</SelectItem>
                        <SelectItem value="monolithic">Monolithic</SelectItem>
                        <SelectItem value="serverless">Serverless</SelectItem>
                        <SelectItem value="event-driven">Event-Driven</SelectItem>
                        <SelectItem value="layered">Layered</SelectItem>
                        <SelectItem value="hexagonal">Hexagonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Scale</Label>
                    <Select value={scale} onValueChange={setScale}>
                      <SelectTrigger className="rounded-full bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1K users)</SelectItem>
                        <SelectItem value="medium">Medium (100K users)</SelectItem>
                        <SelectItem value="large">Large (1M users)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (10M+ users)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={analyzeSystemPrompt}
                  disabled={isAnalyzing || !userPrompt.trim()}
                  variant="glow"
                  size="lg"
                  className="w-full rounded-full gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze & Create Architecture
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* System Architecture JSON */}
            {systemArchitecture && (
              <Card className="glass-card animate-slide-up">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gradient-primary">
                      <Code className="w-5 h-5" />
                      System Architecture
                    </div>
                    <Button
                      onClick={downloadArchitecture}
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download JSON</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
                      <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                      <TabsTrigger value="flow" className="text-xs">Flow</TabsTrigger>
                      <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
                      <TabsTrigger value="technologies" className="text-xs">Tech Stack</TabsTrigger>
                      <TabsTrigger value="dataflow" className="text-xs">Data Flow</TabsTrigger>
                      <TabsTrigger value="patterns" className="text-xs">Patterns</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">System Name</Label>
                          <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">{systemArchitecture.systemName}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Scale</Label>
                          <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">{systemArchitecture.scale}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Description</Label>
                        <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{systemArchitecture.description}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Architecture Patterns</Label>
                        <div className="flex gap-2 flex-wrap">
                          {systemArchitecture.architecture_patterns.map((pattern, index) => (
                            <Badge key={index} variant="secondary" className="text-xs rounded-full">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="flow" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-foreground">System Flow Diagram</Label>
                          <Badge variant="outline" className="text-xs">
                            Interactive Flow
                          </Badge>
                        </div>
                        {systemArchitecture.flow_diagram ? (
                          <FlowDiagram flowData={systemArchitecture.flow_diagram} />
                        ) : (
                          <div className="h-96 bg-muted/20 rounded-xl border border-border/50 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <Network className="w-12 h-12 text-muted-foreground mx-auto" />
                              <p className="text-sm text-muted-foreground">Flow diagram will appear here</p>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                            <span>User Interface</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                            <span>Frontend</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
                            <span>Backend</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                            <span>Database</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                            <span>External</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                            <span>Infrastructure</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="components" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            Frontend ({systemArchitecture.components.frontend.length})
                          </Label>
                          <div className="space-y-1 mt-2">
                            {systemArchitecture.components.frontend.map((comp, index) => (
                              <div key={index} className="text-xs p-2 bg-blue-50 rounded">
                                <div className="font-medium">{comp.name}</div>
                                <div className="text-gray-600">{comp.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Server className="w-3 h-3" />
                            Backend ({systemArchitecture.components.backend.length})
                          </Label>
                          <div className="space-y-1 mt-2">
                            {systemArchitecture.components.backend.map((comp, index) => (
                              <div key={index} className="text-xs p-2 bg-green-50 rounded">
                                <div className="font-medium">{comp.name}</div>
                                <div className="text-gray-600">{comp.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Database ({systemArchitecture.components.database.length})
                          </Label>
                          <div className="space-y-1 mt-2">
                            {systemArchitecture.components.database.map((comp, index) => (
                              <div key={index} className="text-xs p-2 bg-purple-50 rounded">
                                <div className="font-medium">{comp.name}</div>
                                <div className="text-gray-600">{comp.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Cloud className="w-3 h-3" />
                            Infrastructure ({systemArchitecture.components.infrastructure.length})
                          </Label>
                          <div className="space-y-1 mt-2">
                            {systemArchitecture.components.infrastructure.map((comp, index) => (
                              <div key={index} className="text-xs p-2 bg-orange-50 rounded">
                                <div className="font-medium">{comp.name}</div>
                                <div className="text-gray-600">{comp.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="technologies" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Languages</Label>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {systemArchitecture.technologies.languages.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Frameworks</Label>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {systemArchitecture.technologies.frameworks.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Databases</Label>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {systemArchitecture.technologies.databases.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Infrastructure</Label>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {systemArchitecture.technologies.infrastructure.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="dataflow" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-foreground">Data Flow Connections</Label>
                          <Badge variant="outline" className="text-xs">
                            {systemArchitecture.dataFlow.length} Connections
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {systemArchitecture.dataFlow.map((flow, index) => (
                            <div key={index} className="glass-effect rounded-lg p-3 hover:bg-muted/20 transition-all">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="font-semibold text-primary">{flow.source}</span>
                                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-semibold text-accent">{flow.target}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs rounded-full">
                                  {flow.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground pl-2 border-l-2 border-primary/20">
                                {flow.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="patterns" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Scalability Features</Label>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {systemArchitecture.scalability_features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Security Measures</Label>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {systemArchitecture.security_measures.map((measure, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">{measure}</Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Prompt */}
            {analyzedPrompt && (
              <Card className="glass-card animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gradient-primary">
                    <Sparkles className="w-5 h-5" />
                    AI-Enhanced System Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm">
                    {analyzedPrompt}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            {/* Generate Diagrams */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gradient-primary">Generate Diagrams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateArchitectureDiagrams}
                  disabled={isGenerating || !systemArchitecture}
                  variant="glow"
                  size="lg"
                  className="w-full rounded-full gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating with FIBO...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate Architecture Diagrams
                    </>
                  )}
                </Button>
                
                {systemArchitecture && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Diagram Types</Label>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {['System Overview', 'Data Flow', 'Component Architecture', 'Deployment View', 'Technology Stack'].map((type, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flow Names Reference */}
            {systemArchitecture?.flow_diagram && (
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gradient-primary flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Flow Components
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    These names will be used in generated diagrams:
                  </div>
                  {systemArchitecture.flow_diagram.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                      <span className="text-lg">{
                        step.type === 'user' ? '👤' :
                        step.type === 'frontend' ? '🖥️' :
                        step.type === 'backend' ? '⚙️' :
                        step.type === 'database' ? '🗄️' :
                        step.type === 'external' ? '🌐' : '☁️'
                      }</span>
                      <div>
                        <div className="text-xs font-semibold">{step.name}</div>
                        <div className="text-xs text-muted-foreground">{step.type}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Generated Diagrams */}
            {generatedImages.length > 0 && (
              <Card className="glass-card animate-slide-up">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gradient-primary">
                    <Network className="w-5 h-5" />
                    Generated Diagrams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="space-y-3 p-3 bg-background/50 rounded-xl border border-border/50">
                      <div className="rounded-lg overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <img
                          src={imageUrl}
                          alt={`Architecture Diagram ${index + 1}`}
                          className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-foreground">
                            {['System Overview', 'Data Flow Diagram', 'Component Architecture', 'Deployment View', 'Technology Stack'][index] || `Diagram ${index + 1}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Generated with consistent naming from flow analysis
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => window.open(imageUrl, '_blank')}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = imageUrl;
                              link.download = `${systemArchitecture?.systemName.replace(/\s+/g, '-').toLowerCase()}-${['overview', 'dataflow', 'components', 'deployment', 'techstack'][index]}.png`;
                              link.click();
                            }}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/5 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive text-xs">⚠</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-destructive mb-1">
                        Generation Error
                      </div>
                      <div className="text-sm text-destructive/80">
                        {error}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FIBO Info */}
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">
                      Powered by FIBO
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Architecture diagrams are generated using BRIA's FIBO model with consistent naming 
                      from Gemini AI analysis. All components and flows maintain the same names across diagrams.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitectureGenerator;