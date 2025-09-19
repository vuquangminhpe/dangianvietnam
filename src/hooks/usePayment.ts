/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/usePayment.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import paymentApi from "../apis/payment.api";
import type {
  CreatePaymentRequest,
  UpdatePaymentStatusRequest,
} from "../types/Payment.type";
import type { PaymentQueryParams } from "../apis/payment.api";

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: (_, variables) => {
      // Only show success toast for non-Sepay payments
      if (variables.payment_method !== "sepay") {
        toast.success("Payment initiated successfully");
      } else {
        // For Sepay, show different message
        toast.info(
          "Transfer instructions prepared. Please complete the bank transfer."
        );
      }

      // Invalidate and refetch payment queries
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Payment failed";
      toast.error(message);
    },
  });
};

// Hook for fetching user's payments
export const useMyPayments = (params?: PaymentQueryParams) => {
  return useQuery({
    queryKey: ["payments", "my-payments", params],
    queryFn: () => paymentApi.getMyPayments(params),
    select: (response) => response.data.result,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching payment by ID
export const usePaymentById = (paymentId: string) => {
  return useQuery({
    queryKey: ["payments", paymentId],
    queryFn: () => paymentApi.getPaymentById(paymentId),
    select: (response) => response.data.result,
    enabled: !!paymentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for updating payment status (admin only)
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data: UpdatePaymentStatusRequest;
    }) => paymentApi.updatePaymentStatus(paymentId, data),
    onSuccess: (_, variables) => {
      toast.success("Payment status updated successfully");
      // Invalidate specific payment and list queries
      queryClient.invalidateQueries({
        queryKey: ["payments", variables.paymentId],
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update payment status";
      toast.error(message);
    },
  });
};

// Hook for payment statistics (can be used in admin dashboard)
export const usePaymentStats = (dateRange?: { from: string; to: string }) => {
  return useQuery({
    queryKey: ["payments", "stats", dateRange],
    queryFn: () =>
      paymentApi.getMyPayments({
        date_from: dateRange?.from,
        date_to: dateRange?.to,
        limit: 1000, // Get all for stats calculation
      }),
    select: (response) => {
      const payments = response.data.result.payments;
      const totalAmount = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const completedPayments = payments.filter(
        (p) => p.status === "completed"
      );
      const failedPayments = payments.filter((p) => p.status === "failed");

      return {
        total: payments.length,
        completed: completedPayments.length,
        failed: failedPayments.length,
        pending: payments.filter((p) => p.status === "pending").length,
        refunded: payments.filter((p) => p.status === "refunded").length,
        totalAmount,
        completedAmount: completedPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ),
        successRate:
          payments.length > 0
            ? (completedPayments.length / payments.length) * 100
            : 0,
        paymentMethods: payments.reduce((acc, payment) => {
          acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for stats
  });
};

// Hook for retrying failed payments
export const useRetryPayment = () => {
  const createPayment = useCreatePayment();

  const retryPayment = (bookingId: string, paymentMethod: string = "vnpay") => {
    return createPayment.mutate({
      booking_id: bookingId,
      payment_method: paymentMethod as any,
    });
  };

  return {
    retryPayment,
    isLoading: createPayment.isPending,
    error: createPayment.error,
  };
};

export const useVNPayCallback = (bookingId?: string) => {
  return useQuery({
    queryKey: ["vnpay-callback", bookingId],
    queryFn: async () => {
      if (bookingId) {
        const payments = await paymentApi.getMyPayments({ limit: 10 });
        const relevantPayment = payments.data.result.payments.find(
          (p) => p.booking_id === bookingId
        );
        return relevantPayment;
      }
      return null;
    },
    enabled: !!bookingId,
  });
};
