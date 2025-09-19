// ===============================
// COUPON INTERFACES
// ===============================

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed" | null;
  value: number | null;
  min_purchase: number;
  max_discount: number;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "expired";
  usage_limit: number;
  usage_count: number;
  applicable_to: "all" | "movies" | "theaters" | "members";
  applicable_ids: string[];
  created_at: string;
  updated_at: string;
}

// ===============================
// REQUEST INTERFACES
// ===============================

export interface CreateCouponRequest {
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  min_purchase?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  status?: "active" | "inactive";
  usage_limit?: number;
  applicable_to?: "all" | "movies" | "theaters" | "members";
  applicable_ids?: string[];
}

export interface UpdateCouponRequest {
  description?: string;
  type?: "percentage" | "fixed";
  value?: number;
  min_purchase?: number;
  max_discount?: number;
  start_date?: string;
  end_date?: string;
  status?: "active" | "inactive";
  usage_limit?: number;
  applicable_to?: "all" | "movies" | "theaters" | "members";
  applicable_ids?: string[];
}

export interface CouponsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "expired";
  sort_by?: string;
  sort_order?: "asc" | "desc";
  active_only?: boolean;
}

// ===============================
// RESPONSE INTERFACES
// ===============================

export interface GetCouponsResponse {
  message: string;
  result: {
    coupons: Coupon[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface GetCouponByIdResponse {
  message: string;
  result: Coupon;
}

export interface CreateCouponResponse {
  message: string;
  result: {
    coupon_id: string;
  };
}

export interface UpdateCouponResponse {
  message: string;
  result: {
    coupon_id: string;
  };
}

export interface DeleteCouponResponse {
  message: string;
  result: {
    coupon_id: string;
  };
}
