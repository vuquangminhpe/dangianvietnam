/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import type { Movie } from "../../types/Movie.type";
import type { Showtime } from "../../types/Showtime.type";
import type { GetTheatersResponse } from "../../types/Theater.type";
import { getMovieById } from "../../apis/movie.api";
import {
  getShowtimeByMovieIdAndTheaterId,
  getTheatersWithShowtimes,
} from "../../apis/showtime.api";
import { useAuthAction } from "../../hooks/useAuthAction";
import { useAuthStore } from "../../store/useAuthStore";
import LoginModal from "../../components/user/LoginModal";
import ReactPlayer from "react-player";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MovieInfo from "./components/MovieInfo";
import MovieFeedbackSection from "../../components/movie/MovieFeedbackSection";
import CastList from "./components/CastList";
import { getCountryDisplay } from "../../const/language";

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
  const navigate = useNavigate();
  const { showLoginModal, setShowLoginModal } = useAuthAction();
  const { isAuthenticated } = useAuthStore();

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
        // Lấy các rạp có lịch chiếu cho Buổi biểu diễn này
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
      const data = await getShowtimeByMovieIdAndTheaterId(id, theaterId);
      setShowtimes(data);
    } catch {
      setShowtimes([]);
    }
  };

  // Remove old handleSubmitFeedback - now handled by MovieFeedbackSection

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading information...</p>
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
    <div className="min-h-screen">
      {/* Phần trên - Movie Info Section với background đen */}
      <div className="bg-zinc-900 text-gray-300">
       <div className="z-10 px-6 md:px-16 lg:px-24 xl:px-44 pt-20 pb-10">
  {/* Movie Info Section */}
  <motion.div
    variants={container}
    initial="hidden"
    animate="visible"
    // UPDATE: Giữ nguyên flex-col cho mobile, chuyển sang flex-row trên desktop
    className="flex flex-col md:flex-row gap-0 mb-10 mt-10"
  >
    {/* ===== PHẦN BÊN TRÁI - THÔNG TIN PHIM ===== */}
    <motion.div
      // UPDATE: Chiếm toàn bộ chiều rộng trên mobile, 1/3 trên desktop
      className="flex flex-col items-center w-full md:w-1/3"
    >
      <div
        // UPDATE: Bỏ kích thước cố định, thay bằng kích thước responsive
        // Bỏ ml-10 để không bị lệch trên mobile
        // Thay đổi bo góc và hiệu ứng lỗ tròn cho từng màn hình
        className="bg-[#fff4e6] p-6 shadow-xl w-full 
                   min-h-[450px] md:h-[500px] relative
                   rounded-t-3xl md:rounded-l-3xl md:rounded-r-none
                   
                   before:hidden md:before:block before:content-[''] before:absolute before:-top-[30px] before:-right-[30px] before:w-[60px] before:h-[60px] before:bg-[#18181b] before:rounded-full
                   after:hidden md:after:block after:content-[''] after:absolute after:-bottom-[30px] after:-right-[30px] after:w-[60px] after:h-[60px] after:bg-[#18181b] after:rounded-full"
      >
        <MovieInfo
          movie={movie}
          theater={theater}
          selectedInfo={selectedInfo}
          setSelectedInfo={setSelectedInfo}
          showtimes={showtimes}
          isAuthenticated={isAuthenticated}
          userId={userId}
          navigate={navigate}
          setShowLoginModal={setShowLoginModal}
        />
      </div>
    </motion.div>

    {/* ===== ĐƯỜNG KẺ ĐỨT Ở GIỮA ===== */}
    {/* Giữ nguyên, chỉ hiển thị trên desktop */}
    <div className="hidden md:flex items-center justify-center -ml-px relative z-10">
      <div className="h-[440px] border-l-4 border-dashed border-gray-400"></div>
    </div>

    {/* ===== PHẦN BÊN PHẢI - POSTER PHIM ===== */}
    <motion.div
      // UPDATE: Chiếm toàn bộ chiều rộng trên mobile, 2/3 trên desktop
      className="w-full md:w-2/3"
    >
      <div
        // UPDATE: Thay đổi chiều cao và bo góc cho responsive
        className="bg-[#fff4e6] shadow-xl relative 
                   h-[350px] md:h-[500px]
                   rounded-b-3xl md:rounded-r-3xl md:rounded-l-none

                   before:hidden md:before:block before:content-[''] before:absolute before:-top-[30px] before:-left-[30px] before:w-[60px] before:h-[60px] before:bg-[#18181b] before:rounded-full
                   after:hidden md:after:block after:content-[''] after:absolute after:-bottom-[30px] after:-left-[30px] after:w-[60px] after:h-[60px] after:bg-[#18181b] after:rounded-full"
        style={{
          backgroundImage: `url(${movie.poster_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Nội dung trống, chỉ dùng làm nền */}
      </div>
    </motion.div>
  </motion.div>
</div>
      </div>

      {/* Phần dưới - Cast và Feedback Section với background trắng */}
      <div className="bg-white text-gray-800">
        <div className="z-10 px-6 md:px-16 lg:px-24 xl:px-44 pt-10 pb-20">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="gap-6 bg-zinc-900 p-6 rounded-3xl 
            shadow-xl border border-gray-200 mb-10"
          >
            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-3 items-center"
            ></motion.div>
            <motion.p variants={fadeUp} custom={1} className="mb-1 text-gray-300">
              Tác giả: {movie.director}
            </motion.p>
            <motion.p variants={fadeUp} custom={2} className="mb-1 text-gray-300">
              Đạo diễn: {getCountryDisplay(movie.language)}
            </motion.p>
            <motion.div variants={fadeUp} custom={8}>
              <CastList movie={movie} />
            </motion.div>
            <motion.p variants={fadeUp} custom={7} className="mb-4 text-gray-400">
              {movie.description}
            </motion.p>
          </motion.div>
          
          {/* Feedback Section - New integrated component */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-zinc-900 rounded-3xl p-8 border border-gray-200"
          >
            <MovieFeedbackSection
              movieId={id}
              movieTitle={movie.title}
              moviePoster={movie.poster_url}
            />
          </motion.div>
        </div>
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
