
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, RotateCcw, Download, Palette } from "lucide-react";
import GestureDetector from "./components/canvas/GestureDetector";
import DrawingCanvas from "./components/canvas/DrawingCanvas";
import Toolbar from "./components/canvas/Toolbar";
import StatusPanel from "./components/canvas/StatusPanel";
import CursorOverlay from "./components/canvas/CursorOverlay";

// TypeScript interfaces
interface GestureData {
  type: "smile" | "eyebrow_raise" | "mouth_open" | "cursor_move";
  position?: { x: number; y: number };
}

interface DrawingCanvasRef {
  clear: () => void;
  download: () => void;
}

export default function Canvas() {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#6366f1");
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const tools = [
    { id: "pen", name: "Pen", color: currentColor },
    { id: "eraser", name: "Eraser", color: "#ffffff" },
    { id: "thick-pen", name: "Thick Pen", color: currentColor },
  ];

  const colors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c59e", // Green
    "#14b8a6", // Teal
    "#3b82f6", // Blue
    "#1e293b", // Dark gray
  ];

  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const downloadCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.download();
    }
  };

  const cycleTool = () => {
    const currentIndex = tools.findIndex(t => t.id === currentTool);
    const nextIndex = (currentIndex + 1) % tools.length;
    setCurrentTool(tools[nextIndex].id);
  };

  const cycleColor = () => {
    const currentIndex = colors.indexOf(currentColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setCurrentColor(colors[nextIndex]);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Faceable: Face Your Vision.
          </h1>
          <p className="text-gray-300">
            Create art using facial expressions and head movements
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 glass-card-main text-white">
              <h2 className="text-xl font-semibold mb-4 text-white">Controls</h2>
              <div className="space-y-3">
                <Button
                  onClick={toggleWebcam}
                  className={`w-full glass-button ${
                    isWebcamActive
                      ? "bg-red-500/80 hover:bg-red-600/80 text-white"
                      : "bg-indigo-600/80 hover:bg-indigo-700/80 text-white"
                  }`}
                >
                  <Power className="w-4 h-4 mr-2" />
                  {isWebcamActive ? "Stop Webcam" : "Start Webcam"}
                </Button>
                <Button
                  onClick={clearCanvas}
                  variant="outline"
                  className="w-full glass-button border-white/30 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Canvas
                </Button>
                <Button
                  onClick={downloadCanvas}
                  variant="outline"
                  className="w-full glass-button border-white/30 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Art
                </Button>
              </div>
            </Card>

            <StatusPanel
              isWebcamActive={isWebcamActive}
              currentTool={currentTool}
              currentColor={currentColor}
              isDrawing={isDrawing}
            />

            {/* Instructions */}
            <Card className="p-6 glass-card text-white">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-400" />
                How to Use
              </h3>
              <ul className="space-y-2 text-sm text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-1">•</span>
                  <span><strong>Open mouth:</strong> Toggle drawing on/off</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold mt-1">•</span>
                  <span><strong>Smile:</strong> Switch tool</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold mt-1">•</span>
                  <span><strong>Raise eyebrows:</strong> Change color</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold mt-1">•</span>
                  <span><strong>Move head:</strong> Move cursor</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Right Column - Canvas & Tools */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <DrawingCanvas
                ref={canvasRef}
                currentTool={currentTool}
                currentColor={currentColor}
                isDrawing={isDrawing}
                cursorPosition={cursorPosition}
              />
              <CursorOverlay
                position={cursorPosition}
                isDrawing={isDrawing}
                color={currentColor}
              />
            </div>

            {/* Horizontal Tools and Colors */}
            <Toolbar
              tools={tools}
              colors={colors}
              currentTool={currentTool}
              currentColor={currentColor}
              onToolChange={setCurrentTool}
              onColorChange={setCurrentColor}
            />
          </div>
        </div>
      </div>

      {/* Fixed Camera Overlay */}
      {isWebcamActive && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="p-2 glass-card text-white w-48">
            <GestureDetector
              onGestureDetected={(gesture: GestureData) => {
                if (gesture.type === "smile") { // Fixed: was checking for "mouth_smile" but GestureDetector sends "smile"
                  cycleTool();
                } else if (gesture.type === "eyebrow_raise") {
                  cycleColor();
                } else if (gesture.type === "mouth_open") {
                  setIsDrawing(!isDrawing);
                } else if (gesture.type === "cursor_move" && gesture.position) {
                  setCursorPosition(gesture.position);
                }
              }}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
