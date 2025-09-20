/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import bookingApi from "../apis/booking.api";
import type {
  CreateBookingRequest,
  BookingQueryParams,
  UpdateBookingStatusRequest,
} from "../apis/booking.api";

// Hook for creating booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create booking";
      toast.error(message);
    },
  });
};
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: CreateBookingRequest;
    }) => bookingApi.updateBooking(data, bookingId),
    onSuccess: () => {
      toast.success("Booking updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update booking";
      toast.error(message);
    },
  });
};
// Hook for fetching user's bookings
export const useMyBookings = (params?: BookingQueryParams) => {
  return useQuery({
    queryKey: ["bookings", "my-bookings", params],
    queryFn: () => bookingApi.getMyBookings(params),
    select: (response) => response.data.result,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for fetching booking by ID
export const useBookingById = (bookingId: string) => {
  return useQuery({
    queryKey: ["bookings", bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId),
    select: (response) => response.data.result,
    enabled: !!bookingId,
    staleTime: 1 * 60 * 1000, // 1 minute for individual booking
  });
};

// Hook for fetching booking by ticket code
export const useBookingByTicketCode = (ticketCode: string) => {
  return useQuery({
    queryKey: ["bookings", "ticket", ticketCode],
    queryFn: () => bookingApi.getBookingByTicketCode(ticketCode),
    select: (response) => response.data.result,
    enabled: !!ticketCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for updating booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: string;
      data: UpdateBookingStatusRequest;
    }) => bookingApi.updateBookingStatus(bookingId, data),
    onSuccess: (_, variables) => {
      const status = variables.data.status;
      const statusMessage = status === "cancelled" ? "cancelled" : "updated";
      toast.success(`Booking ${statusMessage} successfully`);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["bookings", variables.bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update booking";
      toast.error(message);
    },
  });
};

// Hook for cancelling booking
export const useCancelBooking = () => {
  const updateStatus = useUpdateBookingStatus();

  const cancelBooking = (bookingId: string) => {
    return updateStatus.mutate({
      bookingId,
      data: { status: "cancelled" },
    });
  };

  return {
    cancelBooking,
    isLoading: updateStatus.isPending,
    error: updateStatus.error,
  };
};

// Hook for getting ticket QR code
export const useTicketQR = (ticketCode: string) => {
  return useQuery({
    queryKey: ["bookings", "qr", ticketCode],
    queryFn: () => bookingApi.getTicketQR(ticketCode),
    select: (response) => response.data.result,
    enabled: !!ticketCode,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for booking expiration info with polling
export const useBookingExpiration = (
  bookingId: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["bookings", "expiration", bookingId],
    queryFn: () => bookingApi.getBookingExpirationInfo(bookingId),
    select: (response) => response.data.result,
    enabled: enabled && !!bookingId,

    staleTime: 0, // Always fetch fresh data for expiration
  });
};

// Hook for extending booking expiration
export const useExtendBookingExpiration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      additionalMinutes,
    }: {
      bookingId: string;
      additionalMinutes?: number;
    }) => bookingApi.extendBookingExpiration(bookingId, additionalMinutes),
    onSuccess: (_, variables) => {
      toast.success(
        `Booking expiration extended by ${
          variables.additionalMinutes || 5
        } minutes`
      );
      // Invalidate expiration info to get updated times
      queryClient.invalidateQueries({
        queryKey: ["bookings", "expiration", variables.bookingId],
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to extend booking expiration";
      toast.error(message);
    },
  });
};

// Hook for booking statistics
export const useBookingStats = (dateRange?: { from: string; to: string }) => {
  return useQuery({
    queryKey: ["bookings", "stats", dateRange],
    queryFn: () =>
      bookingApi.getMyBookings({
        date_from: dateRange?.from,
        date_to: dateRange?.to,
        limit: 1000, // Get all for stats calculation
      }),
    select: (response) => {
      const bookings = response.data.result.bookings;
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(
        (b) => b.status === "completed"
      );
      const cancelledBookings = bookings.filter(
        (b) => b.status === "cancelled"
      );
      const pendingBookings = bookings.filter((b) => b.status === "pending");

      const totalSpent = completedBookings.reduce(
        (sum, booking) => sum + booking.total_amount,
        0
      );
      const averageSpending =
        completedBookings.length > 0
          ? totalSpent / completedBookings.length
          : 0;

      return {
        total: totalBookings,
        completed: completedBookings.length,
        cancelled: cancelledBookings.length,
        pending: pendingBookings.length,
        totalSpent,
        averageSpending,
        completionRate:
          totalBookings > 0
            ? (completedBookings.length / totalBookings) * 100
            : 0,
        recentBookings: bookings
          .sort(
            (a, b) =>
              new Date(b.booking_time).getTime() -
              new Date(a.booking_time).getTime()
          )
          .slice(0, 5),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
  });
};

// Hook for managing booking flow in checkout
export const useBookingFlow = () => {
  const createBooking = useCreateBooking();

  const createBookingAndRedirect = async (
    bookingData: CreateBookingRequest,
    onSuccess: (bookingId: string) => void,
    onError: (error: string) => void
  ) => {
    try {
      const response = await createBooking.mutateAsync(bookingData);
      const bookingId = response.data.result.booking._id;
      onSuccess(bookingId);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create booking";
      onError(errorMessage);
    }
  };

  return {
    createBookingAndRedirect,
    isCreating: createBooking.isPending,
    error: createBooking.error,
  };
};

// Hook for real-time booking status updates
export const useBookingStatusUpdates = (bookingId: string) => {
  return useQuery({
    queryKey: ["bookings", "status-updates", bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId),
    select: (response) => response.data.result,
    enabled: !!bookingId,
  });
};
