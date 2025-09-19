/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BookingSeat {
  row: string;
  number: number;
  type: SeatType;
  price: number;
}

export type SeatType = "regular" | "premium" | "recliner" | "couple";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

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
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  // Coupon fields
  coupon_code?: string;
  coupon_discount?: number;
  original_amount?: number; // Amount before coupon discount
  movie?: {
    _id: string;
    title: string;
    poster_url: string;
    duration: number;
    language: string;
    description?: string;
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
    type: SeatType;
  }>;
  // Coupon fields
  coupon_code?: string;
  coupon_discount?: number;
  total_amount?: number; // Final amount after discount
}

export interface CreateBookingResponse {
  message: string;
  result: {
    booking: Booking;
    seat_lock?: SeatLock;
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
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  sort_by?: "booking_time" | "created_at" | "total_amount";
  sort_order?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}

export interface BookingExpirationInfo {
  booking_id: string;
  booking_time: string;
  expiration_time: string;
  time_remaining_ms: number;
  time_remaining_seconds: number;
  is_expired: boolean;
  status: BookingStatus;
  payment_status: PaymentStatus;
}

export interface SeatLock {
  _id: string;
  showtime_id: string;
  user_id: string;
  seats: Array<{
    row: string;
    number: number;
    section?: string;
  }>;
  status: "selected" | "expired" | "confirmed";
  expires_at: string;
  created_at: string;
}

export interface TicketQR {
  qr_code: string; // Base64 data URL
}

// UI specific types
export interface BookingFormData {
  showtime_id: string;
  seats: Array<{
    row: string;
    number: number;
    type: SeatType;
    price?: number;
  }>;
}

export interface BookingFilters {
  status: BookingStatus | "all";
  payment_status: PaymentStatus | "all";
  date_range: {
    from?: string;
    to?: string;
  };
  sort_by: "newest" | "oldest" | "amount_high" | "amount_low";
}

export interface BookingStats {
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
  totalSpent: number;
  averageSpending: number;
  completionRate: number;
  recentBookings: Booking[];
}

// Seat selection types
export interface SeatSelection {
  row: string;
  number: number;
  type: SeatType;
  price: number;
  isSelected: boolean;
  isBooked: boolean;
  isLocked: boolean;
}

export interface SeatMap {
  [key: string]: SeatSelection; // key format: "row-number" (e.g., "A-1")
}

// Booking flow types
export interface BookingFlowState {
  step: "seat-selection" | "booking-review" | "payment" | "confirmation";
  selectedSeats: SeatSelection[];
  bookingInfo?: Booking;
  paymentInfo?: any;
  error?: string;
}

// Checkout specific types
export interface CheckoutData {
  movie: {
    _id: string;
    title: string;
    poster_url: string;
    duration: number;
  };
  theater: {
    _id: string;
    name: string;
    location: string;
  };
  screen: {
    _id: string;
    name: string;
    screen_type: string;
  };
  showtime: {
    _id: string;
    start_time: string;
    end_time: string;
  };
  seats: SeatSelection[];
  totalAmount: number;
}

// Booking validation types
export interface BookingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Notification types for booking events
export interface BookingNotification {
  type: "created" | "confirmed" | "cancelled" | "expired" | "payment_completed";
  booking_id: string;
  message: string;
  timestamp: string;
}

// Booking history types
export interface BookingHistoryItem extends Booking {
  canCancel: boolean;
  canRate: boolean;
  canRefund: boolean;
  timeUntilShowtime: number; // minutes
}

// Theater staff verification types
export interface TicketVerification {
  booking_id: string;
  ticket_code: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  movie: {
    _id: string;
    title: string;
  };
  theater: {
    _id: string;
    name: string;
  };
  screen: {
    _id: string;
    name: string;
  };
  showtime: {
    _id: string;
    start_time: string;
    end_time: string;
  };
  seats: BookingSeat[];
  booking_time: string;
  verified_at: string;
}
