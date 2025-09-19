import axios from 'axios';
import { getAuthToken } from './user.api';

const BASE_URL = 'https://bookmovie-5n6n.onrender.com';

// Create authenticated axios instance for staff screen requests
const createStaffScreenRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Handle staff screen API errors
const handleStaffScreenError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const errors = error.response?.data?.errors;
    
    if (status === 401) {
      throw new Error('Unauthorized. Please login as staff.');
    } else if (status === 403) {
      throw new Error('Access denied. Staff privileges required.');
    } else if (status === 404) {
      throw new Error(message || 'Screen not found.');
    } else if (status === 400) {
      // Handle validation errors specifically
      if (errors && typeof errors === 'object') {
        const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => {
          return `${field}: ${error.msg || error.message || 'Invalid value'}`;
        });
        throw new Error(errorMessages.join(', '));
      }
      throw new Error(message || 'Invalid request data.');
    } else if (status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(message || 'Request failed.');
    }
  }
  throw new Error('Network error. Please check your connection.');
};

// Screen Types
export interface Seat {
  row: string;
  number: number;
  type: 'regular' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'maintenance';
}

export interface ScreenCreateRequest {
  name: string;
  seat_layout: Seat[][];
  capacity: number;
  screen_type: 'standard' | 'premium' | 'imax' | 'dolby';
}

export interface ScreenUpdateRequest extends ScreenCreateRequest {}

export interface Screen {
  _id: string;
  theater_id: string;
  name: string;
  seat_layout: Seat[][];
  capacity: number;
  screen_type: 'standard' | 'premium' | 'imax' | 'dolby';
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
  theater?: {
    _id: string;
    name: string;
    location: string;
    city: string;
    address: string;
  };
  statistics?: {
    total_showtimes: number;
    upcoming_showtimes: number;
    active_bookings: number;
  };
  recent_showtimes?: any[];
}

