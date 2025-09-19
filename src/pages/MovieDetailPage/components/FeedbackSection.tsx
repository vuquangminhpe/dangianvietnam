/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaStar } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllRating, addRating } from "../../../apis/rating.api";

export default function FeedbackSection({
  userId,
  movieId,
  selectedInfo,
  setSelectedInfo,
}: any) {
  const queryClient = useQueryClient();

  // Get all ratings for the movie
  const {
    data: feedbacks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ratings", movieId],
    queryFn: () => getAllRating(movieId),
    enabled: !!movieId,
  });

  // Add rating mutation
  const addRatingMutation = useMutation({
    mutationFn: addRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", movieId] });
      setSelectedInfo({ rating: 0, comment: "" });
    },
  });

  const handleSubmitFeedback = () => {
    if (!selectedInfo.rating || !selectedInfo.comment.trim()) return;

    addRatingMutation.mutate({
      movie_id: movieId,
      rating: selectedInfo.rating,
      review: selectedInfo.comment,
    });
  };

  return (
    <div className="mt-10 bg-[#1E1E1E] text-gray-300 rounded-3xl p-6 mb-2">
      <h2 className="text-2xl font-bold mb-4">Đánh giá phim</h2>
      {userId && (
        <div className="mb-6">
          <p className="mb-2 font-semibold">Chọn sao đánh giá:</p>
          <div className="flex mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                onClick={() =>
                  setSelectedInfo((prev: any) => ({ ...prev, rating: i + 1 }))
                }
                className={`cursor-pointer text-2xl ${
                  i < selectedInfo.rating ? "text-yellow-400" : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <textarea
            className="w-full p-3 border border-gray-700 bg-[#2A2A2A] text-white rounded-lg"
            rows={4}
            placeholder="Viết đánh giá của bạn..."
            value={selectedInfo.comment}
            onChange={(e) =>
              setSelectedInfo((prev: any) => ({
                ...prev,
                comment: e.target.value,
              }))
            }
          />
          <button
            onClick={handleSubmitFeedback}
            disabled={
              addRatingMutation.isPending ||
              !selectedInfo.rating ||
              !selectedInfo.comment.trim()
            }
            className="mt-2 px-4 py-2 text-xs bg-primary rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addRatingMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      )}

      <h3 className="text-xl font-semibold mt-6">Phản hồi từ người xem:</h3>

      {isLoading ? (
        <p className="text-sm text-gray-500 mt-2">Đang tải đánh giá...</p>
      ) : error ? (
        <p className="text-sm text-red-500 mt-2">Lỗi khi tải đánh giá.</p>
      ) : feedbacks.length ? (
        feedbacks.map((fb: any, idx: number) => (
          <div key={idx} className="border-b border-gray-700 py-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-sm ${
                    i < fb.rating ? "text-yellow-400" : "text-gray-500"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-400">
                {fb.user?.email || "Ẩn danh"}
              </span>
            </div>
            <p className="text-sm text-gray-300">{fb.review}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500 mt-2">Chưa có đánh giá nào.</p>
      )}

      {addRatingMutation.isError && (
        <p className="text-sm text-red-500 mt-2">
          Lỗi khi gửi đánh giá: {addRatingMutation.error?.message}
        </p>
      )}
    </div>
  );
}
