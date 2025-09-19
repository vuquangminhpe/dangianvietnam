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

// Contract response types
export interface ContractCheckResponse {
  message: string;
  result: {
    _id: string;
    staff_id: string;
    admin_id: string;
    contract_number: string;
    staff_name: string | null;
    staff_email: string | null;
    staff_phone: string | null;
    theater_name: string | null;
    theater_location: string | null;
    salary: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'inactive' | 'expired';
    terms: string;
    responsibilities: string[];
    benefits: string[];
    contract_file_url: string;
    notes: string;
    created_at: string;
    updated_at: string;
    admin: {
      _id: string;
      email: string;
      name: string;
    };
  } | null;
}

// Theater types
export interface TheaterCreateRequest {
  name: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  screens: number;
  amenities: string[];
  contact_phone: string;
  contact_email: string;
  description: string;
}

export interface TheaterUpdateRequest extends TheaterCreateRequest {}

export interface TheaterResponse {
  message: string;
  result: {
    _id: string;
    name: string;
    location: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    screens: number;
    amenities: string[];
    status: 'active' | 'inactive';
    manager_id: string;
    contact_phone: string;
    contact_email: string;
    description: string;
    images: string[];
    created_at: string;
    updated_at: string;
  } | null;
}

export interface TheaterCreateResponse {
  message: string;
  result: {
    theater_id: string;
  };
}

export interface TheaterUpdateResponse {
  message: string;
  result: {
    theater_id: string;
  };
}

// Movie types
export interface MovieCast {
  id: number;
  name: string;
  character: string;
  order: number;
  profile_image: string;
  gender: number;
}

export interface MovieCreateRequest {
  title: string;
  description: string;
  duration: number;
  genre: string[];
  language: string;
  release_date: string;
  director: string;
  cast: MovieCast[];
  poster_url: string;
  trailer_url: string;
  status: 'coming_soon' | 'now_showing' | 'ended';
}

export interface MovieUpdateRequest extends MovieCreateRequest {}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  language: string;
  release_date: string;
  director: string;
  cast: MovieCast[];
  poster_url: string;
  trailer_url: string;
  status: 'coming_soon' | 'now_showing' | 'ended';
  average_rating: number;
  ratings_count: number;
  is_featured: boolean;
  featured_order: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    _id: string;
    email: string;
    name: string;
  };
}

