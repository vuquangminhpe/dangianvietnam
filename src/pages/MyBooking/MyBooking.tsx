/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  X,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  useMyBookings,
  useCancelBooking,
  useTicketQR,
} from "../../hooks/useBooking";
import type {
  BookingQueryParams,
  BookingStatus,
  PaymentStatus,
} from "../../types/Booking.type";
import {
  formatCurrency,
  formatDateTime,
  formatSeats,
} from "../../utils/format";
import TicketQRSection from "../../components/QR/TicketQRSection";

const MyBooking: React.FC = () => {
  const [filters, setFilters] = useState<BookingQueryParams>({
    page: 1,
    limit: 10,
    sort_by: "booking_time",
    sort_order: "desc",
  });
  const [bookingData, setBookingData] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const { data: bookingsData, isLoading } = useMyBookings(filters as any);
  const { cancelBooking, isLoading: isCancelling } = useCancelBooking();
  const { data: qrData } = useTicketQR(selectedTicket || "");

  const getStatusIcon = (
    status: BookingStatus,
    paymentStatus: PaymentStatus
  ) => {
    if (paymentStatus === "completed" && status === "confirmed") {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else if (status === "cancelled") {
      return <XCircle className="h-5 w-5 text-red-400" />;
    } else if (status === "pending") {
      return <Clock className="h-5 w-5 text-yellow-400" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-orange-400" />;
    }
  };

  const getStatusColor = (
    status: BookingStatus,
    paymentStatus: PaymentStatus
  ) => {
    if (paymentStatus === "completed" && status === "confirmed") {
      return "text-green-400 bg-green-400/10 border-green-400/20";
    } else if (status === "cancelled") {
      return "text-red-400 bg-red-400/10 border-red-400/20";
    } else if (status === "pending") {
      return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    } else {
      return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    }
  };

  const canCancelBooking = (booking: any) => {
    const showTime = new Date(booking.showtime?.start_time);
    const now = new Date();
    const hoursUntilShow =
      (showTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Ẩn nút cancel nếu QR code đang được hiển thị
    const isQRVisible = selectedTicket === booking.ticket_code;

    return (
      booking.status === "confirmed" &&
      booking.payment_status === "completed" &&
      hoursUntilShow > 2 &&
      !isQRVisible // Thêm điều kiện này để ẩn nút cancel khi QR đang hiển thị
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking(bookingId);
    }
  };

  const handleDownloadTicket = (ticketCode: string) => {
    setSelectedTicket(ticketCode);
  };

  const handleFilterChange = (key: keyof BookingQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const statusOptions: BookingStatus[] = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
  ];
  const paymentStatusOptions: PaymentStatus[] = [
    "pending",
    "completed",
    "failed",
    "refunded",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 pt-28">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#730109' }}>
            My Bookings
          </h1>
          <p style={{ color: '#730109' }}>Track and manage your movie tickets</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
          style={{ backgroundColor: '#37373c' }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for event title or ticket code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg 
                       transition-colors"
              style={{ backgroundColor: '#730109' }}
            >
              <Filter className="h-4 w-4" />
              Filters
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Payment Status
                  </label>
                  <select
                    value={filters.payment_status || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "payment_status",
                        e.target.value || undefined
                      )
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                             focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">All Payments</option>
                    {paymentStatusOptions.map((status) => (
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
                    Date Range
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
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {bookingsData?.bookings?.length === 0 ? (
            <div className="backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center" style={{ backgroundColor: '#37373c' }}>
              <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No bookings found
              </h3>
              <p className="text-gray-300">
                You haven't made any bookings yet.
              </p>
            </div>
          ) : (
            bookingsData?.bookings?.map((booking, index) => (
              <motion.div
                onClick={() => setBookingData(booking)}
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 
                         transition-all cursor-pointer"
                style={{ backgroundColor: '#37373c' }}
              >
                <div className="flex flex-col lg:flex-row gap-6  justify-between ">
                  {/* Movie Poster and Info */}
                  <div className="flex items-start gap-4">
                    {booking.movie?.poster_url && (
                      <img
                        src={booking.movie.poster_url}
                        alt={booking.movie.title}
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg">
                        {booking.movie?.title || "Movie Title"}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.theater?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateTime(booking.showtime?.start_time || "", {
                            includeTime: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Ticket className="h-4 w-4" />
                        <span>Seats: {formatSeats(booking.seats)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                    {/* Status */}
                    <div className="flex flex-col items-start lg:items-center gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status, booking.payment_status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            booking.status,
                            booking.payment_status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Payment: {booking.payment_status}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-center lg:text-right">
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(booking.total_amount)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Ticket: {booking.ticket_code}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {booking.payment_status === "completed" && (
                        <button
                          onClick={() =>
                            handleDownloadTicket(booking.ticket_code)
                          }
                          className="flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-colors"
                          style={{ backgroundColor: '#730109' }}
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="hidden md:inline">QR Code</span>
                        </button>
                      )}

                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={isCancelling}
                          className="flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#730109' }}
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden md:inline">Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* QR Code Modal */}
        {selectedTicket && qrData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className=""
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Your Ticket
                </h3>
                <div className="mb-4">
                  <TicketQRSection
                    qrData={qrData.qr_code}
                    ticketCode={selectedTicket}
                    bookingData={bookingData}
                    handleClose={() => setSelectedTicket(null)}
                  />
                </div>

                {/* <div className="flex w-full justify-center gap-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div> */}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Pagination */}
        {bookingsData && bookingsData.total_pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center gap-2">
              {Array.from(
                { length: bookingsData.total_pages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === filters.page
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  style={{ backgroundColor: page === filters.page ? '#730109' : '#37373c' }}
                >
                  {page}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;
