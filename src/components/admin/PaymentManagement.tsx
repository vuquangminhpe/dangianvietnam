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
  Loader,
  Database,
  X,
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
      toast.success("Cập nhật trạng thái thanh toán thành công");
      setShowUpdateModal(false);
      setPaymentToUpdate(null);
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật trạng thái thanh toán thất bại: ${error.message}`);
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
      toast.error("Tải chi tiết thanh toán thất bại");
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
    return new Date(dateString).toLocaleDateString("vi-VN", {
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
              <h1 className="text-2xl font-bold text-white font-heading">Quản Lý Thanh Toán</h1>
              <p className="text-gray-400 font-body">Theo dõi và quản lý tất cả các giao dịch</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => refetchPayments()}
              disabled={paymentsLoading}
              className="border-white/20 border px-4 py-2 rounded-xl flex items-center text-white hover:bg-white/10 transition-colors disabled:opacity-50 font-body"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${paymentsLoading ? "animate-spin" : ""}`}
              />
              Làm mới
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
                <p className="text-sm text-gray-400 font-body">Tổng Doanh Thu</p>
                <p className="text-2xl font-bold text-white font-heading">
                  {formatCurrency(statsData?.result.overview.total_revenue || 0)}
                </p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-body">Giao Dịch</p>
                <p className="text-2xl font-bold text-white font-heading">
                  {statsData?.result.overview.total_payments?.toLocaleString() || 0}
                </p>
              </div>
              <CreditCard className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-body">Thành Công</p>
                <p className="text-2xl font-bold text-white font-heading">
                  {statsData?.result.overview.completed_payments?.toLocaleString() || 0}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-body">Đang Chờ</p>
                <p className="text-2xl font-bold text-white font-heading">
                  {statsData?.result.overview.pending_payments?.toLocaleString() || 0}
                </p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-body">Thất Bại</p>
                <p className="text-2xl font-bold text-white font-heading">
                  {statsData?.result.overview.failed_payments?.toLocaleString() || 0}
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
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Tìm kiếm
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
                placeholder="Tìm theo ID giao dịch..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-body"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-body"
            >
              <option value="" className="bg-slate-700 text-white">Tất cả</option>
              <option value="completed" className="bg-slate-700 text-white">Hoàn thành</option>
              <option value="pending" className="bg-slate-700 text-white">Đang chờ</option>
              <option value="failed" className="bg-slate-700 text-white">Thất bại</option>
              <option value="refunded" className="bg-slate-700 text-white">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Phương thức
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-body"
            >
              <option value="" className="bg-slate-700 text-white">Tất cả</option>
              <option value="Momo" className="bg-slate-700 text-white">Momo</option>
              <option value="ZaloPay" className="bg-slate-700 text-white">ZaloPay</option>
              <option value="Credit Card" className="bg-slate-700 text-white">Thẻ tín dụng</option>
              <option value="Bank Transfer" className="bg-slate-700 text-white">Chuyển khoản ngân hàng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-body"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-body"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4">
          <Button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 flex items-center justify-center text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-body"
          >
            <Search size={16} className="mr-2" />
            Tìm kiếm
          </Button>
          <Button
            onClick={handleReset}
            className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 flex items-center justify-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-body"
          >
            <Filter size={16} className="mr-2" />
            Đặt lại
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
          <h3 className="text-lg font-semibold text-white font-heading">Giao dịch thanh toán</h3>
          <p className="text-gray-400 text-sm font-body">
            Tổng: {paymentsData?.result.total || 0} thanh toán
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-body">
                  ID Giao dịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-body">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-body">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-body">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-body">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-body">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-body">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paymentsLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex justify-center items-center space-x-2">
                      <Loader className="animate-spin text-blue-400" />
                      <span className="text-gray-300 font-body">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : paymentsData && paymentsData.result.payments.length > 0 ? (
                paymentsData.result.payments.map((payment: AdminPayment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-mono">
                        {payment.transaction_id || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-body">{payment.user?.name}</div>
                      <div className="text-xs text-gray-400 font-body">
                        {payment.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-semibold font-body">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          <span className="capitalize font-body">{payment.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 font-body">
                        {payment.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300 font-body">
                        {formatDate(payment.payment_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment._id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(payment)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
                          title="Cập nhật trạng thái"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center space-y-3">
                      <Database size={40} className="text-gray-500" />
                      <p className="text-gray-400 font-body">Không tìm thấy thanh toán nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paymentsData && paymentsData.result.total_pages > 1 && (
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 font-body">
                Trang {paymentsData.result.page} của {paymentsData.result.total_pages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(paymentsData.result.page - 1)}
                  disabled={paymentsData.result.page === 1}
                  className="border border-white/20 text-white hover:bg-white/10 px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-body"
                >
                  Trước
                </Button>
                <Button
                  onClick={() => handlePageChange(paymentsData.result.page + 1)}
                  disabled={
                    paymentsData.result.page === paymentsData.result.total_pages
                  }
                  className="border border-white/20 text-white hover:bg-white/10 px-3 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-body"
                >
                  Sau
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
              className="bg-slate-800 rounded-xl max-w-2xl w-full border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white font-heading">
                  Chi Tiết Thanh Toán
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-body">ID Giao dịch</p>
                    <p className="text-white font-mono text-sm">
                      {selectedPayment.transaction_id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-body">Trạng thái</p>
                    <div
                      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedPayment.status
                      )}`}
                    >
                      {getStatusIcon(selectedPayment.status)}
                      <span className="capitalize font-body">{selectedPayment.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-body">Số tiền</p>
                    <p className="text-lg font-bold text-green-400 font-heading">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-body">Phương thức</p>
                    <p className="text-white font-body">{selectedPayment.payment_method}</p>
                  </div>
                </div>

                <div className="bg-slate-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 font-body">Thời gian thanh toán</p>
                  <p className="text-white font-body">{formatDate(selectedPayment.payment_time)}</p>
                </div>

                {selectedPayment.user && (
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-body">Người dùng</p>
                    <p className="text-white font-body">{selectedPayment.user.name}</p>
                    <p className="text-xs text-gray-400 font-body">
                      {selectedPayment.user.email}
                    </p>
                  </div>
                )}

                {selectedPayment.booking && (
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-body">Chi tiết đặt vé</p>
                    <p className="text-white font-body">
                      Mã vé: {selectedPayment.booking.ticket_code || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 font-body">
                      Trạng thái: {selectedPayment.booking.status || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 font-body">
                      Số ghế: {getSeatsCount(selectedPayment.booking)}
                    </p>
                  </div>
                )}

                {selectedPayment.admin_note && (
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 font-body">Ghi chú của quản trị viên</p>
                    <p className="text-white font-body">{selectedPayment.admin_note}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-white/10 text-right">
                <Button
                  onClick={() => setShowDetailModal(false)}
                  className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors font-body"
                >
                  Đóng
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
          <h3 className="text-xl font-semibold text-white font-heading">
            Cập nhật trạng thái thanh toán
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-body"
            >
              <option value="pending">Đang chờ</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              ID Giao dịch
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-body"
              placeholder="Nhập ID giao dịch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Ghi chú của quản trị viên
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-body"
              placeholder="Thêm ghi chú..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="w-full border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors font-body"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors font-body"
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
