/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  Timer,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import bookingApi from "../../apis/booking.api";
import { formatCurrency } from "../../utils/format";
import VietQRBanking from "../QR/QRSection";

const SepayInstructions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId");

  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  // Fetch booking data
  const { data: bookingData, refetch: refetchBooking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId || ""),
    enabled: !!bookingId,
    refetchInterval: 10000, // Check every 10 seconds for payment completion
  });

  const booking = bookingData?.data?.result;

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to payment failed page
          navigate(`/payment/failed?bookingId=${bookingId}&error=timeout`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingId, navigate]);

  // Check payment status
  useEffect(() => {
    if (booking?.payment_status === "completed") {
      setIsPaymentCompleted(true);
      toast.success("Payment completed successfully!");
      setTimeout(() => {
        navigate(`/payment/success?bookingId=${bookingId}`);
      }, 2000);
    }
  }, [booking?.payment_status, bookingId, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const transferContent = booking?.ticket_code || "";
  const amount = booking?.total_amount || 0;

  // Debug: Log booking data to understand the issue
  useEffect(() => {
    if (booking) {
      console.log("Sepay Booking Data:", {
        total_amount: booking.total_amount,
        coupon_code: booking.coupon_code,
        coupon_discount: booking.coupon_discount,
        seats: booking.seats,
        full_booking: booking,
      });
    }
  }, [booking]);

  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Wait for process QR code
          </h2>

          <button
            onClick={() => navigate("/my-bookings")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (isPaymentCompleted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="h-24 w-24 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Payment Received!
          </h2>
          <p className="text-gray-300 mb-4">
            Redirecting to confirmation page...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      {/* Background Elements */}

      <div className="relative z-10 container mx-auto px-4 max-w-7xl mt-20">
        {/* Header */}
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

            {/* Timer */}
            <div className="flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg">
              <Timer className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="h-8 w-8 " />
              Bank Transfer Instructions
            </h1>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Transfer Instructions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Booking Summary */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Booking Summary
              </h3>

              <div className="space-y-3">
                {booking.movie?.poster_url && (
                  <img
                    src={booking.movie.poster_url}
                    alt={booking.movie.title}
                    className="w-full h-[530px] object-cover rounded-lg"
                  />
                )}

                <div>
                  <h4 className="font-semibold text-white">
                    {booking.movie?.title}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {booking.theater?.name}
                  </p>
                </div>

                <div className="text-sm space-y-1">
                  <p className="text-gray-400">
                    Ticket Code:{" "}
                    <span className="text-white font-mono">
                      {booking.ticket_code}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Seats:{" "}
                    <span className="text-white">
                      {booking.seats
                        ?.map((s: any) => `${s.row}${s.number}`)
                        .join(", ")}
                    </span>
                  </p>
                </div>

                <div className="border-t border-white/20 pt-3">
                  {/* Coupon Discount Display */}
                  {booking.coupon_code && booking.coupon_discount && (
                    <>
                      <div className="flex justify-between text-gray-300 text-sm mb-2">
                        <span>Original Amount</span>
                        <span>
                          {formatCurrency(
                            booking.original_amount ||
                              booking.total_amount + booking.coupon_discount
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-400 text-sm mb-2">
                        <span>Coupon Discount ({booking.coupon_code})</span>
                        <span>-{formatCurrency(booking.coupon_discount)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2">
                        <div className="flex justify-between text-white font-semibold">
                          <span>Final Total</span>
                          <span>{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* No coupon - just show total */}
                  {!booking.coupon_code && (
                    <div className="flex justify-between text-white font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Summary & Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Payment Status */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Payment Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-center p-4  rounded-lg">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-orange-400 mx-auto mb-2 animate-spin" />
                  </div>
                </div>

                <button
                  onClick={() => refetchBooking()}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Check Status
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="space-y-4">
                <VietQRBanking amount={amount} content={transferContent} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SepayInstructions;
