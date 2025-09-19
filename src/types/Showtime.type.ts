// types/Showtime.type.ts
export type Theater = {
  _id: string;
  name: string;
  location: string;
};

export type Screen = {
  _id: string;
  name: string;
  screen_type: string;
};

export type Movie = {
  _id: string;
  title: string;
  poster_url: string;
  duration: number;
};

export type ShowtimeStatus = "booking_open" | "booking_closed" | "completed";

export interface Showtime {
  _id: string;
  movie_id: string;
  screen_id: string;
  theater_id: string;
  start_time: string;
  end_time: string;
  price: {
    regular: number;
    premium: number;
    recliner: number;
    couple: number;
  };
  booked_seats: LockedSeat[];
  available_seats: number;
  status: ShowtimeStatus;
  movie: Movie | null;
  screen: Screen | null;
  theater: Theater | null;
  created_at: string;
  updated_at: string;
}

export interface CreateShowtimeRequest {
  movie_id: string;
  screen_id: string;
  theater_id: string;
  start_time: string;
  end_time: string;
  price: {
    regular: number;
    premium: number;
    recliner: number;
    couple: number;
  };
  available_seats: number;
  status: ShowtimeStatus;
}

export type UpdateShowtimeRequest = Partial<CreateShowtimeRequest>;

export interface ShowtimeQueryParams {
  page?: number;
  limit?: number;
  movie_id?: string;
  theater_id?: string;
  status?: ShowtimeStatus;
  date?: string;
  sortBy?: "start_time" | "available_seats" | "price.regular" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface LockedSeat {
  row: string;
  number: number;
  expires_at: string;
  user_id: string;
  showtime_id: string;
  booking_id: string;
}
