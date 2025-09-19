export interface Theater {
  _id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  screens: number;
  amenities: string[];
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Response for getting a list of theaters
export interface GetTheatersResponse {
  message: string;  
  result:{
    theaters: Theater[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }
}

// Response for getting a single theater by ID
export interface GetTheaterByIdResponse {
  theater: Theater;
}

// Response for create/update theater
export interface TheaterResponse {
  message: string;
  theater: Theater;
}

