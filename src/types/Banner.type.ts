// Banner related types
export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  type: 'home_slider' | 'promotion' | 'announcement';
  position: number;
  status?: 'active' | 'inactive'; // API uses 'status' instead of 'is_active'
  is_active?: boolean; // Keep for backward compatibility  
  start_date?: string;
  end_date?: string;
  movie_id?: string; // API includes movie_id
  created_at?: string; // API uses created_at instead of createdAt
  updated_at?: string; // API uses updated_at instead of updatedAt
  createdAt?: string; // Keep for backward compatibility
  updatedAt?: string; // Keep for backward compatibility
  movie?: {
    _id: string;
    title: string;
    poster_url: string;
  }; // API includes movie object
}

export interface CreateBannerRequest {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  type: 'home_slider' | 'promotion' | 'announcement';
  position: number;
  status?: 'active' | 'inactive'; // Use status instead of is_active to match API
  is_active?: boolean; // Keep for backward compatibility
  start_date?: string;
  end_date?: string;
  movie_id?: string;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {}

export interface BannerQueryParams {
  page?: number;
  limit?: number;
  type?: 'home_slider' | 'promotion' | 'announcement';
  is_active?: boolean;
  sortBy?: 'position' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface GetBannersResponse {
  success: boolean;
  message: string;
  result: {
    banners: Banner[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalBanners: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    total?: number;
  };
}

export interface GetBannerByIdResponse {
  success: boolean;
  message: string;
  result: Banner;
}

export interface BannerResponse {
  success: boolean;
  message: string;
  result?: Banner;
}
