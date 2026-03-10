import axios from "axios";
import type {
  Banner,
  CreateBannerRequest,
  UpdateBannerRequest,
  BannerQueryParams,
  GetBannersResponse,
  GetBannerByIdResponse,
  BannerResponse,
} from "../types/Banner.type";
import { getAuthToken } from "./user.api";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

// Create authenticated axios instance for banner requests
const createBannerRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
// Test

// Create public axios instance for public banner endpoints
const createPublicBannerRequest = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Handle banner API errors
const handleBannerError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login.");
    } else if (status === 403) {
      throw new Error("Access denied. Admin privileges required.");
    } else if (status === 404) {
      throw new Error(message || "Banner not found.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request data.");
    } else if (status === 409) {
      throw new Error(message || "Banner already exists.");
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

// ===============================
// PUBLIC BANNER APIS
// ===============================

// Get home slider banners (public)
export const getHomeSliderBanners = async (): Promise<Banner[]> => {
  try {
    const bannerApi = createPublicBannerRequest();
    const response = await bannerApi.get("/banners/home-slider");

    // API trả về { message: string, result: Banner[] } - không phải result.banners
    const banners = response.data.result || [];

    // Sort banners by position in ascending order
    return banners.sort((a: Banner, b: Banner) => a.position - b.position);
  } catch (error) {
    console.error("Banner API error:", error);
    throw handleBannerError(error);
  }
};

// Get promotion banners (public)
export const getPromotionBanners = async (): Promise<Banner[]> => {
  try {
    const bannerApi = createPublicBannerRequest();
    const response = await bannerApi.get<GetBannersResponse>(
      "/banners/promotions"
    );
    return response.data.result.banners;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Get announcement banners (public)
export const getAnnouncementBanners = async (): Promise<Banner[]> => {
  try {
    const bannerApi = createPublicBannerRequest();
    const response = await bannerApi.get<GetBannersResponse>(
      "/banners/announcements"
    );
    return response.data.result.banners;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Get all banners (public)
export const getAllBanners = async (
  params?: BannerQueryParams
): Promise<GetBannersResponse> => {
  try {
    const bannerApi = createPublicBannerRequest();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/banners${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await bannerApi.get<GetBannersResponse>(url);
    return response.data;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Get banner by ID (public)
export const getBannerById = async (bannerId: string): Promise<Banner> => {
  try {
    const bannerApi = createPublicBannerRequest();
    const response = await bannerApi.get<GetBannerByIdResponse>(
      `/banners/${bannerId}`
    );
    return response.data.result;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// ===============================
// ADMIN BANNER APIS (Requires Authentication)
// ===============================

// Get all banners (Admin)
export const getAllBannersAdmin = async (
  params?: BannerQueryParams
): Promise<GetBannersResponse> => {
  try {
    const bannerApi = createBannerRequest();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/admin/banners${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await bannerApi.get<GetBannersResponse>(url);
    return response.data;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Create a new banner (Admin only)
export const createBanner = async (
  bannerData: CreateBannerRequest
): Promise<BannerResponse> => {
  try {
    const bannerApi = createBannerRequest();
    const response = await bannerApi.post<BannerResponse>(
      "/admin/banners",
      bannerData
    );
    return response.data;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Get banner by ID (Admin)
export const getBannerByIdAdmin = async (bannerId: string): Promise<Banner> => {
  try {
    const bannerApi = createBannerRequest();
    const response = await bannerApi.get<GetBannerByIdResponse>(
      `/admin/banners/${bannerId}`
    );
    return response.data.result;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Update banner information (Admin only)
export const updateBanner = async (
  bannerId: string,
  bannerData: UpdateBannerRequest
): Promise<BannerResponse> => {
  try {
    const bannerApi = createBannerRequest();
    const response = await bannerApi.put<BannerResponse>(
      `/admin/banners/${bannerId}`,
      bannerData
    );
    return response.data;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Delete banner (Admin only)
export const deleteBanner = async (
  bannerId: string
): Promise<BannerResponse> => {
  try {
    const bannerApi = createBannerRequest();
    const response = await bannerApi.delete<BannerResponse>(
      `/admin/banners/${bannerId}`
    );
    return response.data;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// ===============================
// BANNER UTILITY FUNCTIONS
// ===============================

// Get active banners by type
export const getActiveBannersByType = async (
  type: "home_slider" | "promotion" | "announcement"
): Promise<Banner[]> => {
  try {
    const response = await getAllBanners({
      type,
      is_active: true,
      sortBy: "position",
      sortOrder: "asc",
    });
    return response.result.banners;
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Get current active banners (not expired)
export const getCurrentActiveBanners = async (): Promise<Banner[]> => {
  try {
    const response = await getAllBanners({
      is_active: true,
      sortBy: "position",
      sortOrder: "asc",
    });
    const currentDate = new Date();

    return response.result.banners.filter((banner) => {
      if (!banner.start_date && !banner.end_date) return true;

      const startDate = banner.start_date ? new Date(banner.start_date) : null;
      const endDate = banner.end_date ? new Date(banner.end_date) : null;

      if (startDate && currentDate < startDate) return false;
      if (endDate && currentDate > endDate) return false;

      return true;
    });
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Toggle banner active status
export const toggleBannerStatus = async (
  bannerId: string,
  isActive: boolean
): Promise<BannerResponse> => {
  try {
    return await updateBanner(bannerId, { is_active: isActive });
  } catch (error) {
    throw handleBannerError(error);
  }
};

// Reorder banners by position
export const reorderBanners = async (
  bannerUpdates: { bannerId: string; position: number }[]
): Promise<void> => {
  try {
    const promises = bannerUpdates.map(({ bannerId, position }) =>
      updateBanner(bannerId, { position })
    );

    await Promise.all(promises);
  } catch (error) {
    throw handleBannerError(error);
  }
};
