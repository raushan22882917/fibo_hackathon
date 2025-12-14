import { useState, useCallback, useRef } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Save, 
  Upload, 
  ArrowLeft,
  Sparkles,
  Workflow,
  Maximize2
} from "lucide-react";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: { x: 100, y: 100 },
    data: { label: "Start Node" },
  },
];

const initialEdges: Edge[] = [];

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Header */}
      <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
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
                <Workflow className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Workflow Builder
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">Visual FIBO Pipeline</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Load</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 rounded-full">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="rounded-full">
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            <Button variant="glow" size="sm" className="gap-2 rounded-full">
              <Play className="w-4 h-4" />
              Execute
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Workflow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            className="bg-background"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-border/50 bg-card/80 backdrop-blur-xl">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Node Library</h2>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Text Input</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Image Generation</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Output</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowBuilder;