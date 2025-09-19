import { TIMEOUTS } from "../constants/paymentFeedback";

const STORAGE_KEY = "selected-movie-info";

export interface SeatPersistenceData {
  seats: string[];
  screenId: string;
  movieId: string;
  showtimeId: string;
  totalAmount: number;
  theaterId?: string;
  timestamp: number;
  expiresAt: number;
}

export const initializeSeatData = (data: {
  screenId: string;
  movieId: string;
  showtimeId: string;
  theaterId?: string;
}) => {
  const now = Date.now();
  const seatData: SeatPersistenceData = {
    seats: [],
    screenId: data.screenId,
    movieId: data.movieId,
    showtimeId: data.showtimeId,
    totalAmount: 0,
    theaterId: data.theaterId,
    timestamp: now,
    expiresAt: now + TIMEOUTS.SEAT_LOCK_DURATION,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seatData));
  return seatData;
};

export const clearSeatData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getSeatData = (): SeatPersistenceData | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};
