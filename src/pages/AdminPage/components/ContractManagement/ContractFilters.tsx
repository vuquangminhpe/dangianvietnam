import { Search, RefreshCw, Clock, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContractFiltersProps {
  totalContracts: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onSearch: (e: React.FormEvent) => void;
  onRefresh: () => void;
  onCheckExpired: () => void;
}

export const ContractFilters = ({
  totalContracts,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onSearch,
  onRefresh,
  onCheckExpired
}: ContractFiltersProps) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white font-heading">Quản lý hợp đồng</h2>
              <p className="text-sm text-gray-400 font-body">Tổng cộng: {totalContracts} hợp đồng</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onCheckExpired}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg border border-yellow-500/30 transition-all duration-300 font-body"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Clock size={16} />
            <span className="text-sm font-medium">Kiểm tra hết hạn</span>
          </motion.button>
          
          <motion.button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/30 transition-all duration-300 font-body"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} />
            <span className="text-sm font-medium">Làm mới</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <form onSubmit={onSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên nhân viên, email, hoặc mã hợp đồng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 font-body"
            />
          </div>
        </form>

        {/* Sort Controls */}
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 font-body"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="start_date">Ngày bắt đầu</option>
            <option value="end_date">Ngày kết thúc</option>
            <option value="salary">Lương</option>
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 font-body"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};
