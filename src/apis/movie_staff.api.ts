import axios from 'axios';
import { getAuthToken } from './user.api';

const BASE_URL = 'https://bookmovie-5n6n.onrender.com';

// Create authenticated axios instance for staff requests
const createStaffRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Handle staff API errors
const handleStaffError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    if (status === 401) {
      throw new Error('Unauthorized. Please login as staff.');
    } else if (status === 403) {
      throw new Error('Access denied. Staff privileges required.');
    } else if (status === 404) {
      throw new Error(message || 'Resource not found.');
    } else if (status === 400) {
      throw new Error(message || 'Invalid request data.');
    } else if (status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(message || 'Request failed.');
    }
  }
  throw new Error('Network error. Please check your connection.');
};

// ===============================
// MOVIE TYPES
// ===============================

export interface MovieCast {
  id: number;
  name: string;
  character: string;
  order: number;
  profile_image: string;
  gender: number;
}

export interface MovieStatistics {
  ratings_count: number;
  feedbacks_count: number;
  showtimes_count: number;
}

export interface StaffMovie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  language: string;
  release_date: string;
  director: string;
  cast?: MovieCast[];
  poster_url: string;
  trailer_url?: string;
  status: 'now_showing' | 'coming_soon' | 'ended';
  average_rating: number;
  ratings_count: number;
  is_featured: boolean;
  statistics?: MovieStatistics;
  created_at: string;
  updated_at: string;
}

export interface MovieSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  genre?: string;
  language?: string;
  status?: 'now_showing' | 'coming_soon' | 'ended';
}

