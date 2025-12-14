import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextInputNodeData {
  label: string;
  value: string;
  multiline?: boolean;
}

const TextInputNode = memo(({ data, selected }: NodeProps<TextInputNodeData>) => {
  const [inputValue, setInputValue] = useState(data.value || "");

  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    data.value = newValue;
  }, [data]);

  return (
    <Card className={`min-w-64 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          📝 {data.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <Label className="text-xs">Text Input</Label>
          {data.multiline ? (
            <Textarea
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your text..."
              className="text-xs"
              rows={3}
            />
          ) : (
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your text..."
              className="text-xs"
            />
          )}
        </div>
        
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

TextInputNode.displayName = "TextInputNode";

export default TextInputNode;