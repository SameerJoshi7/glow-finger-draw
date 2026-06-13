import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface UseHandTrackingProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onHandTracked: (landmarks: any[], isHandPresent: boolean) => void;
  isEnabled: boolean;
}

export function useHandTracking({
  videoRef,
  onHandTracked,
  isEnabled,
}: UseHandTrackingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializingRef = useRef(false);

  // Initialize MediaPipe HandLandmarker
  useEffect(() => {
    if (isInitializingRef.current || landmarkerRef.current) return;
    isInitializingRef.current = true;

    async function initLandmarker() {
      try {
        setIsLoading(true);
        setError(null);
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `${import.meta.env.BASE_URL}hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        landmarkerRef.current = landmarker;
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize HandLandmarker:', err);
        setError('MediaPipe failed to load. Please check your internet connection and try again.');
        setIsLoading(false);
      }
    }

    initLandmarker();

    return () => {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  // Request camera and stream
  useEffect(() => {
    let active = true;
    const videoElement = videoRef.current;

    async function startCamera() {
      if (!isEnabled || error) return;
      
      try {
        setIsCameraActive(false);
        
        // Stop existing streams if any
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support webcam access.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user', // mirror mode camera
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            if (active) {
              videoElement.play().catch((err) => {
                console.error('Failed to play video stream:', err);
              });
              setIsCameraActive(true);
            }
          };
        }
      } catch (err: any) {
        console.error('Failed to start camera:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access was denied. Please grant camera permission to draw in the air.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No webcam was found. Please connect a camera and try again.');
        } else {
          setError(err.message || 'Failed to access webcam.');
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, [isEnabled, videoRef, error]);

  // Frame processing loop
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!isCameraActive || !videoElement || !landmarkerRef.current || !isEnabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let lastVideoTime = -1;
    let lastProcessTime = 0;

    function processFrame() {
      const currentVideoElement = videoRef.current;
      if (!currentVideoElement || !landmarkerRef.current || !isCameraActive || !isEnabled) return;

      try {
        const now = performance.now();
        if (now - lastProcessTime >= 40) {
          if (currentVideoElement.readyState >= 2 && currentVideoElement.currentTime !== lastVideoTime) {
            lastVideoTime = currentVideoElement.currentTime;
            const results = landmarkerRef.current.detectForVideo(currentVideoElement, now);

            if (results.landmarks && results.landmarks.length > 0) {
              onHandTracked(results.landmarks[0], true);
            } else {
              onHandTracked([], false);
            }
            lastProcessTime = now;
          }
        }
      } catch (err) {
        console.error('Error in hand tracking loop:', err);
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isCameraActive, videoRef, isEnabled, onHandTracked]);

  return {
    isLoading: isLoading || (isEnabled && !isCameraActive && !error),
    error,
    isCameraActive,
  };
}
