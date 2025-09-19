import React from 'react';
import { motion } from 'framer-motion';
import type { Banner } from '../../../../types/Banner.type';

interface PositionSelectProps {
  value: number;
  onChange: (position: number) => void;
  banners: Banner[];
  currentBannerId?: string;
  disabled?: boolean;
  className?: string;
}

export const PositionSelect: React.FC<PositionSelectProps> = ({
  value,
  onChange,
  banners,
  currentBannerId,
  disabled = false,
  className = ''
}) => {
  // Get all used positions excluding current banner
  const usedPositions = banners
    .filter(banner => banner._id !== currentBannerId)
    .map(banner => banner.position);

  // Calculate max position (total banners count)
  const maxPosition = banners.length;

  // Generate available positions (1 to maxPosition)
  const availablePositions = Array.from({ length: maxPosition }, (_, i) => i + 1)
    .filter(pos => !usedPositions.includes(pos));

  // If editing and current position is not in available list, add it
  if (currentBannerId && !availablePositions.includes(value) && value <= maxPosition) {
    availablePositions.push(value);
    availablePositions.sort((a, b) => a - b);
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-300">
        Position
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Select position</option>
        {availablePositions.map(pos => (
          <option key={pos} value={pos}>
            Position {pos}
          </option>
        ))}
      </select>
      
      {/* Position validation info */}
      <div className="text-xs text-slate-400 space-y-1">
        <div>Available positions: {availablePositions.length > 0 ? availablePositions.join(', ') : 'None'}</div>
        {usedPositions.length > 0 && (
          <div>Used positions: {usedPositions.sort((a, b) => a - b).join(', ')}</div>
        )}
        <div className="text-orange-400">
          Note: Position determines display order (1 = first, {maxPosition} = last)
        </div>
      </div>

      {/* Validation errors */}
      {value && usedPositions.includes(value) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-2 py-1"
        >
          Position {value} is already used by another banner
        </motion.div>
      )}
      
      {value && (value < 1 || value > maxPosition) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded px-2 py-1"
        >
          Position must be between 1 and {maxPosition}
        </motion.div>
      )}
    </div>
  );
};
