import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  placeholderSrc = '/logo.png',
  onError,
  style,
  loading = 'lazy'
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setImageSrc(placeholderSrc);
        setIsLoaded(true);
      };
      
      // Optimize image URL for better performance
      let optimizedSrc = src;
      if (width && height) {
        // Add resize parameters if the image service supports it
        const hasQuery = src.includes('?');
        optimizedSrc = `${src}${hasQuery ? '&' : '?'}w=${width}&h=${height}&fit=cover&auto=format,compress`;
      }
      
      img.src = optimizedSrc;
    }
  }, [isInView, src, placeholderSrc, width, height]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageSrc(placeholderSrc);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        } w-full h-full object-cover`}
        style={{
          ...(width && { width: `${width}px` }),
          ...(height && { height: `${height}px` }),
        }}
      />
      
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;