export interface ScreensListResponse {
  message: string;
  result: {
    screens: Screen[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ScreenResponse {
  message: string;
  result: Screen;
}

export interface ScreenCreateResponse {
  message: string;
  result: {
    screen_id: string;
  };
}

export interface ScreenUpdateResponse {
  message: string;
  result: {
    screen_id: string;
  };
}

export interface ScreenDeleteResponse {
  message: string;
  result: {
    screen_id: string;
    message: string;
  };
}

// Theater Response (imported from staff.api.ts structure)
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

// API Functions

/**
 * Get staff's own theater information
 */
export const getMyTheater = async (): Promise<TheaterResponse> => {
  try {
    const staffApi = createStaffScreenRequest();
    const response = await staffApi.get('/staff/theater/mine');
    return response.data;
  } catch (error) {
    throw handleStaffScreenError(error);
  }
};

/**
 * Get screens for a specific theater
 * @param theaterId - The theater ID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 */
export const getTheaterScreens = async (
  theaterId: string,
  page: number = 1,
  limit: number = 10
): Promise<ScreensListResponse> => {
  try {
    const staffApi = createStaffScreenRequest();
    const response = await staffApi.get(`/staff/theater/${theaterId}/screens`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw handleStaffScreenError(error);
  }
};

/**
 * Create a new screen for a theater
 * @param theaterId - The theater ID
 * @param screenData - Screen creation data
 */
export const createScreen = async (
  theaterId: string,
  screenData: ScreenCreateRequest
): Promise<ScreenCreateResponse> => {
  try {
    const staffApi = createStaffScreenRequest();
    const response = await staffApi.post(`/staff/theater/${theaterId}/screens`, screenData);
    return response.data;
  } catch (error) {
    throw handleStaffScreenError(error);
  }
};

/**
 * Get screen details by screen ID
 * @param screenId - The screen ID
 */
export const getScreenById = async (screenId: string): Promise<ScreenResponse> => {
  try {
    const staffApi = createStaffScreenRequest();
    const response = await staffApi.get(`/staff/screens/${screenId}`);
    return response.data;
  } catch (error) {
    throw handleStaffScreenError(error);
  }
};

/**
 * Update screen details
 * @param screenId - The screen ID
 * @param screenData - Screen update data
 */
export const updateScreen = async (
  screenId: string,
  screenData: ScreenUpdateRequest
): Promise<ScreenUpdateResponse> => {
  try {
    const staffApi = createStaffScreenRequest();
    const response = await staffApi.put(`/staff/screens/${screenId}`, screenData);
    return response.data;
  } catch (error) {
    throw handleStaffScreenError(error);
  }
};

/**
 * Delete a screen
 * @param screenId - The screen ID
 */
export const deleteScreen = async (screenId: string): Promise<ScreenDeleteResponse> => {
  try {
    const staffApi = createStaffScreenRequest();
    const response = await staffApi.delete(`/staff/screens/${screenId}`);
    return response.data;
  } catch (error) {
    throw handleStaffScreenError(error);
  }
};

// Utility functions

/**
 * Calculate total seats from seat layout
 * @param seatLayout - 2D array of seats
 */
export const calculateTotalSeats = (seatLayout: Seat[][]): number => {
  return seatLayout.reduce((total, row) => total + row.length, 0);
};

/**
 * Validate seat layout capacity
 * @param seatLayout - 2D array of seats
 * @param capacity - Declared capacity
 */
export const validateSeatLayoutCapacity = (seatLayout: Seat[][], capacity: number): boolean => {
  const totalSeats = calculateTotalSeats(seatLayout);
  return totalSeats === capacity;
};

/**
 * Generate seat layout template for a standard screen
 * @param rows - Number of rows
 * @param seatsPerRow - Number of seats per row
 * @param seatType - Type of seats (default: 'regular')
 */
export const generateSeatLayout = (
  rows: number,
  seatsPerRow: number,
  seatType: 'regular' | 'premium' | 'vip' = 'regular'
): Seat[][] => {
  const seatLayout: Seat[][] = [];
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = 0; i < rows; i++) {
    const row: Seat[] = [];
    const rowLabel = rowLabels[i] || `Row${i + 1}`;
    
    for (let j = 0; j < seatsPerRow; j++) {
      row.push({
        row: rowLabel,
        number: j + 1,
        type: seatType,
        status: 'active'
      });
    }
    
    seatLayout.push(row);
  }
  
  return seatLayout;
};

/**
 * Get screen type display name
 * @param screenType - Screen type
 */
export const getScreenTypeDisplay = (screenType: string): string => {
  switch (screenType) {
    case 'standard':
      return 'Standard';
    case 'premium':
      return 'Premium';
    case 'imax':
      return 'IMAX';
    case 'dolby':
      return 'Dolby Atmos';
    default:
      return screenType;
  }
};

/**
 * Get seat type display name
 * @param seatType - Seat type
 */
export const getSeatTypeDisplay = (seatType: string): string => {
  switch (seatType) {
    case 'regular':
      return 'Regular';
    case 'premium':
      return 'Premium';
    case 'vip':
      return 'VIP';
    default:
      return seatType;
  }
};

/**
 * Get status color class for screens
 * @param status - Screen status
 */
export const getScreenStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-400 bg-green-500/20';
    case 'inactive':
      return 'text-red-400 bg-red-500/20';
    case 'maintenance':
      return 'text-yellow-400 bg-yellow-500/20';
    default:
      return 'text-slate-400 bg-slate-500/20';
  }
};

export default {
  getMyTheater,
  getTheaterScreens,
  createScreen,
  getScreenById,
  updateScreen,
  deleteScreen,
  calculateTotalSeats,
  validateSeatLayoutCapacity,
  generateSeatLayout,
  getScreenTypeDisplay,
  getSeatTypeDisplay,
  getScreenStatusColor
};
