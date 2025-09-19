/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type {
  CouponsQueryParams,
  CreateCouponRequest,
  UpdateCouponRequest,
  GetCouponsResponse,
  GetCouponByIdResponse,
  CreateCouponResponse,
  UpdateCouponResponse,
  DeleteCouponResponse,
} from "../types/Coupon.type";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

// Create authenticated axios instance for admin requests
const createAdminRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Handle admin API errors
const handleAdminError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login as admin.");
    } else if (status === 403) {
      throw new Error("Access denied. Admin privileges required.");
    } else if (status === 404) {
      throw new Error(message || "Coupon not found.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request data.");
    } else if (status === 409) {
      throw new Error(message || "Coupon code already exists.");
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

// ===============================
// COUPON MANAGEMENT APIS
// ===============================

/**
 * Get all coupons with pagination and filters
 * Admin only - Retrieve a paginated list of all coupons with optional filters
 */
export const getAllCoupons = async (
  params?: CouponsQueryParams
): Promise<GetCouponsResponse> => {
  try {
    const adminApi = createAdminRequest();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.active_only !== undefined) {
      queryParams.append("active_only", params.active_only.toString());
    }

    const url = `/admin/coupons${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await adminApi.get<GetCouponsResponse>(url);
    return response.data;
  } catch (error) {
    throw handleAdminError(error);
  }
};

/**
 * Create a new coupon
 * Admin only - Create a new coupon with specified discount rules and constraints
 */
export const createCoupon = async (
  couponData: CreateCouponRequest
): Promise<CreateCouponResponse> => {
  try {
    const adminApi = createAdminRequest();
    const response = await adminApi.post<CreateCouponResponse>(
      "/admin/coupons",
      couponData
    );
    return response.data;
  } catch (error) {
    throw handleAdminError(error);
  }
};

/**
 * Get coupon by ID
 * Admin only - Retrieve detailed information about a specific coupon
 */
export const getCouponById = async (
  couponId: string
): Promise<GetCouponByIdResponse> => {
  try {
    const adminApi = createAdminRequest();
    const response = await adminApi.get<GetCouponByIdResponse>(
      `/admin/coupons/${couponId}`
    );
    return response.data;
  } catch (error) {
    throw handleAdminError(error);
  }
};

/**
 * Update coupon
 * Admin only - Update an existing coupon's details
 */
export const updateCoupon = async (
  couponId: string,
  couponData: UpdateCouponRequest
): Promise<UpdateCouponResponse> => {
  try {
    const adminApi = createAdminRequest();
    const response = await adminApi.put<UpdateCouponResponse>(
      `/admin/coupons/${couponId}`,
      couponData
    );
    return response.data;
  } catch (error) {
    throw handleAdminError(error);
  }
};

/**
 * Delete coupon
 * Admin only - Delete a coupon if unused, or deactivate if already used
 */
export const deleteCoupon = async (
  couponId: string
): Promise<DeleteCouponResponse> => {
  try {
    const adminApi = createAdminRequest();
    const response = await adminApi.delete<DeleteCouponResponse>(
      `/admin/coupons/${couponId}`
    );
    return response.data;
  } catch (error) {
    throw handleAdminError(error);
  }
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Check if coupon code is available
 */
export const checkCouponCodeAvailability = async (
  code: string
): Promise<{ available: boolean; message: string }> => {
  try {
    const adminApi = createAdminRequest();
    const response = await adminApi.get(`/admin/coupons/check-code/${code}`);
    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return {
        available: false,
        message: "Coupon code already exists",
      };
    }
    throw handleAdminError(error);
  }
};

/**
 * Get coupon usage statistics
 */
export const getCouponUsageStats = async (
  couponId: string
): Promise<{
  usage_count: number;
  usage_limit: number;
  remaining_uses: number;
  usage_percentage: number;
}> => {
  try {
    const adminApi = createAdminRequest();
    const response = await adminApi.get(`/admin/coupons/${couponId}/stats`);
    return response.data.result;
  } catch (error) {
    throw handleAdminError(error);
  }
};

/**
 * Bulk update coupon status
 */
export const bulkUpdateCouponStatus = async (
  couponIds: string[],
  status: "active" | "inactive"
): Promise<{
  message: string;
  result: {
    updated_count: number;
    failed_count: number;
  };
}> => {
  try {
    const adminApi = createAdminRequest();
    const response = await adminApi.put("/admin/coupons/bulk-update-status", {
      couponIds,
      status,
    });
    return response.data;
  } catch (error) {
    throw handleAdminError(error);
  }
};

/**
 * Export coupons data
 */
export const exportCouponsData = async (
  params?: CouponsQueryParams
): Promise<Blob> => {
  try {
    const adminApi = createAdminRequest();
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.active_only !== undefined) {
      queryParams.append("active_only", params.active_only.toString());
    }

    const url = `/admin/coupons/export${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await adminApi.get(url, {
      responseType: "blob",
    });

    return response.data;
  } catch (error) {
    throw handleAdminError(error);
  }
};