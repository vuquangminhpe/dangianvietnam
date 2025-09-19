/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Banknote,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  getPaymentStats,
} from "../../apis/admin.api";
import type {
  AdminPayment,
  PaymentQueryParams,
  PaymentStatsQueryParams,
  UpdatePaymentStatusRequest,
} from "../../types";
import { Button } from "@headlessui/react";

export const PaymentManagement = () => {
  // Query parameters state
  const [queryParams, setQueryParams] = useState<PaymentQueryParams>({
    page: 1,
    limit: 10,
    sort_by: "payment_time",
    sort_order: "desc",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statsFilter] = useState<PaymentStatsQueryParams["period"]>("month");

  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [paymentToUpdate, setPaymentToUpdate] = useState<AdminPayment | null>(
    null
  );

  const queryClient = useQueryClient();

  // Queries
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["admin-payments", queryParams],
    queryFn: () => getAllPayments(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: statsData } = useQuery({
    queryKey: ["admin-payment-stats", statsFilter],
    queryFn: () => getPaymentStats({ period: statsFilter }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data: UpdatePaymentStatusRequest;
    }) => updatePaymentStatus(paymentId, data),
    onSuccess: () => {
      toast.success("Payment status updated successfully");
      setShowUpdateModal(false);
      setPaymentToUpdate(null);
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment status: ${error.message}`);
    },
  });

  const handleSearch = () => {
    setQueryParams((prev: any) => ({
      ...prev,
      page: 1,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      payment_method: methodFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }));
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMethodFilter("");
    setDateFrom("");
    setDateTo("");
    setQueryParams({
      page: 1,
      limit: 10,
      sort_by: "payment_time",
      sort_order: "desc",
    });
  };

  const handleViewPayment = async (paymentId: string) => {
    try {
      const response = await getPaymentById(paymentId);
      setSelectedPayment(response.result);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error("Failed to load payment details");
      console.error(error);
    }
  };

  const handleUpdateStatus = (payment: AdminPayment) => {
    setPaymentToUpdate(payment);
    setShowUpdateModal(true);
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev: any) => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/20";
      case "pending":
        return "text-yellow-400 bg-yellow-500/20";
      case "failed":
        return "text-red-400 bg-red-500/20";
      case "refunded":
        return "text-blue-400 bg-blue-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "failed":
        return <XCircle size={16} />;
      case "refunded":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} VNĐ`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get seats count safely
  const getSeatsCount = (booking: any) => {
    if (!booking || !booking.seats) return 0;
    if (Array.isArray(booking.seats)) return booking.seats.length;
    if (typeof booking.seats === "number") return booking.seats;
    return 0;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Banknote size={32} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Payment Management
              </h1>
              <p className="text-gray-300">
                Monitor and manage payment transactions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => refetchPayments()}
              disabled={paymentsLoading}
              className="border-white/20 border px-4 py-2 rounded-xl flex items-center text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${paymentsLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {statsData && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(statsData.result.overview.total_revenue)}
                </p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-white">
                  {statsData.result.overview.total_payments.toLocaleString()}
                </p>
              </div>
              <CreditCard className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-400">
                  {statsData.result.overview.completed_payments}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {statsData.result.overview.pending_payments}
                </p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-400">
                  {statsData.result.overview.failed_payments}
                </p>
              </div>
              <XCircle className="text-red-400" size={24} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by transaction ID..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="bg-gray-800 text-white">
                All Status
              </option>
              <option value="pending" className="bg-gray-800 text-white">
                Pending
              </option>
              <option value="completed" className="bg-gray-800 text-white">
                Completed
              </option>
              <option value="failed" className="bg-gray-800 text-white">
                Failed
              </option>
              <option value="refunded" className="bg-gray-800 text-white">
                Refunded
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Method
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="bg-gray-800 text-white">
                All Methods
              </option>
              <option value="vnpay" className="bg-gray-800 text-white">
                VNPay
              </option>
              <option value="momo" className="bg-gray-800 text-white">
                MoMo
              </option>
              <option value="zalopay" className="bg-gray-800 text-white">
                ZaloPay
              </option>
              <option value="cash" className="bg-gray-800 text-white">
                Cash
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4">
          <Button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 flex items-center justify-center text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
          <Button
            onClick={handleReset}
            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 flex items-center justify-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Filter size={16} className="mr-2" />
            Reset
          </Button>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            Payment Transactions
          </h3>
          <p className="text-gray-400 text-sm">
            Total: {paymentsData?.result.total || 0} payments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paymentsLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw
                        size={20}
                        className="animate-spin text-gray-400 mr-2"
                      />
                      <span className="text-gray-400">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : paymentsData?.result.payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                paymentsData?.result.payments.map((payment: any) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {payment.transaction_id || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400">
                          #{payment._id.slice(-8)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {payment.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {payment.user?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {payment.movie?.poster_url && (
                          <img
                            src={payment.movie.poster_url}
                            alt={payment.movie.title}
                            className="w-8 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {payment.movie?.title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {getSeatsCount(payment.booking)} seats
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(payment.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 uppercase">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        <span className="capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">
                        {formatDate(payment.payment_time)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment._id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-500/20"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(payment)}
                          className="text-green-400 hover:text-green-300 transition-colors p-1 rounded hover:bg-green-500/20"
                          title="Update Status"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paymentsData && paymentsData.result.total_pages > 1 && (
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing{" "}
                {((queryParams.page || 1) - 1) * (queryParams.limit || 10) + 1}{" "}
                to{" "}
                {Math.min(
                  (queryParams.page || 1) * (queryParams.limit || 10),
                  paymentsData.result.total
                )}{" "}
                of {paymentsData.result.total} payments
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange((queryParams.page || 1) - 1)}
                  disabled={(queryParams.page || 1) <= 1}
                  className="border border-white/20 text-white hover:bg-white/10 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-300">
                  Page {queryParams.page || 1} of{" "}
                  {paymentsData.result.total_pages}
                </span>
                <Button
                  onClick={() => handlePageChange((queryParams.page || 1) + 1)}
                  disabled={
                    (queryParams.page || 1) >= paymentsData.result.total_pages
                  }
                  className="border border-white/20 text-white hover:bg-white/10 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedPayment && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">
                  Payment Details
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">
                      Transaction Info
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Transaction ID</p>
                        <p className="text-white">
                          {selectedPayment.transaction_id || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Amount</p>
                        <p className="text-white font-semibold">
                          {formatCurrency(selectedPayment.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Payment Method</p>
                        <p className="text-white capitalize">
                          {selectedPayment.payment_method}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedPayment.status
                          )}`}
                        >
                          {getStatusIcon(selectedPayment.status)}
                          <span className="capitalize">
                            {selectedPayment.status}
                          </span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Payment Time</p>
                        <p className="text-white">
                          {formatDate(selectedPayment.payment_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">
                      Booking Info
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Movie</p>
                        <p className="text-white">
                          {selectedPayment.movie?.title || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Theater</p>
                        <p className="text-white">
                          {selectedPayment.theater?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Seats</p>
                        <p className="text-white">
                          {getSeatsCount(selectedPayment.booking)} seats
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Ticket Code</p>
                        <p className="text-white">
                          {selectedPayment.booking?.ticket_code || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPayment.admin_note && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">
                      Admin Note
                    </h4>
                    <p className="text-gray-300 bg-white/5 p-3 rounded-lg">
                      {selectedPayment.admin_note}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end">
                <Button
                  onClick={() => setShowDetailModal(false)}
                  className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Status Modal */}
      <AnimatePresence>
        {showUpdateModal && paymentToUpdate && (
          <UpdateStatusModal
            payment={paymentToUpdate}
            onClose={() => {
              setShowUpdateModal(false);
              setPaymentToUpdate(null);
            }}
            onUpdate={(data) => {
              updateStatusMutation.mutate({
                paymentId: paymentToUpdate._id,
                data,
              });
            }}
            isLoading={updateStatusMutation.isPending}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Update Status Modal Component
interface UpdateStatusModalProps {
  payment: AdminPayment;
  onClose: () => void;
  onUpdate: (data: UpdatePaymentStatusRequest) => void;
  isLoading: boolean;
}

const UpdateStatusModal = ({
  payment,
  onClose,
  onUpdate,
  isLoading,
}: UpdateStatusModalProps) => {
  const [status, setStatus] = useState(payment.status);
  const [transactionId, setTransactionId] = useState(
    payment.transaction_id || ""
  );
  const [adminNote, setAdminNote] = useState(payment.admin_note || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      status: status as any,
      transaction_id: transactionId || undefined,
      admin_note: adminNote || undefined,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-800 rounded-xl max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">
            Update Payment Status
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="pending" className="bg-slate-700 text-white">
                Pending
              </option>
              <option value="completed" className="bg-slate-700 text-white">
                Completed
              </option>
              <option value="failed" className="bg-slate-700 text-white">
                Failed
              </option>
              <option value="refunded" className="bg-slate-700 text-white">
                Refunded
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter transaction ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Note
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add admin note..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-white font-medium transition-colors"
            >
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="border border-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-xl transition-colors"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
