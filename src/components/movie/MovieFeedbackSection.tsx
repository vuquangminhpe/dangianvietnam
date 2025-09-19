import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import FeedbackForm from "../feedback/FeedbackForm";
import FeedbackList from "../feedback/FeedbackList";
import { useAuthStore } from "../../store/useAuthStore";
import { useCanSubmitFeedback } from "../../hooks/useFeedback";
import LoginModal from "../user/LoginModal";

interface MovieFeedbackSectionProps {
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
}

const MovieFeedbackSection: React.FC<MovieFeedbackSectionProps> = ({
  movieId,
  movieTitle,
  moviePoster,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: canSubmitData } = useCanSubmitFeedback(movieId);

  const handleAddFeedback = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!canSubmitData?.canSubmit) {
      return;
    }

    setShowFeedbackForm(true);
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Feedback List */}
      <FeedbackList
        movieId={movieId}
        showAddFeedbackButton={isAuthenticated && canSubmitData?.canSubmit}
        onAddFeedback={handleAddFeedback}
      />

      {/* Feedback Form Modal */}
      <AnimatePresence>
        {showFeedbackForm && (
          <FeedbackForm
            movieId={movieId}
            movieTitle={movieTitle}
            moviePoster={moviePoster}
            onClose={() => setShowFeedbackForm(false)}
            onSuccess={handleFeedbackSuccess}
          />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && <LoginModal isFormOpen={setShowLoginModal} />}
      </AnimatePresence>
    </div>
  );
};

export default MovieFeedbackSection;
