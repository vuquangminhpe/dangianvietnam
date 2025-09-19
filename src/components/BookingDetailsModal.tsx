/**
 * BookingDetailsModal Component
 * 
 * A comprehensive modal that displays detailed booking information including:
 * - Customer information
 * - Movie details (title, duration, language, poster)
 * - Theater and screen information
 * - Showtime details
 * - Seat selection with individual pricing
 * - Payment status and total amount
 * - Booking status tracking
 * 
 * Features:
 * - Real-time data fetching from API
 * - Error handling with retry functionality
 * - Loading states
 * - Responsive design
 * - Smooth animations
 * - Vietnamese currency formatting
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, User, CreditCard, Ticket, Film } from "lucide-react";
import { useEffect, useState } from "react";
import { 
  getEnrichedBookingDetails,
  formatBookingTime,
  formatPrice,
  getBookingStatusDisplay,
  getPaymentStatusDisplay,
  formatUserDisplay,
  type BookingWithDetails
} from "../apis/staff_booking.api";

interface BookingDetailsModalProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal = ({ bookingId, isOpen, onClose }: BookingDetailsModalProps) => {
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking details when modal opens
  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      const details = await getEnrichedBookingDetails(bookingId);
      setBooking(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking details');
      console.error('Error fetching booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBooking(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Ticket className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Booking Details</h2>
                <p className="text-sm text-slate-400">
                  {booking ? `Ticket: ${booking.ticket_code}` : 'Loading...'}
                </p>
              </div>
            </div>
            <motion.button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-slate-300">Loading booking details...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                <p>Error: {error}</p>
                <button 
                  onClick={fetchBookingDetails}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {booking && !loading && !error && (
              <div className="space-y-6">
                {/* Booking Status */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Booking Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : booking.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {getBookingStatusDisplay(booking.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Payment:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        booking.payment_status === "paid"
                          ? "bg-green-500/20 text-green-400"
                          : booking.payment_status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {getPaymentStatusDisplay(booking.payment_status)}
                    </span>
                  </div>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Customer Information</h3>
                    </div>
                    <div className="space-y-3">
                      {booking.user ? (
                        <>
                          {/* Customer Avatar and Basic Info */}
                          <div className="flex items-center gap-3">
                            {booking.user.avatar && (
                              <img 
                                src={booking.user.avatar} 
                                alt={booking.user.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-orange-500/30"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <p className="text-white font-medium text-lg">{formatUserDisplay(booking.user)}</p>
                              {booking.user.username && (
                                <p className="text-slate-400 text-sm">@{booking.user.username}</p>
                              )}
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <span className="text-sm text-slate-400">Email:</span>
                              <p className="text-white">{booking.user.email}</p>
                            </div>
                            {booking.user.phone && (
                              <div>
                                <span className="text-sm text-slate-400">Phone:</span>
                                <p className="text-white">{booking.user.phone}</p>
                              </div>
                            )}
                            {booking.user.location && (
                              <div>
                                <span className="text-sm text-slate-400">Location:</span>
                                <p className="text-white">{booking.user.location}</p>
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          <div className="pt-2 border-t border-slate-600/30">
                            <div>
                              <span className="text-sm text-slate-400">Customer ID:</span>
                              <p className="text-white text-sm font-mono">{booking.user._id}</p>
                            </div>
                            {booking.user.role && (
                              <div>
                                <span className="text-sm text-slate-400">Role:</span>
                                <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                  {booking.user.role}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="text-sm text-slate-400">Customer ID:</span>
                          <p className="text-white font-medium">{booking.user_id}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-slate-400">Booking Time:</span>
                        <p className="text-white">{formatBookingTime(booking.booking_time)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Film className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Movie Information</h3>
                    </div>
                    <div className="space-y-2">
                      {booking.movie ? (
                        <>
                          <div>
                            <span className="text-sm text-slate-400">Title:</span>
                            <p className="text-white font-medium">{booking.movie.title}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-400">Duration:</span>
                            <p className="text-white">{booking.movie.duration} minutes</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-400">Language:</span>
                            <p className="text-white">{booking.movie.language}</p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="text-sm text-slate-400">Movie ID:</span>
                          <p className="text-white">{booking.movie_id}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Theater Info */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Theater & Screen</h3>
                    </div>
                    <div className="space-y-2">
                      {booking.theater ? (
                        <>
                          <div>
                            <span className="text-sm text-slate-400">Theater:</span>
                            <p className="text-white font-medium">{booking.theater.name}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-400">Location:</span>
                            <p className="text-white">{booking.theater.city}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-400">Address:</span>
                            <p className="text-white">{booking.theater.address}</p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="text-sm text-slate-400">Theater ID:</span>
                          <p className="text-white">{booking.theater_id}</p>
                        </div>
                      )}
                      {booking.screen && (
                        <div>
                          <span className="text-sm text-slate-400">Screen:</span>
                          <p className="text-white">{booking.screen.name} ({booking.screen.screen_type})</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Showtime Info */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Showtime</h3>
                    </div>
                    <div className="space-y-2">
                      {booking.showtime ? (
                        <>
                          <div>
                            <span className="text-sm text-slate-400">Start Time:</span>
                            <p className="text-white">{formatBookingTime(booking.showtime.start_time)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-400">End Time:</span>
                            <p className="text-white">{formatBookingTime(booking.showtime.end_time)}</p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="text-sm text-slate-400">Showtime ID:</span>
                          <p className="text-white">{booking.showtime_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seats & Payment */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Seats */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Seats</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.seats.map((seat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 bg-orange-500/20 text-orange-400 text-sm rounded-lg border border-orange-500/30 font-medium"
                        >
                          {seat.row}{seat.number}
                          <span className="ml-1 text-xs text-orange-300">
                            ({seat.type} - {formatPrice(seat.price)})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">Payment Details</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-slate-400">Total Amount:</span>
                        <p className="text-2xl font-bold text-emerald-400">{formatPrice(booking.total_amount)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-400">Payment Status:</span>
                        <p className="text-white font-medium">{getPaymentStatusDisplay(booking.payment_status)}</p>
                      </div>
                      {booking.payment && (
                        <div>
                          <span className="text-sm text-slate-400">Payment ID:</span>
                          <p className="text-white font-mono text-sm">{booking.payment._id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Movie Poster (if available) */}
                {booking.movie?.poster_url && (
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <h3 className="text-lg font-semibold text-white mb-3">Movie Poster</h3>
                    <div className="flex justify-center">
                      <img 
                        src={booking.movie.poster_url} 
                        alt={booking.movie.title}
                        className="max-w-sm rounded-lg shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingDetailsModal;
