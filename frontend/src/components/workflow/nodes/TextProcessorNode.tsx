import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Wand2, Type } from "lucide-react";

interface TextProcessorNodeData {
  label: string;
  operation?: string;
  enhancement_level?: number;
  style?: string;
  length?: string;
  tone?: string;
  processed_text?: string;
}

const TextProcessorNode = memo(({ data, selected }: NodeProps<TextProcessorNodeData>) => {
  const [settings, setSettings] = useState({
    operation: data.operation || "enhance",
    enhancement_level: data.enhancement_level || 0.7,
    style: data.style || "creative",
    length: data.length || "medium",
    tone: data.tone || "professional",
  });

  const [processedText, setProcessedText] = useState(data.processed_text || "");

  const updateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    data[key] = value;
  }, [settings, data]);

  const processText = useCallback(() => {
    // Simulate text processing
    const operations = {
      enhance: "Enhanced and improved version of the input text with better clarity and impact.",
      summarize: "Concise summary capturing the key points and main ideas.",
      expand: "Detailed expansion with additional context, examples, and comprehensive coverage.",
      translate: "Translated version maintaining original meaning and context.",
      rewrite: "Completely rewritten version with fresh perspective and improved flow.",
      format: "Properly formatted and structured version with improved readability."
    };
    
    const result = operations[settings.operation as keyof typeof operations] || "Processed text output";
    setProcessedText(result);
    data.processed_text = result;
  }, [settings, data]);

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Type className="w-4 h-4" />
          {data.label}
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
          <Label className="text-xs">Operation</Label>
          <Select
            value={settings.operation}
            onValueChange={(value) => updateSettings("operation", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enhance">Enhance Text</SelectItem>
              <SelectItem value="summarize">Summarize</SelectItem>
              <SelectItem value="expand">Expand Details</SelectItem>
              <SelectItem value="translate">Translate</SelectItem>
              <SelectItem value="rewrite">Rewrite</SelectItem>
              <SelectItem value="format">Format & Structure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Style</Label>
          <Select
            value={settings.style}
            onValueChange={(value) => updateSettings("style", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Tone</Label>
          <Select
            value={settings.tone}
            onValueChange={(value) => updateSettings("tone", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              <SelectItem value="authoritative">Authoritative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Length</Label>
          <Select
            value={settings.length}
            onValueChange={(value) => updateSettings("length", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="very-long">Very Long</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Enhancement Level: {(settings.enhancement_level * 100).toFixed(0)}%</Label>
          <Slider
            value={[settings.enhancement_level]}
            onValueChange={([value]) => updateSettings("enhancement_level", value)}
            min={0}
            max={1}
            step={0.1}
            className="mt-1"
          />
        </div>

        <Button onClick={processText} size="sm" className="w-full">
          <Wand2 className="w-3 h-3 mr-1" />
          Process Text
        </Button>

        {processedText && (
          <div>
            <Label className="text-xs">Processed Output</Label>
            <Textarea
              value={processedText}
              readOnly
              className="text-xs bg-muted/30"
              rows={3}
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

TextProcessorNode.displayName = "TextProcessorNode";

export default TextProcessorNode;