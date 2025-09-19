import axios from "axios";
import type { Screen } from "../types/Screen.type";

const BASE_URL = 'https://bookmovie-5n6n.onrender.com';
const API_URL = '/cinema/screens';

// Create axios instance for screen requests
const screenApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Handle screen API errors
const handleScreenError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 401) {
      throw new Error('Unauthorized. Please login.');
    } else if (status === 403) {
      throw new Error('Access denied.');
    } else if (status === 404) {
      throw new Error(message || 'Screen not found.');
    } else if (status === 400) {
      throw new Error(message || 'Invalid request data.');
    } else if (status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(message || 'Request failed.');
    }
  }
  throw new Error('Network error. Please check your connection.');
};

export const getAllScreens = async (): Promise<Screen[]> => {
  try {
    const res = await screenApi.get<{ screens: Screen[] }>(API_URL);
    return res.data.screens;
  } catch (error) {
    throw handleScreenError(error);
  }
};

export const createScreen = async (data: Partial<Screen>): Promise<Screen> => {
  try {
    const res = await screenApi.post<{ result: Screen }>(API_URL, data);
    return res.data.result;
  } catch (error) {
    throw handleScreenError(error);
  }
};

export const getScreenById = async (screen_id: string): Promise<Screen> => {
  try {
    const res = await screenApi.get<{ result: Screen }>(`${API_URL}/${screen_id}`);
    return res.data.result;
  } catch (error) {
    throw handleScreenError(error);
  }
};

export const updateScreen = async (screen_id: string, data: Partial<Screen>): Promise<Screen> => {
  try {
    const res = await screenApi.put<{ result: Screen }>(`${API_URL}/${screen_id}`, data);
    return res.data.result;
  } catch (error) {
    throw handleScreenError(error);
  }
};

export const deleteScreen = async (screen_id: string): Promise<{ message: string }> => {
  try {
    const res = await screenApi.delete<{ message: string }>(`${API_URL}/${screen_id}`);
    return res.data;
  } catch (error) {
    throw handleScreenError(error);
  }
};