export type Seat = {
  row: string;
  number: number;
  type: "regular" | "premium" | "recliner" | "couple" | string;
  status: "active" | "inactive" | string;
};

export type Theater = {
  _id: string;
  name: string;
  location: string;
  city?: string;
};

export type Screen = {
  _id: string;
  theater_id: string;
  name: string;
  seat_layout: Seat[][];
  capacity: number;
  screen_type: string;
  status: "active" | "inactive" | string;
  created_at: string;
  updated_at: string;
  theater?: Theater;
};