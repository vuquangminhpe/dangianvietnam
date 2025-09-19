import { useAuthStore } from '../store/useAuthStore';
import { useState } from 'react';

export const useAuthAction = () => {
  const { isAuthenticated } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const requireAuth = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      setShowLoginModal(true);
    }
  };

  return {
    requireAuth,
    showLoginModal,
    setShowLoginModal
  };
};
