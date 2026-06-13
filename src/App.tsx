import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { Onboarding } from './components/Onboarding';
import { FPSIndicator } from './components/FPSIndicator';

import { useHandTracking } from './hooks/useHandTracking';
import { useSmoothDrawing } from './hooks/useSmoothDrawing';
import { exportToPNG } from './utils/canvasUtils';
import type { DrawMode } from './components/ModeSelector';

export default function App() {
  // 1. Drawing Configuration State
  const [activeColor, setActiveColor] = useState('#00f0ff');
  const [brushSize, setBrushSize] = useState(8);
  const [glowIntensity, setGlowIntensity] = useState(25);
  const [smoothing, setSmoothing] = useState(8);
  const [drawMode, setDrawMode] = useState<DrawMode>('draw');

  // 2. AR & Display Toggles
  const [showPreview, setShowPreview] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [fadeTrail, setFadeTrail] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  const isDevModeRef = useRef(isDevMode);
  useEffect(() => {
    isDevModeRef.current = isDevMode;
  }, [isDevMode]);

  // 3. Media Refs and Tracking Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Shared tracking references (read/written at 60 FPS without React re-renders)
  const landmarksRef = useRef<any[]>([]);
  const isHandPresentRef = useRef<boolean>(false);
  
  // 4. Telemetry State (Throttled for HUD rendering)
  const [telemetryState, setTelemetryState] = useState<{
    isHandPresent: boolean;
    landmarks: any[];
  }>({
    isHandPresent: false,
    landmarks: [],
  });
  
  const [fps, setFps] = useState(0);
  const lastTelemetryUpdateRef = useRef(performance.now());

  // 5. Video Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  // Custom Hooks
  const {
    strokesRef,
    currentPointsRef,
    addPoint,
    commitCurrentStroke,
    stabilizePoint,
    resetStabilizer,
    undo,
    clearAll,
  } = useSmoothDrawing();

  // Hand tracking callback (runs inside tracking animation frame)
  const onHandTracked = useCallback((landmarks: any[], isHandPresent: boolean) => {
    landmarksRef.current = landmarks;
    isHandPresentRef.current = isHandPresent;

    // Only update React state if Dev HUD is active, completely eliminating drawing lag in standard play
    if (isDevModeRef.current) {
      const now = performance.now();
      if (now - lastTelemetryUpdateRef.current > 200) {
        lastTelemetryUpdateRef.current = now;
        setTelemetryState({
          isHandPresent,
          landmarks: landmarks.length > 0 ? [...landmarks] : [],
        });
      }
    }
  }, []);

  // Initialize tracking hook
  const { isLoading, error } = useHandTracking({
    videoRef: videoRef,
    onHandTracked,
    isEnabled: isCameraActive,
  });

  // Toggle Camera Tracking
  const handleToggleCamera = useCallback(() => {
    setIsCameraActive((prev) => !prev);
  }, []);

  // Re-initialize webcam feed after errors
  const handleRetryCamera = useCallback(() => {
    setIsCameraActive(false);
    setTimeout(() => {
      setIsCameraActive(true);
    }, 100);
  }, []);

  // Save Canvas Drawing
  const handleSave = useCallback((transparent: boolean) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    exportToPNG(canvas, transparent, `glow-finger-drawing-${transparent ? 'alpha' : 'solid'}.png`);
  }, []);

  // Video Recording Operations
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    } else {
      // Start
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;

      recordedChunksRef.current = [];
      const stream = canvas.captureStream(30); // Capture only drawing canvas at 30 FPS

      let options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }

      try {
        const recorder = new MediaRecorder(stream, options);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'glow-finger-painting.webm';
          a.click();
          URL.revokeObjectURL(url);
        };

        mediaRecorderRef.current = recorder;
        recorder.start(1000);
        setIsRecording(true);
        setRecordingTime(0);

        recordingIntervalRef.current = window.setInterval(() => {
          setRecordingTime((t) => t + 1);
        }, 1000);
      } catch (err) {
        console.error('Failed to start canvas video capture recorder:', err);
      }
    }
  }, [isRecording]);

  // Clean up recording timers
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (onboardingVisible) return; // ignore when onboarding modal is open

      const key = e.key.toLowerCase();
      if (key === 'c') {
        clearAll();
      } else if (key === 's') {
        handleSave(false);
      } else if (key === 'e') {
        setDrawMode('eraser');
      } else if (key === 'd') {
        setDrawMode('draw');
      } else if (key === 'z' || e.key === 'Backspace') {
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onboardingVisible, clearAll, handleSave, undo]);

  // Count active points in completed strokes
  const totalPointsCount = strokesRef.current.reduce(
    (acc, stroke) => acc + stroke.points.length,
    0
  ) + currentPointsRef.current.length;

  return (
    <main className="relative w-full h-screen bg-slate-950 select-none overflow-hidden">
      {/* 1. Mirrored Camera View Background Layer */}
      <CameraView
        videoRef={videoRef}
        showPreview={showPreview}
        isLoading={isLoading}
        error={error}
        isActive={isCameraActive}
        onRetry={handleRetryCamera}
      />

      {/* 2. Drawing Canvases (Drawing & Overlay HUD) */}
      {isCameraActive && (
        <DrawingCanvas
          drawingCanvasRef={drawingCanvasRef}
          strokesRef={strokesRef}
          currentPointsRef={currentPointsRef}
          landmarksRef={landmarksRef}
          isHandPresentRef={isHandPresentRef}
          activeColor={activeColor}
          brushSize={brushSize}
          glowIntensity={glowIntensity}
          smoothing={smoothing}
          drawMode={drawMode}
          showLandmarks={showLandmarks}
          fadeTrail={fadeTrail}
          stabilizePoint={stabilizePoint}
          addPoint={addPoint}
          commitCurrentStroke={commitCurrentStroke}
          resetStabilizer={resetStabilizer}
          onClear={clearAll}
          onFPSUpdate={isDevMode ? setFps : undefined}
        />
      )}

      {/* 3. Floating Glassmorphic Controls Panel */}
      <ControlsPanel
        isCameraActive={isCameraActive}
        onToggleCamera={handleToggleCamera}
        onClear={clearAll}
        onUndo={undo}
        onSave={handleSave}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((p) => !p)}
        showLandmarks={showLandmarks}
        onToggleLandmarks={() => setShowLandmarks((l) => !l)}
        fadeTrail={fadeTrail}
        onToggleFadeTrail={() => setFadeTrail((f) => !f)}
        brushSize={brushSize}
        onChangeBrushSize={setBrushSize}
        glowIntensity={glowIntensity}
        onChangeGlowIntensity={setGlowIntensity}
        smoothing={smoothing}
        onChangeSmoothing={setSmoothing}
        selectedColor={activeColor}
        onChangeColor={setActiveColor}
        activeMode={drawMode}
        onChangeMode={setDrawMode}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        recordingTime={recordingTime}
        onShowOnboarding={() => setOnboardingVisible(true)}
        isDevMode={isDevMode}
        onToggleDevMode={() => setIsDevMode((d) => !d)}
      />

      {/* 4. Telemetry HUD (visible in developer mode) */}
      {isDevMode && isCameraActive && (
        <FPSIndicator
          fps={fps}
          isHandPresent={telemetryState.isHandPresent}
          landmarks={telemetryState.landmarks}
          strokesCount={strokesRef.current.length}
          pointsCount={totalPointsCount}
          activeMode={drawMode}
          isRecording={isRecording}
          canvasRef={drawingCanvasRef}
        />
      )}

      {/* 5. Ambient Lighting effects overlay (matches active color) */}
      <div 
        style={{ background: `radial-gradient(circle at 50% 50%, ${activeColor}03 0%, transparent 60%)` }}
        className="absolute inset-0 pointer-events-none z-10 transition-all duration-1000"
      />

      {/* 6. Onboarding and Gesture Guide overlay */}
      <Onboarding
        isVisible={onboardingVisible}
        onClose={() => setOnboardingVisible(false)}
      />
    </main>
  );
}
