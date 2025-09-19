/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { getCountryDisplay } from "../../../const/language";
import type { Movie } from "../../../types/Movie.type";
import type { GetTheatersResponse } from "../../../types/Theater.type";
import type { Showtime } from "../../../types/Showtime.type";
import TheaterShowtime from "./TheaterShowtime";

type Props = {
  movie: Movie;
  selectedInfo: any;
  setSelectedInfo: (val: any) => void;
  theater: GetTheatersResponse | null;
  showtimes: Showtime[];
  fetchShowtimesByTheater: (id: string) => void;
  handleBookSeats: () => void;
  userId?: string | null;
  isLoadingTheaters: boolean;
  isLoadingShowtimes: boolean;
  setIsPlayTrailer: (boolean: true) => void;
};

export default function MovieInfo({
  movie,
  selectedInfo,
  setSelectedInfo,
  theater,
  showtimes,
  fetchShowtimesByTheater,

  isLoadingTheaters,
  isLoadingShowtimes,
  setIsPlayTrailer,
}: Props) {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div>
      <motion.div
        className="md:col-span-2"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        <motion.h1
          variants={fadeUp}
          custom={0}
          className="text-4xl font-bold mb-2"
        >
          {movie.title}
        </motion.h1>

        <motion.p variants={fadeUp} custom={1} className="mb-1">
          Director: {movie.director}
        </motion.p>
        <motion.p variants={fadeUp} custom={2} className="mb-1">
          Language: {getCountryDisplay(movie.language)}
        </motion.p>
        <motion.p variants={fadeUp} custom={3} className="mb-1">
          Release: {new Date(movie.release_date).toLocaleDateString("vi-VN")}
        </motion.p>
        <motion.p variants={fadeUp} custom={4} className="mb-1">
          Duration: {movie.duration} phút
        </motion.p>
        {movie.trailer_url && (
          <motion.button
            onClick={() => setIsPlayTrailer(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white 
                                 font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all
                                 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Watch Trailer
          </motion.button>
        )}

        <motion.div variants={fadeUp} custom={9} className="mt-10">
          <TheaterShowtime
            theater={theater}
            selectedInfo={selectedInfo}
            setSelectedInfo={setSelectedInfo}
            showtimes={showtimes}
            fetchShowtimesByTheater={fetchShowtimesByTheater}
            isLoadingTheaters={isLoadingTheaters}
            isLoadingShowtimes={isLoadingShowtimes}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
