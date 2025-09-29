import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Users,
  Eye,
  Search,
  Filter,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  getTheaters,
  getTheaterStats,
  getTheaterDetails,
  formatCurrency,
  type TheaterQueryParams,
} from "../../../../apis/admin.api";

const TheaterManagement: React.FC = () => {
  const [filters, setFilters] = useState<TheaterQueryParams>({
    page: 1,
    limit: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [selectedTheater, setSelectedTheater] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleFilterChange = useCallback((key: keyof TheaterQueryParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // Fetch theaters list
  const {
    data: theatersData,
    isLoading: theatersLoading,
    error: theatersError,
    refetch: refetchTheaters,
  } = useQuery({
    queryKey: ["admin-theaters", filters],
    queryFn: () => getTheaters(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch theater stats
  const {
    data: statsData,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["admin-theater-stats"],
    queryFn: getTheaterStats,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch theater details (when selected)
  const {
    data: theaterDetails,
    isLoading: detailsLoading,
  } = useQuery({
    queryKey: ["admin-theater-details", selectedTheater],
    queryFn: () => getTheaterDetails(selectedTheater!),
    enabled: !!selectedTheater,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Hoạt động", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      inactive: { label: "Ngừng hoạt động", color: "bg-red-500/20 text-red-400 border-red-500/30" },
      maintenance: { label: "Bảo trì", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (theatersError) {
    return (
      <div className="p-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">
            Không thể tải dữ liệu rạp chiếu: {theatersError.message}
          </p>
        </div>
      </div>
    );
  }

  const theaters = theatersData?.result.theaters || [];
  const stats = statsData?.result;

  // Loading skeleton component for table rows
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="border-b border-slate-700">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-700 rounded mr-3 animate-pulse"></div>
              <div>
                <div className="h-4 bg-slate-700 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-slate-600 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-40 animate-pulse"></div>
              <div className="h-3 bg-slate-600 rounded w-32 animate-pulse"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-28 animate-pulse"></div>
              <div className="h-3 bg-slate-600 rounded w-36 animate-pulse"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 bg-slate-700 rounded-full w-20 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="space-y-2">
              <div className="h-3 bg-slate-700 rounded w-20 animate-pulse"></div>
              <div className="h-3 bg-slate-600 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-slate-500 rounded w-24 animate-pulse"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-8 bg-slate-700 rounded w-20 animate-pulse"></div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-heading">
            Quản Lý Rạp Chiếu
          </h1>
          <p className="text-slate-400 font-body">
            Theo dõi và quản lý tất cả rạp chiếu trong hệ thống
          </p>
        </div>
        <button
          onClick={() => refetchTheaters()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-body"
        >
          <BarChart3 className="h-4 w-4" />
          Làm Mới
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {statsLoading && !stats ? (
          // Loading skeleton for stats on first load
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded w-20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-slate-700 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-slate-600 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          ))
        ) : stats ? (
          // Actual stats data
          <>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="h-8 w-8 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium font-body">
                  Tổng Rạp
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white font-heading">
                  {stats.total_theaters}
                </p>
                <p className="text-blue-400 text-sm font-body">
                  {stats.active_theaters} đang hoạt động
                </p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium font-body">
                  Quản Lý
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white font-heading">
                  {stats.theaters_with_manager}
                </p>
                <p className="text-emerald-400 text-sm font-body">
                  {stats.theaters_without_manager} chưa có quản lý
                </p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-8 w-8 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium font-body">
                  Đặt Vé
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white font-heading">
                  {stats.total_bookings.toLocaleString()}
                </p>
                <p className="text-purple-400 text-sm font-body">
                  Tổng số đặt vé
                </p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium font-body">
                  Doanh Thu
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white font-heading">
                  {formatCurrency(stats.total_revenue)}
                </p>
                <p className="text-emerald-400 text-sm font-body">
                  Tổng doanh thu
                </p>
              </div>
            </div>
          </>
        ) : null}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white font-heading">
            Bộ Lọc
          </h2>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-body">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tên rạp, địa chỉ..."
                  value={searchInput}
                  onChange={(e) => {
                    e.preventDefault();
                    handleSearchChange(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-body"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-body">
                Thành phố
              </label>
              <input
                type="text"
                placeholder="Hà Nội, TP.HCM..."
                value={filters.city || ""}
                onChange={(e) => {
                  e.preventDefault();
                  handleFilterChange("city", e.target.value);
                }}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-body"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-body">
                Trạng thái
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => {
                  e.preventDefault();
                  handleFilterChange("status", e.target.value || undefined);
                }}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 font-body"
              >
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>

            {/* Has Manager */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 font-body">
                Quản lý
              </label>
              <select
                value={filters.has_manager?.toString() || ""}
                onChange={(e) => {
                  e.preventDefault();
                  const value = e.target.value;
                  handleFilterChange("has_manager", value ? value === "true" : undefined);
                }}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 font-body"
              >
                <option value="">Tất cả</option>
                <option value="true">Có quản lý</option>
                <option value="false">Chưa có quản lý</option>
              </select>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Theater List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white font-heading">
            Danh Sách Rạp Chiếu ({theatersData?.result.total || 0})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-body">
                  Rạp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-body">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-body">
                  Quản lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-body">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-body">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider font-body">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {theatersLoading ? (
                <TableSkeleton />
              ) : (
                theaters.map((theater) => (
                  <tr key={theater._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-8 w-8 text-blue-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-white font-body">
                            {theater.name}
                          </div>
                          <div className="text-sm text-slate-400 font-body">
                            {theater.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-300 font-body">
                        <MapPin className="h-4 w-4 text-slate-400 mr-1" />
                        <div>
                          <div>{theater.location}</div>
                          <div className="text-slate-400">{theater.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {theater.manager_info ? (
                        <div className="text-sm font-body">
                          <div className="text-white">{theater.manager_info.name}</div>
                          <div className="text-slate-400">{theater.manager_info.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-red-400 font-body">Chưa có quản lý</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(theater.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-body">
                        <div className="text-white">{theater.total_screens} phòng chiếu</div>
                        <div className="text-slate-400">{theater.total_bookings} đặt vé</div>
                        <div className="text-emerald-400">{formatCurrency(theater.total_revenue)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTheater(theater._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors font-body"
                      >
                        <Eye className="h-4 w-4" />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!theatersLoading && theatersData && theatersData.result.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-400 font-body">
              Hiển thị {(theatersData.result.page - 1) * theatersData.result.limit + 1} -{" "}
              {Math.min(theatersData.result.page * theatersData.result.limit, theatersData.result.total)} của{" "}
              {theatersData.result.total} rạp
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(theatersData.result.page - 1)}
                disabled={theatersData.result.page <= 1}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                Trước
              </button>
              <span className="px-3 py-1 text-white text-sm font-body">
                {theatersData.result.page} / {theatersData.result.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(theatersData.result.page + 1)}
                disabled={theatersData.result.page >= theatersData.result.total_pages}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator for pagination */}
        {theatersLoading && theatersData && (
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400 font-body">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Đang tải dữ liệu...
            </div>
          </div>
        )}
      </motion.div>

      {/* Theater Details Modal */}
      {selectedTheater && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTheater(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white font-heading">
                Chi Tiết Rạp Chiếu
              </h2>
            </div>
            
            {detailsLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            ) : theaterDetails ? (
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 font-heading">
                      Thông Tin Cơ Bản
                    </h3>
                    <div className="space-y-2 font-body">
                      <div><strong className="text-slate-300">Tên:</strong> <span className="text-white">{theaterDetails.result.name}</span></div>
                      <div><strong className="text-slate-300">Khu vực:</strong> <span className="text-white">{theaterDetails.result.location}</span></div>
                      <div><strong className="text-slate-300">Địa chỉ:</strong> <span className="text-white">{theaterDetails.result.address}</span></div>
                      <div><strong className="text-slate-300">Thành phố:</strong> <span className="text-white">{theaterDetails.result.city}</span></div>
                      <div><strong className="text-slate-300">Trạng thái:</strong> {getStatusBadge(theaterDetails.result.status)}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 font-heading">
                      Quản Lý Rạp
                    </h3>
                    {theaterDetails.result.manager_info ? (
                      <div className="space-y-2 font-body">
                        <div><strong className="text-slate-300">Tên:</strong> <span className="text-white">{theaterDetails.result.manager_info.name}</span></div>
                        <div><strong className="text-slate-300">Email:</strong> <span className="text-white">{theaterDetails.result.manager_info.email}</span></div>
                        <div><strong className="text-slate-300">Điện thoại:</strong> <span className="text-white">{theaterDetails.result.manager_info.phone || "Chưa cập nhật"}</span></div>
                      </div>
                    ) : (
                      <p className="text-red-400 font-body">Chưa có quản lý được phân công</p>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 font-heading">
                    Thống Kê Chi Tiết
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-slate-400 text-sm font-body">Phòng chiếu</div>
                      <div className="text-white font-bold font-heading">{theaterDetails.result.statistics.total_screens}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-slate-400 text-sm font-body">Suất chiếu</div>
                      <div className="text-white font-bold font-heading">{theaterDetails.result.statistics.total_showtimes}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-slate-400 text-sm font-body">Đặt vé hoàn thành</div>
                      <div className="text-white font-bold font-heading">{theaterDetails.result.statistics.completed_bookings}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <div className="text-slate-400 text-sm font-body">Doanh thu</div>
                      <div className="text-white font-bold font-heading">{formatCurrency(theaterDetails.result.statistics.total_revenue)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TheaterManagement;