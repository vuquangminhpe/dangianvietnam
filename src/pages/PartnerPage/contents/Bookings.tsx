/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getTheaterBookings,
  formatBookingTime,
  formatPrice,
  getBookingStatusDisplay,
  getPaymentStatusDisplay,
  type Booking,
} from "../../../apis/staff_booking.api";
import BookingDetailsModal from "../../../components/BookingDetailsModal";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "confirmed" | "cancelled" | "completed" | "used" | ""
  >("");
  const [paymentFilter, setPaymentFilter] = useState<
    "pending" | "completed" | "failed" | "refunded" | "cancelled" | ""
  >("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTheaterBookings(
        currentPage,
        20,
        statusFilter || undefined,
        paymentFilter || undefined
      );

      setBookings(response.result.bookings);
      setTotalPages(Math.ceil(response.result.total / response.result.limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load bookings on component mount and when filters change
  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, paymentFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleStatusFilter = (
    status: "pending" | "confirmed" | "cancelled" | "completed" | "used" | ""
  ) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  const handlePaymentFilter = (status: "pending" | "completed" | "failed" | "refunded" | "cancelled" | "") => {
    setPaymentFilter(status);
    setCurrentPage(1); // Reset to first page
  };

  // Handle view booking details
  const handleViewBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
  };

  return (
    <div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">Quản Lý Đặt Vé</h2>
            <p className="text-slate-400 text-sm mt-1 font-body">
              Theo dõi và quản lý đặt vé của rạp
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Ticket Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-white font-medium font-body">
                Trạng thái vé:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as any)}
                className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 hover:text-slate-100 px-4 py-2 rounded-lg font-medium transition-colors duration-300 border border-slate-600 focus:border-orange-500/50 focus:outline-none min-w-[140px] font-body"
              >
                <option value="">Tất cả vé</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
                <option value="used">Đã sử dụng</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-white font-medium font-body">
                Thanh toán:
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => handlePaymentFilter(e.target.value as any)}
                className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 hover:text-slate-100 px-4 py-2 rounded-lg font-medium transition-colors duration-300 border border-slate-600/50 focus:border-orange-500/50 focus:outline-none min-w-[140px] font-body"
              >
                <option value="">Tất cả thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="completed">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
                <option value="refunded">Đã hoàn tiền</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(statusFilter || paymentFilter) && (
              <motion.button
                onClick={() => {
                  setStatusFilter("");
                  setPaymentFilter("");
                  setCurrentPage(1);
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors duration-300 border border-red-500/30 font-body"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xóa bộ lọc
              </motion.button>
            )}

            <motion.button
              onClick={fetchBookings}
              className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors duration-300 font-body"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Làm mới
            </motion.button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-slate-300 font-body">Đang tải danh sách đặt vé...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            <p className="font-body">Lỗi: {error}</p>
            <button
              onClick={fetchBookings}
              className="mt-2 text-sm underline hover:no-underline font-body"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Quick Stats Summary */}
        {!loading && !error && bookings.length > 0 && (
          <>
            {/* Payment Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4">
                <div className="text-emerald-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.payment_status === "completed").length}
                </div>
                <div className="text-emerald-300 text-sm font-body">Đã thanh toán</div>
              </div>
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4">
                <div className="text-amber-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.payment_status === "pending").length}
                </div>
                <div className="text-amber-300 text-sm font-body">Chờ thanh toán</div>
              </div>
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-lg p-4">
                <div className="text-rose-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.payment_status === "failed").length}
                </div>
                <div className="text-rose-300 text-sm font-body">Thất bại</div>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.payment_status === "refunded").length}
                </div>
                <div className="text-blue-300 text-sm font-body">Đã hoàn tiền</div>
              </div>
              <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-4">
                <div className="text-gray-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.payment_status === "cancelled").length}
                </div>
                <div className="text-gray-300 text-sm font-body">Đã hủy TT</div>
              </div>
            </div>

            {/* Booking Status Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-yellow-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.status === "pending").length}
                </div>
                <div className="text-yellow-300 text-sm font-body">Chờ xử lý</div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-green-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.status === "confirmed").length}
                </div>
                <div className="text-green-300 text-sm font-body">Đã xác nhận</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="text-red-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.status === "cancelled").length}
                </div>
                <div className="text-red-300 text-sm font-body">Đã hủy vé</div>
              </div>
              <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-4">
                <div className="text-indigo-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.status === "completed").length}
                </div>
                <div className="text-indigo-300 text-sm font-body">Hoàn thành</div>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-400 font-bold text-lg font-heading">
                  {bookings.filter(b => b.status === "used").length}
                </div>
                <div className="text-purple-300 text-sm font-body">Đã sử dụng</div>
              </div>
            </div>
          </>
        )}

        {/* Bookings table */}
        {!loading && !error && (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 font-heading">
                      Mã vé
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 font-heading">
                      Khách hàng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 font-heading">
                      Phim
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 font-heading">
                      Rạp chiếu
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 font-heading">
                      Ghế ngồi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 font-heading">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-300 font-heading">
                      Trạng thái thanh toán
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-slate-300 font-heading">
                      Trạng thái vé
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 font-heading">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-12 text-center text-slate-400 font-body"
                      >
                        Không tìm thấy đặt vé nào
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking, index) => (
                      <motion.tr
                        key={booking._id}
                        className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-orange-400 font-body">
                            {booking.ticket_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white font-body">
                            {booking?.user_info?.name}
                          </div>
                          <div className="text-sm text-slate-400 font-body">
                            {formatBookingTime(booking.booking_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-300 font-body">
                            {booking?.movie_info?.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 flex flex-col">
                          <div className="text-slate-300 font-body">
                            {booking.theater_info.name.length > 20
                              ? booking.theater_info.name.slice(0, 20) + "..."
                              : booking.theater_info.name}
                          </div>
                          <div className="text-sm text-slate-400 font-body">
                            {booking.theater_info.location.length > 20
                              ? booking.theater_info.location.slice(0, 20) +
                                "..."
                              : booking.theater_info.location}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {booking.seats.map((seat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/30 font-body"
                              >
                                {seat.row}
                                {seat.number}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-emerald-400 font-medium font-body">
                            {formatPrice(booking.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {/* Payment Status Column */}
                          <div className="flex items-center justify-center">
                            <span
                              className={`px-3 py-2 rounded-full text-sm font-bold border-2 font-body ${
                                booking.payment_status === "completed"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                  : booking.payment_status === "pending" 
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                                  : booking.payment_status === "failed"
                                  ? "bg-rose-500/20 text-rose-400 border-rose-500/50"
                                  : booking.payment_status === "refunded"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                  : booking.payment_status === "cancelled"
                                  ? "bg-gray-500/20 text-gray-400 border-gray-500/50"
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/50"
                              }`}
                              title={`Trạng thái thanh toán: ${booking.payment_status}`}
                            >
 
                              {getPaymentStatusDisplay(booking.payment_status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {/* Ticket Status Column */}
                          <div className="flex items-center justify-center">
                            <span
                              className={`px-3 py-1 rounded-lg text-sm font-medium border font-body ${
                                booking.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : booking.status === "confirmed"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : booking.status === "cancelled"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : booking.status === "completed"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : booking.status === "used"
                                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                              }`}
                              title={`Trạng thái vé: ${booking.status}`}
                            >
 
                              {getBookingStatusDisplay(booking.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleViewBooking(booking._id)}
                              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1 rounded text-sm font-medium transition-colors duration-300 font-body"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
                <div className="text-sm text-slate-400 font-body">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded text-sm font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Trước
                  </motion.button>
                  <motion.button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded text-sm font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sau
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        bookingId={selectedBookingId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Bookings;
