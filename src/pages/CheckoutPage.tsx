/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  MapPin,
  Ticket,
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react";
import type { Screen } from "../types/Screen.type";
import type { Movie } from "../types/Movie.type";
import type { Showtime } from "../types/Showtime.type";
import { getScreenById } from "../apis/screen.api";
import { getMovieById } from "../apis/movie.api";
import { getShowtimeById } from "../apis/showtime.api";
import {
  useCreateBooking,
  useUpdateBooking,
  useBookingExpiration,
} from "../hooks/useBooking";
import { useAuthStore } from "../store/useAuthStore";
import { useSeatPersistence } from "../hooks/useSeatPersistence";
import CheckoutPaymentStep from "../components/checkout/CheckoutPaymentStep";
import { formatCurrency } from "../utils/format";
import { toast } from "sonner";
import type { CreateBookingRequest } from "../types/Booking.type";
import { useMutation } from "@tanstack/react-query";
import bookingApi, { type ReqBodyMultipleSeatLock } from "../apis/booking.api";

type CheckoutStep = "review" | "payment" | "processing";

interface BookingInfo {
  seats: string[];
  screenId: string;
  movieId: string;
  showtimeId: string;
  totalAmount: number;
  theaterId?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("review");
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Original state
  const [seats, setSeats] = useState<string[]>([]);
  const [screen, setScreen] = useState<Screen | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [price, setPrice] = useState<number>(0);

