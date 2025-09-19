import { BiStar } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import type { Movie } from "../../../types";
import { formatGenres } from "../../../utils/format";

type MovieCardProps = {
  movie: Movie;
  onBookTicket?: (movieId: string) => void; // Optional callback for booking tickets
};

const MovieCard = ({ movie }: MovieCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col h-full bg-gray-800 rounded-2xl
    hover:-translate-y-1 transition duration-300 w-full mx-auto overflow-hidden"
    >
      {/* Poster Section - Fixed aspect ratio */}
      <div className="aspect-[2/3] overflow-hidden rounded-t-2xl">
        <img
          onClick={() => {
            navigate(`/movies/${movie._id}`);
            scrollTo(0, 0);
          }}
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/logo.png'; // fallback image
          }}
        />
      </div>
      
      {/* Content Section - Responsive height */}
      <div className="flex flex-col justify-between p-3 h-[140px] sm:h-[150px] md:h-[140px]">
        {/* Title - Fixed height with ellipsis */}
        <div className="h-[45px] sm:h-[50px] flex items-start">
          <h3 className="font-semibold text-white leading-tight line-clamp-2 text-sm sm:text-base md:text-sm">
            {movie.title}
          </h3>
        </div>

        {/* Movie Info - Fixed height */}
        <div className="h-[40px] sm:h-[45px] flex items-start">
          <p className="text-xs sm:text-sm md:text-xs text-gray-400 line-clamp-2 leading-tight">
            {new Date(movie.release_date).getFullYear()} | {formatGenres(movie.genre)}{" "}
            | {movie.duration} mins
          </p>
        </div>

        {/* Action Section - Fixed height */}
        <div className="flex items-center justify-between h-[35px] sm:h-[40px]">
          <button
            onClick={() => {
              navigate(`/movies/${movie._id}`);
              scrollTo(0, 0);
            }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-primary hover:bg-primary-dull 
          transition rounded-full font-medium cursor-pointer flex-shrink-0"
          >
            <span className="hidden sm:inline">Buy Tickets</span>
            <span className="sm:hidden">Buy</span>
          </button>

          <p className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <BiStar className="w-3 h-3 text-primary fill-primary" />
            {movie.average_rating > 0 ? movie.average_rating.toFixed(1) : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
