import { Card } from "@/components/ui/card";
import { Paintbrush, Eraser, PenTool, Check } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  color: string;
}

interface ToolbarProps {
  tools: Tool[];
  colors: string[];
  currentTool: string;
  currentColor: string;
  onToolChange: (toolId: string) => void;
  onColorChange: (color: string) => void;
}

export default function Toolbar({ tools, colors, currentTool, currentColor, onToolChange, onColorChange }: ToolbarProps) {
  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case "pen": return <PenTool className="w-5 h-5" />;
      case "eraser": return <Eraser className="w-5 h-5" />;
      case "thick-pen": return <Paintbrush className="w-5 h-5" />;
      default: return <PenTool className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-4 glass-card text-white">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tools Section */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-3 text-white">Tools</h3>
          <div className="flex gap-2">
            {tools.map((tool: Tool) => (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 glass-button ${
                  currentTool === tool.id
                    ? "border-blue-400 bg-blue-500/30 text-blue-200"
                    : "border-white/30 bg-black/20 hover:border-white/50 text-gray-200"
                }`}
              >
                {getToolIcon(tool.id)}
                <span className="text-xs font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors Section */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-3 text-white">Colors</h3>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color: string) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 relative ${
                  currentColor === color
                    ? "border-white scale-110"
                    : "border-white/30 hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              >
                {currentColor === color && (
                  <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}