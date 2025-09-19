export interface Payment {
  _id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string;
  order_id: string;
  bank_code?: string;
  card_type?: string;
  payment_time: string;
  status: PaymentStatus;
  admin_note?: string;
  error?: string;
  payment_url?: string;
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
    poster_url?: string;
  };
  theater?: {
    _id: string;
    name: string;
    location?: string;
  };
  showtime?: {
    _id: string;
    start_time: string;
    end_time: string;
  };
}

export type PaymentMethod =
  | "vnpay"
  | "sepay"
  | "credit_card"
  | "debit_card"
  | "cash";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface CreatePaymentRequest {
  booking_id: string;
  payment_method: PaymentMethod;
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
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  sort_by?: "payment_time" | "amount" | "created_at";
  sort_order?: "asc" | "desc";
  date_from?: string;
  date_to?: string;
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
  transaction_id?: string;
}

// Payment UI related types
export interface PaymentFormData {
  payment_method: PaymentMethod;
  save_card?: boolean;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  card_holder_name?: string;
}

export interface PaymentSummary {
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  currency: string;
}

// VNPay specific types
export interface VNPayResponse {
  payment_url: string;
  order_id: string;
}

export interface VNPayCallbackParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TxnRef: string;
  vnp_SecureHashType: string;
  vnp_SecureHash: string;
  booking_id: string;
}

// Sepay specific types
export interface SepayResponse {
  payment_id: string;
  bank_info: {
    account_number: string;
    account_name: string;
    bank_name: string;
    branch: string;
  };
  transfer_content: string;
  amount: number;
  qr_code?: string;
}

export interface SepayPaymentInstructions {
  step1: string;
  step2: string;
  step3: string;
  important_notes: string[];
}
