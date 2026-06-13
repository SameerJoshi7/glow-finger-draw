import React from 'react';
import { ShieldCheck, Crosshair } from 'lucide-react';

interface FPSIndicatorProps {
  fps: number;
  isHandPresent: boolean;
  landmarks: any[];
  strokesCount: number;
  pointsCount: number;
  activeMode: string;
  isRecording: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const FPSIndicator: React.FC<FPSIndicatorProps> = ({
  fps,
  isHandPresent,
  landmarks,
  strokesCount,
  pointsCount,
  activeMode,
  isRecording,
  canvasRef,
}) => {
  // Extract fingertip coords
  const indexTip = landmarks && landmarks.length > 0 ? landmarks[8] : null;
  const canvasWidth = canvasRef.current?.width || 0;
  const canvasHeight = canvasRef.current?.height || 0;

  const xPx = indexTip ? Math.round((1 - indexTip.x) * canvasWidth) : 0;
  const yPx = indexTip ? Math.round(indexTip.y * canvasHeight) : 0;

  return (
    <div className="absolute bottom-4 left-4 z-40 p-4 rounded-xl border border-neon-cyan/20 bg-slate-950/80 backdrop-blur-md font-mono text-[10px] text-neon-cyan flex flex-col gap-2.5 shadow-[0_0_15px_rgba(0,240,255,0.05)] w-[260px]">
      <div className="flex items-center gap-1.5 border-b border-neon-cyan/10 pb-1.5">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-display font-bold tracking-wider uppercase">
          Neural Telemetry HUD
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-1.5">
        <span className="text-slate-400">FRAME RATE:</span>
        <span className="font-bold text-white flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full inline-block ${fps >= 50 ? 'bg-green-400' : fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'}`} />
          {fps} FPS
        </span>

        <span className="text-slate-400">HAND DETECTED:</span>
        <span className={isHandPresent ? 'text-green-400 font-bold' : 'text-red-500'}>
          {isHandPresent ? 'ONLINE' : 'OFFLINE'}
        </span>

        <span className="text-slate-400">TRACKING NODE:</span>
        <span className="text-white">INDEX_TIP (8)</span>

        <span className="text-slate-400">COORDINATES:</span>
        <span className="text-white font-bold flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-slate-400" />
          {isHandPresent && indexTip ? `X:${xPx} Y:${yPx}` : 'N/A'}
        </span>

        <span className="text-slate-400">ACTIVE STROKES:</span>
        <span className="text-white font-bold">{strokesCount}</span>

        <span className="text-slate-400">TOTAL NODES:</span>
        <span className="text-white font-bold">{pointsCount}</span>

        <span className="text-slate-400">RENDER MODE:</span>
        <span className="text-white font-bold uppercase">{activeMode}</span>

        <span className="text-slate-400">RECORDING:</span>
        <span className={isRecording ? 'text-red-500 font-bold animate-pulse' : 'text-slate-500'}>
          {isRecording ? 'RECORDING' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
};
