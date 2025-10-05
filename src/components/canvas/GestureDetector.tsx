import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// MediaPipe types (simplified for our use case)
interface MediaPipeVision {
  FaceLandmarker: any;
  FilesetResolver: any;
  DrawingUtils: any;
}

interface GestureData {
  type: "smile" | "eyebrow_raise" | "mouth_open" | "cursor_move";
  position?: { x: number; y: number };
}

interface GestureDetectorProps {
  onGestureDetected: (gesture: GestureData) => void;
  onBlendShapesUpdate?: (data: any) => void;
}

// Extend Window interface for MediaPipe
declare global {
  interface Window {
    vision?: MediaPipeVision;
    mediaPipeLoaded?: boolean;
  }
}

const THRESHOLDS = {
  MOUTH_OPEN: 0.3,
  SMILE: 0.8,
  EYEBROW_RAISE: 0.75,
  HEAD_TILT_SENSITIVITY: 0.15,
  HEAD_MOVEMENT_THRESHOLD: 0.05, // Threshold for detecting significant head movement
  EYEBROW_STABILITY_TIME: 200, // Time in ms to wait for head stability before detecting eyebrow raise
};

const DEBOUNCE_MS = 500;
// --- NEW CONSTANTS FOR SENSITIVITY ---
// 1. Controls how much the face position (0 to 1) is scaled up to the screen (0 to 100).
//    A higher value means smaller head movements cover more screen space.
const MOVEMENT_MULTIPLIER = 1.5;
// 2. Controls the damping/smoothness. Lower factor = faster, more responsive cursor.
//    (0.6 original was 60% previous position, 0.4 new position)
const SMOOTHING_FACTOR = 0.4;

