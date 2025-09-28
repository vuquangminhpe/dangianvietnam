import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  classNames?: string;
  autoPlay?: boolean;
  showGlow?: boolean;
}
//Check video player
const VideoPlayer = ({
  src,
  classNames,
  autoPlay = true,
  showGlow = true,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      // Add event listeners
      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => setIsLoading(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener("loadstart", handleLoadStart);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
        });

        return () => {
          hls.destroy();
          video.removeEventListener("loadstart", handleLoadStart);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("play", handlePlay);
          video.removeEventListener("pause", handlePause);
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }

      return () => {
        video.removeEventListener("loadstart", handleLoadStart);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }
  }, [src]);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${classNames}`}
    >
      {/* Animated Border Gradient */}
      {/* <div className="absolute inset-0 rounded-2xl">
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            background: [
              "linear-gradient(45deg, #8B5CF6, #EC4899, #F59E0B, #8B5CF6)",
              "linear-gradient(135deg, #EC4899, #F59E0B, #8B5CF6, #EC4899)", 
              "linear-gradient(225deg, #F59E0B, #8B5CF6, #EC4899, #F59E0B)",
              "linear-gradient(315deg, #8B5CF6, #EC4899, #F59E0B, #8B5CF6)"
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            padding: '3px',
            backgroundSize: '300% 300%'
          }}
        >
          <div className="w-full h-full bg-gray-900 rounded-2xl"></div>
        </motion.div>
      </div> */}

      {/* Glow Effect */}
      {showGlow && (
        // <>
        //   <motion.div
        //     className="absolute -inset-2 rounded-2xl opacity-50 blur-xl"
        //   />

        //   {/* Pulse effect when playing */}
        //   {isPlaying && (
        //     <motion.div
        //       className="absolute -inset-4 rounded-2xl opacity-30"
        //     />
        //   )}
        // </>
        <></>
      )}

      {/* Video Container */}
      <div className="relative z-10 p-1">
        <motion.div
          className="relative rounded-xl overflow-hidden bg-black"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
              />
            </motion.div>
          )}

          {/* Corner Accents */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-lg z-30"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-lg z-30"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-lg z-30"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-lg z-30"></div>

          {/* Video Element */}
          <video
            ref={videoRef}
            controls
            autoPlay={autoPlay}
            className="w-full h-auto rounded-xl relative z-10"
            style={{ display: "block" }}
          />
        </motion.div>
      </div>

      {/* Floating Particles */}
      {showGlow && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              animate={{
                x: [
                  Math.random() * 100 + "%",
                  Math.random() * 100 + "%",
                  Math.random() * 100 + "%",
                ],
                y: [
                  Math.random() * 100 + "%",
                  Math.random() * 100 + "%",
                  Math.random() * 100 + "%",
                ],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default VideoPlayer;
