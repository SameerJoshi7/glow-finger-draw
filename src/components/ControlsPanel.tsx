import React, { useState } from 'react';
import { 
  Camera, 
  CameraOff, 
  Trash2, 
  RotateCcw, 
  Download, 
  Eye, 
  EyeOff, 
  Sliders, 
  Video, 
  VideoOff, 
  Sparkles,
  HelpCircle,
  Pencil,
  Eraser,
  Eye as ViewIcon,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import type { DrawMode } from './ModeSelector';

interface ControlsPanelProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
  
  // Canvas Actions
  onClear: () => void;
  onUndo: () => void;
  onSave: (transparent: boolean) => void;
  
  // Toggles
  showPreview: boolean;
  onTogglePreview: () => void;
  showLandmarks: boolean;
  onToggleLandmarks: () => void;
  fadeTrail: boolean;
  onToggleFadeTrail: () => void;
  
  // Sliders
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  glowIntensity: number;
  onChangeGlowIntensity: (intensity: number) => void;
  smoothing: number;
  onChangeSmoothing: (smoothing: number) => void;
  
  // Color & Mode
  selectedColor: string;
  onChangeColor: (color: string) => void;
  activeMode: DrawMode;
  onChangeMode: (mode: DrawMode) => void;

  // Recording
  isRecording: boolean;
  onToggleRecording: () => void;
  recordingTime: number;

  // Onboarding
  onShowOnboarding: () => void;
  
  // Developer
  isDevMode: boolean;
  onToggleDevMode: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isCameraActive,
  onToggleCamera,
  onClear,
  onUndo,
  onSave,
  showPreview,
  onTogglePreview,
  showLandmarks,
  onToggleLandmarks,
  fadeTrail,
  onToggleFadeTrail,
  brushSize,
  onChangeBrushSize,
  glowIntensity,
  onChangeGlowIntensity,
  smoothing,
  onChangeSmoothing,
  selectedColor,
  onChangeColor,
  activeMode,
  onChangeMode,
  isRecording,
  onToggleRecording,
  recordingTime,
  onShowOnboarding,
  isDevMode,
  onToggleDevMode,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);

  // Format recording timer: MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeIcons = {
    draw: { label: 'Draw', icon: Pencil, color: 'text-neon-cyan' },
    eraser: { label: 'Erase', icon: Eraser, color: 'text-neon-pink' },
    pointer: { label: 'Guide', icon: ViewIcon, color: 'text-neon-purple' },
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl flex flex-col items-center gap-3">
      {/* 1. FLOATING ADVANCED SETTINGS POPOVER CARD */}
      {isCameraActive && showSettings && (
        <div className="w-full max-w-lg glass-panel rounded-2xl p-5 border border-white/10 flex flex-col gap-4 shadow-2xl animate-bounce-short mb-1">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="font-display text-[10px] font-black tracking-widest text-slate-300">
              BRUSH & CAMERA TUNING
            </span>
            <button
              onClick={() => onToggleDevMode()}
              className={`text-[9px] font-display font-bold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                isDevMode
                  ? 'bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              DEV TELEMETRY
            </button>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-display text-slate-400">
                <span>SIZE</span>
                <span className="font-mono text-white font-bold">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={brushSize}
                onChange={(e) => onChangeBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-display text-slate-400">
                <span>GLOW</span>
                <span className="font-mono text-white font-bold">{glowIntensity}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={glowIntensity}
                onChange={(e) => onChangeGlowIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-display text-slate-400">
                <span>STABILIZER</span>
                <span className="font-mono text-white font-bold">{smoothing}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={smoothing}
                onChange={(e) => onChangeSmoothing(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Display settings toggles */}
          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
            <button
              onClick={onTogglePreview}
              className={`py-2 px-3 rounded-xl border text-[9px] font-display font-medium tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                showPreview ? 'bg-white/5 border-white/10 text-white' : 'border-slate-800 text-slate-500'
              }`}
            >
              {showPreview ? <Eye className="w-3.5 h-3.5 text-neon-cyan" /> : <EyeOff className="w-3.5 h-3.5" />}
              WEBCAM FEED
            </button>

            <button
              onClick={onToggleLandmarks}
              className={`py-2 px-3 rounded-xl border text-[9px] font-display font-medium tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                showLandmarks ? 'bg-white/5 border-white/10 text-white' : 'border-slate-800 text-slate-500'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-neon-purple" />
              SKELETON DOTS
            </button>

            <button
              onClick={onToggleFadeTrail}
              className={`py-2 px-3 rounded-xl border text-[9px] font-display font-medium tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                fadeTrail ? 'bg-white/5 border-white/10 text-white shadow-[0_0_8px_rgba(217,70,239,0.1)]' : 'border-slate-800 text-slate-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-neon-pink" />
              AUTO-FADE TRAIL
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN BOTTOM PLAYFUL DOCK BAR */}
      <div className="w-full glass-panel rounded-2xl px-4 py-3 border border-white/10 flex items-center justify-between gap-3 shadow-2xl flex-wrap md:flex-nowrap">
        
        {/* Left Side: Brand Logo & Tutorial */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="font-display font-black text-xs text-white leading-none tracking-widest flex items-center gap-1">
              GLOWDRAW <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
            </h1>
            <span className="text-[8px] text-neon-purple font-display font-bold tracking-widest uppercase">
              BY SAMEER
            </span>
          </div>
          <button
            onClick={onShowOnboarding}
            className="p-1.5 rounded-lg glass-button text-slate-400 hover:text-white cursor-pointer"
            title="How to paint (gestures)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center-Left: Tracking Toggle & Mode Segment */}
        <div className="flex items-center gap-3">
          {/* Tracking On/Off */}
          <button
            onClick={onToggleCamera}
            className={`py-2 px-3.5 rounded-xl font-display text-[10px] font-black tracking-widest flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
              isCameraActive 
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                : 'bg-gradient-to-r from-neon-cyan to-neon-purple hover:scale-105 text-slate-950 font-black shadow-[0_0_15px_rgba(0,240,255,0.2)]'
            }`}
          >
            {isCameraActive ? (
              <>
                <CameraOff className="w-3.5 h-3.5" /> SHUTDOWN
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" /> LAUNCH AIR DRAW
              </>
            )}
          </button>

          {/* Mode Selector segment */}
          {isCameraActive && (
            <div className="flex bg-slate-950/60 p-0.5 rounded-xl border border-slate-800/80">
              {(['draw', 'eraser', 'pointer'] as DrawMode[]).map((mode) => {
                const isActive = activeMode === mode;
                const Icon = modeIcons[mode].icon;
                return (
                  <button
                    key={mode}
                    onClick={() => onChangeMode(mode)}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`${modeIcons[mode].label} Mode`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? modeIcons[mode].color : ''}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center-Right: Color Preset Pickers */}
        {isCameraActive && (
          <div className="flex items-center gap-1 border-l border-white/5 pl-2.5">
            <ColorPicker selectedColor={selectedColor} onChangeColor={onChangeColor} />
          </div>
        )}

        {/* Right Side: Advanced Settings & Actions */}
        {isCameraActive && (
          <div className="flex items-center gap-2 border-l border-white/5 pl-2.5">
            {/* Advanced Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                showSettings ? 'bg-neon-cyan/15 border-neon-cyan/30 text-neon-cyan' : 'glass-button text-slate-400 hover:text-white'
              }`}
              title="Tune sliders & options"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Undo Action */}
            <button
              onClick={onUndo}
              className="p-2 rounded-lg glass-button text-slate-300 hover:text-white cursor-pointer"
              title="Undo last stroke (Shortcut: Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clear Action */}
            <button
              onClick={onClear}
              className="p-2 rounded-lg glass-button text-red-400 hover:text-red-300 border-red-500/10 hover:border-red-500/20 bg-red-950/15 cursor-pointer"
              title="Clear screen (Shortcut: C)"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Recording Toggle */}
            <button
              onClick={onToggleRecording}
              className={`p-2 rounded-lg border cursor-pointer transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse'
                  : 'glass-button text-slate-400 hover:text-white'
              }`}
              title={isRecording ? `Recording (${formatTime(recordingTime)})` : 'Record canvas to webm'}
            >
              {isRecording ? <VideoOff className="w-4 h-4 text-red-500" /> : <Video className="w-4 h-4" />}
            </button>

            {/* Save Export Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSaveMenu(!showSaveMenu)}
                className="p-2 rounded-lg glass-button text-neon-cyan hover:text-white flex items-center gap-0.5 cursor-pointer"
                title="Save artwork"
              >
                <Download className="w-4 h-4" />
                {showSaveMenu ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>

              {showSaveMenu && (
                <div className="absolute bottom-12 right-0 w-36 glass-panel rounded-xl p-1 border border-white/10 shadow-2xl flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200 z-50">
                  <button
                    onClick={() => {
                      onSave(false);
                      setShowSaveMenu(false);
                    }}
                    className="w-full py-2 px-3 text-left font-display text-[9px] font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    DIGITAL BACKDROP
                  </button>
                  <button
                    onClick={() => {
                      onSave(true);
                      setShowSaveMenu(false);
                    }}
                    className="w-full py-2 px-3 text-left font-display text-[9px] font-bold text-neon-purple hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    TRANSPARENT PNG
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
