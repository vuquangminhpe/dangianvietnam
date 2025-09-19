/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Filter,
  Search,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  MapPin,
  ChevronDown,
  Eye,
} from "lucide-react";
import paymentApi from "../../apis/payment.api";
import type {
  PaymentQueryParams,
  Payment,
  PaymentStatus,
  PaymentMethod,
} from "../../types/Payment.type";
import VietQRBanking from "../../components/QR/QRSection";

const PaymentHistory: React.FC = () => {
  const [filters, setFilters] = useState<PaymentQueryParams>({
    page: 1,
    limit: 10,
    sort_by: "payment_time",
    sort_order: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments", filters],
    queryFn: () => paymentApi.getMyPayments(filters as any),
    select: (response) => response.data.result,
  });

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "refunded":
        return <RotateCcw className="h-5 w-5 text-blue-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "refunded":
        return "text-blue-400 bg-blue-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "vnpay":
        return "💳";
      case "sepay":
        return "🏦";
      case "credit_card":
        return "💳";
      case "debit_card":
        return "💳";
      case "cash":
        return "💵";
      default:
        return "💳";
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTimeRemaining = (paymentTime: string) => {
    const paymentDate = new Date(paymentTime);
    const expirationDate = new Date(paymentDate.getTime() + 15 * 60 * 1000); // Add 15 minutes
    const now = new Date();
    const timeRemaining = expirationDate.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      return "Đã hết hạn";
    }

    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    if (payment.status === "pending") {
      setShowQRModal(true);
    } else {
      setShowDetailsModal(true);
    }
  };

  const handleFilterChange = (key: keyof PaymentQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const statusOptions: PaymentStatus[] = [
    "completed",
    "pending",
    "failed",
    "refunded",
  ];
  const methodOptions: PaymentMethod[] = ["vnpay", "credit_card", "cash"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/40 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary/40 to-slate-900 py-8 pt-28">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Payment History
          </h1>
          <p className="text-gray-300">Track all your movie ticket payments</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by movie title or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 text-purple-200 rounded-lg 
                       hover:bg-purple-600/50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                             focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">All Status</option>
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="text-black"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={filters.payment_method || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "payment_method",
                        e.target.value || undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                             focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">All Methods</option>
                    {methodOptions.map((method) => (
                      <option
                        key={method}
                        value={method}
                        className="text-black"
                      >
                        {method.replace("_", " ").charAt(0).toUpperCase() +
                          method.replace("_", " ").slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.date_from || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "date_from",
                        e.target.value || undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                             focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.date_to || ""}
                    onChange={(e) =>
                      handleFilterChange("date_to", e.target.value || undefined)
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                             focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Payment List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {paymentsData?.payments?.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No payments found
              </h3>
              <p className="text-gray-300">
                You haven't made any payments yet.
              </p>
            </div>
          ) : (
            paymentsData?.payments?.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 
                         transition-all cursor-pointer"
                onClick={() => handleViewDetails(payment as any)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Movie Poster and Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {payment.movie?.poster_url && (
                      <img
                        src={payment.movie.poster_url}
                        alt={payment.movie.title}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate">
                        {payment.movie?.title || "Movie Title"}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{payment.theater?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateTime(payment.payment_time)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {getPaymentMethodIcon(payment.payment_method)}{" "}
                        {payment.payment_method.replace("_", " ")}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </div>

                    {/* Action */}
                    <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                      <Eye className="h-4 w-4" />
                      <span className="hidden lg:inline">
                        {payment.status === "pending"
                          ? "Thanh toán"
                          : "View Details"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Transaction ID and Expiration Time for Pending */}
                {payment.transaction_id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                      Transaction ID:{" "}
                      <span className="text-gray-300 font-mono">
                        {payment.transaction_id}
                      </span>
                    </p>
                  </div>
                )}

                {payment.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="text-yellow-400 text-sm font-medium">
                        ⏰ Thời gian còn lại:{" "}
                        {calculateTimeRemaining(payment.payment_time)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Hết hạn sau 15 phút
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Pagination */}
        {paymentsData && paymentsData.total_pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center gap-2">
              {Array.from(
                { length: paymentsData.total_pages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === filters.page
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* QR Code Modal for Pending Payments */}
        {showQRModal &&
          selectedPayment &&
          selectedPayment.status === "pending" && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Thanh toán đơn hàng
                  </h3>
                  <p className="text-gray-300">Quét mã QR để thanh toán</p>
                  <div className="mt-4">
                    <p className="text-yellow-400 text-lg font-medium">
                      Còn lại:{" "}
                      {calculateTimeRemaining(selectedPayment.payment_time)}
                    </p>
                  </div>
                </div>

                <VietQRBanking
                  amount={selectedPayment.amount}
                  content={selectedPayment.booking?.ticket_code as string}
                />

                <div className="mt-6">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </div>
          )}

        {/* Payment Details Modal for Completed/Other Status */}
        {showDetailsModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  {getStatusIcon(selectedPayment.status)}
                  <h3 className="text-2xl font-bold text-white ml-3">
                    Chi tiết thanh toán
                  </h3>
                </div>
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    selectedPayment.status
                  )}`}
                >
                  {selectedPayment.status.charAt(0).toUpperCase() +
                    selectedPayment.status.slice(1)}
                </div>
              </div>

              {/* Movie Info */}
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  {selectedPayment.movie?.poster_url && (
                    <img
                      src={selectedPayment.movie.poster_url}
                      alt={selectedPayment.movie.title}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">
                      {selectedPayment.movie?.title || "Movie Title"}
                    </h4>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedPayment.theater?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDateTime(
                          selectedPayment.showtime?.start_time as string
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Mã vé</p>
                    <p className="text-white font-mono text-lg">
                      {selectedPayment.booking?.ticket_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Số ghế</p>
                    <p className="text-white font-medium">
                      {selectedPayment.booking?.seats}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">
                      Phương thức thanh toán
                    </p>
                    <p className="text-white font-medium">
                      {getPaymentMethodIcon(selectedPayment.payment_method)}{" "}
                      {selectedPayment.payment_method.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Tổng tiền</p>
                    <p className="text-green-400 font-bold text-2xl">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">
                      Thời gian thanh toán
                    </p>
                    <p className="text-white font-medium">
                      {formatDateTime(selectedPayment.payment_time)}
                    </p>
                  </div>
                  {selectedPayment.transaction_id && (
                    <div>
                      <p className="text-gray-400 text-sm">Mã giao dịch</p>
                      <p className="text-white font-mono text-sm break-all">
                        {selectedPayment.transaction_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message for Failed Payments */}
              {selectedPayment.status === "failed" && selectedPayment.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <p className="text-red-400 font-medium text-sm">
                    Lỗi thanh toán:
                  </p>
                  <p className="text-red-300 text-sm">
                    Quá thời gian chuyển khoản hoặc giao dịch không thành công.
                  </p>
                </div>
              )}

              {/* Admin Note */}
              {selectedPayment.admin_note && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-blue-400 font-medium text-sm">Ghi chú:</p>
                  <p className="text-blue-300 text-sm">
                    {selectedPayment.admin_note}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
