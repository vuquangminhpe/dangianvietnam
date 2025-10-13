/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  RefreshCw,
  ArrowLeft,
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

  if (isPaymentCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Received!
          </h2>
          <p className="text-gray-600 mb-4">
            Redirecting to confirmation page...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
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
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            {/* Timer */}
            <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg border border-orange-200">
              <Timer className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#730109' }}>
              <Building2 className="h-8 w-8 text-gray-700" />
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
            <div className="rounded-2xl p-6 border border-gray-200 shadow-sm" style={{ backgroundColor: '#37373c' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'white' }}>
                Booking Summary
              </h3>

              <div className="space-y-3">
                {booking?.movie?.poster_url && (
                  <img
                    src={booking?.movie.poster_url}
                    alt={booking?.movie.title}
                    className="w-full h-[530px] object-cover rounded-lg"
                  />
                )}

                <div>
                  <h4 className="font-semibold" style={{ color: 'white' }}>
                    {booking?.movie?.title}
                  </h4>
                  <p style={{ color: '#cccccc' }}>
                    {booking?.theater?.name}
                  </p>
                </div>

                <div className="text-sm space-y-1">
                  <p style={{ color: '#cccccc' }}>
                    Ticket Code:{" "}
                    <span style={{ color: 'white' }}>
                      {booking?.ticket_code}
                    </span>
                  </p>
                  <p style={{ color: '#cccccc' }}>
                    Seats:{" "}
                    <span style={{ color: 'white' }}>
                      {booking?.seats
                        ?.map((s: any) => `${s.row}${s.number}`)
                        .join(", ")}
                    </span>
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  {/* Coupon Discount Display */}
                  {booking?.coupon_code && booking?.coupon_discount && (
                    <>
                      <div className="flex justify-between text-sm mb-2">
                        <span style={{ color: '#cccccc' }}>Original Amount</span>
                        <span style={{ color: 'white' }}>
                          {formatCurrency(
                            booking?.original_amount ||
                              booking?.total_amount + booking?.coupon_discount
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span style={{ color: '#cccccc' }}>Coupon Discount ({booking?.coupon_code})</span>
                        <span style={{ color: '#22c55e' }}>-{formatCurrency(booking?.coupon_discount)}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-2">
                        <div className="flex justify-between font-semibold">
                          <span style={{ color: 'white' }}>Final Total</span>
                          <span style={{ color: 'white' }}>{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* No coupon - just show total */}
                  {!booking?.coupon_code && (
                    <div className="flex justify-between font-semibold">
                      <span style={{ color: 'white' }}>Total</span>
                      <span style={{ color: 'white' }}>{formatCurrency(amount)}</span>
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
            <div className="rounded-2xl p-6 border border-gray-200 shadow-sm" style={{ backgroundColor: '#37373c' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'white' }}>
                <Clock className="h-5 w-5 text-orange-500" />
                Payment Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-orange-500 mx-auto mb-2 animate-spin" />
                  </div>
                </div>

                <button
                  onClick={() => refetchBooking()}
                  className="w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#730109', color: 'white' }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Check Status
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-6 border border-gray-200 shadow-sm" style={{ backgroundColor: '#37373c' }}>
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
