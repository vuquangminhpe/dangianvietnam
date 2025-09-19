import axios from "axios";
import { getAuthToken } from "./user.api";
import type { responseAllRating } from "../types/Rating.type";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";

const createRatingRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
const handleRatingError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login as user.");
    } else if (status === 403) {
      throw new Error("Access denied. user privileges required.");
    } else if (status === 404) {
      throw new Error(message || "Resource not found.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request data.");
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};
export const getAllRating = async (
  movie_id: string
): Promise<responseAllRating[]> => {
  try {
    const res = await createRatingRequest().get<{
      result: responseAllRating[];
    }>(`/ratings?movie_id=${movie_id}`);
    return res.data.result;
  } catch (error) {
    throw handleRatingError(error);
  }
};

export const addRating = async (body: {
  movie_id: string;
  rating: number;
  review: string;
}): Promise<responseAllRating> => {
  try {
    const res = await createRatingRequest().post<{
      result: responseAllRating;
    }>("/ratings", body);
    return res.data.result;
  } catch (error) {
    throw handleRatingError(error);
  }
};
export const updateRating = async (
  ratingId: string,
  body: { rating: number; review: string }
): Promise<responseAllRating> => {
  try {
    const res = await createRatingRequest().put<{
      result: responseAllRating;
    }>(`/ratings/${ratingId}`, body);
    return res.data.result;
  } catch (error) {
    throw handleRatingError(error);
  }
};
export const deleteRating = async (ratingId: string): Promise<void> => {
  try {
    await createRatingRequest().delete(`/ratings/${ratingId}`);
  } catch (error) {
    throw handleRatingError(error);
  }
};
export const getRatingByRatingId = async (
  ratingId: string
): Promise<responseAllRating> => {
  try {
    const res = await createRatingRequest().get<{
      result: responseAllRating;
    }>(`/ratings/${ratingId}`);
    return res.data.result;
  } catch (error) {
    throw handleRatingError(error);
  }
};