  // Enhanced hooks
  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateBooking();
  const { data: expirationInfo } = useBookingExpiration(
    bookingId || "",
    !!bookingId
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(1200); // 20 minutes in seconds
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const { seatData, isExpired, getTimeRemaining, clearSeatData } =
    useSeatPersistence();

  // Delete locked seats mutation
  const deletedLockedSeatsMutation = useMutation({
    mutationFn: ({
      showtime,
      body,
    }: {
      showtime: string;
      body: ReqBodyMultipleSeatLock;
    }) => bookingApi.deletedShowtimeBySeatLocked(showtime, body),

    onSuccess: () => {
      toast.success("Đã hủy giữ ghế thành công!");
      clearSeatData();
      navigate("/movies");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể hủy giữ ghế";
      toast.error(message);
    },
  });

  // Reset flag when showtimeId changes
  useEffect(() => {
    setHasLoadedData(false);
  }, [seatData?.showtimeId]);

  // Load saved booking info from persistence hook (only once)
  useEffect(() => {
    if (isExpired) {
      // Try to cancel locked seats before clearing data
      if (seatData && seatData.seats.length > 0) {
        deletedLockedSeatsMutation.mutate({
          showtime: seatData.showtimeId,
          body: {
            seats: seatData.seats.map((seat) => {
              const [row, number] = seat.split(/(\d+)/).filter(Boolean);
              return {
                seat_row: row,
                seat_number: parseInt(number),
              };
            }),
          },
        });
      } else {
        clearSeatData();
        toast.error("Session expired! Please select seats again.");
        navigate("/movies");
      }
      return;
    }

    if (seatData && !hasLoadedData) {
      // Get screenId from URL params for validation
      const urlScreenId = searchParams.get("screenId");

      // Validate screenId matches URL parameter if provided
      if (urlScreenId && seatData.screenId !== urlScreenId) {
        console.warn("ScreenId mismatch between localStorage and URL:", {
          localStorage: seatData.screenId,
          url: urlScreenId,
        });
        toast.error("Screen information mismatch. Please select seats again.");
        clearSeatData();
        navigate("/movies");
        return;
      }

      const bookingData: BookingInfo = {
        seats: Array.isArray(seatData.seats) ? seatData.seats : [],
        screenId: seatData.screenId,
        movieId: seatData.movieId,
        showtimeId: seatData.showtimeId,
        totalAmount: seatData.totalAmount || 0,
        theaterId: seatData.theaterId,
      };

      setBookingInfo(bookingData);
      setSeats(bookingData.seats);
      setPrice(bookingData.totalAmount);
      setHasLoadedData(true);

      // Load related data
      if (bookingData.screenId) {
        getScreenById(bookingData.screenId)
          .then(setScreen)
          .catch(() => setScreen(null));
      }
      if (bookingData.movieId) {
        getMovieById(bookingData.movieId)
          .then(setMovie as any)
          .catch(() => setMovie(null));
      }
      if (bookingData.showtimeId) {
        getShowtimeById(bookingData.showtimeId)
          .then(setShowtime)
          .catch(() => setShowtime(null));
      }
    }
  }, [
    seatData,
    isExpired,
    hasLoadedData,
    clearSeatData,
    navigate,
    deletedLockedSeatsMutation,
    searchParams,
  ]);

  // Update seats and price when seatData changes (without calling APIs again)
  useEffect(() => {
    if (seatData && hasLoadedData && bookingInfo) {
      setSeats(Array.isArray(seatData.seats) ? seatData.seats : []);
      setPrice(seatData.totalAmount || 0);

      // Debug: Log price being set
      console.log("CheckoutPage price update:", {
        seatDataTotalAmount: seatData.totalAmount,
        priceBeingSet: seatData.totalAmount || 0,
        couponCode: seatData.couponCode,
        couponDiscount: seatData.couponDiscount,
      });
    }
  }, [seatData?.seats, seatData?.totalAmount, hasLoadedData, bookingInfo]);

  // Update timer from both persistence hook and booking expiration
  useEffect(() => {
    if (expirationInfo && !expirationInfo.is_expired) {
      setTimeRemaining(expirationInfo.time_remaining_seconds);
    } else {
      // Fallback to persistence hook timer if no booking expiration info
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
    }
  }, [expirationInfo, getTimeRemaining]);

  // Countdown timer
  useEffect(() => {
    if (currentStep === "review" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Try to cancel locked seats before expiring
            if (bookingInfo && bookingInfo.seats.length > 0) {
              deletedLockedSeatsMutation.mutate({
                showtime: bookingInfo.showtimeId,
                body: {
                  seats: bookingInfo.seats.map((seat) => {
                    const [row, number] = seat.split(/(\d+)/).filter(Boolean);
                    return {
                      seat_row: row,
                      seat_number: parseInt(number),
                    };
                  }),
                },
              });
            } else {
              toast.error("Session expired! Please select seats again.");
              navigate("/movies");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    currentStep,
    timeRemaining,
    navigate,
    bookingInfo,
    deletedLockedSeatsMutation,
  ]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to check if BOTH selected-movie-info AND seat-locked exist for the current showtimeId
  const checkExistingBooking = (showtimeId: string) => {
    try {
      // Check for selected-movie-info data
      const selectedMovieInfo = localStorage.getItem("selected-movie-info");
      let hasSelectedMovieInfo = false;
      if (selectedMovieInfo) {
        const parsedData = JSON.parse(selectedMovieInfo);
        if (parsedData.showtimeId === showtimeId) {
          hasSelectedMovieInfo = true;
        }
      }

      // Only return true if BOTH exist
      const bothExist = hasSelectedMovieInfo;
      return bothExist;
    } catch (error) {
      console.error("Error checking existing booking data:", error);
      return false;
    }
  };

  // Create booking before payment
  const handleCreateBooking = async () => {
    if (!bookingInfo || !user) {
      toast.error("Missing booking information or user not logged in");
      return;
    }

    if (!bookingInfo.seats || bookingInfo.seats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    setIsCreatingBooking(true);

    try {
      // Prepare booking data with coupon information
      const bookingData: CreateBookingRequest = {
        showtime_id: bookingInfo.showtimeId,
        seats: bookingInfo.seats.map((seat) => {
          const [row, number] = seat.split(/(\d+)/).filter(Boolean);
          return {
            row,
            number: parseInt(number),
            type: "regular" as const, // Default seat type, can be enhanced
          };
        }),
        // Include coupon information from localStorage
        coupon_code: seatData?.couponCode,
        coupon_discount: seatData?.couponDiscount,
        total_amount: bookingInfo.totalAmount, // Final amount after coupon discount
      };

      // Debug: Log booking data being sent
      console.log("Creating Booking with data:", {
        bookingData,
        seatData: {
          couponCode: seatData?.couponCode,
          couponDiscount: seatData?.couponDiscount,
          appliedCoupon: seatData?.appliedCoupon,
          totalAmount: seatData?.totalAmount,
        },
        bookingInfo,
      });

      // Check if existing booking data exists for this showtimeId

      const hasExistingBooking = checkExistingBooking(bookingInfo.showtimeId);

      let response;
      let newBookingId;

      if (hasExistingBooking) {
        // Both selected-movie-info AND seat-locked exist, use updateBooking

        // Get existing booking ID from seat-locked data (preferred) or selected-movie-info
        let existingBookingId = null;

        // Fallback to selected-movie-info if no bookingId in seat-locked
        if (!existingBookingId) {
          const selectedMovieInfo = localStorage.getItem("selected-movie-info");
          if (selectedMovieInfo) {
            const parsedData = JSON.parse(selectedMovieInfo);
            existingBookingId = parsedData.bookingId;
          }
        }

        if (existingBookingId) {
          response = await updateBookingMutation.mutateAsync({
            bookingId: existingBookingId,
            data: bookingData,
          });
          newBookingId = existingBookingId;
        } else {
          // Fallback to createBooking
          response = await createBookingMutation.mutateAsync(bookingData, {});
          newBookingId = response.data.result.booking._id;
        }
      } else {
        // Use createBooking if either or both localStorage items are missing
        response = await createBookingMutation.mutateAsync(bookingData);
        newBookingId = response.data.result.booking._id;
      }

      setBookingId(newBookingId);
      setCurrentStep("payment");
    } catch (error: any) {
      // Error is already handled by the hook
      console.error("Booking creation error:", error);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear seat data after successful payment
    clearSeatData();
    navigate(`/payment/success?bookingId=${bookingId}`);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    navigate(
      `/payment/failed?bookingId=${bookingId}&error=${encodeURIComponent(
        error
      )}`
    );
  };

  // Handle canceling locked seats
  const handleCancelLockedSeats = async () => {
    if (!bookingInfo || !user) return;

    try {
      await deletedLockedSeatsMutation.mutateAsync({
        showtime: bookingInfo.showtimeId,
        body: {
          seats: bookingInfo.seats.map((seat) => {
            const [row, number] = seat.split(/(\d+)/).filter(Boolean);
            return {
              seat_row: row,
              seat_number: parseInt(number),
            };
          }),
        },
      });
    } catch (error) {
      console.error("Error canceling locked seats:", error);
    }
  };

  if (!screen || seats.length === 0 || !bookingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No Booking Information
          </h2>
          <p className="text-gray-300 mb-4">Please select seats first</p>
          <button
            onClick={() => navigate("/movies")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: "review", title: "Review Booking", icon: Ticket },
    { id: "payment", title: "Payment", icon: CreditCard },
    { id: "processing", title: "Processing", icon: Check },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl mt-20">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            <motion.button
              onClick={handleCancelLockedSeats}
              disabled={deletedLockedSeatsMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {deletedLockedSeatsMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Canceling...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Cancel Seats
                </>
              )}
            </motion.button>
          </div>

          {/* Cancel locked seats button */}

          <h1 className="text-3xl font-bold text-white">
            Complete Your Booking
          </h1>
        </motion.div>

        {/* Steps Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted =
                steps.findIndex((s) => s.id === currentStep) > index;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline text-sm font-medium">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? "bg-green-400" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Timer (only show in review step) */}
        {currentStep === "review" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 text-center"
          >
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining <= 60
                  ? "bg-red-500/20 border border-red-500/40 text-red-300"
                  : "bg-orange-500/20 border border-orange-500/40 text-orange-300"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg font-bold">
                {formatTimeRemaining(timeRemaining)}
              </span>
              <span className="text-sm">remaining</span>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Summary - Always visible */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-400" />
                Booking Summary
              </h2>

              {/* Movie Info */}
              {movie && (
                <div className="flex gap-4 mb-6">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg leading-tight">
                      {movie.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">
                      {movie.duration} minutes
                    </p>
                  </div>
                </div>
              )}

              {/* Theater & Showtime */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">
                      {screen.theater?.name}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {screen.theater?.location}, {screen.theater?.city}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Screen: {screen.name} ({screen.screen_type})
                    </p>
                  </div>
                </div>

                {showtime && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-white font-medium">
                        {formatTime(showtime.start_time)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Seats */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Selected Seats</p>
                <div className="flex flex-wrap gap-2">
                  {seats.map((seat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm font-medium"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">
                    {seats.length} seat{seats.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(price)}
                  </span>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="border-t border-white/20 pt-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {currentStep === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Review Your Booking
                  </h2>

                  {/* Booking Details */}
                  <div className="space-y-6">
                    {/* Terms and Conditions */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-300 mb-2">
                        Important Information
                      </h3>
                      <ul className="text-blue-400/80 text-sm space-y-1">
                        <li>• Please arrive 15 minutes before showtime</li>
                        <li>• No refunds after payment confirmation</li>
                        <li>
                          • Seats will be released if payment not completed
                          within 5 minutes
                        </li>
                        <li>• Show your booking confirmation at the theater</li>
                      </ul>
                    </div>

                    {/* Confirm Button */}
                    <motion.button
                      onClick={handleCreateBooking}
                      disabled={
                        isCreatingBooking ||
                        createBookingMutation.isPending ||
                        updateBookingMutation.isPending
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                               font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 
                               transition-all disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                    >
                      {isCreatingBooking ||
                      createBookingMutation.isPending ||
                      updateBookingMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Processing Booking...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Proceed to Payment
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {currentStep === "payment" && bookingId && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <CheckoutPaymentStep
                    bookingId={bookingId}
                    totalAmount={price}
                    originalAmount={seatData?.originalAmount}
                    couponCode={seatData?.couponCode}
                    couponDiscount={seatData?.couponDiscount}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
