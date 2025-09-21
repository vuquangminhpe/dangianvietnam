import { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { searchMoviesAdvanced } from "../../apis/movie.api";
import type { Movie, AdvancedSearchParams } from "../../types/Movie.type";
import MovieCard from "../../components/movies/MovieCard/MovieCard";

const AdvancedSearchPage = () => {
  const [urlSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams, setSearchParams] = useState<AdvancedSearchParams>({
    page: 1,
    limit: 12,
  });

  // Initialize search params from URL
  useEffect(() => {
    const urlQuery = urlSearchParams.get("q");
    if (urlQuery) {
      const initialParams = {
        q: urlQuery,
        page: 1,
        limit: 12,
      };
      setSearchParams(initialParams);
      handleSearch(initialParams, true);
    }
  }, [urlSearchParams]);

  const handleSearch = async (
    params?: AdvancedSearchParams,
    resetPage = true
  ) => {
    const searchData = params || searchParams;

    if (
      !searchData.q &&
      !searchData.genre &&
      !searchData.year &&
      !searchData.language
    ) {
      setMovies([]);
      return;
    }

    try {
      setLoading(true);
      const searchToUse = resetPage ? { ...searchData, page: 1 } : searchData;
      const response = await searchMoviesAdvanced(searchToUse);

      if (resetPage) {
        setMovies(response.result.movies);
        setCurrentPage(1);
        if (params) setSearchParams(params);
      } else {
        setMovies((prev) => [...prev, ...response.result.movies]);
      }

      setTotalResults(response.result.total);
      setTotalPages(response.result.total_pages);
    } catch (error) {
      console.error("Search failed:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchParams, true);
  };

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    const newParams = { ...searchParams, page: nextPage };
    setSearchParams(newParams);
    handleSearch(newParams, false);
  };

  const updateSearchParam = (key: keyof AdvancedSearchParams, value: any) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchParams({ page: 1, limit: 12 });
    setMovies([]);
    setTotalResults(0);
    setCurrentPage(1);
    setTotalPages(0);
  };

  const currentYear = new Date().getFullYear();
  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Thriller",
    "Romance",
    "Sci-Fi",
    "Fantasy",
    "Animation",
    "Adventure",
  ];
  const languages = ["English", "Việt Nam", "Korean", "Japanese", "Chinese"];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Advanced Search
          </h1>
          <p className="text-gray-400 text-lg">
            Find the perfect with our powerful search filters
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-6 mb-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit}>
            {/* Basic Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaSearch className="inline mr-2" />
                Search Query
              </label>
              <input
                type="text"
                placeholder="Search for event s..."
                value={searchParams.q || ""}
                onChange={(e) => updateSearchParam("q", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Advanced Filters */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaFilter className="mr-2" />
                Advanced Filters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <select
                    value={searchParams.genre || ""}
                    onChange={(e) => updateSearchParam("genre", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={currentYear + 5}
                    value={searchParams.year || ""}
                    onChange={(e) =>
                      updateSearchParam(
                        "year",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 2024"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={searchParams.language || ""}
                    onChange={(e) =>
                      updateSearchParam("language", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">All Languages</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration Min */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={searchParams.duration_min || ""}
                    onChange={(e) =>
                      updateSearchParam(
                        "duration_min",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 90"
                  />
                </div>

                {/* Duration Max */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={searchParams.duration_max || ""}
                    onChange={(e) =>
                      updateSearchParam(
                        "duration_max",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 180"
                  />
                </div>

                {/* Rating Min */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={searchParams.rating_min || ""}
                    onChange={(e) =>
                      updateSearchParam(
                        "rating_min",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 7.0"
                  />
                </div>

                {/* Rating Max */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={searchParams.rating_max || ""}
                    onChange={(e) =>
                      updateSearchParam(
                        "rating_max",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 10.0"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results */}
        {loading && movies.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
          </div>
        )}

        {totalResults > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Search Results ({totalResults} movies found)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movies.map((movie, index) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Loading..."
                    : `Load More (${movies.length}/${totalResults})`}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {!loading &&
          movies.length === 0 &&
          (searchParams.q || searchParams.genre || searchParams.year) && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Movies Found
              </h3>
              <p className="text-gray-400 text-lg">
                Try adjusting your search criteria or clearing some filters.
              </p>
            </motion.div>
          )}

        {!searchParams.q &&
          !searchParams.genre &&
          !searchParams.year &&
          !searchParams.language &&
          movies.length === 0 &&
          !loading && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Start Your Search
              </h3>
              <p className="text-gray-400 text-lg">
                Use the search form above to find movies that match your
                preferences.
              </p>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default AdvancedSearchPage;
