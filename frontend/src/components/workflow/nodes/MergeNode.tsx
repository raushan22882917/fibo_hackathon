import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MergeNodeData {
  label: string;
  merge_type?: string;
  priority?: string;
}

const MergeNode = memo(({ data, selected }: NodeProps<MergeNodeData>) => {
  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🔗 {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Handle
          type="target"
          position={Position.Left}
          id="input1"
          className="w-3 h-3"
          style={{ top: '40%' }}
        />
        <div className="text-xs text-muted-foreground absolute left-4" style={{ top: '35%' }}>
          Input 1
        </div>
        
        <Handle
          type="target"
          position={Position.Left}
          id="input2"
          className="w-3 h-3"
          style={{ top: '60%' }}
        />
        <div className="text-xs text-muted-foreground absolute left-4" style={{ top: '55%' }}>
          Input 2
        </div>
        
        <Handle
          type="target"
          position={Position.Left}
          id="input3"
          className="w-3 h-3"
          style={{ top: '80%' }}
        />
        <div className="text-xs text-muted-foreground absolute left-4" style={{ top: '75%' }}>
          Input 3
        </div>
        
        <div>
          <Label className="text-xs">Merge Type</Label>
          <Select
            value={data.merge_type || "combine"}
            onValueChange={(value) => {
              data.merge_type = value;
            }}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="combine">Combine All</SelectItem>
              <SelectItem value="overlay">Overlay</SelectItem>
              <SelectItem value="blend">Blend</SelectItem>
              <SelectItem value="sequence">Sequence</SelectItem>
              <SelectItem value="priority">Priority Based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.merge_type === "priority" && (
          <div>
            <Label className="text-xs">Priority Order</Label>
            <Select
              value={data.priority || "first"}
              onValueChange={(value) => {
                data.priority = value;
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First Input Priority</SelectItem>
                <SelectItem value="last">Last Input Priority</SelectItem>
                <SelectItem value="largest">Largest Value</SelectItem>
                <SelectItem value="smallest">Smallest Value</SelectItem>
              </SelectContent>
            </Select>
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

MergeNode.displayName = "MergeNode";

export default MergeNode;