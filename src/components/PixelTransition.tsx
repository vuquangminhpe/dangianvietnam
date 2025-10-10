
import React, { useRef, useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';

type PixelTransitionProps = {
  firstContent: ReactNode;
  secondContent: ReactNode;
  className?: string;
  style?: CSSProperties;
  aspectRatio?: string;
};

const PixelTransition: React.FC<PixelTransitionProps> = ({
  firstContent,
  secondContent,
  className = '',
  style = {},
  aspectRatio = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);

  const [isActive, setIsActive] = useState<boolean>(false);

  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  // Bỏ tạo pixel grid, không cần hiệu ứng pixel nữa

  // Chuyển ngay sang secondContent không hiệu ứng pixel
  const animatePixels = (activate: boolean): void => {
    setIsActive(activate);
    const activeEl = activeRef.current;
    if (!activeEl) return;
    activeEl.style.display = activate ? 'block' : 'none';
    activeEl.style.pointerEvents = activate ? 'auto' : 'none';
  };

  const handleMouseEnter = (): void => {
    if (!isActive) animatePixels(true);
  };
  const handleMouseLeave = (): void => {
    if (isActive) animatePixels(false);
  };
  const handleClick = (): void => {
    animatePixels(!isActive);
  };

  return (
    <div
      ref={containerRef}
      className={`
        ${className}
        bg-[#222]
        text-white
        rounded-[15px]
        border-2
        border-white
        w-[300px]
        max-w-full
        relative
        overflow-hidden
      `}
      style={style}
      onMouseEnter={!isTouchDevice ? handleMouseEnter : undefined}
      onMouseLeave={!isTouchDevice ? handleMouseLeave : undefined}
      onClick={isTouchDevice ? handleClick : undefined}
    >
      <div style={{ paddingTop: aspectRatio }} />

      <div className="absolute inset-0 w-full h-full">{firstContent}</div>

      <div ref={activeRef} className="absolute inset-0 w-full h-full z-[2]" style={{ display: 'none' }}>
        {secondContent}
      </div>

  {/* Không render pixel grid nữa */}
    </div>
  );
};

export default PixelTransition;
