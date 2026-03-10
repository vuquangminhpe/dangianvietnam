import axios from "axios";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

// Create authenticated axios instance for staff requests
const createStaffRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Handle staff API errors
const handleStaffError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login as staff.");
    } else if (status === 403) {
      throw new Error("Access denied. Staff privileges required.");
    } else if (status === 404) {
      throw new Error(message || "Resource not found.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request data.");
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

// ===============================
// SHOWTIME TYPES
// ===============================

export type ShowtimeStatus =
  | "scheduled"
  | "booking_open"
  | "booking_closed"
  | "cancelled"
  | "completed";

export const ShowtimeStatusValues = {
  SCHEDULED: "scheduled" as const,
  BOOKING_OPEN: "booking_open" as const,
  BOOKING_CLOSED: "booking_closed" as const,
  CANCELLED: "cancelled" as const,
  COMPLETED: "completed" as const,
} as const;

export interface Seat {
  row: string;
  number: number;
  type: "regular" | "premium" | "vip";
  status: "active" | "inactive";
}

export interface BookedSeat {
  row: string;
  number: number;
  type: "regular" | "premium" | "vip";
  booking_id: string;
  user_id: string;
}

export interface ShowtimePrice {
  regular: number;
  premium: number;
  vip?: number;
}

export interface ShowtimeMovie {
  _id: string;
  title: string;
  description: string;
  poster_url: string;
  duration: number;
  genre: string[];
  language: string;
}

export interface ShowtimeTheater {
  _id: string;
  name: string;
  location: string;
  address: string;
  city: string;
}

export interface ShowtimeScreen {
  _id: string;
  name: string;
  screen_type: "standard" | "premium" | "imax" | "dolby";
  capacity: number;
  seat_layout: Seat[][];
}

export interface Showtime {
  _id: string;
  movie_id: string;
  screen_id: string;
  theater_id: string;
  start_time: string;
  end_time: string;
  price: ShowtimePrice;
  available_seats: number;
  status: ShowtimeStatus;
  created_at: string;
  updated_at: string;
  movie?: ShowtimeMovie;
  theater?: ShowtimeTheater;
  screen?: ShowtimeScreen;
  booked_seats?: BookedSeat[];
}

export interface ShowtimeCreateRequest {
  movie_id: string;
  screen_id: string;
  theater_id: string;
  start_time: string;
  end_time: string;
  price: ShowtimePrice;
  available_seats: number;
  status?: ShowtimeStatus;
}

export interface ShowtimeUpdateRequest {
  start_time?: string;
  end_time?: string;
  price?: ShowtimePrice;
  available_seats?: number;
  status?: ShowtimeStatus;
}

export interface ShowtimeListResponse {
  message: string;
  result: {
    showtimes: Showtime[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ShowtimeResponse {
  message: string;
  result: Showtime;
}

export interface ShowtimeCreateResponse {
  message: string;
  result: Showtime | {
    showtime_id: string;
  };
}

export interface ShowtimeUpdateResponse {
  message: string;
  result: {
    showtime_id: string;
  };
}

export interface ShowtimeDeleteResponse {
  message: string;
  result: {
    showtime_id: string;
  };
}

// ===============================
// SHOWTIME MANAGEMENT APIS
// ===============================

/**
 * Get showtimes for movies owned by current staff
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param movieId - Filter by specific movie ID (optional)
 * @param status - Filter by showtime status (optional)
 * @param startDate - Filter showtimes from this date (optional)
 * @param endDate - Filter showtimes until this date (optional)
 */
export const getMyShowtimes = async (
  page: number = 1,
  limit: number = 10,
  movieId?: string,
  status?: ShowtimeStatus,
  startDate?: string,
  endDate?: string
): Promise<ShowtimeListResponse> => {
  try {
    const staffApi = createStaffRequest();
    const params: Record<string, any> = { 
      page, 
      limit,
      sort: "start_time",
      order: "desc"
    };

    if (movieId) params.movie_id = movieId;
    if (status) params.status = status;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await staffApi.get("/staff/showtimes", { params });
    
    // Sort locally to ensure future showtimes appear first, then by start_time descending
    if (response.data.result && response.data.result.showtimes) {
      const now = new Date();
      response.data.result.showtimes.sort((a: Showtime, b: Showtime) => {
        const startTimeA = new Date(a.start_time);
        const startTimeB = new Date(b.start_time);
        
        // Separate future and past showtimes
        const aIsFuture = startTimeA > now;
        const bIsFuture = startTimeB > now;
        
        // Future showtimes first
        if (aIsFuture && !bIsFuture) return -1;
        if (!aIsFuture && bIsFuture) return 1;
        
        // Within same category, sort by start_time descending (newest first)
        return startTimeB.getTime() - startTimeA.getTime();
      });
    }
    
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

/**
 * Create a new showtime for movie owned by current staff
 * @param showtimeData - Showtime creation data
 */
export const createShowtime = async (
  showtimeData: ShowtimeCreateRequest
): Promise<ShowtimeCreateResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.post("/staff/showtimes", showtimeData);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

/**
 * Get specific showtime details (must be for movie owned by current staff)
 * @param showtimeId - The ID of the showtime
 */
export const getShowtimeById = async (
  showtimeId: string
): Promise<ShowtimeResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get(`/staff/showtimes/${showtimeId}`);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

/**
 * Update showtime information (must be for movie owned by current staff)
 * @param showtimeId - The ID of the showtime to update
 * @param showtimeData - Updated showtime data
 */
export const updateShowtime = async (
  showtimeId: string,
  showtimeData: ShowtimeUpdateRequest
): Promise<ShowtimeUpdateResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.put(
      `/staff/showtimes/${showtimeId}`,
      showtimeData
    );
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

/**
 * Delete a showtime (must be for movie owned by current staff)
 * @param showtimeId - The ID of the showtime to delete
 */
export const deleteShowtime = async (
  showtimeId: string
): Promise<ShowtimeDeleteResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.delete(`/staff/showtimes/${showtimeId}`);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// ===============================
// SHOWTIME HELPER FUNCTIONS
// ===============================

/**
 * Validate showtime status
 * @param status - Status to validate
 */
export const isValidShowtimeStatus = (
  status: string
): status is ShowtimeStatus => {
  return [
    "scheduled",
    "booking_open",
    "booking_closed",
    "cancelled",
    "completed",
  ].includes(status);
};

/**
 * Get showtime status display text
 * @param status - Showtime status
 */
export const getShowtimeStatusDisplay = (status: string): string => {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "booking_open":
      return "Booking Open";
    case "booking_closed":
      return "Booking Closed";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return status;
  }
};

/**
 * Get showtime status color for UI
 * @param status - Showtime status
 */
export const getShowtimeStatusColor = (status: string): string => {
  switch (status) {
    case "scheduled":
      return "bg-blue-500/20 border-blue-500/30 text-blue-400";
    case "booking_open":
      return "bg-green-500/20 border-green-500/30 text-green-400";
    case "booking_closed":
      return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
    case "cancelled":
      return "bg-red-500/20 border-red-500/30 text-red-400";
    case "completed":
      return "bg-gray-500/20 border-gray-500/30 text-gray-400";
    default:
      return "bg-slate-500/20 border-slate-500/30 text-slate-400";
  }
};

/**
 * Format showtime date and time
 * @param dateTimeString - ISO date string
 */
export const formatShowtimeDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format showtime date only
 * @param dateTimeString - ISO date string
 */
export const formatShowtimeDate = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format showtime time only
 * @param dateTimeString - ISO date string
 */
export const formatShowtimeTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Calculate showtime duration in minutes
 * @param startTime - Start time ISO string
 * @param endTime - End time ISO string
 */
export const calculateShowtimeDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * Check if showtime is in the past
 * @param startTime - Start time ISO string
 */
export const isShowtimePast = (startTime: string): boolean => {
  const start = new Date(startTime);
  const now = new Date();
  return start < now;
};

/**
 * Check if showtime is currently ongoing
 * @param startTime - Start time ISO string
 * @param endTime - End time ISO string
 */
export const isShowtimeOngoing = (
  startTime: string,
  endTime: string
): boolean => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  return now >= start && now <= end;
};

/**
 * Calculate total revenue for a showtime based on booked seats
 * @param showtime - Showtime object with booked seats and pricing
 */
export const calculateShowtimeRevenue = (showtime: Showtime): number => {
  if (!showtime.booked_seats || showtime.booked_seats.length === 0) {
    return 0;
  }

  let totalRevenue = 0;
  showtime.booked_seats.forEach((seat) => {
    const seatPrice = showtime.price[seat.type] || 0;
    totalRevenue += seatPrice;
  });

  return totalRevenue;
};

/**
 * Calculate occupancy rate for a showtime
 * @param showtime - Showtime object
 */
export const calculateShowtimeOccupancy = (showtime: Showtime): number => {
  if (!showtime.screen?.capacity || showtime.screen.capacity === 0) {
    return 0;
  }

  const bookedSeatsCount = showtime.booked_seats?.length || 0;
  return Math.round((bookedSeatsCount / showtime.screen.capacity) * 100);
};

/**
 * Get available seats count by type
 * @param showtime - Showtime object with seat layout and booked seats
 */
export const getAvailableSeatsByType = (
  showtime: Showtime
): Record<string, number> => {
  if (!showtime.screen?.seat_layout) {
    return { regular: 0, premium: 0, vip: 0 };
  }

  const seatCounts = { regular: 0, premium: 0, vip: 0 };
  const bookedSeats = showtime.booked_seats || [];

  // Count total seats by type
  showtime.screen.seat_layout.forEach((row) => {
    row.forEach((seat) => {
      if (seat.status === "active") {
        seatCounts[seat.type] = (seatCounts[seat.type] || 0) + 1;
      }
    });
  });

  // Subtract booked seats
  bookedSeats.forEach((bookedSeat) => {
    if (seatCounts[bookedSeat.type] > 0) {
      seatCounts[bookedSeat.type]--;
    }
  });

  return seatCounts;
};

/**
 * Validate showtime data before creation/update
 * @param showtimeData - Showtime data to validate
 */
export const validateShowtimeData = (
  showtimeData: ShowtimeCreateRequest | ShowtimeUpdateRequest
): string[] => {
  const errors: string[] = [];

  if ("movie_id" in showtimeData) {
    if (!showtimeData.movie_id || showtimeData.movie_id.trim().length === 0) {
      errors.push("Movie ID is required");
    }
  }

  if ("screen_id" in showtimeData) {
    if (!showtimeData.screen_id || showtimeData.screen_id.trim().length === 0) {
      errors.push("Screen ID is required");
    }
  }

  if ("theater_id" in showtimeData) {
    if (
      !showtimeData.theater_id ||
      showtimeData.theater_id.trim().length === 0
    ) {
      errors.push("Theater ID is required");
    }
  }

  if (showtimeData.start_time) {
    const startTime = new Date(showtimeData.start_time);
    if (isNaN(startTime.getTime())) {
      errors.push("Invalid start time format");
    }
  }

  if (showtimeData.end_time) {
    const endTime = new Date(showtimeData.end_time);
    if (isNaN(endTime.getTime())) {
      errors.push("Invalid end time format");
    }

    if (showtimeData.start_time) {
      const startTime = new Date(showtimeData.start_time);
      if (endTime <= startTime) {
        errors.push("End time must be after start time");
      }
    }
  }

  if (showtimeData.price) {
    if (!showtimeData.price.regular || showtimeData.price.regular <= 0) {
      errors.push("Regular seat price must be greater than 0");
    }
    if (!showtimeData.price.premium || showtimeData.price.premium <= 0) {
      errors.push("Premium seat price must be greater than 0");
    }
    if (showtimeData.price.vip && showtimeData.price.vip <= 0) {
      errors.push("VIP seat price must be greater than 0");
    }
  }

  if ("available_seats" in showtimeData) {
    if (!showtimeData.available_seats || showtimeData.available_seats <= 0) {
      errors.push("Available seats must be greater than 0");
    }
  }

  if (
    "status" in showtimeData &&
    showtimeData.status &&
    !isValidShowtimeStatus(showtimeData.status)
  ) {
    errors.push("Invalid showtime status");
  }

  return errors;
};

/**
 * Generate time slots for showtime scheduling
 * @param startHour - Start hour (0-23)
 * @param endHour - End hour (0-23)
 * @param intervalMinutes - Interval between time slots in minutes
 */
export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 23,
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break; // Don't go past end hour

      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);
    }
  }

  return slots;
};

/**
 * Format price for display
 * @param price - Price in the smallest currency unit (e.g., cents, đồng)
 * @param currency - Currency symbol (default: 'VND')
 */
export const formatPrice = (
  price: number,
  currency: string = "VND"
): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
