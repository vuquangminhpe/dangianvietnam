import { useQuery } from "@tanstack/react-query";
import { getMoviesByStatus, getPopularMovies } from "../../apis/movie.api";
import BlurCircle from "../../components/layout/BlurCircle";
import MovieCard from "../../components/movies/MovieCard/MovieCard";

const Movies = () => {
  const { data: moviesShowing } = useQuery({
    queryKey: ["moviesShowing"],
    queryFn: () => getPopularMovies(10, 1),
  });

  const { data: moviesIncoming } = useQuery({
    queryKey: ["moviesIncoming"],
    queryFn: () => getMoviesByStatus("coming_soon", 10),
  });

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-medium my-4">Now Showing</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {moviesShowing?.map((item) => (
              <MovieCard movie={item} key={item._id} />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-lg font-medium my-4">In Comming</h1>
          {moviesIncoming?.length !== 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {moviesIncoming?.map((item) => (
                <MovieCard movie={item} key={item._id} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <h1 className="text-3xl font-semibold text-center">
                No movies avaiable
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Movies;
