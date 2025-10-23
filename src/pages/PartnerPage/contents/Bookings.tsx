/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getTheaterBookings,
  formatBookingTime,
  formatPrice,
  getBookingStatusDisplay,
  type Booking,
} from "../../../apis/staff_booking.api";
import BookingDetailsModal from "../../../components/BookingDetailsModal";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  type FilterOption =
    | ""
    | "payment_cancelled"
    | "payment_failed"
    | "payment_pending"
    | "payment_completed"
    | "ticket_used";

  const [filterOption, setFilterOption] = useState<FilterOption>("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch bookings data
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      let statusParam: "pending" | "confirmed" | "cancelled" | "completed" | "used" | undefined;
      let paymentParam: "pending" | "completed" | "failed" | "refunded" | "cancelled" | undefined;

      switch (filterOption) {
        case "payment_cancelled":
          paymentParam = "cancelled";
          break;
        case "payment_failed":
          paymentParam = "failed";
          break;
        case "payment_pending":
          paymentParam = "pending";
          break;
        case "payment_completed":
          paymentParam = "completed";
          break;
        case "ticket_used":
          statusParam = "used";
          break;
        default:
          break;
      }

      const response = await getTheaterBookings(
        currentPage,
        20,
        statusParam,
        paymentParam
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
  }, [currentPage, filterOption]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleFilterChange = (option: FilterOption) => {
    setFilterOption(option);
    setCurrentPage(1);
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
            <div className="flex items-center gap-2">
              <label className="text-sm text-white font-medium font-body">
                Bộ lọc:
              </label>
              <select
                value={filterOption}
                onChange={(e) => handleFilterChange(e.target.value as FilterOption)}
                className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 hover:text-slate-100 px-4 py-2 rounded-lg font-medium transition-colors duration-300 border border-slate-600 focus:border-orange-500/50 focus:outline-none min-w-[180px] font-body"
              >
                <option value="">Tất cả</option>
                <option value="payment_cancelled">Đã huỷ thanh toán</option>
                <option value="payment_failed">Thanh toán thất bại</option>
                <option value="payment_pending">Chờ thanh toán</option>
                <option value="payment_completed">Đã thanh toán</option>
                <option value="ticket_used">Đã sử dụng</option>
              </select>
            </div>

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
                        colSpan={8}
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
