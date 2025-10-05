import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Circle, Square } from "lucide-react";

interface StatusPanelProps {
  isWebcamActive: boolean;
  currentTool: string;
  currentColor: string;
  isDrawing: boolean;
}

export default function StatusPanel({ isWebcamActive, currentTool, currentColor, isDrawing }: StatusPanelProps) {
  return (
    <Card className="p-6 glass-card text-white">
      <h3 className="text-lg font-semibold mb-4 text-white">Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-200">Webcam</span>
          <Badge variant={isWebcamActive ? "default" : "secondary"} className={`glass-badge ${isWebcamActive ? "bg-green-500/80" : "bg-gray-600/80"}`}>
            {isWebcamActive ? <Video className="w-3 h-3 mr-1" /> : <VideoOff className="w-3 h-3 mr-1" />}
            {isWebcamActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-200">Current Tool</span>
          <Badge variant="outline" className="glass-badge border-white/30 text-white">
            {currentTool.replace("-", " ")}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-200">Color</span>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white/50"
              style={{ backgroundColor: currentColor }}
            />
            <Badge variant="outline" className="glass-badge border-white/30 text-white">
              {currentColor}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-200">Drawing</span>
          <Badge variant={isDrawing ? "default" : "secondary"} className={`glass-badge ${isDrawing ? "bg-pink-500/80" : "bg-gray-600/80"}`}>
            {isDrawing ? <Circle className="w-3 h-3 mr-1 fill-current" /> : <Square className="w-3 h-3 mr-1" />}
            {isDrawing ? "ON" : "OFF"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}