export interface Feedback {
  _id: string;
  user_id: string;
  movie_id: string;
  title: string;
  content: string;
  is_spoiler: boolean;
  status: FeedbackStatus;
  moderation_note?: string;
  created_at: string;
  updated_at: string;
  user?: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  movie?: {
    _id: string;
    title: string;
    poster_url: string;
    description: string;
  };
}

export type FeedbackStatus = "pending" | "approved" | "rejected";

export interface CreateFeedbackRequest {
  movie_id: string;
  title: string;
  content: string;
  is_spoiler?: boolean;
}

export interface UpdateFeedbackRequest {
  title?: string;
  content?: string;
  is_spoiler?: boolean;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}

export interface GetFeedbacksResponse {
  message: string;
  result: {
    feedbacks: Feedback[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  movie_id?: string;
  user_id?: string;
  status?: FeedbackStatus;
  search?: string;
  sort_by?: "created_at" | "title";
  sort_order?: "asc" | "desc";
}

// UI specific types
export interface FeedbackFormData {
  title: string;
  content: string;
  is_spoiler: boolean;
  rating?: number; // Optional rating integration
}

export interface FeedbackFilters {
  status: FeedbackStatus | "all";
  sortBy: "newest" | "oldest" | "title";
  showSpoilers: boolean;
}

export interface FeedbackStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  spoilers: number;
  approvalRate: number;
  averageLength: number;
  recentFeedbacks: Feedback[];
}
