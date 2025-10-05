import { motion } from "framer-motion"; // Note: The import is typically 'framer-motion'

interface CursorOverlayProps {
  position: { x: number; y: number };
  isDrawing: boolean;
  color: string;
}

export default function CursorOverlay({ position, isDrawing, color }: CursorOverlayProps) {
  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{
        // The position is now set here and will update instantly
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      animate={{
        // The scale animation provides clear feedback without being distracting
        scale: isDrawing ? 1.5 : 1,
      }}
      transition={{
        // This spring transition will now ONLY apply to properties in `animate` (i.e., scale)
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <div className="relative transform -translate-x-1/2 -translate-y-1/2">
        {/* Outer ring */}
        <div 
          className={`w-12 h-12 rounded-full border-4 ${isDrawing ? 'border-pink-500' : 'border-indigo-500'} opacity-70`}
        />
        {/* Inner dot */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
          style={{ 
            backgroundColor: isDrawing ? color : '#6366f1',
            boxShadow: `0 0 20px ${isDrawing ? color : '#6366f1'}`
          }}
        />
        {/* Pulsing effect when drawing */}
        {isDrawing && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}