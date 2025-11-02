/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, AlertTriangle, Send, X, MessageSquare, Eye } from "lucide-react";
import { toast } from "sonner";
import feedbackApi from "../../apis/feedback.api";
import { addRating, getAllRating } from "../../apis/rating.api";
import { useAuthStore } from "../../store/useAuthStore";
import type { CreateFeedbackRequest } from "../../types/Feedback.type";

interface FeedbackFormProps {
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  movieId,
  movieTitle,
  moviePoster,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_spoiler: false,
  });

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showSpoilerWarning, setShowSpoilerWarning] = useState(false);

  // Get existing ratings to check if user already rated
  const { data: existingRatings = [], refetch: refetchRatings } = useQuery({
    queryKey: ["ratings", movieId],
    queryFn: () => getAllRating(movieId),
    enabled: !!movieId && isAuthenticated,
  });

  // Check if user already has a rating
  const userExistingRating =
    existingRatings.length > 0
      ? existingRatings.find((r: any) => r?.user?._id === user?._id)
      : 0;

  const createFeedbackMutation = useMutation({
    mutationFn: (data: CreateFeedbackRequest) =>
      feedbackApi.createFeedback(data),
    onSuccess: () => {
      refetchRatings();
      toast.success("Đánh giá của bạn đã được gửi để kiểm duyệt!");
      queryClient.invalidateQueries({ queryKey: ["movie-feedbacks", movieId] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gửi đánh giá thất bại");
    },
  });

  // Add rating mutation
  const addRatingMutation = useMutation({
    mutationFn: addRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", movieId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gửi đánh giá sao thất bại");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    if (formData.title.length < 5 || formData.title.length > 100) {
      toast.error("Tiêu đề phải từ 5 đến 100 ký tự");
      return;
    }

    if (formData.content.length < 10 || formData.content.length > 2000) {
      toast.error("Nội dung phải từ 10 đến 2000 ký tự");
      return;
    }

    if (formData.is_spoiler && !showSpoilerWarning) {
      setShowSpoilerWarning(true);
      return;
    }

    try {
      // Submit rating if provided and user doesn't already have one
      if (rating > 0 && !userExistingRating) {
        await addRatingMutation.mutateAsync({
          movie_id: movieId,
          rating: rating,
          review: formData.content.trim(), // Use feedback content as review
        });
      }

      // Submit feedback
      const feedbackData: CreateFeedbackRequest = {
        movie_id: movieId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_spoiler: formData.is_spoiler,
      };

      createFeedbackMutation.mutate(feedbackData);
    } catch (error) {
      console.error("Error submitting rating:", error);
      // Continue with feedback submission even if rating fails
      const feedbackData: CreateFeedbackRequest = {
        movie_id: movieId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_spoiler: formData.is_spoiler,
      };

      createFeedbackMutation.mutate(feedbackData);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const StarRating = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          className="transition-colors"
        >
          <Star
            className={`h-8 w-8 ${
              star <= (hoveredRating || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-gray-300">
        {rating > 0 && `${rating}/5 sao`}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-10 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 sm:p-6 md:p-8 w-full max-w-lg sm:max-w-xl md:max-w-3xl 
                   border border-white/20 shadow-2xl max-h-[88vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {moviePoster && (
              <img
                src={moviePoster}
                alt={movieTitle}
                className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-lg"
              />
            )}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-[#730109]" />
                Chia sẻ cảm nhận của bạn
              </h2>
              <p className="text-gray-300 text-base sm:text-lg">{movieTitle}</p>
            </div>
          </div>
          <div className="flex md:block justify-end">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Spoiler Warning Modal */}
        {showSpoilerWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-60 flex items-center justify-center px-4 py-6 bg-black/80"
          >
            <div className="bg-gradient-to-br from-red-900/90 to-orange-900/90 rounded-xl p-6 max-w-md border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <h3 className="text-xl font-bold text-white">
                  Cảnh báo tiết lộ nội dung
                </h3>
              </div>
              <p className="text-gray-200 mb-6">
                Bạn đã đánh dấu phản hồi này có thể tiết lộ nội dung. Điều này sẽ
                cảnh báo người xem khác trước khi đọc. Bạn có chắc muốn tiếp tục?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowSpoilerWarning(false);
                    handleSubmit({
                      preventDefault: () => {},
                    } as React.FormEvent);
                  }}
                  className="flex-1 py-3 px-6 bg-[#730109] text-white font-medium rounded-lg 
                       hover:bg-[#5a0708] transition-colors"
                >
                  Đồng ý gửi kèm cảnh báo
                </button>
                <button
                  onClick={() => setShowSpoilerWarning(false)}
                  className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Đánh giá sao (không bắt buộc)
              {userExistingRating && (
                <span className="text-yellow-400 text-sm ml-2">
                  (Bạn đã đánh giá: {userExistingRating.rating}/5 ⭐)
                </span>
              )}
            </label>
            {!userExistingRating ? (
              <StarRating />
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  Bạn đã đánh giá vở diễn này ({userExistingRating.rating}/5 sao). 
                  Đánh giá chi tiết vẫn sẽ được gửi mà không thay đổi số sao đã cho.
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiêu đề đánh giá <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Hãy tóm tắt cảm nhận của bạn..."
              maxLength={100}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Yêu cầu 5-100 ký tự</span>
              <span
                className={`${
                  formData.title.length > 100 ? "text-red-400" : "text-gray-400"
                }`}
              >
                {formData.title.length}/100
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nội dung đánh giá <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Chia sẻ cảm nhận chi tiết về vở diễn. Bạn ấn tượng điều gì? Có điều gì chưa hài lòng? Bạn có giới thiệu cho người khác không?"
              maxLength={2000}
              rows={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Yêu cầu 10-2000 ký tự</span>
              <span
                className={`${
                  formData.content.length > 2000
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {formData.content.length}/2000
              </span>
            </div>
          </div>

          {/* Spoiler Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Đánh dấu có tiết lộ nội dung?</p>
                <p className="text-gray-300 text-sm">
                  Hãy bật nếu đánh giá của bạn có thể làm lộ chi tiết cốt truyện.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleInputChange("is_spoiler", !formData.is_spoiler)
              }
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                formData.is_spoiler ? "bg-yellow-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  formData.is_spoiler ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium text-sm">
                  Kiểm duyệt đánh giá
                </p>
                <p className="text-blue-400/80 text-sm">
                  Đánh giá sẽ được đội ngũ kiểm duyệt trước khi xuất bản để đảm bảo tuân thủ quy định cộng đồng.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 px-6 bg-gray-600 text-white font-medium rounded-lg 
                       hover:bg-gray-700 transition-colors"
            >
              Hủy bỏ
            </motion.button>
            <motion.button
              type="submit"
              disabled={createFeedbackMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 px-6 bg-[#730109] text-white 
                       font-medium rounded-lg hover:bg-[#5a0708] transition-all 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createFeedbackMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Gửi đánh giá
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FeedbackForm;
