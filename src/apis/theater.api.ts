import axios from "axios";
import type {
  Theater,
  GetTheatersResponse,
  GetTheaterByIdResponse,
  TheaterResponse,
} from "../types/Theater.type";

const BASE_URL = "https://bookmovie-5n6n.onrender.com";
const API_URL = "/cinema/theaters";

const theaterApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Lấy danh sách rạp
export const getTheaters = async (
  limit = 100
): Promise<GetTheatersResponse> => {
  const res = await theaterApi.get<GetTheatersResponse>(API_URL, {
    params: { limit },
  });
  return res.data;
};

// Lấy thông tin rạp theo ID
export const getTheaterById = async (
  id: string
): Promise<GetTheaterByIdResponse> => {
  const res = await theaterApi.get<GetTheaterByIdResponse>(`${API_URL}/${id}`);
  return res.data;
};

// Tạo mới rạp
export const createTheater = async (
  data: Partial<Theater>
): Promise<TheaterResponse> => {
  const res = await theaterApi.post<TheaterResponse>(API_URL, data);
  return res.data;
};

// Cập nhật rạp
export const updateTheater = async (
  id: string,
  data: Partial<Theater>
): Promise<TheaterResponse> => {
  const res = await theaterApi.put<TheaterResponse>(`${API_URL}/${id}`, data);
  return res.data;
};

// Xoá rạp
export const deleteTheater = async (
  id: string
): Promise<{ message: string }> => {
  const res = await theaterApi.delete<{ message: string }>(`${API_URL}/${id}`);
  return res.data;
};
