import { Loader2, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminUser } from '../../../../types/Admin.type';

interface UserTableProps {
  users: AdminUser[];
  usersLoading: boolean;
  currentPage: number;
  totalUsers: number;
  limit: number;
  onViewUser: (userId: string) => void;
  onEditUser: (user: AdminUser) => void;
  onToggleUserStatus: (userId: string, isCurrentlyActive: boolean) => void;
  onDeleteUser: (user: AdminUser) => void;
  onPageChange: (page: number) => void;
}

export const UserTable = ({
  users,
  usersLoading,
  currentPage,
  totalUsers,
  limit,
  onViewUser,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
  onPageChange
}: UserTableProps) => {
  const totalPages = Math.ceil(totalUsers / limit);

  if (usersLoading) {
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
            Loading users...
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <motion.thead 
            className="bg-gradient-to-r from-slate-700/80 to-slate-800/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stats</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </motion.thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {users.map((userData, index) => (
                <motion.tr 
                  key={userData._id} 
                  className="hover:bg-slate-700/30 transition-all duration-300 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    delay: index * 0.05, 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {userData.avatar ? (
                        <img 
                          src={userData.avatar} 
                          alt={userData.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextEl) nextEl.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span className={userData.avatar ? 'hidden' : 'block'}>
                        {userData.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{userData.name || 'No name'}</div>
                      <div className="text-sm text-gray-400">{userData.email}</div>
                      {userData.phone && (
                        <div className="text-xs text-gray-500">{userData.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    userData.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : userData.role === 'staff'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {userData.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.button
                    onClick={() => onToggleUserStatus(userData._id, userData.verify === 1)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      userData.verify === 1
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        : userData.verify === 2
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {userData.verify === 1 ? 'Verified' : userData.verify === 2 ? 'Banned' : 'Unverified'}
                  </motion.button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {userData.stats && (
                    <div className="text-xs space-y-1">
                      <div>Bookings: {userData.stats.bookings_count}</div>
                      <div>Ratings: {userData.stats.ratings_count}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(userData.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => onViewUser(userData._id)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-lg hover:bg-blue-500/10"
                      title="View Details"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => onEditUser(userData)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-yellow-500/10"
                      title="Edit User"
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => onDeleteUser(userData)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                      title="Delete User"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          className="bg-slate-800/50 px-6 py-4 flex items-center justify-between border-t border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.div 
            className="text-sm text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-slate-600/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500/50 transition-all duration-300 flex items-center gap-1"
              whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            >
              <ChevronLeft size={16} />
              Previous
            </motion.button>
            
            <motion.span 
              className="text-sm px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-medium"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              Page {currentPage} of {totalPages}
            </motion.span>
            
            <motion.button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-slate-600/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500/50 transition-all duration-300 flex items-center gap-1"
              whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            >
              Next
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
