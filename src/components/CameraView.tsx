import React from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showPreview: boolean;
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
  onRetry: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  showPreview,
  isLoading,
  error,
  isActive,
  onRetry,
}) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden">
      {/* 1. Video stream element (mirrored) */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover camera-mirror transition-opacity duration-700 ${
          isActive && showPreview ? 'opacity-35' : 'opacity-0'
        }`}
        playsInline
        muted
      />

      {/* Cyber Grid background overlay (visible when preview is toggled off or loading) */}
      <div 
        className={`absolute inset-0 cyber-grid transition-opacity duration-700 pointer-events-none ${
          !showPreview || !isActive ? 'opacity-100' : 'opacity-45'
        }`}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-10">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Spinning glowing rings */}
            <div className="absolute inset-0 rounded-full border-4 border-t-neon-cyan border-r-transparent border-b-neon-purple border-l-transparent animate-spin duration-1000" />
            <div className="absolute inset-2 rounded-full border-4 border-b-neon-pink border-l-transparent border-t-neon-green border-r-transparent animate-spin duration-1500 reverse" />
            <Camera className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="mt-6 font-display text-lg tracking-wider text-neon-cyan animate-pulse">
            INITIALIZING NEURAL TRACKING...
          </p>
          <p className="mt-2 text-sm text-slate-400">Loading AI model & requesting camera stream</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg z-10 px-4">
          <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-red-500/20 text-center relative overflow-hidden">
            {/* Ambient Red glow background */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-16 h-16 bg-red-950/50 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            
            <h3 className="font-display text-xl text-red-400 mb-3 tracking-wide">
              SYSTEM DIAGNOSTIC ERROR
            </h3>
            
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
              {error}
            </p>
            
            <button
              onClick={onRetry}
              className="w-full py-3 px-6 rounded-lg font-display text-sm tracking-widest text-white border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              RE-INITIALIZE WEBCAM
            </button>
          </div>
        </div>
      )}

      {/* Camera Inactive placeholder screen */}
      {!isActive && !isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
          <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-6">
            <CameraOff className="w-8 h-8 text-slate-500" />
          </div>
          <p className="font-display text-lg text-slate-400 tracking-widest">
            NEURAL TRACKING STBY
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Click Start Tracking in controls to launch air draw.
          </p>
        </div>
      )}
    </div>
  );
};
