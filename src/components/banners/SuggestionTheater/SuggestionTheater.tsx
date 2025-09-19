import { BsArrowRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPopularMovies } from "../../../apis/movie.api";
import type { Movie } from "../../../types";
import MovieCard from "../../movies/MovieCard/MovieCard";

const SuggestionTheater = () => {
  const navigate = useNavigate();

  const [getShowingMovies, setGetShowingMovies] = useState<Movie[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMaxMovie, setIsMaxMovie] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const movies = await getPopularMovies(4, pages);
        if (!ignore) {
          setGetShowingMovies((prev) => [...prev, ...movies]);
          // Kiểm tra nếu số lượng phim trả về ít hơn limit hoặc không có phim nào
          if (movies.length < 4) {
            setIsMaxMovie(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch popular movies:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [pages]);
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div className="relative flex items-center justify-between pt-20 pb-10">
        <p className="text-gray-300 font-medium text-lg">Theater Near By</p>
        <button
          onClick={() => navigate("/movies")}
          className="group flex items-center gap-2 text-sm text-gray-300 hover:text-gray-400 cursor-pointer"
        >
          View All
          <BsArrowRight
            className="group-hover:translate-x-0.5 transition
                w-4.5 h-4.5"
          />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mt-8">
        {getShowingMovies?.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          disabled={loading || isMaxMovie}
          onClick={() => setPages(pages + 1)}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull
    transition rounded-md font-medium cursor-pointer disabled:opacity-50"
        >
          {loading ? "Loading..." : "Show more"}
        </button>
      </div>
    </div>
  );
};

export default SuggestionTheater;
