import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  getRevenueStats,
  type RevenueStatsParams,
  type RevenueStatsResponse,
} from "../apis/analytics_staff.api";

// Hook for revenue statistics
export const useRevenueStats = (
  params: RevenueStatsParams = {},
  options?: Omit<UseQueryOptions<RevenueStatsResponse>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["revenue-stats", params],
    queryFn: () => getRevenueStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook for revenue statistics with date range
export const useRevenueStatsWithDateRange = (
  dateRange: { start_date: string; end_date: string },
  additionalParams: Omit<RevenueStatsParams, "start_date" | "end_date"> = {}
) => {
  return useRevenueStats({
    ...dateRange,
    ...additionalParams,
  });
};

// Hook for theater-specific revenue stats
export const useTheaterRevenueStats = (
  theaterId: string,
  params: Omit<RevenueStatsParams, "theater_id"> = {}
) => {
  return useRevenueStats({
    theater_id: theaterId,
    ...params,
  });
};

// Hook for movie-specific revenue stats
export const useMovieRevenueStats = (
  movieId: string,
  params: Omit<RevenueStatsParams, "movie_id"> = {}
) => {
  return useRevenueStats({
    movie_id: movieId,
    ...params,
  });
};
