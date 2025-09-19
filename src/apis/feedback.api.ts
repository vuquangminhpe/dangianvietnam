import axios from "axios";
import type { SuccessResponse } from "../types";
import type {
  CreateFeedbackRequest,
  Feedback,
  FeedbackQueryParams,
  GetFeedbacksResponse,
  UpdateFeedbackRequest,
  UpdateFeedbackStatusRequest,
} from "../types/Feedback.type";
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
const feedbackApi = {
  createFeedback: (data: CreateFeedbackRequest) => {
    const authRequest = createAuthRequest();
    return authRequest.post<SuccessResponse<{ feedback_id: string }>>(
      "/feedback",
      data
    );
  },

  // Get feedbacks (public)
  getFeedbacks: (params?: FeedbackQueryParams) => {
    return axios.get<GetFeedbacksResponse>(`${BASE_URL}/feedback`, { params });
  },

  // Get feedback by ID (public)
  getFeedbackById: (feedbackId: string) => {
    return axios.get<SuccessResponse<Feedback>>(
      `${BASE_URL}/feedback/${feedbackId}`
    );
  },

  // Update feedback (user can only update their own)
  updateFeedback: (feedbackId: string, data: UpdateFeedbackRequest) => {
    const authRequest = createAuthRequest();
    return authRequest.put<SuccessResponse<{ feedback_id: string }>>(
      `/feedback/${feedbackId}`,
      data
    );
  },

  // Update feedback status (admin only)
  updateFeedbackStatus: (
    feedbackId: string,
    data: UpdateFeedbackStatusRequest
  ) => {
    const authRequest = createAuthRequest();
    return authRequest.put<SuccessResponse<{ feedback_id: string }>>(
      `/feedback/${feedbackId}/status`,
      data
    );
  },

  // Delete feedback
  deleteFeedback: (feedbackId: string) => {
    const authRequest = createAuthRequest();
    return authRequest.delete<SuccessResponse<{ feedback_id: string }>>(
      `/feedback/${feedbackId}`
    );
  },

  // Get movie feedbacks (for movie detail page)
  getMovieFeedbacks: (
    movieId: string,
    params?: { page?: number; limit?: number }
  ) => {
    return axios.get<GetFeedbacksResponse>(`${BASE_URL}/feedback`, {
      params: {
        movie_id: movieId,
        status: "approved",
        ...params,
      },
    });
  },
};

export default feedbackApi;
