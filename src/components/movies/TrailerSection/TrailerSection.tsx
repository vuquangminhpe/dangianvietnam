import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import VideoPlayer from "../../VideoPlayer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Movie } from "../../../types";
import { getPopularMovies } from "../../../apis/movie.api";
import BlurCircle from "../../layout/BlurCircle";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Custom Arrow Components
const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-600 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
    aria-label="Previous"
  >
    <ChevronLeft className="w-6 h-6" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-600 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm"
    aria-label="Next"
  >
    <ChevronRight className="w-6 h-6" />
  </button>
);

const TrailerSection = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 2,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };
  const [getShowingMovies, setGetShowingMovies] = useState<Movie[]>([]);
  const [currentTrailer, setCurrentTrailer] = useState<string | undefined>(
    undefined
  );
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movies = await getPopularMovies(10, 1);
        setGetShowingMovies(movies);
        // Removed auto-selection of trailer and movie
      } catch (error) {
        console.error("Failed to fetch popular movies:", error);
      }
    };

    fetchData();
  }, []);

  const handleClickTrailer = (trailerUrl: string | undefined, movieId: string) => {
    setCurrentTrailer(trailerUrl);
    setSelectedMovieId(movieId);
    setShowVideoPlayer(true);

    // Scroll to video player after a short delay to ensure it's rendered
    setTimeout(() => {
      const trailerElement = document.getElementById("trailer-player");
      trailerElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div id="trailer-main" className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Movie Trailers
        </h2>
        <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
          Click on any movie below to watch its trailer
        </p>
      </motion.div>

      {/* Video Player - Only show when a trailer is selected */}
      {showVideoPlayer && currentTrailer && (
        <motion.div 
          id="trailer-player"
          className="relative mt-6 mb-12"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <BlurCircle top="-100px" right="-100px" />
          <div className="mx-auto max-w-[960px] h-[540px] relative">
            <VideoPlayer 
              src={currentTrailer} 
              classNames="w-full h-full rounded-lg shadow-2xl"
              showGlow={true}
            />
            {/* Close button */}
            <button
              onClick={() => setShowVideoPlayer(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-200 z-10"
              aria-label="Close video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-10 max-w-6xl mx-auto overflow-visible px-4 relative"
      >
        <div className="relative px-16">
          <Slider {...settings}>
          {getShowingMovies.map((trailer, index) => {
            const isSelected = selectedMovieId === trailer._id;
            
            return (
              <motion.div
                key={trailer._id}
                className="px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <motion.div
                  className={`relative group cursor-pointer overflow-hidden rounded-lg transition-all duration-300 ${
                    isSelected 
                      ? 'ring-2 ring-purple-500/80 shadow-lg shadow-purple-500/25 scale-105' 
                      : 'hover:ring-1 hover:ring-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-102'
                  }`}
                  onClick={() => handleClickTrailer(trailer.trailer_url, trailer._id)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Selected Glow Effect */}
                  {isSelected && (
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 rounded-lg blur-sm"
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-lg h-64 md:h-72">
                    <motion.img
                      src={trailer.poster_url}
                      alt={trailer.title}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isSelected 
                          ? 'brightness-110 saturate-110' 
                          : 'brightness-90 group-hover:brightness-100 group-hover:saturate-110'
                      }`}
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-gradient-to-t from-purple-900/40 via-transparent to-transparent' 
                        : 'bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-purple-900/30'
                    }`} />

                    {/* Selected Badge */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg"
                      >
                        Playing
                      </motion.div>
                    )}

                  </div>

                  {/* Movie Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <h3 className={`text-sm md:text-base font-semibold transition-colors duration-300 ${
                      isSelected ? 'text-purple-200' : 'text-white group-hover:text-purple-200'
                    }`}>
                      {trailer.title}
                    </h3>
                    <p className="text-gray-300 text-xs mt-1 opacity-80">
                      Click to watch trailer
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </Slider>
        </div>
      </motion.div>
    </div>
  );
};

export default TrailerSection;
