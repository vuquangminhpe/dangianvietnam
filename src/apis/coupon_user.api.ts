/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { Coupon } from "../types/Coupon.type";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

// ===============================
// USER COUPON API TYPES
// ===============================

export interface ValidateCouponRequest {
  code: string;
  movie_id?: string;
  theater_id?: string;
  total_amount: number;
}

export interface ValidateCouponResponse {
  message: string;
  result: {
    coupon: Coupon;
    discount_amount: number;
  };
}

export interface ApplyCouponRequest {
  code: string;
  booking_id: string;
  discount_amount: number;
}

export interface ApplyCouponResponse {
  message: string;
  result: {
    coupon_code: string;
    discount_amount: number;
  };
}

export interface GetMyCouponsResponse {
  message: string;
  result: Coupon[];
}

// Create authenticated axios instance for user requests
const createUserRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Handle user API errors
const handleUserError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login to continue.");
    } else if (status === 403) {
      throw new Error(
        "Access denied. You don't have permission to access this resource."
      );
    } else if (status === 404) {
      throw new Error(message || "Coupon not found or not available.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request. Please check your input.");
    } else if (status === 409) {
      throw new Error(
        message || "Coupon is not valid or has already been used."
      );
    } else if (status === 422) {
      throw new Error(
        message || "Coupon validation failed. Please check the requirements."
      );
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed. Please try again.");
    }
  }
  throw new Error("Network error. Please check your internet connection.");
};

// ===============================
// USER COUPON APIS
// ===============================

/**
 * Get available coupons for the authenticated user
 * Retrieve a list of coupons that the user can use
 */
export const getMyCoupons = async (): Promise<GetMyCouponsResponse> => {
  try {
    const userApi = createUserRequest();
    const response = await userApi.get<GetMyCouponsResponse>(
      "/coupons/my-coupons"
    );
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Validate a coupon code for a booking
 * Check if a coupon is valid and calculate the discount amount
 */
export const validateCoupon = async (
  validateData: ValidateCouponRequest
): Promise<ValidateCouponResponse> => {
  try {
    const userApi = createUserRequest();
    const response = await userApi.post<ValidateCouponResponse>(
      "/coupons/validate",
      validateData
    );
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Apply a validated coupon to a booking
 * Called during booking finalization to apply the coupon discount
 */
export const applyCoupon = async (
  applyData: ApplyCouponRequest
): Promise<ApplyCouponResponse> => {
  try {
    const userApi = createUserRequest();
    const response = await userApi.post<ApplyCouponResponse>(
      "/coupons/apply",
      applyData
    );
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Check if a coupon is still valid (not expired and active)
 */
export const isCouponValid = (coupon: Coupon): boolean => {
  if (coupon.status !== "active") {
    return false;
  }

  const now = new Date();
  const startDate = new Date(coupon.start_date);
  const endDate = new Date(coupon.end_date);

  if (now < startDate || now > endDate) {
    return false;
  }

  if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
    return false;
  }

  return true;
};

/**
 * Calculate discount amount based on coupon type and value
 */
export const calculateDiscount = (
  coupon: Coupon,
  totalAmount: number
): number => {
  if (!isCouponValid(coupon) || totalAmount < coupon.min_purchase) {
    return 0;
  }

  let discountAmount = 0;

  if (coupon.type === "percentage") {
    discountAmount = Math.floor((totalAmount * (coupon.value || 0)) / 100);
  } else if (coupon.type === "fixed") {
    discountAmount = coupon.value || 0;
  }

  // Apply maximum discount limit if specified
  if (coupon.max_discount > 0) {
    discountAmount = Math.min(discountAmount, coupon.max_discount);
  }

  // Ensure discount doesn't exceed total amount
  return Math.min(discountAmount, totalAmount);
};

/**
 * Format coupon discount for display
 */
export const formatCouponDiscount = (coupon: Coupon): string => {
  if (coupon.type === "percentage") {
    return `${coupon.value}% off`;
  } else if (coupon.type === "fixed") {
    return `${coupon.value?.toLocaleString("vi-VN")}₫ off`;
  }
  return "Discount available";
};

/**
 * Get coupon validity status message
 */
export const getCouponStatusMessage = (coupon: Coupon): string => {
  if (coupon.status !== "active") {
    return "This coupon is not active";
  }

  const now = new Date();
  const startDate = new Date(coupon.start_date);
  const endDate = new Date(coupon.end_date);

  if (now < startDate) {
    return `This coupon will be available from ${startDate.toLocaleDateString(
      "vi-VN"
    )}`;
  }

  if (now > endDate) {
    return "This coupon has expired";
  }

  if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
    return "This coupon has reached its usage limit";
  }

  return "This coupon is valid";
};

/**
 * Check if coupon is applicable to specific criteria
 */
export const isCouponApplicable = (
  coupon: Coupon,
  movieId?: string,
  theaterId?: string
): boolean => {
  if (coupon.applicable_to === "all") {
    return true;
  }

  if (coupon.applicable_to === "movies" && movieId) {
    return coupon.applicable_ids.includes(movieId);
  }

  if (coupon.applicable_to === "theaters" && theaterId) {
    return coupon.applicable_ids.includes(theaterId);
  }

  // For members type, assume user is eligible if they can see the coupon
  if (coupon.applicable_to === "members") {
    return true;
  }

  return false;
};
