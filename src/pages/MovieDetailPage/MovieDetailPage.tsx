/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import type { Movie } from "../../types/Movie.type";
import type { Showtime } from "../../types/Showtime.type";
import type { GetTheatersResponse } from "../../types/Theater.type";
import { getMovieById } from "../../apis/movie.api";
import { getShowtimeByMovieIdAndTheaterId, getTheatersWithShowtimes } from "../../apis/showtime.api";
import { useAuthAction } from "../../hooks/useAuthAction";
import LoginModal from "../../components/user/LoginModal";
import ReactPlayer from "react-player";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MovieInfo from "./components/MovieInfo";
import MovieFeedbackSection from "../../components/movie/MovieFeedbackSection";

type SelectedInfo = {
  movieId: string;
  theaterId: string | null;
  showtimeId: string | null;
  screenId: string | null;
  rating: number;
  comment: string;
};

export default function MovieDetailsPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [theater, setTheater] = useState<GetTheatersResponse | null>(null);
  const [isLoadingTheaters, setIsLoadingTheaters] = useState(false);
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);
  const navigate = useNavigate();
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthAction();
  const [isPlayTrailer, setIsPlayTrailer] = useState(false);

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo>({
    movieId: id,
    theaterId: null,
    showtimeId: null,
    screenId: null,
    rating: 0,
    comment: "",
  });

  // Remove mock feedbacks - now handled by MovieFeedbackSection
  let userId: string | null = null;
  try {
    const authStorage = localStorage.getItem("auth-storage");
    userId = authStorage ? JSON.parse(authStorage).state.user._id : null;
  } catch {
    userId = null;
  }

  useEffect(() => {
    localStorage.setItem("selected-movie-info", JSON.stringify(selectedInfo));
  }, [selectedInfo]);

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      try {
        const movieData = await getMovieById(id);
        setMovie(movieData as any);
      } catch {
        setMovie(null);
      }
    };

    const fetchTheater = async () => {
      try {
        setIsLoadingTheaters(true);
        // Lấy các rạp có lịch chiếu cho phim này
        const theaterData = await getTheatersWithShowtimes(id);
        setTheater(theaterData);
        const firstId = theaterData.result?.theaters?.[0]?._id;
        if (firstId) {
          setSelectedInfo((prev) => ({
            ...prev,
            theaterId: firstId,
          }));
          fetchShowtimesByTheater(firstId);
        }
      } catch {
        setTheater(null);
      } finally {
        setIsLoadingTheaters(false);
      }
    };

    const stored = localStorage.getItem("selected-movie-info");
    if (stored) {
      const data = JSON.parse(stored);
      setSelectedInfo({
        movieId: id,
        theaterId: data.theaterId || null,
        showtimeId: data.showtimeId || null,
        screenId: data.screenId || null,
        rating: data.rating || 0,
        comment: data.comment || "",
      });
    }

    fetchMovie();
    fetchTheater();
  }, [id]);

  const fetchShowtimesByTheater = async (theaterId: string) => {
    try {
      setIsLoadingShowtimes(true);
      const data = await getShowtimeByMovieIdAndTheaterId(id, theaterId);
      setShowtimes(data);
    } catch {
      setShowtimes([]);
    } finally {
      setIsLoadingShowtimes(false);
    }
  };

  const handleBookSeats = () => {
    requireAuth(() => {
      if (
        selectedInfo.theaterId &&
        selectedInfo.showtimeId &&
        selectedInfo.screenId
      ) {
        navigate(`/movies/${id}/${selectedInfo.screenId}`);
      }
    });
  };

  // Remove old handleSubmitFeedback - now handled by MovieFeedbackSection

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading movie information...</p>
        </div>
      </div>
    );
  }

  // Motion variants
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-primary/40 to-slate-900 text-gray-300 overflow-x-hidden">
      {/* Background Elements - matching your design theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 px-6 md:px-16 lg:px-24 xl:px-44 pt-20 pb-20">
        {/* Movie Info Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 bg-white/10 backdrop-blur-lg p-6 rounded-3xl 
          shadow-xl border border-white/20 mb-10 mt-10"
        >
          <motion.div variants={fadeUp} className="flex flex-col items-center">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="rounded-lg w-full shadow-2xl border border-white/10"
            />

            {/* Play Trailer Button */}
            {movie.trailer_url && (
              <motion.button
                onClick={() => setIsPlayTrailer(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white 
                         font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all
                         flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Watch Trailer
              </motion.button>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="md:col-span-2">
            <MovieInfo
              movie={movie}
              theater={theater}
              selectedInfo={selectedInfo}
              setSelectedInfo={setSelectedInfo}
              showtimes={showtimes}
              fetchShowtimesByTheater={fetchShowtimesByTheater}
              handleBookSeats={handleBookSeats}
              userId={userId}
              isLoadingTheaters={isLoadingTheaters}
              isLoadingShowtimes={isLoadingShowtimes}
            />
          </motion.div>
        </motion.div>

        {/* Feedback Section - New integrated component */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10"
        >
          <MovieFeedbackSection
            movieId={id}
            movieTitle={movie.title}
            moviePoster={movie.poster_url}
          />
        </motion.div>
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal isFormOpen={setShowLoginModal} />}

      {/* Trailer Modal */}
      {isPlayTrailer && movie.trailer_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 
                   flex items-center justify-center p-4"
          onClick={() => setIsPlayTrailer(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-5xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPlayTrailer(false)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-xl
                       w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center
                       hover:bg-white/20 transition-colors z-10"
            >
              ✕
            </button>

            <div className="w-full h-0 pb-[56.25%] relative rounded-lg overflow-hidden border border-white/20">
              <ReactPlayer
                url={movie.trailer_url}
                controls={true}
                playing={true}
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