export default function GestureDetector({
  onGestureDetected,
  onBlendShapesUpdate,
}: GestureDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const lastGestureTimeRef = useRef<Record<string, number>>({});
  const drawingUtilsRef = useRef<any>(null);
  const lastCursorPosRef = useRef({ x: 50, y: 50 });
  const onGestureDetectedRef = useRef(onGestureDetected);
  const onBlendShapesUpdateRef = useRef(onBlendShapesUpdate);
  const lastHeadPositionRef = useRef({ x: 0.5, y: 0.5 });
  const headStableSinceRef = useRef<number>(0);
  const lastEyebrowRaiseRef = useRef<number>(0);

  useEffect(() => {
    onGestureDetectedRef.current = onGestureDetected;
    onBlendShapesUpdateRef.current = onBlendShapesUpdate;
  });

  useEffect(() => {
    let webcamStream: MediaStream | null = null;
    let animationFrameId: number | null = null;

    const loadMediaPipeScript = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.vision) {
          resolve(window.vision);
          return;
        }

        const script = document.createElement("script");
        script.type = "module";
        script.textContent = `
          import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3';
          window.vision = vision;
          window.mediaPipeLoaded = true;
        `;

        script.onerror = () => reject(new Error("Failed to load MediaPipe"));

        document.head.appendChild(script);

        // Poll for the script to load
        const checkLoaded = setInterval(() => {
          if (window.vision) {
            clearInterval(checkLoaded);
            resolve(window.vision);
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          if (!window.vision) {
            reject(new Error("MediaPipe loading timeout"));
          }
        }, 10000);
      });
    };

    const initializeMediaPipe = async () => {
      try {
        // Load MediaPipe
        const vision = await loadMediaPipeScript();
        const { FaceLandmarker, FilesetResolver, DrawingUtils } =
          vision as MediaPipeVision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
              delegate: "GPU",
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1,
          }
        );

        // Initialize webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        webcamStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadeddata = resolve;
            }
          });
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            drawingUtilsRef.current = new DrawingUtils(ctx);
          }
        }

        setIsLoading(false);
        startDetection();
      } catch (err) {
        console.error("Initialization error:", err);
        setError(
          "Failed to initialize webcam or face tracking. Please ensure camera permissions are granted."
        );
        setIsLoading(false);
      }
    };

    const startDetection = () => {
      const detectFrame = async () => {
        if (
          !faceLandmarkerRef.current ||
          !videoRef.current ||
          !canvasRef.current
        )
          return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const startTimeMs = performance.now();
        const results = faceLandmarkerRef.current.detectForVideo(
          video,
          startTimeMs
        );

        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          const blendShapes = results.faceBlendshapes[0].categories;
          processGestures(blendShapes);
          onBlendShapesUpdateRef.current?.(blendShapes);
        }

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          processCursorMovement(results.faceLandmarks[0]);
        }

        animationFrameId = requestAnimationFrame(detectFrame);
      };

      detectFrame();
    };

    const processGestures = (blendShapes: any[]) => {
      const now = Date.now();

      const getBlendShape = (name: string) => {
        const shape = blendShapes.find((s: any) => s.categoryName === name);
        return shape ? shape.score : 0;
      };

      // Smile detection (for changing tool)
      const smile = Math.max(
        getBlendShape("mouthSmileLeft"),
        getBlendShape("mouthSmileRight")
      );
      if (smile > THRESHOLDS.SMILE) {
        if (
          !lastGestureTimeRef.current.smile ||
          now - lastGestureTimeRef.current.smile > DEBOUNCE_MS
        ) {
          onGestureDetectedRef.current?.({ type: "smile" });
          lastGestureTimeRef.current.smile = now;
        }
      }

      // Eyebrow raise detection (for changing color)
      // Only detect eyebrow raise when head is stable to avoid false positives from head tilting
      const eyebrowRaise = Math.max(
        getBlendShape("browInnerUp"),
        getBlendShape("browOuterUpLeft"),
        getBlendShape("browOuterUpRight")
      );

      const isHeadStable =
        headStableSinceRef.current > 0 &&
        now - headStableSinceRef.current > THRESHOLDS.EYEBROW_STABILITY_TIME;

      if (eyebrowRaise > THRESHOLDS.EYEBROW_RAISE && isHeadStable) {
        if (
          !lastGestureTimeRef.current.eyebrow_raise ||
          now - lastGestureTimeRef.current.eyebrow_raise > DEBOUNCE_MS
        ) {
          onGestureDetectedRef.current?.({ type: "eyebrow_raise" });
          lastGestureTimeRef.current.eyebrow_raise = now;
          lastEyebrowRaiseRef.current = now;
        }
      }

      // Mouth open detection (for toggling drawing)
      const mouthOpen = Math.max(
        getBlendShape("mouthOpen"),
        getBlendShape("jawOpen")
      );
      if (mouthOpen > THRESHOLDS.MOUTH_OPEN) {
        if (
          !lastGestureTimeRef.current.mouth_open ||
          now - lastGestureTimeRef.current.mouth_open > DEBOUNCE_MS
        ) {
          onGestureDetectedRef.current?.({ type: "mouth_open" });
          lastGestureTimeRef.current.mouth_open = now;
        }
      }
    };

    const processCursorMovement = (landmarks: any[]) => {
      // Use nose tip (landmark 1) for cursor position
      const noseTip = landmarks[1];

      // Calculate center point (50, 50) and displacement from center (x_disp, y_disp)
      // Normalized coordinates range from 0 to 1. Center is (0.5, 0.5)
      const centerX = 0.5;
      const centerY = 0.5;

      const x_disp = 1 - noseTip.x - centerX; // Flip X and find displacement from center
      const y_disp = noseTip.y - centerY; // Find displacement from center

      // *** THE CORE SENSITIVITY ADJUSTMENT ***
      // Apply the multiplier to the displacement.
      // A multiplier > 1.0 expands the effective drawing area.
      const magnifiedX = centerX + x_disp * MOVEMENT_MULTIPLIER;
      const magnifiedY = centerY + y_disp * MOVEMENT_MULTIPLIER;

      // Map magnified position (0-1) to canvas coordinates (0-100%)
      const x = Math.max(0, Math.min(100, magnifiedX * 100));
      const y = Math.max(0, Math.min(100, magnifiedY * 100));

      // Smooth movement
      // lastCursorPosRef.current.x * 0.6 + x * 0.4; (Original weights 60/40)
      // New weights use SMOOTHING_FACTOR=0.4 (40% previous, 60% new) for higher responsiveness
      const smoothedX =
        lastCursorPosRef.current.x * SMOOTHING_FACTOR +
        x * (1 - SMOOTHING_FACTOR);
      const smoothedY =
        lastCursorPosRef.current.y * SMOOTHING_FACTOR +
        y * (1 - SMOOTHING_FACTOR);

      // Track head movement for eyebrow raise detection
      const currentHeadPos = { x: noseTip.x, y: noseTip.y };
      const headMovement = Math.sqrt(
        Math.pow(currentHeadPos.x - lastHeadPositionRef.current.x, 2) +
          Math.pow(currentHeadPos.y - lastHeadPositionRef.current.y, 2)
      );

      const now = Date.now();

      // Check if head is stable (not moving significantly)
      if (headMovement < THRESHOLDS.HEAD_MOVEMENT_THRESHOLD) {
        if (headStableSinceRef.current === 0) {
          headStableSinceRef.current = now;
        }
      } else {
        // Head is moving, reset stability timer
        headStableSinceRef.current = 0;
      }

      lastHeadPositionRef.current = currentHeadPos;
      lastCursorPosRef.current = { x: smoothedX, y: smoothedY };

      onGestureDetectedRef.current?.({
        type: "cursor_move",
        position: { x: smoothedX, y: smoothedY },
      });
    };

    initializeMediaPipe();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (webcamStream) {
        webcamStream
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-2 font-semibold">
          Unable to Start Face Tracking
        </p>
        <p className="text-red-700 text-sm">{error}</p>
        <p className="text-red-600 text-xs mt-3">
          Please check your camera permissions and ensure you're using a modern
          browser (Chrome, Edge, or Safari).
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm rounded-lg z-10">
          <div className="bg-white rounded-lg p-3 shadow-xl flex flex-col items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span className="text-slate-700 text-xs font-medium">
              Loading...
            </span>
          </div>
        </div>
      )}
      <div className="relative rounded-lg overflow-hidden bg-slate-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-32 object-cover transform scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
        />
      </div>
      <p className="text-center text-xs text-slate-400 mt-1">
        Face tracking active
      </p>
    </div>
  );
}
