import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PartnerPage from "./pages/PartnerPage";
import AdminPage from "./pages/AdminPage";
import VerifyPage from "./pages/VerifyPage";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MoviesPage from "./pages/MoviesPage";
import MovieDetail from "./pages/MovieDetailPage/MovieDetailPage";
import SeatLayout from "./pages/SeatLayout/SeatLayout";
import MyBooking from "./pages/MyBooking/MyBooking";
import Favourite from "./pages/Favourite/Favourite";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage/PaymentPage";
import PaymentHistory from "./pages/PaymentHistory/PaymentHistory";
import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed/PaymentFailed";
import ProfilePage from "./pages/ProfilePage";
import SepayInstructions from "./components/sepay/SepayInstructions";
import AdvancedSearchPage from "./pages/AdvancedSearchPage/AdvancedSearchPage";
import ProductPage from "./pages/ProductPage";
import { useEffect } from "react";
import { getUserProfile } from "./apis/user.api";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const location = useLocation();
  const { updateUser } = useAuthStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get("access_token");
    const verify = urlParams.get("verify");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);

      getUserProfile().then((profile) => {
        console.log(profile);

        // Always update the store for both new and existing users
        const authStorageData = {
          state: {
            user: profile?.result,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            tempEmail: null,
          },
          version: 0,
        };
        localStorage.setItem("auth-storage", JSON.stringify(authStorageData));
        updateUser(profile?.result);
      });

      if (verify) {
        localStorage.setItem("verify", verify);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);
  return (
    <>
      <Toaster />
      <Routes>
        {/* Auth routes - no layout */}
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/verify" element={<VerifyPage />} />

        {/* Public landing page */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HomePage />
              <Footer />
            </>
          }
        />

        {/* Admin routes - has own layout */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </RoleProtectedRoute>
          }
        />

        {/* Partner/Staff routes - has own layout */}
        <Route
          path="/partner"
          element={
            <RoleProtectedRoute allowedRoles={["staff"]}>
              <PartnerPage />
            </RoleProtectedRoute>
          }
        />

        {/* Public/Customer routes with main layout */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                {/* Public routes - accessible to all users */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/movies/:id" element={<MovieDetail />} />
                <Route path="/search" element={<AdvancedSearchPage />} />
                <Route path="/product" element={<ProductPage />} />

                {/* Routes that require authentication */}
                <Route
                  path="/movies/:id/:screenId"
                  element={
                    <ProtectedRoute>
                      <SeatLayout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />

                {/* Payment routes */}
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/sepay-instructions"
                  element={
                    <ProtectedRoute>
                      <SepayInstructions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/failed"
                  element={
                    <ProtectedRoute>
                      <PaymentFailed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment-history"
                  element={
                    <ProtectedRoute>
                      <PaymentHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Booking and user routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBooking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favourite"
                  element={
                    <ProtectedRoute>
                      <Favourite />
                    </ProtectedRoute>
                  }
                />

                {/* Default routes */}
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