export interface MovieSearchResponse {
  message: string;
  result: {
    movies: StaffMovie[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface MovieDetailResponse {
  message: string;
  result: StaffMovie;
}

export interface PopularMoviesResponse {
  message: string;
  result: {
    movies: StaffMovie[];
  };
}

// ===============================
// MOVIE SEARCH APIS
// ===============================

/**
 * Search for available movies in the system for creating showtimes
 * @param params - Search parameters
 */
export const searchAvailableMovies = async (params: MovieSearchParams = {}): Promise<MovieSearchResponse> => {
  try {
    const staffApi = createStaffRequest();
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.limit || 10
    };
    
    if (params.search) queryParams.search = params.search;
    if (params.genre) queryParams.genre = params.genre;
    if (params.language) queryParams.language = params.language;
    if (params.status) queryParams.status = params.status;
    
    const response = await staffApi.get('/staff/movies/search', { params: queryParams });
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

/**
 * Get popular movies for reference
 * @param limit - Number of movies to return (default: 10)
 */
export const getPopularMovies = async (limit: number = 10): Promise<PopularMoviesResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get('/staff/movies/popular', { 
      params: { limit } 
    });
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

/**
 * Get detailed information about a specific movie
 * @param movieId - The ID of the movie
 */
export const getMovieById = async (movieId: string): Promise<MovieDetailResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get(`/staff/movies/${movieId}`);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// ===============================
// MOVIE HELPER FUNCTIONS
// ===============================

/**
 * Validate movie status
 * @param status - Status to validate
 */
export const isValidMovieStatus = (status: string): status is 'now_showing' | 'coming_soon' | 'ended' => {
  return ['now_showing', 'coming_soon', 'ended'].includes(status);
};

/**
 * Get movie status display text
 * @param status - Movie status
 */
export const getMovieStatusDisplay = (status: string): string => {
  switch (status) {
    case 'now_showing':
      return 'Now Showing';
    case 'coming_soon':
      return 'Coming Soon';
    case 'ended':
      return 'Ended';
    default:
      return status;
  }
};

/**
 * Get movie status color for UI
 * @param status - Movie status
 */
export const getMovieStatusColor = (status: string): string => {
  switch (status) {
    case 'now_showing':
      return 'bg-green-500/20 border-green-500/30 text-green-400';
    case 'coming_soon':
      return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    case 'ended':
      return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    default:
      return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
  }
};

/**
 * Format movie duration
 * @param duration - Duration in minutes
 */
export const formatMovieDuration = (duration: number): string => {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Format movie release date
 * @param dateString - ISO date string
 */
export const formatMovieReleaseDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get movie rating display
 * @param rating - Average rating
 * @param ratingsCount - Number of ratings
 */
export const getMovieRatingDisplay = (rating: number, ratingsCount: number): string => {
  if (ratingsCount === 0) {
    return 'No ratings';
  }
  return `${rating.toFixed(1)} (${ratingsCount} reviews)`;
};

/**
 * Check if movie is available for showtime creation
 * @param movie - Movie object
 */
export const isMovieAvailableForShowtime = (movie: StaffMovie): boolean => {
  return movie.status === 'now_showing' || movie.status === 'coming_soon';
};

/**
 * Get movie genres as comma-separated string
 * @param genres - Array of genre strings
 */
export const formatMovieGenres = (genres: string[]): string => {
  return genres.join(', ');
};

/**
 * Filter movies by genre
 * @param movies - Array of movies
 * @param genre - Genre to filter by
 */
export const filterMoviesByGenre = (movies: StaffMovie[], genre: string): StaffMovie[] => {
  return movies.filter(movie => 
    movie.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
  );
};

/**
 * Filter movies by language
 * @param movies - Array of movies
 * @param language - Language to filter by
 */
export const filterMoviesByLanguage = (movies: StaffMovie[], language: string): StaffMovie[] => {
  return movies.filter(movie => 
    movie.language.toLowerCase().includes(language.toLowerCase())
  );
};

/**
 * Sort movies by rating (descending)
 * @param movies - Array of movies
 */
export const sortMoviesByRating = (movies: StaffMovie[]): StaffMovie[] => {
  return [...movies].sort((a, b) => b.average_rating - a.average_rating);
};

/**
 * Sort movies by release date (newest first)
 * @param movies - Array of movies
 */
export const sortMoviesByReleaseDate = (movies: StaffMovie[]): StaffMovie[] => {
  return [...movies].sort((a, b) => 
    new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
  );
};

/**
 * Search movies by title
 * @param movies - Array of movies
 * @param searchTerm - Search term
 */
export const searchMoviesByTitle = (movies: StaffMovie[], searchTerm: string): StaffMovie[] => {
  const term = searchTerm.toLowerCase();
  return movies.filter(movie => 
    movie.title.toLowerCase().includes(term)
  );
};

/**
 * Get all unique genres from movies array
 * @param movies - Array of movies
 */
export const getUniqueGenres = (movies: StaffMovie[]): string[] => {
  const genresSet = new Set<string>();
  movies.forEach(movie => {
    movie.genre.forEach(genre => genresSet.add(genre));
  });
  return Array.from(genresSet).sort();
};

/**
 * Get all unique languages from movies array
 * @param movies - Array of movies
 */
export const getUniqueLanguages = (movies: StaffMovie[]): string[] => {
  const languagesSet = new Set<string>();
  movies.forEach(movie => {
    languagesSet.add(movie.language);
  });
  return Array.from(languagesSet).sort();
};

/**
 * Calculate movie popularity score based on ratings and feedback
 * @param movie - Movie object
 */
export const calculateMoviePopularityScore = (movie: StaffMovie): number => {
  const ratingWeight = 0.7;
  const feedbackWeight = 0.3;
  
  const normalizedRating = movie.average_rating / 10; // Normalize to 0-1
  const normalizedFeedback = movie.statistics 
    ? Math.min(movie.statistics.feedbacks_count / 1000, 1) // Cap at 1000 feedbacks
    : 0;
  
  return (normalizedRating * ratingWeight) + (normalizedFeedback * feedbackWeight);
};

/**
 * Get recommended movies for showtime creation
 * @param movies - Array of all movies
 * @param limit - Number of recommendations to return
 */
export const getRecommendedMoviesForShowtime = (movies: StaffMovie[], limit: number = 5): StaffMovie[] => {
  return movies
    .filter(isMovieAvailableForShowtime)
    .map(movie => ({
      ...movie,
      popularityScore: calculateMoviePopularityScore(movie)
    }))
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit)
    .map(({ popularityScore, ...movie }) => movie);
};

/**
 * Validate search parameters
 * @param params - Search parameters to validate
 */
export const validateSearchParams = (params: MovieSearchParams): string[] => {
  const errors: string[] = [];
  
  if (params.page && (params.page < 1 || !Number.isInteger(params.page))) {
    errors.push('Page must be a positive integer');
  }
  
  if (params.limit && (params.limit < 1 || params.limit > 100 || !Number.isInteger(params.limit))) {
    errors.push('Limit must be a positive integer between 1 and 100');
  }
  
  if (params.status && !isValidMovieStatus(params.status)) {
    errors.push('Invalid movie status');
  }
  
  if (params.search && params.search.trim().length === 0) {
    errors.push('Search term cannot be empty');
  }
  
  return errors;
};

/**
 * Build search query string for API request
 * @param params - Search parameters
 */
export const buildSearchQuery = (params: MovieSearchParams): string => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search.trim());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.genre) queryParams.append('genre', params.genre);
  if (params.language) queryParams.append('language', params.language);
  if (params.status) queryParams.append('status', params.status);
  
  return queryParams.toString();
};
