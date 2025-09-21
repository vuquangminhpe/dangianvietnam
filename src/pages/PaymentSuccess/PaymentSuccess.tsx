/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Download,
  Calendar,
  MapPin,
  Ticket,
  Star,
  ArrowRight,
  Share2,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import bookingApi from "../../apis/booking.api";
import { formatCurrency, formatDateTime } from "../../utils/format";
import QRCode from "react-qr-code";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  const bookingId = searchParams.get("bookingId");

  // Fetch booking data
  const { data: bookingDatas, isLoading: isLoadingBooking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId || ""),
  });
  const bookingData = bookingDatas?.data?.result;

  const handleDownloadTicket = () => {
    const svg = document.querySelector("#payment-qr svg") as SVGElement;
    if (svg && bookingData) {
      // Create canvas for QR code
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 800;
      canvas.height = 600;

      img.onload = () => {
        if (ctx) {
          // White background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, 800, 600);

          // Title
          ctx.fillStyle = "#000000";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("CINEMA TICKET", 400, 40);

          // Line
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(50, 60);
          ctx.lineTo(750, 60);
          ctx.stroke();

          // Movie info
          ctx.font = "18px Arial";
          ctx.textAlign = "left";
          ctx.fillText(`Phim: ${bookingData.movie?.title}`, 50, 100);
          ctx.fillText(`Rạp: ${bookingData.theater?.name}`, 50, 130);
          ctx.fillText(`Suất: ${formatDateTime(bookingData.showtime?.start_time as any)}`, 50, 160);
          ctx.fillText(`Ghế: ${bookingData.seats?.map((s: any) => `${s.row}${s.number}`).join(", ")}`, 50, 190);
          ctx.fillText(`Mã vé: ${bookingData.ticket_code}`, 50, 220);
          ctx.fillText(`Tổng tiền: ${formatCurrency(bookingData.total_amount as any)}`, 50, 250);

          // QR Code
          ctx.drawImage(img, 300, 300, 200, 200);

          // QR Code label
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Quét QR code để vào rạp", 400, 530);

          // Footer
          ctx.font = "12px Arial";
          ctx.fillText("Vui lòng đến rạp trước 15 phút!", 400, 570);
        }

        // Download
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `ticket-${bookingData.ticket_code}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const svgData = new XMLSerializer().serializeToString(svg);
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  const handleCopyTicketCode = async () => {
    if (bookingData?.ticket_code) {
      try {
        await navigator.clipboard.writeText(bookingData.ticket_code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleShareExperience = async () => {
    const shareData = {
      title: `Đã đặt vé xem ${bookingData?.movie?.title}! 🎬`,
      text: `Tôi vừa đặt vé xem phim "${bookingData?.movie?.title}" tại ${bookingData?.theater?.name}. Cùng đi xem nhé! 🍿`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert("Đã copy link chia sẻ!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (isLoadingBooking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Đang tải thông tin đặt vé...</p>
        </div>
      </div>
    );
  }

  const handleWriteReview = () => {
    // Navigate to review page or open review modal
    navigate(`/movies/${bookingData?.movie?.title}?tab=reviews&write=true`);
  };

  return (
    <div className="min-h-screen  bg-gray-950 py-8">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-green-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Đặt vé thành công! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300"
          >
            Vé của bạn đã được xác nhận
          </motion.p>
        </motion.div>

        {/* Ticket Card */}
        {bookingData &&
          bookingData.movie &&
          bookingData.payment &&
          bookingData.showtime &&
          bookingData.theater && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8"
            >
              {/* Ticket Header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/20">
                <div className="flex items-center gap-4">
                  <img
                    src={bookingData.movie.poster_url}
                    alt={bookingData.movie.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-movie.png";
                    }}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {bookingData.movie.title}
                    </h2>
                    <p className="text-gray-300">
                      {bookingData.movie.duration} phút
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                        Đã thanh toán
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Mã vé</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-400 font-mono">
                      {bookingData?.ticket_code}
                    </p>
                    <button
                      onClick={handleCopyTicketCode}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy mã vé"
                    >
                      {isCopied ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <Copy className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                {/* Cinema & Time */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Rạp chiếu</p>
                      <p className="text-white font-semibold">
                        {bookingData.theater.name}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {bookingData.theater.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Suất chiếu</p>
                      <p className="text-white font-semibold">
                        {formatDateTime(bookingData.showtime.start_time)}
                      </p>
                      <p className="text-orange-400 text-sm font-medium">
                        ⏰ Vui lòng có mặt trước 15 phút
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seats & Payment */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Ticket className="h-5 w-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Ghế ngồi</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {bookingData.seats.map((seat: any, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium"
                          >
                            {seat.row}
                            {seat.number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Tổng thanh toán</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(bookingData.total_amount)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        qua {(bookingData.payment as any)?.method || "VNPay"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple QR Code Section */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                    <Ticket className="h-5 w-5 text-green-400" />
                    QR Code vé xem phim
                  </h4>

                  <div className="bg-white p-4 rounded-lg inline-block" id="payment-qr">
                    <QRCode
                      value={bookingData?.ticket_code || ""}
                      size={160}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>

                  <p className="text-gray-300 text-sm mt-3 font-mono">
                    {bookingData?.ticket_code}
                  </p>

                  <p className="text-gray-400 text-xs mt-2">
                    Đưa QR code này cho nhân viên rạp để vào xem phim
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <button
            onClick={handleDownloadTicket}
            className="flex items-center justify-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 
                     text-white rounded-xl transition-colors font-medium"
          >
            <Download className="h-5 w-5" />
            Tải vé xuống
          </button>

          <button
            onClick={handleShareExperience}
            className="flex items-center justify-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 
                     text-white rounded-xl transition-colors font-medium"
          >
            <Share2 className="h-5 w-5" />
            Chia sẻ
          </button>

          <button
            onClick={handleWriteReview}
            className="flex items-center justify-center gap-3 p-4 bg-green-600 hover:bg-green-700 
                     text-white rounded-xl transition-colors font-medium"
          >
            <MessageSquare className="h-5 w-5" />
            Viết đánh giá
          </button>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Bước tiếp theo
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Đến rạp sớm 15 phút</p>
                <p className="text-gray-400 text-sm">
                  Đưa mã QR hoặc mã vé cho nhân viên
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Xem vé đã đặt</p>
                <p className="text-gray-400 text-sm">
                  Quản lý tất cả vé xem phim của bạn
                </p>
              </div>
              <button
                onClick={() => navigate("/my-bookings")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 transition-colors"
              >
                <Ticket className="h-4 w-4" />
                Vé của tôi
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => navigate("/movies")}
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Đặt vé phim khác →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
