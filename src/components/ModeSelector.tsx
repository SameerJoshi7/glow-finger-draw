import React from 'react';
import { Pencil, Eraser, Eye } from 'lucide-react';

export type DrawMode = 'draw' | 'eraser' | 'pointer';

interface ModeSelectorProps {
  activeMode: DrawMode;
  onChangeMode: (mode: DrawMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onChangeMode,
}) => {
  const modes = [
    { id: 'draw' as DrawMode, label: 'Draw', icon: Pencil, desc: 'Index up' },
    { id: 'eraser' as DrawMode, label: 'Erase', icon: Eraser, desc: 'Fingertip erase' },
    { id: 'pointer' as DrawMode, label: 'Guide', icon: Eye, desc: 'Hover mode' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-xs tracking-wider text-slate-400">
        INTERACTION MODE
      </label>
      
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        {modes.map((m) => {
          const isActive = activeMode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onChangeMode(m.id)}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg cursor-pointer transition-all duration-300 ${
                isActive
                  ? 'bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
              title={`${m.label} Mode (${m.desc})`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 text-neon-cyan' : ''}`} />
              <span className="text-[10px] font-display font-medium tracking-wider uppercase">
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
