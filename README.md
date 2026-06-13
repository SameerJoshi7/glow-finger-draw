# ✨ Glow Finger Draw

Glow Finger Draw is a high-performance, browser-based augmented reality (AR) air-painting creative suite. It integrates machine learning (MediaPipe HandLandmarker) and HTML5 canvas layers to let users paint neon drawings using hand gestures captured by a webcam.

🚀 **Live Demo:** [https://SameerJoshi7.github.io/glow-finger-draw/](https://SameerJoshi7.github.io/glow-finger-draw/)

---

## 🎨 Key Features

- 🖐️ **AI Air Tracking & Gesture Control**:
  - Real-time index fingertip tracking (Landmark `8`).
  - **Draw Gesture**: Raise index finger, keep other fingers folded to draw paths.
  - **Pause/Hover Gesture**: Open your palm to stop drawing and hover the glowing fingertip guide.
  - **Interactive Clear**: Hold an open palm for 2 seconds to trigger a glowing countdown ring. Keep holding to wipe the canvas.
- ⚡ **Ultra-Smooth Drawing Core**:
  - **Coordinate Stabilization**: Linear weighted moving average filters out raw webcam tracking jitter.
  - **Quadratic Bezier Curves**: Smooth path interpolation for organic lines instead of jagged segments.
  - **Tracking Loss Rejection**: Automatically detects tracking jumps ($>150\text{px}$) and splits path segments cleanly.
- 🌈 **Premium Visual Aesthetics**:
  - **Stacked Layered Canvases**: Separate canvases for drawings, skeleton joint HUDs, and dynamic cursors.
  - **Multi-pass Neon Glows**: Renders strokes using layered glows (core white, medium glow, outer blur) to mimic real light painting.
  - **Trailing Particle Sparks**: Colorful neon particles float and fade behind the brush tip as you paint.
  - **Auto-Fade Trail**: Optional setting to let older strokes gradually dissolve over time.
- 🎥 **Studio & Export Utilities**:
  - **Digital Backdrop PNG**: Export artwork on a dark backdrop.
  - **Transparent PNG**: Export artwork with an alpha transparency channel (transparent background).
  - **WebM Video Recording**: Record the canvas paths at 30 FPS using `MediaRecorder` and download as video.
  - **Developer Telemetry HUD**: Toggle technical diagnostics displaying active FPS, joint coordinates, and total point arrays.

---

## 🎮 How To Paint (Gestures)

| Gesture | Finger Layout | Action |
| :--- | :--- | :--- |
| **Draw Brush** | ☝️ Index Finger raised, others folded | Draw colored neon paths with trailing sparks |
| **Hover / Pause** | 🖐️ Open Palm / All fingers raised | Stop drawing, move glowing cursor around canvas |
| **Auto-Clear Canvas**| 🖐️ Hold Open Palm for 2 seconds | Triggers a pink countdown ring; clears the board when complete |

---

## ⌨️ Keyboard Shortcuts

Press these keys while painting to trigger quick actions:

| Key | Action |
| :---: | :--- |
| `D` | Switch to **Draw Mode** |
| `E` | Switch to **Eraser Mode** |
| `Z` / `Backspace` | **Undo** last stroke |
| `C` | **Clear** entire canvas |
| `S` | Export **Solid PNG** |

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Glassmorphic gradients & micro-animations)
- **Computer Vision**: `@mediapipe/tasks-vision` (Throttled local WASM tracking model)
- **Icons**: `lucide-react`
- **Effects**: `canvas-confetti`

---

## 💻 Local Setup & Development

To clone, install dependencies, and run the project locally, execute the following commands in your shell:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/SameerJoshi7/glow-finger-draw.git
   cd glow-finger-draw
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## ⚡ Performance Optimizations

To ensure high-framerate drawing even on lower-end laptops or integrated GPUs, the following optimizations are implemented:
1. **Model Tracking Throttle (25 FPS)**: The raw MediaPipe solver runs at 25 FPS instead of trying to compute landmark positions on every single requestAnimationFrame (60 FPS). This cuts CPU overhead by over 50% with zero impact on hand responsiveness.
2. **React Rendering Bypass**: Coordinates, active path nodes, and joints are stored and updated inside stable `MutableRef`s. We completely bypass React state re-renders during active drawing, decoupling the UI from the 60 FPS requestAnimationFrame render loop.
3. **Gated Telemetry HUD**: Detailed coordinates updates and frame counts are completely disabled unless **Developer Telemetry** mode is explicitly toggled on in settings.
4. **CSS Reflow Elimination**: All layout properties are fixed/absolute, avoiding expensive document layout recalculations (paint invalidations) during drawing cycles.
