/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Star,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import paymentApi from "../../apis/payment.api";
import type {
  CreatePaymentRequest,
  PaymentMethod,
} from "../../types/Payment.type";

// Real booking data from localStorage
interface BookingData {
  _id: string;
  movie: {
    title: string;
    poster_url: string;
    duration: number;
  };
  theater: {
    name: string;
    location: string;
  };
  showtime: {
    start_time: string;
    end_time: string;
  };
  seats: Array<{
    row: string;
    number: number;
    type: string;
    price: number;
  }>;
  total_amount: number;
}

// Interface for localStorage data
interface StoredMovieInfo {
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  movieDuration: number;
  theaterId: string;
  theaterName: string;
  theaterLocation: string;
  showtimeId: string;
  showDate: string;
  startTime: string;
  endTime: string;
  seats: string[];
  totalAmount: number;
  price: {
    regular: number;
    premium: number;
    recliner: number;
    couple: number;
  };
}

const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("booking_id");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("vnpay");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get real booking data from localStorage
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [hasValidSeats, setHasValidSeats] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("selected-movie-info");
    if (storedData) {
      try {
        const parsed: StoredMovieInfo = JSON.parse(storedData);
        
        // Check if seats are selected
        if (!parsed.seats || parsed.seats.length === 0) {
          setHasValidSeats(false);
          toast.error("Please select at least one seat before proceeding to payment");
          return;
        }

        setHasValidSeats(true);

        // Convert seat strings to detailed seat objects
        const seatDetails = parsed.seats.map(seatKey => {
          const row = seatKey.charAt(0);
          const number = parseInt(seatKey.slice(1));
          
          // Determine seat type and price based on row or other logic
          let type = "regular";
          let price = parsed.price?.regular || 80000;
          
          // You can add logic here to determine seat type based on row
          if (row >= 'A' && row <= 'C') {
            type = "premium";
            price = parsed.price?.premium || 120000;
          } else if (row >= 'D' && row <= 'F') {
            type = "recliner";
            price = parsed.price?.recliner || 150000;
          } else if (row === 'Z') {
            type = "couple";
            price = parsed.price?.couple || 200000;
          }

          return {
            row,
            number,
            type,
            price
          };
        });

        const formattedBookingData: BookingData = {
          _id: bookingId || parsed.showtimeId || "",
          movie: {
            title: parsed.movieTitle || "Unknown Movie",
            poster_url: parsed.moviePoster || "/api/placeholder/300/400",
            duration: parsed.movieDuration || 120,
          },
          theater: {
            name: parsed.theaterName || "Unknown Theater",
            location: parsed.theaterLocation || "Unknown Location",
          },
          showtime: {
            start_time: parsed.startTime || new Date().toISOString(),
            end_time: parsed.endTime || new Date().toISOString(),
          },
          seats: seatDetails,
          total_amount: parsed.totalAmount || 0,
        };

        setBookingData(formattedBookingData);
      } catch (error) {
        console.error("Error parsing stored movie info:", error);
        setHasValidSeats(false);
        toast.error("Invalid booking data. Please select seats again.");
      }
    } else {
      setHasValidSeats(false);
      toast.error("No booking information found. Please select seats first.");
    }
  }, [bookingId]);

  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: (response) => {
      const { payment_url } = response.data;

      if (selectedPaymentMethod === "vnpay" && payment_url) {
        // Redirect to VNPay
        window.location.href = payment_url;
      } else {
        // Show success and redirect to booking history
        toast.success("Payment completed successfully!");
        navigate("/my-bookings");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Payment failed");
      setIsProcessing(false);
    },
  });

  const paymentMethods = [
    {
      id: "vnpay" as PaymentMethod,
      name: "VNPay",
      description: "Pay with VNPay gateway",
      icon: Smartphone,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "sepay" as PaymentMethod,
      name: "Sepay Bank Transfer",
      description: "Instant bank transfer with auto-verification",
      icon: Building2,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      id: "credit_card" as PaymentMethod,
      name: "Credit Card",
      description: "Visa, Mastercard, JCB",
      icon: CreditCard,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "wallet" as PaymentMethod,
      name: "Digital Wallet",
      description: "MoMo, ZaloPay, ShopeePay",
      icon: Wallet,
      color: "from-green-500 to-green-600",
    },
  ];

  const handlePayment = async () => {
    if (!bookingData) {
      toast.error("No booking data available");
      return;
    }

    if (!hasValidSeats) {
      toast.error("Please select at least one seat before proceeding");
      navigate(-1); // Go back to seat selection
      return;
    }

    if (!bookingId && !bookingData._id) {
      toast.error("Booking ID is required");
      return;
    }

    if (bookingData.seats.length === 0) {
      toast.error("No seats selected. Please go back and select seats.");
      navigate(-1);
      return;
    }

    if (bookingData.total_amount <= 0) {
      toast.error("Invalid total amount. Please check your booking.");
      return;
    }

    setIsProcessing(true);

    const paymentData: CreatePaymentRequest = {
      booking_id: bookingId || bookingData._id,
      payment_method: selectedPaymentMethod,
    };

    createPaymentMutation.mutate(paymentData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!hasValidSeats || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {!bookingData ? "No Booking Data" : "No Seats Selected"}
          </h2>
          <p className="text-gray-300 mb-4">
            {!bookingData 
              ? "Please select seats and try again" 
              : "You need to select at least one seat to proceed with payment"
            }
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">
            Complete Your Payment
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Booking Summary
              </h2>

              {/* Movie Info */}
              <div className="flex gap-4 mb-6">
                <img
                  src={bookingData.movie.poster_url}
                  alt={bookingData.movie.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg leading-tight">
                    {bookingData.movie.title}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {bookingData.movie.duration} minutes
                  </p>
                </div>
              </div>

              {/* Theater & Showtime */}
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Theater</p>
                  <p className="text-white font-medium">
                    {bookingData.theater.name}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {bookingData.theater.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Showtime</p>
                  <p className="text-white font-medium">
                    {formatDateTime(bookingData.showtime.start_time)}
                  </p>
                </div>
              </div>

              {/* Seats */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {bookingData.seats.map((seat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm"
                    >
                      {seat.row}
                      {seat.number}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-white/20 pt-4">
                <div className="space-y-2 text-sm">
                  {bookingData.seats.map((seat, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-gray-300"
                    >
                      <span>
                        Seat {seat.row}
                        {seat.number} ({seat.type})
                      </span>
                      <span>{formatCurrency(seat.price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between text-white font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(bookingData.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Select Payment Method
              </h2>

              <div className="space-y-4 mb-8">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-purple-400 bg-purple-500/20"
                          : "border-white/20 bg-white/5 hover:border-white/40"
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">
                            {method.name}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {method.description}
                          </p>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="h-6 w-6 text-purple-400" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Security Info */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-green-300 font-medium">Secure Payment</p>
                    <p className="text-green-400/80 text-sm">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePayment}
                disabled={isProcessing || createPaymentMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl 
                         hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing || createPaymentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay {formatCurrency(bookingData.total_amount)}
                  </>
                )}
              </motion.button>

              <p className="text-center text-gray-400 text-sm mt-4">
                By completing this payment, you agree to our Terms of Service
                and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
