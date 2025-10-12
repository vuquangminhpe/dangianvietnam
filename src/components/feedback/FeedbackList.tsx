/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  AlertTriangle,
  Eye,
  EyeOff,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Flag,
  Calendar,
  User,
  Star,
} from "lucide-react";
import feedbackApi from "../../apis/feedback.api";
import { getAllRating } from "../../apis/rating.api";
import { useAuthStore } from "../../store/useAuthStore";
import type { FeedbackQueryParams } from "../../types/Feedback.type";

interface FeedbackListProps {
  movieId: string;
  showAddFeedbackButton?: boolean;
  onAddFeedback?: () => void;
}

const FeedbackList: React.FC<FeedbackListProps> = ({
  movieId,
  showAddFeedbackButton = true,
  onAddFeedback,
}) => {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<FeedbackQueryParams>({
    page: 1,
    limit: 10,
    movie_id: movieId,
    status: "approved",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [showSpoilers, setShowSpoilers] = useState(false);
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Set<string>>(
    new Set()
  );

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["movie-feedbacks", movieId, filters],
    queryFn: () => feedbackApi.getFeedbacks(filters),
    select: (response) => response.data.result,
  });

  // Get ratings for the movie
  const { data: ratings = [], isLoading: isLoadingRatings } = useQuery({
    queryKey: ["ratings", movieId],
    queryFn: () => getAllRating(movieId),
    enabled: !!movieId,
  });

  const toggleExpanded = (feedbackId: string) => {
    const newExpanded = new Set(expandedFeedbacks);
    if (newExpanded.has(feedbackId)) {
      newExpanded.delete(feedbackId);
    } else {
      newExpanded.add(feedbackId);
    }
    setExpandedFeedbacks(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            }`}
          />
        ))}
      </div>
    );
  };

  const sortOptions = [
    { value: "created_at", label: "Newest First", order: "desc" },
    { value: "created_at", label: "Oldest First", order: "asc" },
    { value: "title", label: "Title A-Z", order: "asc" },
    { value: "title", label: "Title Z-A", order: "desc" },
  ];

  const handleSortChange = (sortBy: string, order: string) => {
    setFilters((prev: any) => ({
      ...prev,
      sort_by: sortBy as any,
      sort_order: order as any,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev: any) => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4" />
        <p className="text-gray-300">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-[#730109]" />
          <h3 className="text-2xl font-bold text-white">
            User Reviews ({feedbackData?.total || 0})
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Spoiler Toggle */}
          <button
            onClick={() => setShowSpoilers(!showSpoilers)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showSpoilers
                ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                : "bg-white/10 border-white/20 text-gray-300 hover:border-white/40"
            }`}
          >
            {showSpoilers ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {showSpoilers ? "Hide Spoilers" : "Show Spoilers"}
          </button>

          {/* Add Review Button */}
          {showAddFeedbackButton && user && (
            <motion.button
              onClick={onAddFeedback}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-[#730109] text-white 
                       font-medium rounded-lg hover:bg-[#5a0708] transition-all"
            >
              Write Review
            </motion.button>
          )}
        </div>
      </div>

      {/* Ratings Section */}
      {!isLoadingRatings && ratings.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-6 w-6 text-[#730109]" />
            <h4 className="text-xl font-bold text-white">
              Movie Ratings ({ratings.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ratings.slice(0, 6).map((rating: any, index: number) => (
              <motion.div
                key={rating._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {rating.user?.name || rating.user?.email || "Anonymous"}
                    </p>
                    {renderStars(rating.rating)}
                  </div>
                </div>
                {rating.review && (
                  <p className="text-gray-300 text-sm mt-2">
                    {truncateContent(rating.review, 100)}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
          {ratings.length > 6 && (
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                And {ratings.length - 6} more ratings...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Sort by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={`${option.value}-${option.order}`}
                onClick={() => handleSortChange(option.value, option.order)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filters.sort_by === option.value &&
                  filters.sort_order === option.order
                    ? "bg-[#730109] text-white"
                    : "bg-white/10 text-gray-300 hover:bg-[#730109]/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbackData?.feedbacks?.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <MessageSquare className="h-16 w-16 text-[#730109] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-300 mb-4">
              Be the first to share your thoughts about this movie!
            </p>
            {showAddFeedbackButton && user && (
              <button
                onClick={onAddFeedback}
                className="px-6 py-2 bg-[#730109] text-white rounded-lg hover:bg-[#5a0708] transition-colors"
              >
                Write First Review
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {feedbackData?.feedbacks?.map((feedback: any, index: number) => {
              const isExpanded = expandedFeedbacks.has(feedback._id as any);
              const shouldShowSpoilerWarning =
                feedback.is_spoiler && !showSpoilers;
              const shouldTruncate =
                !isExpanded && feedback.content.length > 200;

              return (
                <motion.div
                  key={feedback._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${
                    shouldShowSpoilerWarning ? "opacity-60" : ""
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 
                                    rounded-full flex items-center justify-center"
                      >
                        {feedback.user?.avatar ? (
                          <img
                            src={feedback.user.avatar}
                            alt={feedback.user.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {feedback.user?.name || "Anonymous User"}
                        </h4>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(feedback.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {feedback.is_spoiler && (
                        <span
                          className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs 
                                       rounded-full border border-yellow-500/30"
                        >
                          Spoiler
                        </span>
                      )}
                      <button className="p-1 rounded hover:bg-white/10 transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Spoiler Warning */}
                  {shouldShowSpoilerWarning ? (
                    <div className="flex items-center justify-center py-8 border-2 border-dashed border-yellow-500/30 rounded-lg">
                      <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-yellow-300 font-medium mb-2">
                          This review contains spoilers
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                          Enable "Show Spoilers" to read this review
                        </p>
                        <button
                          onClick={() => setShowSpoilers(true)}
                          className="px-4 py-2 bg-[#730109] text-white rounded-lg 
                                   hover:bg-[#5a0708] transition-colors border border-red-500/30"
                        >
                          Show Anyway
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Review Title */}
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {feedback.title}
                      </h3>

                      {/* Review Content */}
                      <div className="text-gray-300 leading-relaxed mb-4">
                        {shouldTruncate ? (
                          <>
                            {truncateContent(feedback.content as any)}
                            <button
                              onClick={() =>
                                toggleExpanded(feedback._id as any)
                              }
                              className="text-purple-400 hover:text-purple-300 ml-2 font-medium"
                            >
                              Read more
                            </button>
                          </>
                        ) : (
                          <>
                            {feedback.content}
                            {feedback.content.length > 200 && isExpanded && (
                              <button
                                onClick={() =>
                                  toggleExpanded(feedback._id as any)
                                }
                                className="text-purple-400 hover:text-purple-300 ml-2 font-medium"
                              >
                                Show less
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <button
                            className="flex items-center gap-2 text-gray-400 hover:text-green-400 
                                           transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm">Helpful</span>
                          </button>
                          <button
                            className="flex items-center gap-2 text-gray-400 hover:text-red-400 
                                           transition-colors"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span className="text-sm">Not helpful</span>
                          </button>
                        </div>
                        <button
                          className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 
                                         transition-colors"
                        >
                          <Flag className="h-4 w-4" />
                          <span className="text-sm">Report</span>
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {feedbackData && feedbackData.total_pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {Array.from(
              { length: feedbackData.total_pages },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  page === filters.page
                    ? "bg-[#730109] text-white"
                    : "bg-white/10 text-gray-300 hover:bg-[#730109]/20"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
