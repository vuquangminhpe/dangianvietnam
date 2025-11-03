import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  CreditCard,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId");
  const orderId = searchParams.get("orderId");
  const error = searchParams.get("error") || "Thanh toán không thành công";

  // Mock booking data for retry
  const bookingData = {
    _id: bookingId || "",
    movie: {
      title: "Guardian of the Galaxy Vol. 3",
      poster_url: "/api/placeholder/300/400",
    },
    total_amount: 160000,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleRetryPayment = () => {
    if (bookingId) {
      navigate(`/payment?booking_id=${bookingId}`);
    }
  };

  const handleContactSupport = () => {
    // Implement contact support logic
    window.open("tel:+84357663145", "_self");
  };

  const commonReasons = [
    {
      icon: CreditCard,
      title: "Không đủ số dư",
      description:
        "Thẻ của bạn có thể không đủ số dư để hoàn tất giao dịch.",
    },
    {
      icon: AlertTriangle,
      title: "Thẻ bị từ chối",
      description:
        "Ngân hàng có thể đã từ chối giao dịch vì lý do bảo mật.",
    },
    {
      icon: Clock,
      title: "Hết thời gian",
      description: "Phiên thanh toán có thể đã hết hạn. Vui lòng thử lại.",
    },
    {
      icon: RefreshCw,
      title: "Sự cố mạng",
      description:
        "Kết nối internet kém có thể đã gián đoạn quá trình thanh toán.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 py-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-red-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Failed Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full mb-6">
            <XCircle className="h-12 w-12 text-white" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Thanh toán thất bại
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300"
          >
            Đừng lo, chúng tôi vẫn giữ chỗ cho bạn
          </motion.p>
        </motion.div>

        {/* Error Details */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Có chuyện gì vậy?</h2>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-300 font-medium">Lỗi thanh toán</p>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
            {orderId && (
              <p className="text-gray-400 text-sm mt-2">
                Mã đơn hàng: <span className="font-mono">{orderId}</span>
              </p>
            )}
          </div>

          {/* Booking Summary */}
          {bookingData._id && (
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <img
                src={bookingData.movie.poster_url}
                alt={bookingData.movie.title}
                className="w-16 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  {bookingData.movie.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  Booking ID: {bookingData._id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(bookingData.total_amount)}
                </p>
                <p className="text-gray-400 text-sm">Số tiền cần thanh toán</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          <motion.button
            onClick={handleRetryPayment}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 
                     text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <RefreshCw className="h-5 w-5" />
            Thử lại
          </motion.button>

          <motion.button
            onClick={() => navigate("/my-bookings")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-gray-600 to-gray-700 
                     text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại lịch sử đặt vé
          </motion.button>
        </motion.div>

        {/* Common Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">
            Lý do thường gặp khiến thanh toán thất bại
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {commonReasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white/5 rounded-lg"
                >
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Icon className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {reason.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {reason.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Cần hỗ trợ?</h3>
          <p className="text-gray-300 mb-6">
            Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn hoàn tất đặt vé.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.button
              onClick={handleContactSupport}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 bg-green-600/20 text-green-300 rounded-lg 
                       hover:bg-green-600/30 transition-colors border border-green-500/30"
            >
              <Phone className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Gọi hỗ trợ</p>
                <p className="text-sm opacity-80">0356055320</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 bg-blue-600/20 text-blue-300 rounded-lg 
                       hover:bg-blue-600/30 transition-colors border border-blue-500/30"
            >
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Gửi email</p>
                <p className="text-sm opacity-80">Nhận hỗ trợ qua email</p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate("/help")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 bg-purple-600/20 text-purple-300 rounded-lg 
                       hover:bg-purple-600/30 transition-colors border border-purple-500/30"
            >
              <AlertTriangle className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Trung tâm trợ giúp</p>
                <p className="text-sm opacity-80">Xem câu hỏi thường gặp</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-8 space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/movies")}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              ← Xem phim khác
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={() => navigate("/payment-history")}
              className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              Xem lịch sử thanh toán →
            </button>
          </div>

          <p className="text-gray-400 text-sm">
            Đặt vé sẽ được giữ trong 15 phút. Vui lòng thanh toán trước khi hết thời gian.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailed;
