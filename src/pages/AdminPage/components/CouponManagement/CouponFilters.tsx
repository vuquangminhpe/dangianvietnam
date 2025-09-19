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
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'code', label: 'Coupon Code' },
    { value: 'start_date', label: 'Start Date' },
    { value: 'end_date', label: 'End Date' },
    { value: 'usage_count', label: 'Usage Count' }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-white placeholder-gray-400"
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
            className="block w-full pl-10 pr-8 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors duration-200 text-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-700 text-white">
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
            className="block w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors duration-200 text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-700 text-white">
                Sort by {option.label}
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
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-colors duration-200 ${
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
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
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
          <span className="text-sm font-medium text-gray-300">Active Only</span>
        </label>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-300">
              {selectedCount} selected
            </span>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBulkActivate}
              disabled={bulkLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Activate
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBulkDeactivate}
              disabled={bulkLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Deactivate
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
