/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import feedbackApi from "../apis/feedback.api";
import type {
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  UpdateFeedbackStatusRequest,
  FeedbackQueryParams,
} from "../types/Feedback.type";

// Hook for creating feedback
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackRequest) =>
      feedbackApi.createFeedback(data),
    onSuccess: (_, variables) => {
      toast.success("Your review has been submitted for moderation");
      // Invalidate feedback queries for the specific movie
      queryClient.invalidateQueries({
        queryKey: ["feedbacks", "movie", variables.movie_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["feedbacks"],
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to submit review";
      toast.error(message);
    },
  });
};

// Hook for fetching feedbacks with filters
export const useFeedbacks = (params?: FeedbackQueryParams) => {
  return useQuery({
    queryKey: ["feedbacks", params],
    queryFn: () => feedbackApi.getFeedbacks(params),
    select: (response) => response.data.result,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching feedback by ID
export const useFeedbackById = (feedbackId: string) => {
  return useQuery({
    queryKey: ["feedbacks", feedbackId],
    queryFn: () => feedbackApi.getFeedbackById(feedbackId),
    select: (response) => response.data.result,
    enabled: !!feedbackId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching movie feedbacks (approved only)
export const useMovieFeedbacks = (
  movieId: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ["feedbacks", "movie", movieId, params],
    queryFn: () => feedbackApi.getMovieFeedbacks(movieId, params),
    select: (response) => response.data.result,
    enabled: !!movieId,
    staleTime: 3 * 60 * 1000, // 3 minutes for movie feedbacks
  });
};

// Hook for updating feedback (user can only update their own)
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedbackId,
      data,
    }: {
      feedbackId: string;
      data: UpdateFeedbackRequest;
    }) => feedbackApi.updateFeedback(feedbackId, data),
    onSuccess: (_, variables) => {
      toast.success("Review updated successfully");
      // Invalidate specific feedback and related queries
      queryClient.invalidateQueries({
        queryKey: ["feedbacks", variables.feedbackId],
      });
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update review";
      toast.error(message);
    },
  });
};

// Hook for updating feedback status (admin only)
export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedbackId,
      data,
    }: {
      feedbackId: string;
      data: UpdateFeedbackStatusRequest;
    }) => feedbackApi.updateFeedbackStatus(feedbackId, data),
    onSuccess: (_, variables) => {
      const status = variables.data.status;
      const statusMessage =
        status === "approved"
          ? "approved"
          : status === "rejected"
          ? "rejected"
          : "updated";
      toast.success(`Feedback ${statusMessage} successfully`);

      // Invalidate all feedback queries
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update feedback status";
      toast.error(message);
    },
  });
};

// Hook for deleting feedback
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) => feedbackApi.deleteFeedback(feedbackId),
    onSuccess: () => {
      toast.success("Review deleted successfully");
      // Invalidate all feedback queries
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete review";
      toast.error(message);
    },
  });
};

// Hook for checking if user can submit feedback for a movie
export const useCanSubmitFeedback = (movieId: string) => {
  // This would typically check if user has watched the movie (completed booking)
  // For now, we'll simulate this check
  return useQuery({
    queryKey: ["can-submit-feedback", movieId],
    queryFn: async () => {
      // In a real app, this would check:
      // 1. User has completed booking for this movie
      // 2. The showtime has ended
      // 3. User hasn't already submitted feedback

      // Mock implementation - always return true for now
      return {
        canSubmit: true,
        reason: null,
        hasWatched: true,
        hasExistingFeedback: false,
      };
    },
    enabled: !!movieId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for feedback analytics (admin use)
export const useFeedbackStats = (movieId?: string) => {
  return useQuery({
    queryKey: ["feedback-stats", movieId],
    queryFn: () =>
      feedbackApi.getFeedbacks({
        movie_id: movieId,
        limit: 1000, // Get all for stats
      }),
    select: (response) => {
      const feedbacks = response.data.result.feedbacks;
      const totalFeedbacks = feedbacks.length;
      const approvedFeedbacks = feedbacks.filter(
        (f: { status: string }) => f.status === "approved"
      );
      const pendingFeedbacks = feedbacks.filter(
        (f: { status: string }) => f.status === "pending"
      );
      const rejectedFeedbacks = feedbacks.filter(
        (f: { status: string }) => f.status === "rejected"
      );
      const spoilerFeedbacks = feedbacks.filter(
        (f: { is_spoiler: any }) => f.is_spoiler
      );

      return {
        total: totalFeedbacks,
        approved: approvedFeedbacks.length,
        pending: pendingFeedbacks.length,
        rejected: rejectedFeedbacks.length,
        spoilers: spoilerFeedbacks.length,
        approvalRate:
          totalFeedbacks > 0
            ? (approvedFeedbacks.length / totalFeedbacks) * 100
            : 0,
        averageLength:
          totalFeedbacks > 0
            ? feedbacks.reduce(
                (sum: any, f: { content: string | any[] }) =>
                  sum + f.content.length,
                0
              ) / totalFeedbacks
            : 0,
        recentFeedbacks: feedbacks
          .sort(
            (
              a: { created_at: string | number | Date },
              b: { created_at: string | number | Date }
            ) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5),
      };
    },
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
  });
};

// Hook for user's own feedbacks
export const useMyFeedbacks = (
  params?: Omit<FeedbackQueryParams, "user_id">
) => {
  return useQuery({
    queryKey: ["feedbacks", "my-feedbacks", params],
    queryFn: () =>
      feedbackApi.getFeedbacks({
        ...params,
        // user_id will be determined by the backend based on auth token
      }),
    select: (response) => response.data.result,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for moderating feedbacks (admin use)
export const useModerateFeedback = () => {
  const updateStatus = useUpdateFeedbackStatus();

  const approveFeedback = (feedbackId: string) => {
    return updateStatus.mutate({
      feedbackId,
      data: { status: "approved" },
    });
  };

  const rejectFeedback = (feedbackId: string) => {
    return updateStatus.mutate({
      feedbackId,
      data: { status: "rejected" },
    });
  };

  return {
    approveFeedback,
    rejectFeedback,
    isLoading: updateStatus.isPending,
    error: updateStatus.error,
  };
};
