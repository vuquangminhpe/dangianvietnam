import axios from "axios";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

// Types based on the API documentation
export interface BannerSliderHome {
  _id: string;
  image: string;
  author: string;
  title: string;
  topic?: string;
  description: string;
  active: boolean;
  time_active?: string;
  auto_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerSliderHomeRequest {
  image: string;
  author: string;
  title: string;
  topic?: string;
  description: string;
  active?: boolean;
  time_active?: string;
  auto_active?: boolean;
}

export interface UpdateBannerSliderHomeRequest {
  image?: string;
  author?: string;
  title?: string;
  topic?: string;
  description?: string;
  active?: boolean;
  time_active?: string | null;
  auto_active?: boolean;
}

export interface BannerSliderHomeQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  active_only?: string;
}

export interface GetBannerSliderHomeResponse {
  message: string;
  result: {
    banners: BannerSliderHome[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BannerSliderHomeResponse {
  message: string;
  result: {
    banner_id: string;
  };
}

export interface GetSingleBannerSliderHomeResponse {
  message: string;
  result: BannerSliderHome;
}

export interface ManualActivationResponse {
  success: boolean;
  message: string;
  result: {
    activated_count: number;
    activated_banners: Array<{
      _id: string;
      title: string;
      time_active: string;
    }>;
  };
}

export interface StatusResponse {
  success: boolean;
  data: {
    is_running: boolean;
    socket_connected: boolean;
    next_check: string;
  };
}

// Create authenticated axios instance
const createAuthenticatedRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Create public axios instance
const createPublicRequest = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Handle API errors
const handleError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Access token is required");
    } else if (status === 403) {
      throw new Error("Admin access required");
    } else if (status === 404) {
      throw new Error("Banner slider home not found");
    } else if (status === 400) {
      throw new Error(message || "Validation error");
    } else {
      throw new Error(message || "Request failed");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

// ===============================
// PUBLIC APIS
// ===============================

// Get active banners slider home (public)
export const getActiveBannerSliderHome = async (): Promise<BannerSliderHome[]> => {
  try {
    const api = createPublicRequest();
    const response = await api.get("/banner-slider-home/active");
    return response.data.result;
  } catch (error) {
    throw handleError(error);
  }
};

// ===============================
// ADMIN APIS
// ===============================

// Get all banners slider home with pagination and filter (Admin)
export const getAllBannerSliderHomeAdmin = async (
  params?: BannerSliderHomeQueryParams
): Promise<GetBannerSliderHomeResponse> => {
  try {
    const api = createAuthenticatedRequest();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page);
    if (params?.limit) queryParams.append("limit", params.limit);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.active_only) queryParams.append("active_only", params.active_only);

    const url = `/banner-slider-home${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await api.get<GetBannerSliderHomeResponse>(url);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get banner slider home by ID (Admin)
export const getBannerSliderHomeById = async (
  bannerId: string
): Promise<BannerSliderHome> => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get<GetSingleBannerSliderHomeResponse>(
      `/banner-slider-home/${bannerId}`
    );
    return response.data.result;
  } catch (error) {
    throw handleError(error);
  }
};

// Create new banner slider home (Admin)
export const createBannerSliderHome = async (
  bannerData: CreateBannerSliderHomeRequest
): Promise<BannerSliderHomeResponse> => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.post<BannerSliderHomeResponse>(
      "/banner-slider-home/",
      bannerData
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update banner slider home (Admin)
export const updateBannerSliderHome = async (
  bannerId: string,
  bannerData: UpdateBannerSliderHomeRequest
): Promise<BannerSliderHomeResponse> => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.put<BannerSliderHomeResponse>(
      `/banner-slider-home/${bannerId}`,
      bannerData
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete banner slider home (Admin)
export const deleteBannerSliderHome = async (
  bannerId: string
): Promise<BannerSliderHomeResponse> => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.delete<BannerSliderHomeResponse>(
      `/banner-slider-home/${bannerId}`
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// ===============================
// ADMIN MANAGEMENT APIS
// ===============================

// Manual trigger activation for banners (Admin)
export const manualActivateBannerSliderHome = async (): Promise<ManualActivationResponse> => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.post<ManualActivationResponse>(
      "/admin/banner-slider-home/activate"
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get scheduler status (Admin)
export const getBannerSliderHomeStatus = async (): Promise<StatusResponse> => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get<StatusResponse>(
      "/admin/banner-slider-home/status"
    );
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// ===============================
// UTILITY FUNCTIONS
// ===============================

// Toggle banner active status
export const toggleBannerSliderHomeStatus = async (
  bannerId: string,
  active: boolean
): Promise<BannerSliderHomeResponse> => {
  try {
    return await updateBannerSliderHome(bannerId, { active });
  } catch (error) {
    throw handleError(error);
  }
};

// Get banners ready for activation
export const getBannersReadyForActivation = async (): Promise<BannerSliderHome[]> => {
  try {
    const response = await getAllBannerSliderHomeAdmin({
      active_only: "false",
      sort_by: "time_active",
      sort_order: "asc",
    });

    const currentDate = new Date();

    return response.result.banners.filter((banner) => {
      return (
        banner.auto_active &&
        !banner.active &&
        banner.time_active &&
        new Date(banner.time_active) <= currentDate
      );
    });
  } catch (error) {
    throw handleError(error);
  }
};