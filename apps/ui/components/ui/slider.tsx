import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueLabel?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueLabel, min = 0, max = 100, step = 1, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-neutral-300">
              {label}
            </label>
            {valueLabel && (
              <span className="text-sm font-mono text-neutral-200">
                {valueLabel}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          <input
            type="range"
            className={cn(
              "w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2 focus:ring-offset-[#0a0b0e]",
              "slider-thumb",
              className
            )}
            min={min}
            max={max}
            step={step}
            ref={ref}
            {...props}
          />
          
          {/* Custom track fill - Silent Blade gradient (22.5°) */}
          <div
            className="absolute top-0 left-0 h-1 blade-gradient rounded-lg pointer-events-none"
            style={{
              width: `${((Number(props.value || 0) - min) / (max - min)) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

// Add custom slider thumb styles to globals.css
const sliderStyles = `
.slider-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #2D8EDF;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(45, 142, 223, 0.6);
  transition: all 150ms ease-out;
}

.slider-thumb::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 16px rgba(45, 142, 223, 0.8);
}

.slider-thumb::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #2D8EDF;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(45, 142, 223, 0.6);
  transition: all 150ms ease-out;
}

.slider-thumb::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 16px rgba(45, 142, 223, 0.8);
}
`;

// We'll add this to globals.css later
export { sliderStyles };
