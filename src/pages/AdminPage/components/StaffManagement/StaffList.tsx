import { Loader2, RefreshCw, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AdminUser } from '../../../../types/Admin.type';

interface StaffListProps {
  staff: AdminUser[];
  loading: boolean;
  onRefresh: () => void;
}

export const StaffList = ({ staff, loading, onRefresh }: StaffListProps) => {
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
            Đang tải danh sách nhân viên...
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
          <h3 className="text-lg font-semibold text-white font-heading">Thành viên nhân viên hiện tại</h3>
          <p className="text-sm text-gray-400 font-body">Quản lý và xem thông tin nhân viên</p>
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
        {staff.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-heading">Không tìm thấy thành viên nhân viên nào</p>
              <p className="text-sm font-body">Thăng chức cho một số khách hàng thành nhân viên để thấy họ ở đây.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700/80 to-slate-800/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Thành viên nhân viên</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Vai trò</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Thống kê</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {staff.map((staffMember, index) => (
                  <motion.tr 
                    key={staffMember._id}
                    className="hover:bg-slate-700/30 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.01,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {staffMember.avatar ? (
                            <img 
                              src={staffMember.avatar} 
                              alt={staffMember.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextEl) nextEl.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <span className={staffMember.avatar ? 'hidden' : 'block'}>
                            {staffMember.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white font-body">{staffMember.name || 'Không có tên'}</div>
                          <div className="text-sm text-gray-400 font-body">{staffMember.email}</div>
                          {staffMember.phone && (
                            <div className="text-xs text-gray-500 font-body">{staffMember.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-500/20 text-blue-400 border border-blue-500/30 font-body">
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 font-body ${
                          staffMember.verify === 1
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : staffMember.verify === 2
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {staffMember.verify === 1 ? 'Hoạt động' : staffMember.verify === 2 ? 'Không hoạt động' : 'Đang chờ xử lý'}
                      </motion.button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-body">
                      {staffMember.stats && (
                        <div className="text-xs space-y-1">
                          <div>Lượt đặt vé: {staffMember.stats.bookings_count}</div>
                          <div>Lượt đánh giá: {staffMember.stats.ratings_count}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-body">
                      {new Date(staffMember.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
