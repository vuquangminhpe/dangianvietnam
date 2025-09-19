import { Routes, Route, Navigate } from "react-router-dom";
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

function App() {
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
