import { useRef, useCallback } from 'react';
import type { CanvasPoint, CanvasStroke } from '../utils/canvasUtils';

export function useSmoothDrawing() {
  const strokesRef = useRef<CanvasStroke[]>([]);
  const currentPointsRef = useRef<CanvasPoint[]>([]);
  const pointHistoryRef = useRef<{ x: number; y: number }[]>([]);

  // Linear weighted moving average for stabilizing coordinates
  const stabilizePoint = useCallback((rawX: number, rawY: number, windowSize: number) => {
    pointHistoryRef.current.push({ x: rawX, y: rawY });
    
    // Cap history size to windowSize
    if (pointHistoryRef.current.length > windowSize) {
      pointHistoryRef.current.shift();
    }

    const len = pointHistoryRef.current.length;
    if (len === 0) return { x: rawX, y: rawY };

    let sumX = 0;
    let sumY = 0;
    let totalWeight = 0;

    for (let i = 0; i < len; i++) {
      const weight = i + 1; // more weight to recent coordinates
      sumX += pointHistoryRef.current[i].x * weight;
      sumY += pointHistoryRef.current[i].y * weight;
      totalWeight += weight;
    }

    return {
      x: sumX / totalWeight,
      y: sumY / totalWeight,
    };
  }, []);

  // Reset the smoothing history (e.g. when drawing starts or tracking is lost)
  const resetStabilizer = useCallback(() => {
    pointHistoryRef.current = [];
  }, []);

  // Adds a point to the current stroke
  const addPoint = useCallback((x: number, y: number) => {
    const newPoint: CanvasPoint = {
      x,
      y,
      timestamp: performance.now(),
    };

    const len = currentPointsRef.current.length;
    
    if (len > 0) {
      const lastPoint = currentPointsRef.current[len - 1];
      const distance = Math.hypot(x - lastPoint.x, y - lastPoint.y);
      
      // Prevent jump: if distance is too high (e.g., > 150px), start a new stroke
      if (distance > 150) {
        commitCurrentStroke();
        currentPointsRef.current = [newPoint];
        return;
      }
    }

    currentPointsRef.current.push(newPoint);
  }, []);

  // Commits the current active stroke to the history
  const commitCurrentStroke = useCallback((
    color: string = '#00f0ff',
    size: number = 8,
    isEraser: boolean = false,
    glowIntensity: number = 25
  ) => {
    if (currentPointsRef.current.length < 2) {
      currentPointsRef.current = [];
      return;
    }

    strokesRef.current.push({
      points: [...currentPointsRef.current],
      color,
      size,
      isEraser,
      glowIntensity,
    });

    currentPointsRef.current = [];
  }, []);

  // Erase the last completed stroke
  const undo = useCallback(() => {
    if (strokesRef.current.length > 0) {
      strokesRef.current.pop();
    }
  }, []);

  // Clear all strokes
  const clearAll = useCallback(() => {
    strokesRef.current = [];
    currentPointsRef.current = [];
    pointHistoryRef.current = [];
  }, []);

  return {
    strokesRef,
    currentPointsRef,
    addPoint,
    commitCurrentStroke,
    stabilizePoint,
    resetStabilizer,
    undo,
    clearAll,
  };
}
export type UseSmoothDrawingReturn = ReturnType<typeof useSmoothDrawing>;
