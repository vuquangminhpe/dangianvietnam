import axios from "axios";
import type { SuccessResponse } from "../types/Utils.type";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

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

export interface Payment {
  _id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: "vnpay" | "sepay" | "credit_card" | "debit_card" | "cash";
  transaction_id: string;
  order_id: string;
  payment_time: string;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
  booking?: {
    _id: string;
    ticket_code: string;
    status: string;
    seats: number;
    total_amount: number;
  };
  movie?: {
    _id: string;
    title: string;
    poster_url: string;
  };
  theater?: {
    _id: string;
    name: string;
    location: string;
  };
  showtime?: {
    _id: string;
    start_time: string;
    end_time: string;
  };
}

export interface CreatePaymentRequest {
  booking_id: string;
  payment_method: "vnpay" | "sepay" | "credit_card" | "debit_card" | "cash";
  transaction_id?: string;
}

export interface CreatePaymentResponse {
  message: string;
  payment_id?: string;
  payment_url?: string;
  order_id?: string;
  result?: Payment;
}

export interface GetPaymentsResponse {
  message: string;
  result: {
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: "pending" | "completed" | "failed" | "refunded";
  payment_method?: "vnpay" | "credit_card" | "debit_card" | "cash";
  sort_by?: "payment_time" | "amount" | "created_at";
  sort_order?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
}

const paymentApi = {
  // Create payment
  createPayment: (data: CreatePaymentRequest) => {
    const authRequest = createAuthRequest();
    return authRequest.post<CreatePaymentResponse>("/cinema/payments", data);
  },

  // Get my payments
  getMyPayments: (params?: PaymentQueryParams) => {
    const authRequest = createAuthRequest();
    return authRequest.get<GetPaymentsResponse>(
      "/cinema/payments/my-payments",
      { params }
    );
  },

  // Get payment by ID
  getPaymentById: (paymentId: string) => {
    const authRequest = createAuthRequest();
    return authRequest.get<SuccessResponse<Payment>>(
      `/cinema/payments/${paymentId}`
    );
  },

  // Update payment status (admin only)
  updatePaymentStatus: (
    paymentId: string,
    data: { status: string; transaction_id?: string }
  ) => {
    const authRequest = createAuthRequest();
    return authRequest.put<SuccessResponse<{ payment_id: string }>>(
      `/cinema/payments/${paymentId}/status`,
      data
    );
  },
};

export default paymentApi;