export interface MovieListResponse {
  message: string;
  result: {
    movies: Movie[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface MovieResponse {
  message: string;
  result: Movie;
}

export interface MovieCreateResponse {
  message: string;
  result: {
    movie_id: string;
  };
}

export interface MovieDeleteResponse {
  message: string;
  result: {
    movie_id: string;
  };
}

export interface MovieRating {
  _id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

export interface MovieRatingsResponse {
  message: string;
  result: {
    ratings: MovieRating[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface MovieFeedback {
  _id: string;
  user_id: string;
  movie_id: string;
  feedback: string;
  created_at: string;
  updated_at: string;
  user?: {
    _id: string;
    email: string;
    name: string;
  };
}

export interface MovieFeedbacksResponse {
  message: string;
  result: {
    feedbacks: MovieFeedback[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ===============================
// CONTRACT MANAGEMENT APIS
// ===============================

// Check current staff's own contract status
export const checkStaffContract = async (): Promise<ContractCheckResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get('/staff/contract');
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Helper function to validate contract status
export const isContractActive = (contract: ContractCheckResponse): boolean => {
  if (!contract.result) {
    return false;
  }
  
  const { status, start_date, end_date } = contract.result;
  const now = new Date();
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  
  return status === 'active' && now >= startDate && now <= endDate;
};

// ===============================
// THEATER MANAGEMENT APIS
// ===============================

// Create a new theater (staff can only create one theater)
export const createTheater = async (theaterData: TheaterCreateRequest): Promise<TheaterCreateResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.post('/staff/theater', theaterData);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Get staff's own theater
export const getMyTheater = async (): Promise<TheaterResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get('/staff/theater/mine');
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Get theater details by ID
export const getTheaterById = async (theaterId: string): Promise<TheaterResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get(`/staff/theater/${theaterId}`);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Update theater information
export const updateTheater = async (theaterId: string, theaterData: TheaterUpdateRequest): Promise<TheaterUpdateResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.put(`/staff/theater/${theaterId}`, theaterData);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// ===============================
// MOVIE MANAGEMENT APIS
// ===============================

// Get list of movies created by current staff with filtering options
export const getMyMovies = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: 'coming_soon' | 'now_showing' | 'ended'
): Promise<MovieListResponse> => {
  try {
    const staffApi = createStaffRequest();
    const params: Record<string, any> = { page, limit };
    
    if (search) params.search = search;
    if (status) params.status = status;
    
    const response = await staffApi.get('/staff/movies', { params });
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Check if a movie title already exists in the entire system
export const checkMovieTitleExists = async (title: string): Promise<boolean> => {
  try {
    // Use public API to check all movies in the system
    const response = await axios.get(`${BASE_URL}/cinema/movies`, {
      params: {
        page: 1,
        limit: 100, // Get enough results to check thoroughly
        sort_by: 'release_date',
        sort_order: 'desc'
      }
    });
    
    // Normalize function to remove accents, convert to lowercase, and remove special characters
    const normalizeTitle = (str: string): string => {
      return str
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/[^a-z0-9\s]/g, '') // Keep only letters, numbers, and spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    };
    
    // Check if any movie has exact same title (normalized comparison)
    const existingMovies = response.data.result.movies;
    const normalizedSearchTitle = normalizeTitle(title);
    
    return existingMovies.some((movie: Movie) => {
      const normalizedMovieTitle = normalizeTitle(movie.title);
      return normalizedMovieTitle === normalizedSearchTitle;
    });
  } catch (error) {
    console.error('Error checking movie title:', error);
    return false; // If error occurs, allow creation (don't block user)
  }
};

// Create a new movie with ownership
export const createMovie = async (movieData: MovieCreateRequest): Promise<MovieCreateResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.post('/staff/movies', movieData);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Get specific movie details (must be owned by current staff)
export const getMyMovieById = async (movieId: string): Promise<MovieResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get(`/staff/movies/${movieId}`);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Update movie information (must be owned by current staff)
export const updateMovie = async (movieId: string, movieData: MovieUpdateRequest): Promise<MovieResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.put(`/staff/movies/${movieId}`, movieData);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Delete a movie (must be owned by current staff)
export const deleteMovie = async (movieId: string): Promise<MovieDeleteResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.delete(`/staff/movies/${movieId}`);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Get ratings for movie owned by current staff
export const getMyMovieRatings = async (
  movieId: string,
  page: number = 1,
  limit: number = 10
): Promise<MovieRatingsResponse> => {
  try {
    const staffApi = createStaffRequest();
    const params = { page, limit };
    const response = await staffApi.get(`/staff/movies/${movieId}/ratings`, { params });
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Get feedbacks for movie owned by current staff
export const getMyMovieFeedbacks = async (
  movieId: string,
  page: number = 1,
  limit: number = 10,
  includeAll: boolean = true
): Promise<MovieFeedbacksResponse> => {
  try {
    const staffApi = createStaffRequest();
    const params: Record<string, any> = { page, limit };
    
    if (includeAll) params.include_all = includeAll;
    
    const response = await staffApi.get(`/staff/movies/${movieId}/feedbacks`, { params });
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// ===============================
// MOVIE HELPER FUNCTIONS
// ===============================

// Helper function to validate movie status
export const isValidMovieStatus = (status: string): status is 'coming_soon' | 'now_showing' | 'ended' => {
  return ['coming_soon', 'now_showing', 'ended'].includes(status);
};

// Helper function to format movie release date
export const formatMovieReleaseDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to calculate movie duration in hours and minutes
export const formatMovieDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

// Helper function to get movie status display text
export const getMovieStatusDisplay = (status: string): string => {
  switch (status) {
    case 'coming_soon':
      return 'Coming Soon';
    case 'now_showing':
      return 'Now Showing';
    case 'ended':
      return 'Ended';
    default:
      return status;
  }
};

// Helper function to validate movie data before creation/update
export const validateMovieData = (movieData: MovieCreateRequest | MovieUpdateRequest): string[] => {
  const errors: string[] = [];
  
  if (!movieData.title || movieData.title.trim().length < 1) {
    errors.push('Title is required');
  }
  
  if (!movieData.description || movieData.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  
  if (!movieData.duration || movieData.duration < 1 || movieData.duration > 500) {
    errors.push('Duration must be between 1 and 500 minutes');
  }
  
  if (!movieData.genre || movieData.genre.length === 0) {
    errors.push('At least one genre is required');
  }
  
  if (!movieData.language || movieData.language.trim().length < 1) {
    errors.push('Language is required');
  }
  
  if (!movieData.release_date) {
    errors.push('Release date is required');
  }
  
  if (!movieData.director || movieData.director.trim().length < 1) {
    errors.push('Director is required');
  }
  
  if (!movieData.cast || movieData.cast.length === 0) {
    errors.push('At least one cast member is required');
  }
  
  if (!movieData.poster_url || movieData.poster_url.trim().length < 1) {
    errors.push('Poster URL is required');
  }
  
  if (!isValidMovieStatus(movieData.status)) {
    errors.push('Invalid movie status');
  }
  
  return errors;
};