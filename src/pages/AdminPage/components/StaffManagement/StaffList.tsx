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
            className="ml-3 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading staff...
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
          <h3 className="text-lg font-semibold text-white">Current Staff Members</h3>
          <p className="text-sm text-gray-400">Manage and view staff information</p>
        </div>
        <motion.button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={16} />
          Refresh
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-6">
        {staff.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No staff members found</p>
              <p className="text-sm">Promote some customers to staff to see them here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700/80 to-slate-800/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Staff Member</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
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
                          <div className="text-sm font-medium text-white">{staffMember.name || 'No name'}</div>
                          <div className="text-sm text-gray-400">{staffMember.email}</div>
                          {staffMember.phone && (
                            <div className="text-xs text-gray-500">{staffMember.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                          staffMember.verify === 1
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : staffMember.verify === 2
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {staffMember.verify === 1 ? 'Active' : staffMember.verify === 2 ? 'Inactive' : 'Pending'}
                      </motion.button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {staffMember.stats && (
                        <div className="text-xs space-y-1">
                          <div>Bookings: {staffMember.stats.bookings_count}</div>
                          <div>Ratings: {staffMember.stats.ratings_count}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
