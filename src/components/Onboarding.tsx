import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Play } from 'lucide-react';

interface OnboardingProps {
  isVisible: boolean;
  onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-2xl w-full glass-panel rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden my-auto"
        >
          {/* Neon accent glows */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 animate-bounce">
              <Sparkles className="w-8 h-8 text-neon-cyan" />
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-widest uppercase">
              GLOWDRAW
            </h2>
            <p className="text-neon-cyan text-[10px] font-display font-bold tracking-widest uppercase mt-1">
              DESIGNED & BUILT BY SAMEER
            </p>
            <p className="text-slate-400 text-sm mt-3 tracking-wide">
              Paint with light in the air using your webcam
            </p>
          </div>

          {/* Gesture Guides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Gesture 1: Draw */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/5 border border-white/5 relative group hover:border-neon-cyan/20 transition-all duration-300">
              <div className="w-20 h-20 flex items-center justify-center mb-3 text-neon-cyan relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-neon-cyan/35 group-hover:animate-spin duration-10000" />
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Wrist & Palm */}
                  <path d="M7 21h10M7 16v5M17 16v5M8 12c.5-2 0-5.5 0-6.5C8 4.7 9 4 10 4s2 .7 2 1.5V11" />
                  {/* Index finger UP */}
                  <path d="M10 11V3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V10c0 .8 0 1-.2 1.2" />
                  {/* Other fingers folded */}
                  <path d="M13 11.5c.3-.5.7-1 1.2-1s.8.4.8 1v1M15 12c.3-.5.7-1 1.2-1s.8.4.8 1v1.5M17 13c.3-.4.7-.8 1.2-.8s.8.4.8 1v2.5" />
                  {/* Thumb */}
                  <path d="M8 13.5c-1 0-2 .8-2 1.8s1 .8 2.2 0" />
                </svg>
              </div>
              <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-1">
                1. DRAW GESTURE
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raise your <strong className="text-neon-cyan">index finger</strong> while folding other fingers down to draw glowing strokes.
              </p>
            </div>

            {/* Gesture 2: Pause */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/5 border border-white/5 relative group hover:border-neon-purple/20 transition-all duration-300">
              <div className="w-20 h-20 flex items-center justify-center mb-3 text-neon-purple relative">
                <div className="absolute inset-0 rounded-full border border-dashed border-neon-purple/35 group-hover:animate-spin duration-10000" />
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 21h10M7 16v5M17 16v5" />
                  {/* Thumb */}
                  <path d="M6 13c-1.5-.5-2.5.5-2.5 1.5s1 1.5 2.5.5" />
                  {/* 4 Raised Fingers */}
                  <path d="M8.5 15V4.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V12M11.5 12V3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V12M14.5 12V4.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V12M17.5 13V6.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V15" />
                </svg>
              </div>
              <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-1">
                2. PAUSE HOVER
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Show a full <strong className="text-neon-purple">open palm</strong> to temporarily pause drawing. Hover your fingertip guide freely.
              </p>
            </div>

            {/* Gesture 3: Clear */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/5 border border-white/5 relative group hover:border-neon-pink/20 transition-all duration-300">
              <div className="w-20 h-20 flex items-center justify-center mb-3 text-neon-pink relative">
                <div className="absolute inset-0 rounded-full border border-dashed border-neon-pink/35 group-hover:animate-spin duration-10000" />
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-1">
                3. CLEAR SCREEN
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep your <strong className="text-neon-pink">hand open for 2 seconds</strong>. A countdown will trigger to clear the canvas.
              </p>
            </div>
          </div>

          {/* Core instructions banner */}
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-blue-950/20 border border-blue-900/30 text-left mb-8">
            <Camera className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
            <div>
              <h5 className="font-display font-bold text-xs text-slate-200 uppercase tracking-wide">
                Webcam & Mirroring Setup
              </h5>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Once initialized, look directly into the camera. Stand 2 to 5 feet back. Make sure your face and hand are well-lit for seamless tracking results.
              </p>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan hover:to-neon-purple text-slate-950 font-display font-black text-sm tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all duration-300"
          >
            LAUNCH SPACE CANVAS <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default Onboarding;
