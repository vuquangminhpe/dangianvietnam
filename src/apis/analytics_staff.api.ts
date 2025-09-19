import axios from "axios";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

// Create authenticated axios instance for staff analytics requests
const createStaffAnalyticsRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Handle staff analytics API errors
const handleStaffAnalyticsError = (error: unknown): Error => {
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
// ANALYTICS TYPES
// ===============================

// My Theater Analytics Types
export interface TheaterInfo {
  _id: string;
  name: string;
  location: string;
  city: string;
  address: string;
  status: "active" | "inactive";
}

export interface TheaterAnalytics {
  total_revenue: number;
  total_bookings: number;
  total_customers: number;
}

export interface MyTheaterAnalyticsResponse {
  message: string;
  result: {
    theater_info: TheaterInfo;
    analytics: TheaterAnalytics;
  };
}

// All Theaters Analytics Types
export interface AllTheaterAnalytics {
  theater_id: string;
  theater_name: string;
  theater_location: string;
  theater_city: string;
  manager_id?: string;
  total_revenue: number;
  total_bookings: number;
  total_customers: number;
}

export interface AllTheatersAnalyticsResponse {
  message: string;
  result: AllTheaterAnalytics[];
}

// Theater Details Types
export interface TheaterDetails {
  _id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  screens: number;
  amenities: string[];
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface TheaterDetailsResponse {
  message: string;
  result: TheaterDetails;
}

// ===============================
// ANALYTICS APIS
// ===============================

/**
 * Get analytics for the current staff's own theater
 * @returns Promise<MyTheaterAnalyticsResponse>
 */
export const getMyTheaterAnalytics =
  async (): Promise<MyTheaterAnalyticsResponse> => {
    try {
      const staffAnalyticsApi = createStaffAnalyticsRequest();
      const response = await staffAnalyticsApi.get(
        "/staff/analytics/my-theater"
      );
      return response.data;
    } catch (error) {
      throw handleStaffAnalyticsError(error);
    }
  };

/**
 * Get analytics for all theaters (requires appropriate permissions)
 * @returns Promise<AllTheatersAnalyticsResponse>
 */
export const getAllTheatersAnalytics =
  async (): Promise<AllTheatersAnalyticsResponse> => {
    try {
      const staffAnalyticsApi = createStaffAnalyticsRequest();
      const response = await staffAnalyticsApi.get(
        "/staff/analytics/all-theaters"
      );
      return response.data;
    } catch (error) {
      throw handleStaffAnalyticsError(error);
    }
  };

/**
 * Get theater details by theater ID
 * @param theaterId - The ID of the theater to get details for
 * @returns Promise<TheaterDetailsResponse>
 */
export const getTheaterDetailsById = async (
  theaterId: string
): Promise<TheaterDetailsResponse> => {
  try {
    const staffAnalyticsApi = createStaffAnalyticsRequest();
    const response = await staffAnalyticsApi.get(`/staff/theater/${theaterId}`);
    return response.data;
  } catch (error) {
    throw handleStaffAnalyticsError(error);
  }
};

// ===============================
// ANALYTICS HELPER FUNCTIONS
// ===============================

/**
 * Format revenue amount to display currency
 * @param amount - Revenue amount in VND
 * @returns Formatted currency string
 */
export const formatRevenue = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format revenue amount to display with K/M suffixes
 * @param amount - Revenue amount
 * @returns Formatted string with suffixes
 */
export const formatRevenueShort = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B VND`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M VND`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K VND`;
  } else {
    return `${amount} VND`;
  }
};

/**
 * Calculate average revenue per booking
 * @param totalRevenue - Total revenue amount
 * @param totalBookings - Total number of bookings
 * @returns Average revenue per booking
 */
export const calculateAverageRevenuePerBooking = (
  totalRevenue: number,
  totalBookings: number
): number => {
  if (totalBookings === 0) return 0;
  return totalRevenue / totalBookings;
};

/**
 * Calculate average revenue per customer
 * @param totalRevenue - Total revenue amount
 * @param totalCustomers - Total number of customers
 * @returns Average revenue per customer
 */
export const calculateAverageRevenuePerCustomer = (
  totalRevenue: number,
  totalCustomers: number
): number => {
  if (totalCustomers === 0) return 0;
  return totalRevenue / totalCustomers;
};

/**
 * Calculate booking rate (bookings per customer)
 * @param totalBookings - Total number of bookings
 * @param totalCustomers - Total number of customers
 * @returns Booking rate
 */
export const calculateBookingRate = (
  totalBookings: number,
  totalCustomers: number
): number => {
  if (totalCustomers === 0) return 0;
  return totalBookings / totalCustomers;
};

/**
 * Get theater performance status based on revenue
 * @param totalRevenue - Total revenue amount
 * @returns Performance status
 */
export const getTheaterPerformanceStatus = (
  totalRevenue: number
): "excellent" | "good" | "average" | "poor" => {
  if (totalRevenue >= 10000000) {
    // 10M VND or more
    return "excellent";
  } else if (totalRevenue >= 5000000) {
    // 5M - 10M VND
    return "good";
  } else if (totalRevenue >= 1000000) {
    // 1M - 5M VND
    return "average";
  } else {
    return "poor";
  }
};

/**
 * Get performance status display text
 * @param status - Performance status
 * @returns Display text for the status
 */
export const getPerformanceStatusDisplay = (
  status: "excellent" | "good" | "average" | "poor"
): string => {
  switch (status) {
    case "excellent":
      return "Xuất sắc";
    case "good":
      return "Tốt";
    case "average":
      return "Trung bình";
    case "poor":
      return "Cần cải thiện";
    default:
      return status;
  }
};

/**
 * Get performance status color
 * @param status - Performance status
 * @returns CSS color class or hex color
 */
export const getPerformanceStatusColor = (
  status: "excellent" | "good" | "average" | "poor"
): string => {
  switch (status) {
    case "excellent":
      return "#10B981"; // Green
    case "good":
      return "#3B82F6"; // Blue
    case "average":
      return "#F59E0B"; // Orange
    case "poor":
      return "#EF4444"; // Red
    default:
      return "#6B7280"; // Gray
  }
};

/**
 * Sort theaters by revenue (descending)
 * @param theaters - Array of theater analytics
 * @returns Sorted array by revenue (highest to lowest)
 */
export const sortTheatersByRevenue = (
  theaters: AllTheaterAnalytics[]
): AllTheaterAnalytics[] => {
  return [...theaters].sort((a, b) => b.total_revenue - a.total_revenue);
};

/**
 * Sort theaters by bookings (descending)
 * @param theaters - Array of theater analytics
 * @returns Sorted array by bookings (highest to lowest)
 */
export const sortTheatersByBookings = (
  theaters: AllTheaterAnalytics[]
): AllTheaterAnalytics[] => {
  return [...theaters].sort((a, b) => b.total_bookings - a.total_bookings);
};

/**
 * Sort theaters by customers (descending)
 * @param theaters - Array of theater analytics
 * @returns Sorted array by customers (highest to lowest)
 */
export const sortTheatersByCustomers = (
  theaters: AllTheaterAnalytics[]
): AllTheaterAnalytics[] => {
  return [...theaters].sort((a, b) => b.total_customers - a.total_customers);
};

/**
 * Filter theaters by city
 * @param theaters - Array of theater analytics
 * @param city - City name to filter by
 * @returns Filtered array of theaters
 */
export const filterTheatersByCity = (
  theaters: AllTheaterAnalytics[],
  city: string
): AllTheaterAnalytics[] => {
  return theaters.filter((theater) =>
    theater.theater_city.toLowerCase().includes(city.toLowerCase())
  );
};

/**
 * Get top performing theaters by revenue
 * @param theaters - Array of theater analytics
 * @param limit - Number of top theaters to return (default: 5)
 * @returns Array of top performing theaters
 */
export const getTopTheatersByRevenue = (
  theaters: AllTheaterAnalytics[],
  limit: number = 5
): AllTheaterAnalytics[] => {
  return sortTheatersByRevenue(theaters).slice(0, limit);
};

/**
 * Calculate total analytics across all theaters
 * @param theaters - Array of theater analytics
 * @returns Aggregated analytics
 */
export const calculateTotalAnalytics = (
  theaters: AllTheaterAnalytics[]
): TheaterAnalytics => {
  return theaters.reduce(
    (total, theater) => ({
      total_revenue: total.total_revenue + theater.total_revenue,
      total_bookings: total.total_bookings + theater.total_bookings,
      total_customers: total.total_customers + theater.total_customers,
    }),
    { total_revenue: 0, total_bookings: 0, total_customers: 0 }
  );
};

/**
 * Check if theater has any activity
 * @param theater - Theater analytics data
 * @returns Boolean indicating if theater has activity
 */
export const hasTheaterActivity = (
  theater: AllTheaterAnalytics | TheaterAnalytics
): boolean => {
  return (
    theater.total_revenue > 0 ||
    theater.total_bookings > 0 ||
    theater.total_customers > 0
  );
};

// ===============================
// ENHANCED REVENUE STATISTICS TYPES
// ===============================

export interface RevenueStatsParams {
  period?: "day" | "week" | "month";
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: "date" | "revenue" | "bookings";
  sort_order?: "asc" | "desc";
  theater_id?: string;
  movie_id?: string;
  group_by?: "date" | "theater" | "movie";
}

export interface RevenueStatsData {
  period: string;
  date: string;
  revenue: number;
  bookings_count: number;
  average_booking_value: number;
  tickets_sold: number;
  total_seats_capacity: number;
  occupancy_rate: number;
  theater_info?: {
    theater_id: string;
    theater_name: string;
    theater_location: string;
  };
  movie_info?: {
    movie_id: string;
    movie_title: string;
    movie_genre: string[];
  };
}

export interface RevenueStatsSummary {
  total_revenue: number;
  total_bookings: number;
  average_revenue_per_period: number;
  period_type: string;
  date_range: {
    start: string;
    end: string;
  };
  total_tickets_sold: number;
  theaters_count: number;
  movies_count: number;
  top_performing_theater: {
    theater_id: string;
    theater_name: string;
    revenue: number;
  };
  top_performing_movie: {
    movie_id: string;
    movie_title: string;
    revenue: number;
  };
  average_occupancy_rate: number;
}

export interface RevenueStatsResponse {
  message: string;
  result: {
    data: RevenueStatsData[];
    summary: RevenueStatsSummary;
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
}

// ===============================
// ENHANCED REVENUE STATISTICS API
// ===============================

/**
 * Get enhanced revenue statistics with filtering and grouping
 * @param params - Query parameters for revenue stats
 */
export const getRevenueStats = async (
  params: RevenueStatsParams = {}
): Promise<RevenueStatsResponse> => {
  try {
    const staffRequest = createStaffAnalyticsRequest();
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await staffRequest.get(
      `/staff/revenue-stats?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    throw handleStaffAnalyticsError(error);
  }
};
