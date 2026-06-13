import React, { useEffect, useRef } from 'react';
import { 
  drawStroke, 
  createSparks, 
  updateAndDrawSparks, 
  drawCursor 
} from '../utils/canvasUtils';
import type { 
  CanvasStroke, 
  CanvasPoint, 
  SparkParticle 
} from '../utils/canvasUtils';
import { detectGesture, isAllFingersRaised } from '../utils/gestureDetection';

interface DrawingCanvasProps {
  drawingCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  strokesRef: React.MutableRefObject<CanvasStroke[]>;
  currentPointsRef: React.MutableRefObject<CanvasPoint[]>;
  landmarksRef: React.RefObject<any[]>;
  isHandPresentRef: React.RefObject<boolean>;
  activeColor: string;
  brushSize: number;
  glowIntensity: number;
  smoothing: number;
  drawMode: 'draw' | 'eraser' | 'pointer';
  showLandmarks: boolean;
  fadeTrail: boolean;
  stabilizePoint: (x: number, y: number, windowSize: number) => { x: number; y: number };
  addPoint: (x: number, y: number) => void;
  commitCurrentStroke: (color: string, size: number, isEraser: boolean, glowIntensity: number) => void;
  resetStabilizer: () => void;
  onClear: () => void;
  onFPSUpdate?: (fps: number) => void;
}

