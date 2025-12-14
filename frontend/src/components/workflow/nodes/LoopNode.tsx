import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface LoopNodeData {
  label: string;
  iterations?: number;
  loop_type?: string;
  variable?: string;
}

const LoopNode = memo(({ data, selected }: NodeProps<LoopNodeData>) => {
  const [iterations, setIterations] = useState(data.iterations || 3);
  const [variableValue, setVariableValue] = useState(data.variable || "");

  const handleIterationsChange = useCallback((newIterations: number) => {
    setIterations(newIterations);
    data.iterations = newIterations;
  }, [data]);

  const handleVariableChange = useCallback((newVariable: string) => {
    setVariableValue(newVariable);
    data.variable = newVariable;
  }, [data]);

  const handleLoopTypeChange = useCallback((newType: string) => {
    data.loop_type = newType;
  }, [data]);

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🔄 {data.label}
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
          <Label className="text-xs">Loop Type</Label>
          <Select
            value={data.loop_type || "fixed"}
            onValueChange={handleLoopTypeChange}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Iterations</SelectItem>
              <SelectItem value="while">While Condition</SelectItem>
              <SelectItem value="foreach">For Each Item</SelectItem>
              <SelectItem value="until">Until Condition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.loop_type === "fixed" && (
          <div>
            <Label className="text-xs">Iterations: {iterations}</Label>
            <Slider
              value={[iterations]}
              onValueChange={([value]) => handleIterationsChange(value)}
              min={1}
              max={10}
              step={1}
              className="mt-1"
            />
          </div>
        )}

        {(data.loop_type === "while" || data.loop_type === "until") && (
          <div>
            <Label className="text-xs">Condition</Label>
            <Input
              value={variableValue}
              onChange={(e) => handleVariableChange(e.target.value)}
              placeholder="e.g., count < 5"
              className="text-xs"
            />
          </div>
        )}

        {data.loop_type === "foreach" && (
          <div>
            <Label className="text-xs">Array Variable</Label>
            <Input
              value={variableValue}
              onChange={(e) => handleVariableChange(e.target.value)}
              placeholder="e.g., items"
              className="text-xs"
            />
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

LoopNode.displayName = "LoopNode";

export default LoopNode;