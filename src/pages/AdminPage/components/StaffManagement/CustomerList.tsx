import { Loader2, UserPlus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AdminUser } from '../../../../types/Admin.type';

interface CustomerListProps {
  customers: AdminUser[];
  loading: boolean;
  onPromote: (customer: AdminUser) => void;
  onRefresh: () => void;
}

export const CustomerList = ({ customers, loading, onPromote, onRefresh }: CustomerListProps) => {
  if (loading) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={32} className="text-blue-400" />
          </motion.div>
          <motion.span 
            className="ml-3 text-gray-300 font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Đang tải danh sách khách hàng...
          </motion.span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white font-heading">Khách hàng có sẵn để thăng chức</h3>
          <p className="text-sm text-gray-400 font-body">Chọn một khách hàng để thăng chức lên nhân viên</p>
        </div>
        <motion.button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-all duration-300 font-body"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={16} />
          Làm mới
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-6">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-heading">Không có khách hàng nào để thăng chức</p>
              <p className="text-sm font-body">Tất cả khách hàng đã được thăng chức hoặc không có khách hàng nào trong hệ thống.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer, index) => (
              <motion.div
                key={customer._id}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-blue-500/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Customer Info */}
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {customer.avatar ? (
                      <img 
                        src={customer.avatar} 
                        alt={customer.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextEl) nextEl.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className={customer.avatar ? 'hidden' : 'block'}>
                      {customer.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-white font-medium font-heading">{customer.name || 'Không có tên'}</h4>
                    <p className="text-gray-400 text-sm font-body">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-gray-500 text-xs font-body">{customer.phone}</p>
                    )}
                  </div>
                </div>

                {/* Customer Stats */}
                {customer.stats && (
                  <div className="mb-4 text-xs text-gray-400 space-y-1 font-body">
                    <div className="flex justify-between">
                      <span>Lượt đặt vé:</span>
                      <span className="text-blue-400">{customer.stats.bookings_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lượt đánh giá:</span>
                      <span className="text-green-400">{customer.stats.ratings_count}</span>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="mb-4 text-xs text-gray-500 font-body">
                  Thành viên từ: {new Date(customer.created_at).toLocaleDateString()}
                </div>

                {/* Promote Button */}
                <motion.button
                  onClick={() => onPromote(customer)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 font-body"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus size={16} />
                  Thăng chức thành nhân viên
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
