/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "../../ui/button";
import type { Movie } from "../../../types/Movie.type";
import MovieCard from "../MovieCard/MovieCard";

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  onBookTicket: (movieId: string) => void;
  searchTerm?: string;
  onResetFilters?: () => void;
}

export const MovieGrid = ({
  movies,
  isLoading,
  onBookTicket,
  searchTerm = "",
  onResetFilters,
}: MovieGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
          >
            <div className="w-full h-64 bg-gray-700"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="text-gray-400 text-lg mb-4">
          {searchTerm ? "Không tìm thấy phim nào" : "Chưa có phim nào"}
        </div>
        {onResetFilters && (
          <Button
            onClick={onResetFilters}
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
          >
            Xem tất cả phim
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie._id}
          movie={movie}
          onBookTicket={onBookTicket as any}
        />
      ))}
    </div>
  );
};
