import React from "react";
import { motion } from "framer-motion";
import { Search, Filter, RotateCcw } from "lucide-react";

interface BannerSliderHomeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onActiveFilterChange: (value: string) => void;
  autoActiveFilter: string;
  onAutoActiveFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

export const BannerSliderHomeFilters: React.FC<BannerSliderHomeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
  autoActiveFilter,
  onAutoActiveFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters = searchTerm || activeFilter || autoActiveFilter;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 font-body"
    >
      <div className="flex items-center gap-3 mb-4">
        <Filter size={20} className="text-slate-400" />
        <span className="text-white font-medium font-heading">Bộ lọc</span>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetFilters}
            className="flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-body"
          >
            <RotateCcw size={14} />
            Đặt lại
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Filter */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm banner..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 font-body"
          />
        </div>

        {/* Active Status Filter */}
        <select
          value={activeFilter}
          onChange={(e) => onActiveFilterChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 font-body"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Chỉ đang hoạt động</option>
          <option value="false">Chỉ không hoạt động</option>
        </select>

        {/* Auto-Active Filter */}
        <select
          value={autoActiveFilter}
          onChange={(e) => onAutoActiveFilterChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 font-body"
        >
          <option value="">Tất cả tự động kích hoạt</option>
          <option value="true">Đã bật tự động kích hoạt</option>
          <option value="false">Đã tắt tự động kích hoạt</option>
        </select>

        {/* Date Range - Future Enhancement */}
        <div className="flex items-center text-slate-400 text-sm font-body">
          <span>Bộ lọc phạm vi ngày sắp ra mắt...</span>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-600/30">
          {searchTerm && (
            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm flex items-center gap-2 font-body">
              Tìm kiếm: "{searchTerm}"
              <button
                onClick={() => onSearchChange("")}
                className="hover:text-orange-200"
              >
                ×
              </button>
            </span>
          )}
          {activeFilter && (
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center gap-2 font-body">
              Trạng thái: {activeFilter === "true" ? "Hoạt động" : "Không hoạt động"}
              <button
                onClick={() => onActiveFilterChange("")}
                className="hover:text-green-200"
              >
                ×
              </button>
            </span>
          )}
          {autoActiveFilter && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2 font-body">
              Tự động kích hoạt: {autoActiveFilter === "true" ? "Đã bật" : "Đã tắt"}
              <button
                onClick={() => onAutoActiveFilterChange("")}
                className="hover:text-blue-200"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};