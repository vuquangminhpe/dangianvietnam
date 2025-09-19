/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Building2,
  AlertCircle,
} from "lucide-react";
import { useCreatePayment } from "../../hooks/usePayment";
import type { PaymentMethod } from "../../types/Payment.type";
import { formatCurrency } from "../../utils/format";
import { PAYMENT_METHOD_ICONS } from "../../constants/paymentFeedback";

interface CheckoutPaymentStepProps {
  bookingId: string;
  totalAmount: number;
  originalAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({
  bookingId,
  totalAmount,
  originalAmount,
  couponCode,
  couponDiscount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("sepay");
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentMutation = useCreatePayment();

  const paymentMethods = [
    {
      id: "sepay" as PaymentMethod,
      name: "Sepay Bank Transfer",
      description: "Instant bank transfer with automatic verification",
      icon: Building2,
      color: "from-emerald-500 to-emerald-600",
      new: true,
    },
  ];

  const handlePayment = async () => {
    if (!bookingId) {
      onPaymentError?.("Booking ID is required");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await createPaymentMutation.mutateAsync({
        booking_id: bookingId,
        payment_method: selectedPaymentMethod,
      });

      if (selectedPaymentMethod === "vnpay" && response.data.payment_url) {
        // Redirect to VNPay
        window.location.href = response.data.payment_url;
      } else if (selectedPaymentMethod === "sepay") {
        // Navigate to Sepay instruction page
        // Don't call onPaymentSuccess here - payment is still pending
        navigate(
          `/payment/sepay-instructions?bookingId=${bookingId}&paymentId=${response.data.payment_id}`
        );
      } else {
        // For other payment methods, simulate success
        onPaymentSuccess?.();
        navigate(
          `/payment/success?bookingId=${bookingId}&orderId=${response.data.order_id}`
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Payment failed";
      onPaymentError?.(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-400" />
          Select Payment Method
        </h3>

        <div className="space-y-3">
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
                {method.new && (
                  <span
                    className="absolute -top-2 left-4 px-2 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 
                                 text-white text-xs font-semibold rounded-full"
                  >
                    POPULAR
                  </span>
                )}

                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      {method.name}
                      <span className="text-lg">
                        {PAYMENT_METHOD_ICONS[method.id]}
                      </span>
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {method.description}
                    </p>

                    {/* Special note for Sepay */}
                    {method.id === "sepay" && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400 text-xs">
                          Auto-verified within seconds
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedPaymentMethod === method.id && (
                    <CheckCircle className="h-6 w-6 text-purple-400" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sepay Special Instructions */}
      {selectedPaymentMethod === "sepay" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
        >
          <h4 className="text-emerald-300 font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            How Sepay Bank Transfer Works
          </h4>
          <div className="space-y-2 text-sm text-emerald-200/90">
            <p>
              • You'll receive bank account details and transfer instructions
            </p>
            <p>• Transfer money using your mobile banking app</p>
            <p>• Payment is automatically verified within 30 seconds</p>
            <p>• Your booking will be confirmed instantly after verification</p>
          </div>
        </motion.div>
      )}

      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h4 className="text-lg font-semibold text-white mb-4">
          Payment Summary
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span>
            <span>{formatCurrency(originalAmount || totalAmount)}</span>
          </div>

          {couponCode && couponDiscount && couponDiscount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Coupon ({couponCode})</span>
              <span>-{formatCurrency(couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-300">
            <span>Service Fee</span>
            <span>{formatCurrency(0)}</span>
          </div>

          <div className="flex justify-between text-gray-300">
            <span>Taxes</span>
            <span>{formatCurrency(0)}</span>
          </div>

          <div className="border-t border-white/20 pt-3">
            <div className="flex justify-between text-white font-semibold text-xl">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-green-300 font-medium">Secure Payment</p>
            <p className="text-green-400/80 text-sm">
              {selectedPaymentMethod === "sepay"
                ? "Bank transfers are processed through secure banking networks"
                : "Your payment information is encrypted and processed securely"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <motion.button
        onClick={handlePayment}
        disabled={
          isProcessing ||
          createPaymentMutation.isPending ||
          selectedPaymentMethod !== "sepay"
        }
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl 
                 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 
                 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing || createPaymentMutation.isPending ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Processing Payment...
          </>
        ) : (
          <>
            <span>
              {selectedPaymentMethod === "sepay"
                ? `Get Transfer Details`
                : `Pay ${formatCurrency(totalAmount)}`}
            </span>
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </motion.button>

      {/* Terms */}
      <p className="text-center text-gray-400 text-sm">
        By proceeding with payment, you agree to our{" "}
        <a
          href="/terms"
          className="text-purple-400 hover:text-purple-300 underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="text-purple-400 hover:text-purple-300 underline"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default CheckoutPaymentStep;
