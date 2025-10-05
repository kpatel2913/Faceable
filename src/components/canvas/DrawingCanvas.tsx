import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card } from "@/components/ui/card";

interface DrawingCanvasProps {
  currentTool: string;
  currentColor: string;
  isDrawing: boolean;
  cursorPosition: { x: number; y: number };
}

interface DrawingCanvasRef {
  clear: () => void;
  download: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ currentTool, currentColor, isDrawing, cursorPosition }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    download: () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `artwork-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    contextRef.current = ctx;
  }, []);

  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    if (currentTool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 3;
      ctx.strokeStyle = currentColor;
    } else if (currentTool === "thick-pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 8;
      ctx.strokeStyle = currentColor;
    } else if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;
    }
  }, [currentTool, currentColor]);

  useEffect(() => {
    if (!isDrawing || !cursorPosition) {
      lastPosRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!ctx || !canvas) return;

    const x = (cursorPosition.x / 100) * canvas.width / 2;
    const y = (cursorPosition.y / 100) * canvas.height / 2;

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    lastPosRef.current = { x, y };
  }, [isDrawing, cursorPosition]);

  return (
    <Card className="overflow-hidden shadow-2xl border-0 bg-white">
      <canvas
        ref={canvasRef}
        className="w-full h-[500px] md:h-[600px] bg-white cursor-crosshair"
      />
    </Card>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;