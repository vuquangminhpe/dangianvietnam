import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { getCountryDisplay } from "../../../const/language";
import type { Movie } from "../../../types/Movie.type";
import CastList from "./CastList";
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
};

export default function MovieInfo({
  movie,
  selectedInfo,
  setSelectedInfo,
  theater,
  showtimes,
  fetchShowtimesByTheater,
  handleBookSeats,
  userId,
  isLoadingTheaters,
  isLoadingShowtimes,
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
          Release:{" "}
          {new Date(movie.release_date).toLocaleDateString("vi-VN")}
        </motion.p>
        <motion.p variants={fadeUp} custom={4} className="mb-1">
          Duration: {movie.duration} phút
        </motion.p>
        <motion.p variants={fadeUp} custom={5} className="mb-1">
          Genre:{" "}
          {movie.genre
            .map((genre: any) =>
              typeof genre === "string" ? genre : genre.name
            )
            .join(", ")}
        </motion.p>

        <motion.div
          variants={fadeUp}
          custom={6}
          className="flex items-center mb-2"
        >
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`mr-1 ${
                i < Math.round((movie.average_rating || 0) / 2)
                  ? "text-yellow-400"
                  : "text-gray-600"
              }`}
            />
          ))}
          <span className="ml-2">({movie.average_rating}/10)</span>
          <span className="ml-2 text-sm text-gray-400">
            ({movie.ratings_count} rating)
          </span>
        </motion.div>

        <motion.p variants={fadeUp} custom={7} className="mb-4">
          {movie.description}
        </motion.p>

        <motion.div variants={fadeUp} custom={8}>
          <CastList movie={movie} />
        </motion.div>

        <motion.div variants={fadeUp} custom={9}>
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

        <motion.div
          variants={fadeUp}
          custom={10}
          className="mt-4 flex justify-end"
        >
          {userId ? (
            <button
              onClick={handleBookSeats}
              disabled={!selectedInfo.showtimeId}
              className="px-4 py-2 text-xs text-white bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              className="px-4 py-2 text-xs text-white bg-red-500  transition rounded-full font-medium"
              disabled
            >
              Log in to booking
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
