export type GestureType = 'draw' | 'pause' | 'none';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Detects the gesture based on hand landmarks.
 * Landmarks indices:
 * 4: Thumb Tip, 3: Thumb IP
 * 8: Index Tip, 6: Index PIP
 * 12: Middle Tip, 10: Middle PIP
 * 16: Ring Tip, 14: Ring PIP
 * 20: Pinky Tip, 18: Pinky PIP
 */
export function detectGesture(landmarks: HandLandmark[]): GestureType {
  if (!landmarks || landmarks.length < 21) return 'none';

  // In MediaPipe, y decreases as we move upwards (0 at top, 1 at bottom)
  const indexUp = landmarks[8].y < landmarks[6].y;
  const middleUp = landmarks[12].y < landmarks[10].y;
  const ringUp = landmarks[16].y < landmarks[14].y;
  const pinkyUp = landmarks[20].y < landmarks[18].y;
  
  // 1. Pause Gesture: Open Palm (all fingers raised)
  if (indexUp && middleUp && ringUp && pinkyUp) {
    return 'pause';
  }

  // 2. Draw Gesture: Index finger raised, middle finger folded
  if (indexUp && !middleUp) {
    return 'draw';
  }

  return 'none';
}

/**
 * Checks if the hand is fully open (used for the clear gesture countdown).
 */
export function isAllFingersRaised(landmarks: HandLandmark[]): boolean {
  if (!landmarks || landmarks.length < 21) return false;

  const indexUp = landmarks[8].y < landmarks[6].y;
  const middleUp = landmarks[12].y < landmarks[10].y;
  const ringUp = landmarks[16].y < landmarks[14].y;
  const pinkyUp = landmarks[20].y < landmarks[18].y;

  return indexUp && middleUp && ringUp && pinkyUp;
}
