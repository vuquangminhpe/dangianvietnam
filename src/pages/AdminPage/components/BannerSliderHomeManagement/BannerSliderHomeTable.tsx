import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import type { BannerSliderHome } from "../../../../apis/bannerSliderHome.api";

interface BannerSliderHomeTableProps {
  banners: BannerSliderHome[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string) => void;
  onEdit: (banner: BannerSliderHome) => void;
  onDelete: (bannerId: string) => void;
  onPreview: (banner: BannerSliderHome) => void;
  onRefresh: () => void;
}

export const BannerSliderHomeTable: React.FC<BannerSliderHomeTableProps> = ({
  banners,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
  onPreview,
  onRefresh,
}) => {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const SortableHeader: React.FC<{
    field: string;
    children: React.ReactNode;
  }> = ({ field, children }) => (
    <th
      onClick={() => onSortChange(field)}
      className="px-3 py-3 text-left text-xs font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors font-heading"
    >
      <div className="flex items-center gap-1">
        {children}
        <span className="text-orange-400 text-xs">{getSortIcon(field)}</span>
      </div>
    </th>
  );

  const getActivationStatus = (banner: BannerSliderHome) => {
    if (banner.active) {
      return {
        icon: CheckCircle,
        text: "Hoạt động",
        className: "text-green-400",
        bgClassName: "bg-green-500/20",
      };
    }

    if (banner.auto_active && banner.time_active) {
      const activationTime = new Date(banner.time_active);
      const now = new Date();

      if (activationTime > now) {
        return {
          icon: Clock,
          text: "Đã lên lịch",
          className: "text-blue-400",
          bgClassName: "bg-blue-500/20",
        };
      } else {
        return {
          icon: AlertTriangle,
          text: "Đang chờ",
          className: "text-yellow-400",
          bgClassName: "bg-yellow-500/20",
        };
      }
    }

    return {
      icon: XCircle,
      text: "Không hoạt động",
      className: "text-slate-400",
      bgClassName: "bg-slate-500/20",
    };
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 font-body"
      >
        <div className="flex items-center justify-center">
          <RefreshCw size={24} className="animate-spin text-orange-400 mr-3" />
          <span className="text-white">Đang tải banner...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 font-body"
      >
        <div className="text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2 font-heading">
            Lỗi khi tải Banner
          </h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg mx-auto transition-colors font-body"
          >
            <RefreshCw size={18} />
            Thử lại
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden font-body"
    >
      {/* Table Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white font-heading">
          Banner Trang chủ ({banners.length})
        </h3>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-body"
        >
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {/* Table */}
      {banners.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-slate-400 mb-4 font-body">Không tìm thấy banner nào</div>
          <button
            onClick={onRefresh}
            className="text-orange-400 hover:text-orange-300 transition-colors font-body"
          >
            Làm mới để thử lại
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 font-heading">
                  Xem trước
                </th>
                <SortableHeader field="title">Tiêu đề</SortableHeader>
                <SortableHeader field="author">Tác giả</SortableHeader>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 font-heading">
                  Chủ đề
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 font-heading">
                  Trạng thái
                </th>
                <SortableHeader field="time_active">
                  Kích hoạt
                </SortableHeader>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 font-heading">
                  Tự động
                </th>
                <SortableHeader field="created_at">Ngày tạo</SortableHeader>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 font-heading">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              <AnimatePresence>
                {banners.map((banner, index) => {
                  const status = getActivationStatus(banner);
                  const StatusIcon = status.icon;
                  console.log(banner);

                  return (
                    <motion.tr
                      key={banner._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-700/30 transition-all duration-200"
                    >
                      {/* Preview */}
                      <td className="px-3 py-3">
                        <div className="w-12 h-8 rounded overflow-hidden bg-slate-700">
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-3 py-3">
                        <div className="max-w-[150px]">
                          <div className="font-semibold text-white truncate text-xs font-body">
                            {banner.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate font-body">
                            {banner.description}
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-3 py-3">
                        <div className="max-w-[100px]">
                          <span className="text-slate-300 text-xs truncate block font-body">{banner.author}</span>
                        </div>
                      </td>

                      {/* Topic */}
                      <td className="px-3 py-3">
                        <div className="max-w-[80px]">
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-[10px] truncate block font-body">
                            {banner.topic || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit ${status.bgClassName}`}
                        >
                          <StatusIcon size={12} className={status.className} />
                          <span className={`text-[10px] ${status.className} font-body`}>
                            {status.text}
                          </span>
                        </div>
                      </td>

                      {/* Activation Time */}
                      <td className="px-3 py-3">
                        <div className="max-w-[100px]">
                          {banner.time_active ? (
                            <div className="text-[10px]">
                              <div className="text-slate-300 truncate font-body">
                                {format(
                                  new Date(banner.time_active),
                                  "dd/MM"
                                )}
                              </div>
                              <div className="text-slate-400 font-body">
                                {format(new Date(banner.time_active), "HH:mm")}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-body">—</span>
                          )}
                        </div>
                      </td>

                      {/* Auto-Active */}
                      <td className="px-3 py-3">
                        <div className="flex justify-center">
                          {banner.auto_active ? (
                            <ToggleRight size={14} className="text-green-400" />
                          ) : (
                            <ToggleLeft size={14} className="text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-3 py-3">
                        <div className="max-w-[80px]">
                          <div className="text-[10px] text-slate-400 truncate font-body">
                            {format(new Date(banner.created_at), "dd/MM/yy")}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onPreview(banner)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all duration-200"
                            title="Xem trước Banner"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => onEdit(banner)}
                            className="p-1.5 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded transition-all duration-200"
                            title="Sửa Banner"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => onDelete(banner._id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200"
                            title="Xóa Banner"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50 font-body">
          <div className="text-sm text-slate-400">
            Trang {currentPage} của {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page =
                Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 font-body ${
                    page === currentPage
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
