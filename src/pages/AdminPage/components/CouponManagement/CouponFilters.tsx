import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc, Check, X } from 'lucide-react';

interface CouponFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  activeOnly: boolean;
  onActiveOnlyChange: (value: boolean) => void;
  selectedCount: number;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  bulkLoading: boolean;
}

export const CouponFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  activeOnly,
  onActiveOnlyChange,
  selectedCount,
  onBulkActivate,
  onBulkDeactivate,
  bulkLoading
}: CouponFiltersProps) => {
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'expired', label: 'Đã hết hạn' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Ngày tạo' },
    { value: 'code', label: 'Mã giảm giá' },
    { value: 'start_date', label: 'Ngày bắt đầu' },
    { value: 'end_date', label: 'Ngày kết thúc' },
    { value: 'usage_count', label: 'Lượt sử dụng' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6 font-body">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm mã giảm giá..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-white placeholder-gray-400 font-body"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="block w-full pl-10 pr-8 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors duration-200 text-white font-body"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-700 text-white font-body">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="block w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors duration-200 text-white font-body"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-700 text-white font-body">
                Sắp xếp theo {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-colors duration-200 font-body ${
              sortOrder === 'asc'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          </motion.button>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Active Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => onActiveOnlyChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            activeOnly ? 'bg-blue-600' : 'bg-slate-600'
          }`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
              activeOnly ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
          <span className="text-sm font-medium text-gray-300 font-body">Chỉ đang hoạt động</span>
        </label>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-300 font-body">
              Đã chọn {selectedCount}
            </span>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBulkActivate}
              disabled={bulkLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 font-body"
            >
              <Check className="h-4 w-4" />
              Kích hoạt
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBulkDeactivate}
              disabled={bulkLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 font-body"
            >
              <X className="h-4 w-4" />
              Vô hiệu hóa
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
