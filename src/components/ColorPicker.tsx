import React from 'react';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onChangeColor: (color: string) => void;
}

const PRESETS = [
  { name: 'Cyan', value: '#00f0ff', class: 'bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.4)]' },
  { name: 'Purple', value: '#d946ef', class: 'bg-neon-purple shadow-[0_0_8px_rgba(217,70,239,0.4)]' },
  { name: 'Pink', value: '#ff007a', class: 'bg-neon-pink shadow-[0_0_8px_rgba(255,0,122,0.4)]' },
  { name: 'Green', value: '#39ff14', class: 'bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.4)]' },
  { name: 'Orange', value: '#ff6b00', class: 'bg-neon-orange shadow-[0_0_8px_rgba(255,107,0,0.4)]' },
  { name: 'White', value: '#ffffff', class: 'bg-neon-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onChangeColor,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      {PRESETS.map((preset) => {
        const isSelected = selectedColor.toLowerCase() === preset.value.toLowerCase();
        return (
          <button
            key={preset.value}
            onClick={() => onChangeColor(preset.value)}
            title={preset.name}
            className={`w-6 h-6 rounded-full ${preset.class} cursor-pointer transition-all duration-300 hover:scale-110 relative ${
              isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-105' : 'opacity-80 hover:opacity-100'
            }`}
          >
            {isSelected && (
              <span className="absolute inset-0 m-auto w-1 h-1 bg-slate-950 rounded-full" />
            )}
          </button>
        );
      })}

      {/* Custom Color Pipette Picker */}
      <div className="relative w-6 h-6 rounded-full border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 transition-colors flex items-center justify-center cursor-pointer hover:border-slate-600 group">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onChangeColor(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          title="Custom Neon Palette"
        />
        <Pipette className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
};
export default ColorPicker;
