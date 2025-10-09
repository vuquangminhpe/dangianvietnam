import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
}

const ImagePreloader = ({ images }: ImagePreloaderProps) => {
  useEffect(() => {
    const preloadImages = () => {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
        // Optionally set loading priority
        img.loading = 'eager';
      });
    };

    // Preload after a short delay to not block initial render
    const timeoutId = setTimeout(preloadImages, 100);
    
    return () => clearTimeout(timeoutId);
  }, [images]);

  return null; // This component doesn't render anything
};

export default ImagePreloader;