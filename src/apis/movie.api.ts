import axios from "axios";
import type {
  Movie,
  CreateMovieRequest,
  UpdateMovieRequest,
  UpdateMovieFeatureRequest,
  MovieQueryParams,
  GetMoviesResponse,
  GetMovieByIdResponse,
  MovieResponse,
  AdvancedSearchParams,
  AdvancedSearchResponse,
} from "../types/Movie.type";
import { getAuthToken } from "./user.api";
import type { SuccessResponse } from "../types";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

// Create authenticated axios instance for movie requests
const createMovieRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Create public axios instance for public movie endpoints
const createPublicMovieRequest = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Handle movie API errors
const handleMovieError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login.");
    } else if (status === 403) {
      throw new Error("Access denied. Insufficient privileges.");
    } else if (status === 404) {
      throw new Error(message || "Movie not found.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request data.");
    } else if (status === 409) {
      throw new Error(message || "Movie already exists.");
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

// ===============================
// PUBLIC MOVIE APIS
// ===============================

// Get all movies (public)
export const getAllMovies = async (
  params?: MovieQueryParams
): Promise<GetMoviesResponse> => {
  try {
    const movieApi = createPublicMovieRequest();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.genre) queryParams.append("genre", params.genre);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.language) queryParams.append("language", params.language);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/cinema/movies${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await movieApi.get<GetMoviesResponse>(url);
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get movie by ID (public)
export const getMovieById = async (movieId: string) => {
  try {
    const movieApi = createPublicMovieRequest();
    const response = await movieApi.get<SuccessResponse<GetMovieByIdResponse>>(
      `/cinema/movies/${movieId}`
    );
    return response.data.result;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// ===============================
// ADMIN MOVIE APIS (Requires Authentication)
// ===============================

// Create a new movie (Admin only)
export const createMovie = async (
  movieData: CreateMovieRequest
): Promise<MovieResponse> => {
  try {
    const movieApi = createMovieRequest();
    const response = await movieApi.post<MovieResponse>(
      "/cinema/movies",
      movieData
    );
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Update movie information (Admin only)
export const updateMovie = async (
  movieId: string,
  movieData: UpdateMovieRequest
): Promise<MovieResponse> => {
  try {
    const movieApi = createMovieRequest();
    const response = await movieApi.put<MovieResponse>(
      `/cinema/movies/${movieId}`,
      movieData
    );
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Delete movie (Admin only)
export const deleteMovie = async (movieId: string): Promise<MovieResponse> => {
  try {
    const movieApi = createMovieRequest();
    const response = await movieApi.delete<MovieResponse>(
      `/cinema/movies/${movieId}`
    );
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Update movie feature status (Admin only)
export const updateMovieFeatureStatus = async (
  movieId: string,
  featureData: UpdateMovieFeatureRequest
): Promise<MovieResponse> => {
  try {
    const movieApi = createMovieRequest();
    const response = await movieApi.put<MovieResponse>(
      `/admin/movies/${movieId}/feature`,
      featureData
    );
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// ===============================
// MOVIE UTILITY FUNCTIONS
// ===============================

// Get movies by status
export const getMoviesByStatus = async (
  status: "now_showing" | "coming_soon" | "ended",
  limit?: number,
  pages?: number
): Promise<Movie[]> => {
  try {
    const response = await getAllMovies({
      page: pages,
      status,
      limit,
      sortBy: "release_date",
      sortOrder: "desc",
    });
    return response.result.movies;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get popular movies (sorted by rating)
export const getPopularMovies = async (
  limit = 10,
  pages: number
): Promise<Movie[]> => {
  try {
    const response = await getAllMovies({
      page: pages,
      sortBy: "average_rating",
      sortOrder: "desc",
      limit,
      status: "now_showing",
    });
    return response.result.movies;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get featured movies
export const getFeaturedMovies = async (limit = 10): Promise<Movie[]> => {
  try {
    const movieApi = createPublicMovieRequest();
    const response = await movieApi.get<GetMoviesResponse>(
      `/cinema/movies?is_featured=true&limit=${limit}`
    );
    return response.data.result.movies;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Search movies
export const searchMovies = async (
  searchTerm: string,
  limit = 20
): Promise<Movie[]> => {
  try {
    const response = await getAllMovies({ search: searchTerm, limit });
    return response.result.movies;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get movies by genre
export const getMoviesByGenre = async (
  genre: string,
  limit = 20
): Promise<Movie[]> => {
  try {
    const response = await getAllMovies({ genre, limit });
    return response.result.movies;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get latest movies
export const getLatestMovies = async (limit = 10): Promise<Movie[]> => {
  try {
    const response = await getAllMovies({
      sortBy: "release_date",
      sortOrder: "desc",
      limit,
    });
    return response.result.movies;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get top revenue movies
export const getTopRevenueMovies = async (limit = 10): Promise<Movie[]> => {
  try {
    const movieApi = createPublicMovieRequest();
    const response = await movieApi.get<{ message: string; result: Movie[] }>(
      `/cinema/movies/categories/top-revenue?limit=${limit}`
    );
    console.log('API Response:', response.data);
    // The API returns {message: "...", result: [...]} where result is directly an array
    if (response.data && Array.isArray(response.data.result)) {
      return response.data.result;
    }
    // Fallback for other possible structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching top revenue movies:', error);
    throw handleMovieError(error);
  }
};

// Get coming soon movies
export const getComingSoonMovies = async (limit = 20): Promise<Movie[]> => {
  try {
    const movieApi = createPublicMovieRequest();
    const response = await movieApi.get<{ message: string; result: { movies: Movie[] } }>(
      `/cinema/movies/categories/coming-soon?page=1&limit=${limit}&sort_by=release_date&sort_order=asc`
    );
    console.log('Coming Soon API Response:', response.data);
    if (response.data && response.data.result && Array.isArray(response.data.result.movies)) {
      return response.data.result.movies;
    }
    return [];
  } catch (error) {
    console.error('Error fetching coming soon movies:', error);
    throw handleMovieError(error);
  }
};

// Advanced search movies with multiple filters
export const searchMoviesAdvanced = async (
  params: AdvancedSearchParams
): Promise<AdvancedSearchResponse> => {
  try {
    const movieApi = createPublicMovieRequest();
    const queryParams = new URLSearchParams();

    // Add all search parameters
    if (params.q) queryParams.append("q", params.q);
    if (params.genre) queryParams.append("genre", params.genre);
    if (params.year) queryParams.append("year", params.year.toString());
    if (params.language) queryParams.append("language", params.language);
    if (params.duration_min)
      queryParams.append("duration_min", params.duration_min.toString());
    if (params.duration_max)
      queryParams.append("duration_max", params.duration_max.toString());
    if (params.rating_min)
      queryParams.append("rating_min", params.rating_min.toString());
    if (params.rating_max)
      queryParams.append("rating_max", params.rating_max.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `/cinema/movies/search?${queryParams.toString()}`;
    const response = await movieApi.get<AdvancedSearchResponse>(url);
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};
