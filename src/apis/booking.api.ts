/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { SuccessResponse } from "../types/Utils.type";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com/";

// Create authenticated axios instance
const createAuthRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export interface Booking {
  _id: string;
  user_id: string;
  showtime_id: string;
  movie_id: string;
  theater_id: string;
  screen_id: string;
  seats: Array<{
    row: string;
    number: number;
    type: string;
    price: number;
  }>;
  total_amount: number;
  booking_time: string;
  ticket_code: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
  // Coupon information
  coupon_code?: string;
  coupon_discount?: number;
  original_amount?: number;
  movie?: {
    _id: string;
    title: string;
    poster_url: string;
    duration: number;
    language: string;
  };
  theater?: {
    _id: string;
    name: string;
    location: string;
    address: string;
    city: string;
  };
  screen?: {
    _id: string;
    name: string;
    screen_type: string;
  };
  showtime?: {
    _id: string;
    start_time: string;
    end_time: string;
  };
  payment?: {
    _id: string;
    payment_method: string;
    status: string;
    transaction_id: string;
  };
}

export interface CreateBookingRequest {
  showtime_id: string;
  seats: Array<{
    row: string;
    number: number;
    type: string;
  }>;
  // Coupon information
  coupon_code?: string;
  coupon_discount?: number;
  total_amount?: number;
}

export interface CreateBookingResponse {
  message: string;
  result: {
    booking: Booking;
    seat_lock?: any;
  };
}

export interface GetBookingsResponse {
  message: string;
  result: {
    bookings: Booking[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BookingQueryParams {
  page?: number;
  limit?: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status?: "pending" | "completed" | "failed" | "refunded";
  sort_by?: "booking_time" | "created_at";
  sort_order?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
}

export interface UpdateBookingStatusRequest {
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface BookingExpirationInfo {
  booking_id: string;
  booking_time: string;
  expiration_time: string;
  time_remaining_ms: number;
  time_remaining_seconds: number;
  is_expired: boolean;
  status: string;
  payment_status: string;
}
export interface ReqBodySeatLock {
  seat_row: string;
  seat_number: number;
}

export interface ReqBodyMultipleSeatLock {
  seats: Array<{
    seat_row: string;
    seat_number: number;
  }>;
}
const bookingApi = {
  // Create booking
  createBooking: (data: CreateBookingRequest) => {
    const authRequest = createAuthRequest();
    return authRequest.post<CreateBookingResponse>("/cinema/bookings", data);
  },
  updateBooking: (data: CreateBookingRequest, bookingId: string) => {
    const authRequest = createAuthRequest();
    return authRequest.post<SuccessResponse<{ messages: string }>>(
      `/bookings/updateBookingAndSeats/${bookingId}`,
      data
    );
  },
  // Get my bookings
  getMyBookings: (params?: BookingQueryParams) => {
    const authRequest = createAuthRequest();
    return authRequest.get<GetBookingsResponse>(
      "/cinema/bookings/my-bookings",
      { params }
    );
  },

  // Get booking by ID
  getBookingById: (bookingId: string) => {
    const authRequest = createAuthRequest();
    return authRequest.get<SuccessResponse<Booking>>(
      `/cinema/bookings/${bookingId}`
    );
  },

  // Get booking by ticket code (public endpoint for theater staff)
  getBookingByTicketCode: (ticketCode: string) => {
    return axios.get<SuccessResponse<Booking>>(
      `${BASE_URL}/cinema/bookings/verify/${ticketCode}`
    );
  },

  // Update booking status (cancel booking)
  updateBookingStatus: (
    bookingId: string,
    data: UpdateBookingStatusRequest
  ) => {
    const authRequest = createAuthRequest();
    return authRequest.put<SuccessResponse<{ booking_id: string }>>(
      `/cinema/bookings/${bookingId}/status`,
      data
    );
  },

  // Get ticket QR code
  getTicketQR: (ticketCode: string) => {
    const authRequest = createAuthRequest();
    return authRequest.get<SuccessResponse<{ qr_code: string }>>(
      `/cinema/bookings/ticket/${ticketCode}/qr`
    );
  },

  // Get booking expiration info
  getBookingExpirationInfo: (bookingId: string) => {
    const authRequest = createAuthRequest();
    return authRequest.get<SuccessResponse<BookingExpirationInfo>>(
      `/cinema/bookings/${bookingId}/expiration`
    );
  },

  // Extend booking expiration
  extendBookingExpiration: (
    bookingId: string,
    additionalMinutes: number = 5
  ) => {
    const authRequest = createAuthRequest();
    return authRequest.post<
      SuccessResponse<{ booking_id: string; extended_minutes: number }>
    >(`/cinema/bookings/${bookingId}/extend`, {
      additional_minutes: additionalMinutes,
    });
  },
  //deleted showtime by seat locked
  deletedShowtimeBySeatLocked: (
    showtimeId: string,
    body: ReqBodyMultipleSeatLock
  ) => {
    const authRequest = createAuthRequest();
    return authRequest.post<SuccessResponse<{ message: string }>>(
      `/bookings/delete/showtime/${showtimeId}`,
      body
    );
  },
};

export default bookingApi;
