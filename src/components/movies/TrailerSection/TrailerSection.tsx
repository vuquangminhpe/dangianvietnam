import { useEffect, useState } from "react";
import VideoPlayer from "../../VideoPlayer";
import LazyImage from "../../ui/LazyImage";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Movie } from "../../../types";
import { getPopularMovies } from "../../../apis/movie.api";
import BlurCircle from "../../layout/BlurCircle";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bgImage from "../../../assets/Img_category/Giao dien home-01.png";

// Custom Arrow Components
const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-600 text-white rounded-full p-3 transition-colors duration-200 shadow-lg"
    aria-label="Previous"
  >
    <ChevronLeft className="w-6 h-6" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 z-10 bg-purple-600/80 hover:bg-purple-600 text-white rounded-full p-3 transition-colors duration-200 shadow-lg"
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
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const [getShowingMovies, setGetShowingMovies] = useState<Movie[]>([]);
  const [currentTrailer, setCurrentTrailer] = useState<string | undefined>(
    undefined
  );
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movies = await getPopularMovies(10, 1);
        setGetShowingMovies(movies);
        // Auto-select first movie's trailer on load
        if (movies.length > 0) {
          setCurrentTrailer(movies[0].trailer_url);
          setSelectedMovieId(movies[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch popular movies:", error);
      }
    };

    fetchData();
  }, []);

  const handleClickTrailer = (
    trailerUrl: string | undefined,
    movieId: string
  ) => {
    setCurrentTrailer(trailerUrl);
    setSelectedMovieId(movieId);

    // Scroll to video player after a short delay to ensure it's rendered
    setTimeout(() => {
      const trailerElement = document.getElementById("trailer-player");
      trailerElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div
      id="trailer-main"
      className="overflow-hidden"
    >
      <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20">
        <div className="text-center mb-12">
          <div className="group relative flex items-center justify-center">
          <h2
            className="text-4xl md:text-6xl font-extrabold text-gray-800 text-center tracking-wider transition-colors duration-200 cursor-pointer group-hover:text-red-500"
            style={{
              fontFamily: 'Merriweather, serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            ĐOẠN GIỚI THIỆU CÁC BUỔI BIỂU DIỄN
          </h2>
        </div>
      </div>

      {/* Video Player - Always visible */}
      {currentTrailer && (
        <div
          id="trailer-player"
          className="relative mt-6 mb-12"
        >
          <BlurCircle top="-100px" right="-100px" />
          <div className="mx-auto max-w-[960px] h-[540px] relative">
            <VideoPlayer
              src={currentTrailer}
              classNames="w-full h-full rounded-lg shadow-2xl"
              showGlow={true}
            />
          </div>
        </div>
      )}
      <div
        className="mt-10 max-w-6xl mx-auto overflow-visible px-4 relative"
      >
        <div className="relative px-16">
          <Slider {...settings}>
            {getShowingMovies.map((trailer) => {
              const isSelected = selectedMovieId === trailer._id;

              return (
                <div
                  key={trailer._id}
                  className="px-2"
                >
                  <div
                    className={`relative group cursor-pointer overflow-hidden rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-purple-500/80 shadow-lg"
                        : "hover:ring-1 hover:ring-purple-400/50 hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleClickTrailer(trailer.trailer_url, trailer._id)
                    }
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden rounded-lg h-64 md:h-72">
                      <LazyImage
                        src={trailer.poster_url}
                        alt={trailer.title}
                        className={`w-full h-full transition-opacity duration-200 ${
                          isSelected
                            ? "brightness-110"
                            : "brightness-90 group-hover:brightness-100"
                        }`}
                        width={300}
                        height={400}
                        loading="lazy"
                      />

                      {/* Simple Overlay */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-200 ${
                          isSelected
                            ? "bg-black/30"
                            : "bg-black/50"
                        }`}
                      />

                      {/* Selected Badge */}
                      {isSelected && (
                        <div
                          className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg"
                        >
                          Playing
                        </div>
                      )}
                    </div>

                    {/* Movie Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/70">
                      <h3
                        className={`text-sm md:text-base font-semibold transition-colors duration-200 ${
                          isSelected
                            ? "text-purple-200"
                            : "text-white group-hover:text-purple-200"
                        }`}
                      >
                        {trailer.title}
                      </h3>
                      <p className="text-gray-300 text-xs mt-1 opacity-80">
                        Click to watch trailer
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>
      </div>

      {/* Background Section at the bottom - Full Width */}
      <div
        className="w-screen h-96 relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
        }}
      >
        {/* Optional overlay for better visual effect */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </div>
  );
};

export default TrailerSection;
