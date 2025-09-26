/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getAuthToken } from "./user.api";
import { getUserProfileById } from "./user.api";

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

// Booking types
export interface BookingSeat {
  row: string;
  number: number;
  type: string;
  price: number;
}

export interface BookingMovie {
  _id: string;
  title: string;
  description: string;
  poster_url: string;
  duration: number;
  language: string;
}

export interface BookingTheater {
  _id: string;
  name: string;
  location: string;
  address: string;
  city: string;
}

export interface BookingScreen {
  _id: string;
  name: string;
  screen_type: string;
}

export interface BookingShowtime {
  _id: string;
  start_time: string;
  end_time: string;
}

export interface BookingPayment {
  _id?: string;
  // Add other payment fields as needed
}

export interface BookingUser {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  username?: string;
  role?: string;
  avatar?: string;
  date_of_birth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  bio?: string;
  cover_photo?: string;
  location?: string;
  website?: string;
}

export interface Booking {
  _id: string;
  user_id: string;
  showtime_id: string;
  movie_id: string;
  theater_id: string;
  screen_id: string;
  seats: BookingSeat[];
  total_amount: number;
  booking_time: string;
  ticket_code: string;
  theater_info: {
    name: string;
    location: string;
  };
  user_info: {
    name: string;
    email: string;
  };
  movie_info: {
    title: string;
  };
  status: "pending" | "confirmed" | "cancelled" | "completed" | "used";
  payment_status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  movie: BookingMovie;
  theater: BookingTheater;
  screen: BookingScreen;
  showtime: BookingShowtime;
  payment: BookingPayment | null;
  user?: BookingUser;
}

export interface BookingListResponse {
  message: string;
  result: {
    bookings: Booking[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface BookingDetailResponse {
  message: string;
  result: BookingWithDetails;
}

// ===============================
// BOOKING MANAGEMENT APIS
// ===============================

// Get all bookings for staff's theater
export const getTheaterBookings = async (
  page: number = 1,
  limit: number = 20,
  status?: "pending" | "confirmed" | "cancelled" | "completed" | "used",
  paymentStatus?: "pending" | "completed" | "failed" | "refunded" | "cancelled"
): Promise<BookingListResponse> => {
  try {
    const staffApi = createStaffRequest();
    const params: Record<string, any> = { page, limit };

    if (status) params.status = status;
    if (paymentStatus) params.payment_status = paymentStatus;

    const response = await staffApi.get("/staff/bookings", { params });
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Get specific booking details by ID
export const getBookingById = async (
  bookingId: string
): Promise<BookingDetailResponse> => {
  try {
    const staffApi = createStaffRequest();
    const response = await staffApi.get(`/staff/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw handleStaffError(error);
  }
};

// Get enriched booking details with all related information
export const getEnrichedBookingDetails = async (
  bookingId: string
): Promise<BookingWithDetails> => {
  try {
    // Get basic booking details
    const bookingResponse = await getBookingById(bookingId);
    const booking = bookingResponse.result;

    // If the booking already has detailed information, try to enhance with user data
    let userDetails = booking.user;
    if (!userDetails && booking.user_id) {
      try {
        const userResponse = await getUserProfileById(booking.user_id);
        userDetails = {
          _id: userResponse._id,
          email: userResponse.email,
          name: userResponse.name,
          phone: userResponse.phone,
          username: userResponse.username,
          role: userResponse.role,
          avatar: userResponse.avatar,
          date_of_birth: userResponse.date_of_birth,
          address: userResponse.address,
          bio: userResponse.bio,
          cover_photo: userResponse.cover_photo,
          location: userResponse.location,
          website: userResponse.website,
        };
      } catch (error) {
        console.warn("Failed to fetch user details:", error);
      }
    }

    // Return the enriched booking with user data
    return {
      ...booking,
      user: userDetails,
    };
  } catch (error) {
    throw handleStaffError(error);
  }
};

// ===============================
// BOOKING HELPER FUNCTIONS
// ===============================

// Helper function to validate booking status
export const isValidBookingStatus = (
  status: string
): status is "pending" | "confirmed" | "cancelled" | "completed" | "used" => {
  return ["pending", "confirmed", "cancelled", "completed", "used"].includes(status);
};

// Helper function to validate payment status
export const isValidPaymentStatus = (
  status: string
): status is "pending" | "completed" | "failed" | "refunded" | "cancelled" => {
  return ["pending", "completed", "failed", "refunded", "cancelled"].includes(status);
};

// Helper function to get booking status display text
export const getBookingStatusDisplay = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    case "used":
      return "Used";
    default:
      return status;
  }
};

// Helper function to get payment status display text
export const getPaymentStatusDisplay = (status: string): string => {
  switch (status) {
    case "pending":
      return "Pending";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

// Helper function to format booking time
export const formatBookingTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to format showtime
export const formatShowtime = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const startFormatted = start.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const endFormatted = end.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${startFormatted} - ${endFormatted}`;
};

// Helper function to calculate total seats count
export const getTotalSeatsCount = (seats: BookingSeat[]): number => {
  return seats.length;
};

// Helper function to format seats display
export const formatSeatsDisplay = (seats: BookingSeat[]): string => {
  return seats.map((seat) => `${seat.row}${seat.number}`).join(", ");
};

// Helper function to format price
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Helper function to get seat type display
export const getSeatTypeDisplay = (type: string): string => {
  switch (type) {
    case "regular":
      return "Regular";
    case "vip":
      return "VIP";
    case "premium":
      return "Premium";
    default:
      return type;
  }
};

// Helper function to format user display name
export const formatUserDisplay = (user: BookingUser): string => {
  if (user.name) {
    return user.name;
  } else if (user.username) {
    return user.username;
  } else {
    return user.email;
  }
};

// Helper function to get user contact info
export const getUserContactInfo = (user: BookingUser): string => {
  const contacts = [];
  if (user.email) contacts.push(user.email);
  if (user.phone) contacts.push(user.phone);
  return contacts.join(" • ");
};
