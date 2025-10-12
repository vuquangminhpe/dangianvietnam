/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
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
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);

  // Coupon states
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [showCouponInput, setShowCouponInput] = useState(true);
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
        `Đã hủy ghế thành công ${
          (data?.data?.result as any)?.deleted_seats[0].seat_row
        }${(data?.data?.result as any)?.deleted_seats[0].seat_number}!`
      );

      // Delay refresh to allow server to process the unlock
      setTimeout(() => {
        fetchSeatData();
      }, 500);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Không thể hủy đặt ghế";
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
    if (!seatData) {
      toast.error("Vui lòng đợi dữ liệu ghế tải xong");
      return;
    }

    const couponToValidate =
      coupon || availableCoupons.find((c) => c.code === code);
    if (!couponToValidate) {
      toast.error("Không tìm thấy mã giảm giá");
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
        `Áp dụng mã giảm giá thành công! Giảm giá ${response.result.discount_amount.toLocaleString(
          "vi-VN"
        )} VNĐ`
      );
    } catch (error: any) {
      const message = error.message || "Không thể áp dụng mã giảm giá";
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

    toast.info("Đã xóa mã giảm giá");
  };

  // Manual coupon code input
  const handleManualCouponSubmit = async () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
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

  // Fetch seat data function with ref to avoid useEffect dependency issues
  const fetchSeatDataRef = useRef<(() => Promise<void>) | null>(null);

  const fetchSeatData = useCallback(async () => {
    if (!seatData || !seatData.showtimeId || isRefetching) return;

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
  }, [seatData, user, isRefetching]);

  // Update ref when function changes
  useEffect(() => {
    fetchSeatDataRef.current = fetchSeatData;
  }, [fetchSeatData]);

  // Reset initialization flag when showtimeId changes
  useEffect(() => {
    setHasInitialized(false);
  }, [seatData?.showtimeId]);

  // Load initial data only once when showtimeId is available
  useEffect(() => {
    if (
      seatData &&
      !isExpired &&
      seatData.showtimeId &&
      !hasInitialized &&
      !isLoadingInitialData
    ) {
      setIsLoadingInitialData(true);
      fetchSeatDataRef.current?.().finally(() => {
        setHasInitialized(true);
        setIsLoadingInitialData(false);
      });
    }
  }, [seatData?.showtimeId, isExpired, hasInitialized, isLoadingInitialData]);

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

  const handleCheckout = async () => {
    requireAuth(async () => {
      if (!seatData || selectedSeats.length === 0) {
        toast.error("Vui lòng chọn ghế trước khi thanh toán");
        return;
      }

      try {
        // Create booking directly when user clicks Payment
        setIsRefetching(true);

        // Prepare booking data with coupon information
        const bookingData = {
          showtime_id: seatData.showtimeId,
          seats: selectedSeats.map((seat) => {
            const [row, number] = seat.split(/(\d+)/).filter(Boolean);
            return {
              row,
              number: parseInt(number),
              type: "regular" as const,
            };
          }),
          coupon_code: seatData?.couponCode,
          coupon_discount: seatData?.couponDiscount,
          total_amount: seatData?.totalAmount || totalAmount,
        };

        // Navigate to checkout with payment step directly
        navigate(
          `/checkout?movieId=${seatData?.movieId}&screenId=${seatData?.screenId}&step=payment`,
          { state: { bookingData, skipReview: true } }
        );
      } catch (error) {
        console.error("Error preparing checkout:", error);
        toast.error("Lỗi chuẩn bị thanh toán. Vui lòng thử lại.");
      } finally {
        setIsRefetching(false);
      }
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
      className="flex flex-col gap-4 items-center text-gray-300 max-w-6xl mx-auto p-2 sm:p-4"
       style={{ fontFamily: "Black Stuff, cursive" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Screen indicator */}
      <div className="relative w-full max-w-3xl">
        <div className="bg-gradient-to-b from-gray-200 to-gray-400 h-2 sm:h-3 rounded-t-3xl shadow-lg"></div>
        <div className="text-center text-sm sm:text-base text-gray-400 mt-2 font-medium tracking-wider">
          MÀN HÌNH
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
                    whileHover={{ scale: canSelect ? 1.05 : 1 }}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-xs font-bold flex items-center justify-center
                    border border-gray-700 transition-all duration-200 shadow-md hover:shadow-lg
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
                    <span className="text-xs font-bold">
                      {seat.row}
                      {seat.number}
                    </span>
                  </motion.button>
                  {isLocked && countdown !== undefined && countdown > 0 && (
                    <motion.div
                      className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div
                        className={`px-1 py-0.5 rounded-full text-xs font-bold shadow-md border ${
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
      <motion.div
        className="bg-gradient-to-br max-w-5xl from-gray-800/30 to-gray-700/30 rounded-lg p-3 border border-gray-600/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-bold text-sm mb-2 text-center text-gray-200 flex items-center justify-center gap-2">
        

        </h3>
        <div className="flex gap-2">
          {[
            ["THƯỜNG", "bg-blue-500"],
            ["VIP", "bg-purple-500"],
            ["ĐÃ CHỌN", "bg-green-500"],
            ["ĐANG CHỌN", "bg-yellow-500"],
            ["ĐÃ ĐẶT", "bg-red-500"],
            ["KHÔNG SỬ DỤNG", "bg-gray-500"],
          ].map(([type, color], i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1 p-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.02 }}
            >
              <div className={`w-3 h-3 ${color} rounded shadow-sm`}></div>
              <p className="text-xs text-gray-200">{type}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <div className="mt-6 rounded-xl p-4 border border-gray-700/50 max-w-7xl mx-auto w-full bg-gray-800/30">
        <div className="flex items-start justify-between gap-6 w-full">
          {/* Left side: Selected Seats + Total Amount */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Selected Seats */}
            <div className="flex gap-2 items-center">
              <h2 className="font-bold text-lg mb-2 text-white-400 uppercase tracking-wide">
                GHẾ ĐÃ CHỌN
              </h2>
              <div className="min-h-[40px] flex items-center">
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat, index) => (
                      <motion.span
                        key={seat}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {seat}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    Chưa chọn ghế nào
                  </p>
                )}
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex gap-2 items-center">
              <h2 className="font-black text-lg mb-2 text-white-400 uppercase tracking-wide">
                TỔNG TIỀN
              </h2>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white-400 bg-gray-800/50 px-3 py-2 rounded-lg border border-yellow-400/30 shadow-lg">
                  {price ? totalAmount.toLocaleString("vi-VN") : "0"} VNĐ
                </div>
                {selectedCoupon && (
                  <div className="flex items-center justify-between border-t border-gray-600 pt-2">
                    <span className="text-sm text-orange-400">
                      Giảm giá ({selectedCoupon.code}):
                    </span>
                    <span className="text-sm font-bold text-red-400">
                      -{couponDiscount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Coupon Section + Action Buttons */}
          <div className="flex flex-col gap-3 min-w-[300px]">
            {/* Coupon Section */}
            {user && (
              <motion.div
                className="bg-gradient-to-r rounded-lg p-3 shadow-lg border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
              

                {!selectedCoupon && (
                  <div className="space-y-3">
                    {/* Available Coupons */}
                    {availableCoupons.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-300">
                            Mã giảm giá có sẵn:
                          </span>
                          <button
                            onClick={() =>
                              setShowAvailableCoupons(!showAvailableCoupons)
                            }
                            className="text-xs text-white-400 hover:text-orange-300"
                          >
                            Xem tất cả
                          </button>
                        </div>

                        {showAvailableCoupons && (
                          <motion.div
                            className="grid grid-cols-1 gap-2 mb-3"
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
                                  className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-md p-2 cursor-pointer hover:border-orange-400/50 transition-all duration-300"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleValidateCoupon(coupon)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="font-bold text-orange-300 text-xs">
                                        {coupon.code}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {formatCouponDiscount(coupon)}
                                      </p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <p className="text-xs text-gray-400">
                                        Tối thiểu: {coupon.min_purchase.toLocaleString("vi-VN")}₫
                                      </p>
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
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-300">
                          Nhập mã giảm giá:
                        </span>
                        <button
                          onClick={() => setShowCouponInput(!showCouponInput)}
                          className="text-xs text-orange-400 hover:text-orange-300"
                        >
                     
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
                            placeholder="Nhập mã giảm giá..."
                            className="flex-1 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none text-xs"
                          />
                          <button
                            onClick={handleManualCouponSubmit}
                            disabled={isValidatingCoupon || !couponCode.trim()}
                            className={`px-3 py-1 rounded font-medium transition-all duration-300 text-xs ${
                              isValidatingCoupon || !couponCode.trim()
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-yellow-600 hover:bg-yellow-700 text-white"
                            }`}
                          >
                            {isValidatingCoupon ? (
                              <motion.div
                                className="w-3 h-3 border border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                            ) : (
                              "Áp dụng"
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
                    className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-md p-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-green-300 text-xs">
                          ✓ {selectedCoupon.code}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          Tiết kiệm: {couponDiscount.toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="flex-shrink-0 px-2 py-1 bg-red-600/20 border border-red-500/30 rounded text-red-400 hover:bg-red-600/30 transition-all duration-300 text-xs font-medium"
                      >
                        Hủy
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => {
                  if (!isRefetching) {
                    setHasInitialized(false);
                    fetchSeatData();
                  }
                }}
                disabled={isRefetching}
                whileHover={{ scale: isRefetching ? 1 : 1.02 }}
                whileTap={{ scale: isRefetching ? 1 : 0.98 }}
                className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                  isRefetching
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "text-gray-800"
                }`}
                style={{
                  backgroundColor: isRefetching ? undefined : "#ffebd3",
                }}
              >
                {isRefetching ? "Đang làm mới..." : "Làm mới"}
              </motion.button>

              {showConfirmButton && selectedSeats.length > 0 && (
                <motion.button
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 text-white"
                  style={{
                    backgroundColor: "#730109",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Thanh toán ({selectedSeats.length})
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLoginModal && <LoginModal isFormOpen={setShowLoginModal} />}
    </motion.div>
  );
}