// MediaPipe hand joint connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  drawingCanvasRef,
  strokesRef,
  currentPointsRef,
  landmarksRef,
  isHandPresentRef,
  activeColor,
  brushSize,
  glowIntensity,
  smoothing,
  drawMode,
  showLandmarks,
  fadeTrail,
  stabilizePoint,
  addPoint,
  commitCurrentStroke,
  resetStabilizer,
  onClear,
  onFPSUpdate,
}) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<SparkParticle[]>([]);
  const clearTimerRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  
  // Performance and loop tracking
  const animationFrameRef = useRef<number | null>(null);
  const wasDrawingRef = useRef(false);
  const fpsFrameCountRef = useRef(0);
  const fpsLastTimeRef = useRef(performance.now());

  // Mirror React props to stable mutable refs to prevent restarting the RAF loop on settings changes
  const activeColorRef = useRef(activeColor);
  const brushSizeRef = useRef(brushSize);
  const glowIntensityRef = useRef(glowIntensity);
  const smoothingRef = useRef(smoothing);
  const drawModeRef = useRef(drawMode);
  const showLandmarksRef = useRef(showLandmarks);
  const fadeTrailRef = useRef(fadeTrail);
  const onClearRef = useRef(onClear);

  useEffect(() => { activeColorRef.current = activeColor; }, [activeColor]);
  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { glowIntensityRef.current = glowIntensity; }, [glowIntensity]);
  useEffect(() => { smoothingRef.current = smoothing; }, [smoothing]);
  useEffect(() => { drawModeRef.current = drawMode; }, [drawMode]);
  useEffect(() => { showLandmarksRef.current = showLandmarks; }, [showLandmarks]);
  useEffect(() => { fadeTrailRef.current = fadeTrail; }, [fadeTrail]);
  useEffect(() => { onClearRef.current = onClear; }, [onClear]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = drawingCanvasRef.current;
      const overlay = overlayCanvasRef.current;
      if (canvas && overlay) {
        const parent = canvas.parentElement;
        if (parent) {
          const width = parent.clientWidth;
          const height = parent.clientHeight;
          
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            overlay.width = width;
            overlay.height = height;
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [drawingCanvasRef]);

  // Main Render Loop (Runs once on mount, stays alive decoupled from React re-renders)
  useEffect(() => {
    function render() {
      const drawingCanvas = drawingCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!drawingCanvas || !overlayCanvas) {
        return;
      }

      const dCtx = drawingCanvas.getContext('2d');
      const oCtx = overlayCanvas.getContext('2d');
      if (!dCtx || !oCtx) {
        return;
      }

      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Extract current configurations from stable refs
      const activeColor = activeColorRef.current;
      const brushSize = brushSizeRef.current;
      const glowIntensity = glowIntensityRef.current;
      const smoothing = smoothingRef.current;
      const drawMode = drawModeRef.current;
      const showLandmarks = showLandmarksRef.current;
      const fadeTrail = fadeTrailRef.current;
      const onClear = onClearRef.current;
      const landmarks = landmarksRef.current || [];
      const isHandPresent = isHandPresentRef.current || false;

      // --- 1. Calculate FPS (for dev mode) ---
      fpsFrameCountRef.current++;
      if (now - fpsLastTimeRef.current >= 1000) {
        const fps = Math.round((fpsFrameCountRef.current * 1000) / (now - fpsLastTimeRef.current));
        if (onFPSUpdate) onFPSUpdate(fps);
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = now;
      }

      // --- 2. Clear canvases ---
      dCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // --- 3. Draw Completed Strokes (and handle fade-out trail decay) ---
      strokesRef.current = strokesRef.current.filter((stroke) => {
        let fadeAlpha = 1.0;
        if (fadeTrail) {
          const lastPoint = stroke.points[stroke.points.length - 1];
          const age = now - lastPoint.timestamp;
          if (age >= 2500) return false; // expire after 2.5s
          fadeAlpha = 1.0 - (age / 2500);
        }
        drawStroke(dCtx, stroke, fadeAlpha);
        return true;
      });

      // --- 4. Process finger tracking coordinates ---
      let stabilizedPos: { x: number; y: number } | null = null;
      let isDrawingActive = false;

      if (isHandPresent && landmarks && landmarks.length >= 21) {
        // Check for Clear Gesture: Open palm (all fingers up)
        const isAllUp = isAllFingersRaised(landmarks);
        if (isAllUp) {
          clearTimerRef.current += deltaTime;
          
          // Render pink glowing loading ring around the wrist
          const wrist = landmarks[0];
          const wx = (1 - wrist.x) * overlayCanvas.width;
          const wy = wrist.y * overlayCanvas.height;
          
          oCtx.save();
          oCtx.strokeStyle = '#ff007a';
          oCtx.lineWidth = 4;
          oCtx.shadowColor = '#ff007a';
          oCtx.shadowBlur = 12;
          oCtx.beginPath();
          const ratio = Math.min(clearTimerRef.current, 2000) / 2000;
          oCtx.arc(wx, wy, 28, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
          oCtx.stroke();
          
          oCtx.fillStyle = '#ffffff';
          oCtx.font = 'bold 9px Orbitron';
          oCtx.textAlign = 'center';
          oCtx.fillText('CLEARING', wx, wy + 3);
          oCtx.restore();

          if (clearTimerRef.current >= 2000) {
            onClear();
            clearTimerRef.current = 0;
          }
        } else {
          clearTimerRef.current = 0;
        }

        // Finger index tip is 8
        const rawX = (1 - landmarks[8].x) * drawingCanvas.width;
        const rawY = landmarks[8].y * drawingCanvas.height;
        
        stabilizedPos = stabilizePoint(rawX, rawY, smoothing);
        
        const gesture = detectGesture(landmarks);
        isDrawingActive = gesture === 'draw';

        // Draw gesture sparks & trail points
        if (isDrawingActive) {
          if (!wasDrawingRef.current) {
            resetStabilizer();
            stabilizedPos = stabilizePoint(rawX, rawY, smoothing);
            wasDrawingRef.current = true;
          }

          if (drawMode !== 'pointer') {
            addPoint(stabilizedPos.x, stabilizedPos.y);
            
            if (drawMode === 'draw') {
              sparksRef.current = [
                ...sparksRef.current,
                ...createSparks(stabilizedPos.x, stabilizedPos.y, activeColor, 2)
              ];
            }
          }
        } else {
          if (wasDrawingRef.current) {
            if (drawMode !== 'pointer') {
              commitCurrentStroke(activeColor, brushSize, drawMode === 'eraser', glowIntensity);
            }
            wasDrawingRef.current = false;
          }
        }
      } else {
        clearTimerRef.current = 0;
        if (wasDrawingRef.current) {
          if (drawMode !== 'pointer') {
            commitCurrentStroke(activeColor, brushSize, drawMode === 'eraser', glowIntensity);
          }
          wasDrawingRef.current = false;
        }
      }

      // --- 5. Draw active drawing path (if drawing right now) ---
      if (wasDrawingRef.current && currentPointsRef.current.length > 0 && drawMode !== 'pointer') {
        const activeStroke: CanvasStroke = {
          points: currentPointsRef.current,
          color: activeColor,
          size: brushSize,
          isEraser: drawMode === 'eraser',
          glowIntensity,
        };
        drawStroke(dCtx, activeStroke, 1.0);
      }

      // --- 6. Update and Draw Particles ---
      sparksRef.current = updateAndDrawSparks(dCtx, sparksRef.current);

      // --- 7. Draw Magnetic Cursor (Fingertip Halo) on Overlay Canvas ---
      if (stabilizedPos) {
        drawCursor(oCtx, stabilizedPos.x, stabilizedPos.y, activeColor, brushSize);
      }

      // --- 8. Draw Hand Landmark Points & Joints for Debug Mode ---
      if (isHandPresent && landmarks && landmarks.length >= 21 && showLandmarks) {
        oCtx.save();
        
        oCtx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        oCtx.lineWidth = 2;
        oCtx.shadowColor = 'rgba(0, 240, 255, 0.5)';
        oCtx.shadowBlur = 4;
        
        for (const conn of HAND_CONNECTIONS) {
          const pt1 = landmarks[conn[0]];
          const pt2 = landmarks[conn[1]];
          
          const x1 = (1 - pt1.x) * overlayCanvas.width;
          const y1 = pt1.y * overlayCanvas.height;
          const x2 = (1 - pt2.x) * overlayCanvas.width;
          const y2 = pt2.y * overlayCanvas.height;
          
          oCtx.beginPath();
          oCtx.moveTo(x1, y1);
          oCtx.lineTo(x2, y2);
          oCtx.stroke();
        }

        for (let i = 0; i < landmarks.length; i++) {
          const pt = landmarks[i];
          const x = (1 - pt.x) * overlayCanvas.width;
          const y = pt.y * overlayCanvas.height;

          oCtx.beginPath();
          oCtx.arc(x, y, 4, 0, Math.PI * 2);
          
          if (i === 8) {
            oCtx.fillStyle = activeColor;
            oCtx.arc(x, y, 6, 0, Math.PI * 2);
          } else if (i === 12 || i === 16 || i === 20 || i === 4) {
            oCtx.fillStyle = '#ff007a';
          } else {
            oCtx.fillStyle = '#ffffff';
          }
          oCtx.fill();
        }

        oCtx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    }

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawingCanvasRef, landmarksRef, isHandPresentRef]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <canvas
        ref={drawingCanvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};
export default DrawingCanvas;
