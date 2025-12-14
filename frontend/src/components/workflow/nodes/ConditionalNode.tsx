import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConditionalNodeData {
  label: string;
  condition?: string;
  operator?: string;
  value?: string;
}

const ConditionalNode = memo(({ data, selected }: NodeProps<ConditionalNodeData>) => {
  const [conditionValue, setConditionValue] = useState(data.condition || "");
  const [valueInput, setValueInput] = useState(data.value || "");

  const handleConditionChange = useCallback((newCondition: string) => {
    setConditionValue(newCondition);
    data.condition = newCondition;
  }, [data]);

  const handleValueChange = useCallback((newValue: string) => {
    setValueInput(newValue);
    data.value = newValue;
  }, [data]);

  const handleOperatorChange = useCallback((newOperator: string) => {
    data.operator = newOperator;
  }, [data]);

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🔀 {data.label}
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
          <Label className="text-xs">Condition</Label>
          <Input
            value={conditionValue}
            onChange={(e) => handleConditionChange(e.target.value)}
            placeholder="e.g., input.mood === 'happy'"
            className="text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Operator</Label>
          <Select
            value={data.operator || "equals"}
            onValueChange={handleOperatorChange}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals (===)</SelectItem>
              <SelectItem value="not_equals">Not Equals (!==)</SelectItem>
              <SelectItem value="greater">Greater Than (&gt;)</SelectItem>
              <SelectItem value="less">Less Than (&lt;)</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="exists">Exists</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Value</Label>
          <Input
            value={valueInput}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Comparison value"
            className="text-xs"
          />
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="w-3 h-3"
          style={{ top: '60%' }}
        />
        <div className="text-xs text-green-600 absolute right-4" style={{ top: '55%' }}>
          True
        </div>
        
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="w-3 h-3"
          style={{ top: '80%' }}
        />
        <div className="text-xs text-red-600 absolute right-4" style={{ top: '75%' }}>
          False
        </div>
      </CardContent>
    </Card>
  );
});

ConditionalNode.displayName = "ConditionalNode";

export default ConditionalNode;