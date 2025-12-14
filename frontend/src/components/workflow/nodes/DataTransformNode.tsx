import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database, ArrowRightLeft } from "lucide-react";

interface DataTransformNodeData {
  label: string;
  transform_type?: string;
  format_from?: string;
  format_to?: string;
  custom_mapping?: string;
  validation_rules?: string;
}

const DataTransformNode = memo(({ data, selected }: NodeProps<DataTransformNodeData>) => {
  const [settings, setSettings] = useState({
    transform_type: data.transform_type || "format",
    format_from: data.format_from || "json",
    format_to: data.format_to || "csv",
    custom_mapping: data.custom_mapping || "",
    validation_rules: data.validation_rules || "",
  });

  const updateSettings = useCallback((key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    data[key] = value;
  }, [settings, data]);

  const transformTypes = [
    { value: "format", label: "Format Conversion" },
    { value: "filter", label: "Data Filtering" },
    { value: "aggregate", label: "Data Aggregation" },
    { value: "validate", label: "Data Validation" },
    { value: "clean", label: "Data Cleaning" },
    { value: "merge", label: "Data Merging" },
    { value: "split", label: "Data Splitting" },
    { value: "normalize", label: "Data Normalization" },
  ];

  const dataFormats = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" },
    { value: "txt", label: "Plain Text" },
    { value: "excel", label: "Excel" },
    { value: "sql", label: "SQL" },
    { value: "api", label: "API Response" },
  ];

  return (
    <Card className={`min-w-80 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />
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
          <Label className="text-xs">Transform Type</Label>
          <Select
            value={settings.transform_type}
            onValueChange={(value) => updateSettings("transform_type", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transformTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {settings.transform_type === "format" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">From Format</Label>
              <Select
                value={settings.format_from}
                onValueChange={(value) => updateSettings("format_from", value)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">To Format</Label>
              <Select
                value={settings.format_to}
                onValueChange={(value) => updateSettings("format_to", value)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {(settings.transform_type === "filter" || settings.transform_type === "validate") && (
          <div>
            <Label className="text-xs">
              {settings.transform_type === "filter" ? "Filter Rules" : "Validation Rules"}
            </Label>
            <Textarea
              value={settings.validation_rules}
              onChange={(e) => updateSettings("validation_rules", e.target.value)}
              placeholder={
                settings.transform_type === "filter" 
                  ? "e.g., age > 18, status === 'active'"
                  : "e.g., required: name, email; format: email"
              }
              className="text-xs"
              rows={2}
            />
          </div>
        )}

        {(settings.transform_type === "merge" || settings.transform_type === "aggregate") && (
          <div>
            <Label className="text-xs">Custom Mapping</Label>
            <Textarea
              value={settings.custom_mapping}
              onChange={(e) => updateSettings("custom_mapping", e.target.value)}
              placeholder="Define how data should be mapped or aggregated"
              className="text-xs"
              rows={2}
            />
          </div>
        )}

        <div className="bg-muted/30 p-2 rounded text-xs">
          <div className="font-medium mb-1 flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3" />
            Transform Preview
          </div>
          <div>Operation: {transformTypes.find(t => t.value === settings.transform_type)?.label}</div>
          {settings.transform_type === "format" && (
            <div>
              {dataFormats.find(f => f.value === settings.format_from)?.label} → {dataFormats.find(f => f.value === settings.format_to)?.label}
            </div>
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

DataTransformNode.displayName = "DataTransformNode";

export default DataTransformNode;