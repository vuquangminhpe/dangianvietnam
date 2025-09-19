/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Seat } from "../../types/Screen.type";
import type { LockedSeat } from "../../types/Showtime.type";
import type { Coupon } from "../../types/Coupon.type";
import { useAuthAction } from "../../hooks/useAuthAction";
import { useAuthStore } from "../../store/useAuthStore";
import { useSeatPersistence } from "../../hooks/useSeatPersistence";
import LoginModal from "../user/LoginModal";
import {
  getShowtimeById,
  getShowtimeByIdLockedSeats,
} from "../../apis/showtime.api";
import { useMutation } from "@tanstack/react-query";
import bookingApi, {
  type ReqBodyMultipleSeatLock,
} from "../../apis/booking.api";
import {
  getMyCoupons,
  validateCoupon,
  isCouponValid,
  formatCouponDiscount,
  isCouponApplicable,
} from "../../apis/coupon_user.api";
import { toast } from "sonner";

type priceType = {
  regular: number;
  premium: number;
  recliner: number;
  couple: number;
};

type Props = {
  seatLayout: Seat[][];
  showConfirmButton?: boolean;
  onSelectSeat?: () => void;
};

export default function SeatSelection({
  seatLayout,
  showConfirmButton = true,
  onSelectSeat,
}: Props) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [price, setPrice] = useState<priceType | null>(null);
  const [lockedSeats, setLockedSeats] = useState<LockedSeat[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});
  const [isRefetching, setIsRefetching] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Coupon states
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  const navigate = useNavigate();
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthAction();
  const { user } = useAuthStore();
  const {
    seatData,
    isExpired,
    updateSeats,
    updateTotalAmount,
    updateBookingId,
    updateCoupon,
    removeCoupon,
    extendExpiration,
  } = useSeatPersistence();

  // Delete locked seats mutation
  const deletedLockedSeatsMutation = useMutation({
    mutationFn: ({
      showtime,
      body,
    }: {
      showtime: string;
      body: ReqBodyMultipleSeatLock;
    }) => bookingApi.deletedShowtimeBySeatLocked(showtime, body),

    onSuccess: (data) => {
      toast.success(
        `Successfully cancelled seat ${(data?.data?.result as any)?.deleted_seats[0].seat_row}${
          (data?.data?.result as any)?.deleted_seats[0].seat_number
        }!`
      );

      // Delay refresh to allow server to process the unlock
      setTimeout(() => {
        fetchSeatData();
      }, 500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Unable to cancel seat reservation";
      console.error("Error unlocking seat:", message);
    },
  });

  // Fetch available coupons for user
  const fetchAvailableCoupons = useCallback(async () => {
    if (!user) return;

    try {
      const response = await getMyCoupons();
      setAvailableCoupons(response.result);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    }
  }, [user]);

  // Validate and apply coupon
  const handleValidateCoupon = async (coupon: Coupon | null, code?: string) => {
    if (!seatData || selectedSeats.length === 0) {
      toast.error("Please select seats before applying coupon");
      return;
    }

    const couponToValidate =
      coupon || availableCoupons.find((c) => c.code === code);
    if (!couponToValidate) {
      toast.error("Coupon not found");
      return;
    }

    setIsValidatingCoupon(true);

    try {
      const response = await validateCoupon({
        code: couponToValidate.code,
        movie_id: seatData.movieId,
        theater_id: seatData.theaterId,
        total_amount: totalAmount,
      });

      setSelectedCoupon(response.result.coupon);
      setCouponDiscount(response.result.discount_amount);
      setCouponCode(response.result.coupon.code);
      setShowCouponInput(false);
      setShowAvailableCoupons(false);

      // Save coupon to localStorage
      updateCoupon(
        response.result.coupon.code,
        response.result.discount_amount,
        response.result.coupon
      );

      toast.success(
        `Coupon applied successfully! Discount ${response.result.discount_amount.toLocaleString(
          "vi-VN"
        )} VND`
      );
    } catch (error: any) {
      const message = error.message || "Cannot apply coupon";
      toast.error(message);

      // Reset coupon state on error
      setSelectedCoupon(null);
      setCouponDiscount(0);
      setCouponCode("");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");

    // Remove coupon from localStorage
    removeCoupon();

    toast.info("Coupon removed");
  };

  // Manual coupon code input
  const handleManualCouponSubmit = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter coupon code");
      return;
    }

    await handleValidateCoupon(null, couponCode.trim());
  };

  // Load seats from persistence hook (only on mount or when showtimeId changes)
  useEffect(() => {
    if (isExpired) {
      setSelectedSeats([]);
      return;
    }

    if (seatData && Array.isArray(seatData.seats) && !hasInitialized) {
      setSelectedSeats(seatData.seats);

      // Restore coupon data if available
      if (seatData.couponCode && seatData.appliedCoupon) {
        setSelectedCoupon(seatData.appliedCoupon);
        setCouponCode(seatData.couponCode);
        setCouponDiscount(seatData.couponDiscount || 0);
      }

      setHasInitialized(true);
    }
  }, [seatData?.showtimeId, isExpired, hasInitialized]);

  // Fetch available coupons when user is available
  useEffect(() => {
    if (user) {
      fetchAvailableCoupons();
    }
  }, [user, fetchAvailableCoupons]);

  // Reset coupon when seats change
  useEffect(() => {
    if (selectedCoupon && selectedSeats.length === 0) {
      handleRemoveCoupon();
    }
  }, [selectedSeats.length, selectedCoupon]);

  // Remove automatic localStorage updates to avoid infinite loops
  // Updates will be handled manually in toggleSeat function

  // Fetch seat data function
  const fetchSeatData = useCallback(async () => {
    if (!seatData || !seatData.showtimeId) return;

    const showtimeId = seatData.showtimeId;
    if (showtimeId) {
      setIsRefetching(true);
      try {
        const [showtime, locked] = await Promise.all([
          getShowtimeById(showtimeId),
          getShowtimeByIdLockedSeats(showtimeId),
        ]);

        setPrice(showtime.price);
        setLockedSeats(locked);

        // Initialize countdowns for locked seats
        const newCountdowns: Record<string, number> = {};
        const userLockedSeats: string[] = [];

        locked.forEach((seat) => {
          const key = `${seat.row}${seat.number}`;
          const expiresAt = new Date(seat.expires_at).getTime();
          const now = new Date().getTime();
          const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
          newCountdowns[key] = remaining;

          // Auto-select seats locked by current user
          if (user && seat.user_id === user._id) {
            userLockedSeats.push(key);
            // Update bookingId from locked seat if it exists
            if (seat.booking_id) {
              updateBookingId(seat.booking_id);
            }
          }
        });

        setCountdowns(newCountdowns);

        // Add user's locked seats to selected seats
        if (userLockedSeats.length > 0) {
          setSelectedSeats((prev) => {
            const newSelection = [...new Set([...prev, ...userLockedSeats])];
            // Also update localStorage when adding locked seats
            updateSeats(newSelection);
            return newSelection;
          });
        }

        // Xử lý booked_seats, loại trừ locked seats
        if (showtime.booked_seats) {
          const lockedSeatKeys = locked.map(
            (seat) => `${seat.row}${seat.number}`
          );
          const bookedSeatKeys = showtime.booked_seats
            .map((seat: any) => `${seat.row}${seat.number}`)
            .filter((seatKey: string) => !lockedSeatKeys.includes(seatKey));
          setBookedSeats(bookedSeatKeys);
        }
      } catch (error) {
        console.error("Failed to fetch showtime data:", error);
      } finally {
        setIsRefetching(false);
      }
    }
  }, [seatData, user]);

  // Reset initialization flag when showtimeId changes
  useEffect(() => {
    setHasInitialized(false);
  }, [seatData?.showtimeId]);

  // Lấy giá tiền và ghế đã đặt từ showtimeId
  useEffect(() => {
    if (seatData && !isExpired && seatData.showtimeId && !hasInitialized) {
      fetchSeatData();
      setHasInitialized(true);
    }
  }, [seatData?.showtimeId, isExpired, hasInitialized, fetchSeatData]); // Only run once when showtimeId is available

  const toggleSeat = (seat: Seat) => {
    const key = `${seat.row}${seat.number}`;
    const isAlreadySelected = selectedSeats.includes(key);

    // Check if this seat is locked by current user
    const lockedSeat = lockedSeats.find(
      (locked) => `${locked.row}${locked.number}` === key
    );
    const isUserLocked = lockedSeat && user && lockedSeat.user_id === user._id;

    // If deselecting a locked seat, call API to unlock it and update UI immediately
    if (isAlreadySelected && isUserLocked && seatData) {
      // Remove from selected seats immediately
      setSelectedSeats((prev) => {
        const newSelection = prev.filter((s) => s !== key);
        updateSeats(newSelection);
        return newSelection;
      });

      // Call API to unlock the seat
      deletedLockedSeatsMutation.mutate({
        showtime: seatData.showtimeId,
        body: {
          seats: [
            {
              seat_row: seat.row,
              seat_number: seat.number,
            },
          ],
        },
      });

      return; // Exit early to prevent duplicate state updates
    }

    // Regular seat selection logic
    setSelectedSeats((prev) => {
      const newSelection = isAlreadySelected
        ? prev.filter((s) => s !== key)
        : [...prev, key];

      if (!isAlreadySelected && prev.length === 0 && onSelectSeat) {
        onSelectSeat();
      }

      // Extend expiration time when user selects seat
      if (!isAlreadySelected) {
        extendExpiration();
      }

      // Manually update localStorage for user actions
      updateSeats(newSelection);

      return newSelection;
    });
  };

  const handleCheckout = () => {
    requireAuth(() => {
      navigate(
        `/checkout?movieId=${seatData?.movieId}&screenId=${seatData?.screenId}`
      );
    });
  };

  const getSeatColor = (
    type: string,
    isSelected: boolean,
    isDisabled: boolean,
    isLocked: boolean,
    isBooked: boolean,
    isUserLocked: boolean
  ) => {
    if (isBooked) return "bg-red-600 text-white cursor-not-allowed";
    if (isUserLocked) return "bg-green-500 text-white hover:bg-green-600"; // User's locked seats appear as selected
    if (isLocked) return "bg-yellow-600 text-white cursor-not-allowed"; // Others' locked seats appear as yellow
    if (isDisabled) return "bg-gray-600 text-gray-400 cursor-not-allowed";
    if (isSelected) return "bg-green-500 text-white hover:bg-green-600";
    switch (type) {
      case "regular":
        return "bg-blue-600 hover:bg-blue-400";
      case "premium":
        return "bg-purple-600 hover:bg-purple-400";
      case "recliner":
        return "bg-pink-600 hover:bg-pink-400";
      case "couple":
        return "bg-yellow-600 hover:bg-yellow-400";
      default:
        return "bg-gray-500 hover:bg-gray-400";
    }
  };

  // ✅ Tính tổng tiền ghế đã chọn theo loại ghế
  const totalAmount = selectedSeats.reduce((sum, seatKey) => {
    for (const row of seatLayout) {
      for (const seat of row) {
        const key = `${seat.row}${seat.number}`;
        if (key === seatKey && price) {
          return sum + (price[seat.type as keyof priceType] || 0);
        }
      }
    }
    return sum;
  }, 0);

  // Calculate final amount after coupon discount
  const finalAmount = Math.max(0, totalAmount - couponDiscount);

  // ✅ Lưu totalAmount vào localStorage khi seats hoặc price đổi
  useEffect(() => {
    if (!price) return;

    const calculatedTotal = selectedSeats.reduce((sum, seatKey) => {
      for (const row of seatLayout) {
        for (const seat of row) {
          const key = `${seat.row}${seat.number}`;
          if (key === seatKey) {
            return sum + (price[seat.type as keyof priceType] || 0);
          }
        }
      }
      return sum;
    }, 0);

    // Save final amount after coupon discount and original amount
    const finalCalculatedAmount = Math.max(0, calculatedTotal - couponDiscount);
    updateTotalAmount(finalCalculatedAmount, calculatedTotal);
  }, [selectedSeats, price, seatLayout, couponDiscount, updateTotalAmount]);

  // Countdown timer for locked seats
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated = { ...prev };
        let hasExpired = false;

        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] -= 1;
          } else if (updated[key] === 0) {
            hasExpired = true;
            delete updated[key];
          }
        });

        // Auto refresh when seats expire
        if (hasExpired) {
          setTimeout(() => fetchSeatData(), 500);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format countdown display
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="flex flex-col gap-8 items-center text-gray-300 max-w-6xl mx-auto p-4 sm:p-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Screen indicator */}
      <div className="relative w-full max-w-3xl">
        <div className="bg-gradient-to-b from-gray-200 to-gray-400 h-2 sm:h-3 rounded-t-3xl shadow-lg"></div>
        <div className="text-center text-sm sm:text-base text-gray-400 mt-2 font-medium tracking-wider">
          SCREEN
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-4xl overflow-x-auto">
        {seatLayout.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            className="flex justify-center gap-1 sm:gap-2 relative min-w-max"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
          >
            {/* Row label */}
            <div className="absolute -left-6 sm:-left-8 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-gray-400 w-4 sm:w-6 text-center">
              {row[0]?.row}
            </div>
            {row.map((seat) => {
              const key = `${seat.row}${seat.number}`;
              const isSelected = selectedSeats.includes(key);
              const isDisabled = seat.status !== "active";
              const lockedSeat = lockedSeats.find(
                (locked) => `${locked.row}${locked.number}` === key
              );
              const isLocked = !!lockedSeat;
              const isUserLocked =
                lockedSeat && user && lockedSeat.user_id === user._id;
              const isOtherUserLocked = isLocked && !isUserLocked;
              const isBooked = bookedSeats.includes(key);
              const canSelect = !isDisabled && !isOtherUserLocked && !isBooked;
              const countdown = countdowns[key];

              return (
                <motion.div key={key} className="relative mb-6">
                  <motion.button
                    disabled={!canSelect}
                    onClick={() => canSelect && toggleSeat(seat)}
                    whileTap={{ scale: canSelect ? 0.95 : 1 }}
                    whileHover={{ scale: canSelect ? 1.1 : 1 }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center
                    border-2 border-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl
                    ${getSeatColor(
                      seat.type,
                      isSelected,
                      isDisabled,
                      isOtherUserLocked,
                      isBooked,
                      !!isUserLocked
                    )}
                    ${canSelect ? "transform hover:-translate-y-1" : ""}
                  `}
                  >
                    <span className="text-xs sm:text-sm font-extrabold">
                      {seat.row}
                      {seat.number}
                    </span>
                  </motion.button>
                  {isLocked && countdown !== undefined && countdown > 0 && (
                    <motion.div
                      className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-10"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-bold shadow-xl border-2 ${
                          isUserLocked
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300"
                            : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-300"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isUserLocked && (
                            <motion.span
                              className="w-2 h-2 bg-white rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                          <span className="font-mono">
                            {formatCountdown(countdown)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          <motion.div
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-bold text-lg mb-3 text-blue-300 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              Selected Seats
            </h3>
            <div className="min-h-[60px] flex items-center">
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat, index) => (
                    <motion.span
                      key={seat}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {seat}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No seats selected.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-bold text-lg mb-3 text-green-300 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              Total Amount
            </h3>
            <div className="space-y-3">
              {/* Original amount */}
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${
                      selectedCoupon
                        ? "text-gray-400 line-through"
                        : "text-green-400"
                    }`}
                  >
                    {price ? totalAmount.toLocaleString("vi-VN") : "0"}
                  </p>
                  {!selectedCoupon && (
                    <p className="text-sm text-gray-400">VNĐ</p>
                  )}
                </div>
                {selectedSeats.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {selectedSeats.length} seats
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      {/* Show breakdown of seat types and prices */}
                      {(() => {
                        const seatsByType: Record<
                          string,
                          { count: number; price: number }
                        > = {};

                        selectedSeats.forEach((seatKey) => {
                          for (const row of seatLayout) {
                            for (const seat of row) {
                              const key = `${seat.row}${seat.number}`;
                              if (key === seatKey && price) {
                                const seatPrice =
                                  price[seat.type as keyof priceType] || 0;
                                if (!seatsByType[seat.type]) {
                                  seatsByType[seat.type] = {
                                    count: 0,
                                    price: seatPrice,
                                  };
                                }
                                seatsByType[seat.type].count += 1;
                              }
                            }
                          }
                        });

                        return Object.entries(seatsByType).map(
                          ([type, data]) => (
                            <div key={type}>
                              {data.count}{" "}
                              {type === "regular"
                                ? "standard"
                                : type === "premium"
                                ? "premium"
                                : type}{" "}
                              × {data.price.toLocaleString("vi-VN")}
                            </div>
                          )
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon discount */}
              {selectedCoupon && (
                <motion.div
                  className="border-t border-gray-600 pt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-orange-400">Coupon:</span>
                      <span className="text-sm font-semibold text-orange-300">
                        {selectedCoupon.code}
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-400 hover:text-red-300 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="text-sm text-red-400">
                      -{couponDiscount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Final amount */}
              {selectedCoupon && (
                <motion.div
                  className="border-t border-gray-600 pt-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-400">
                        {finalAmount.toLocaleString("vi-VN")}
                      </p>
                      <p className="text-sm text-gray-400">
                        VNĐ (sau giảm giá)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-400">
                        Tiết kiệm: {couponDiscount.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Coupon Section */}
      {user && selectedSeats.length > 0 && (
        <motion.div
          className="mt-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-orange-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-xl mb-4 text-center text-orange-300 flex items-center justify-center gap-2">
            <span className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></span>
            Discount Code
          </h3>

          {!selectedCoupon && (
            <div className="space-y-4">
              {/* Available Coupons */}
              {availableCoupons.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">
                      Available Coupons:
                    </span>
                    <button
                      onClick={() =>
                        setShowAvailableCoupons(!showAvailableCoupons)
                      }
                      className="text-sm text-orange-400 hover:text-orange-300"
                    >
                      {showAvailableCoupons ? "Hide" : "View All"}
                    </button>
                  </div>

                  {showAvailableCoupons && (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      {availableCoupons
                        .filter(
                          (coupon) =>
                            isCouponValid(coupon) &&
                            isCouponApplicable(
                              coupon,
                              seatData?.movieId,
                              seatData?.theaterId
                            ) &&
                            totalAmount >= coupon.min_purchase
                        )
                        .map((coupon) => (
                          <motion.div
                            key={coupon._id}
                            className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-3 cursor-pointer hover:border-orange-400/50 transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleValidateCoupon(coupon)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-bold text-orange-300">
                                  {coupon.code}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {coupon.description}
                                </p>
                                <p className="text-sm text-orange-400 mt-1">
                                  {formatCouponDiscount(coupon)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">
                                  Minimum:{" "}
                                  {coupon.min_purchase.toLocaleString("vi-VN")}₫
                                </p>
                                {coupon.max_discount > 0 && (
                                  <p className="text-xs text-gray-400">
                                    Maximum:{" "}
                                    {coupon.max_discount.toLocaleString(
                                      "vi-VN"
                                    )}
                                    ₫
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Manual Coupon Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Enter coupon code:
                  </span>
                  <button
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="text-sm text-orange-400 hover:text-orange-300"
                  >
                    {showCouponInput ? "Hide" : "Enter Code"}
                  </button>
                </div>

                {showCouponInput && (
                  <motion.div
                    className="flex gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter coupon code..."
                      className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleManualCouponSubmit();
                        }
                      }}
                    />
                    <button
                      onClick={handleManualCouponSubmit}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        isValidatingCoupon || !couponCode.trim()
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-orange-600 hover:bg-orange-700 text-white"
                      }`}
                    >
                      {isValidatingCoupon ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Applied Coupon Display */}
          {selectedCoupon && (
            <motion.div
              className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-green-300">
                    ✓ {selectedCoupon.code}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    {selectedCoupon.description}
                  </p>
                  <p className="text-sm text-green-400 mt-2">
                    Savings: {couponDiscount.toLocaleString("vi-VN")} VND
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="flex-shrink-0 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-all duration-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <motion.div
        className="mt-8 bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-bold text-xl mb-6 text-center text-gray-200 flex items-center justify-center gap-2">
          <span className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
          Seat Legend
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            [
              "Standard Seat",
              "bg-gradient-to-r from-blue-500 to-blue-600",
              "Regular seat",
            ],
            [
              "VIP Seat",
              "bg-gradient-to-r from-purple-500 to-purple-600",
              "Premium seat",
            ],
            [
              "Selected",
              "bg-gradient-to-r from-green-500 to-green-600",
              "Your selected seat",
            ],
            [
              "Being Selected",
              "bg-gradient-to-r from-yellow-500 to-orange-500",
              "Seat being selected by others",
            ],
            [
              "Booked",
              "bg-gradient-to-r from-red-500 to-red-600",
              "Already booked seat",
            ],
            [
              "Unavailable",
              "bg-gradient-to-r from-gray-500 to-gray-600",
              "Broken or locked seat",
            ],
          ].map(([type, color, description], i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-2 p-3 bg-gray-800/50 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div
                className={`w-8 h-8 ${color} rounded-lg shadow-lg border-2 border-white/20 flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">{i + 1}</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-200">{type}</p>
                <p className="text-xs text-gray-400 mt-1">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        <motion.button
          onClick={() => {
            setHasInitialized(false);
            fetchSeatData();
          }}
          disabled={isRefetching}
          whileHover={{ scale: isRefetching ? 1 : 1.05 }}
          whileTap={{ scale: isRefetching ? 1 : 0.95 }}
          className={`px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${
            isRefetching
              ? "bg-gray-500 cursor-not-allowed text-gray-300"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-2 border-blue-400/30 hover:border-blue-300/50"
          }`}
        >
          <div className="flex items-center gap-2">
            {isRefetching && (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
            <span>{isRefetching ? "Loading..." : "Refresh"}</span>
          </div>
        </motion.button>

        {showConfirmButton && selectedSeats.length > 0 && (
          <motion.button
            onClick={handleCheckout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl border-2 border-green-400/30 hover:border-green-300/50 transition-all duration-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-extrabold">
                  {selectedSeats.length}
                </span>
              </span>
              <span>Payment</span>
            </div>
          </motion.button>
        )}
      </div>

      {showLoginModal && <LoginModal isFormOpen={setShowLoginModal} />}
    </motion.div>
  );
}
