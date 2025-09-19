import { Activity, CheckCircle, Clock, XCircle, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../../../types/Admin.type';

interface RevenueByStatusProps {
  dashboardData: DashboardStats | null;
}

export const RevenueByStatus = ({ dashboardData }: RevenueByStatusProps) => {
  if (!dashboardData?.booking_stats?.revenue_by_status || dashboardData.booking_stats.revenue_by_status.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity size={48} className="mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400">No revenue data available</p>
      </div>
    );
  }

  const statusConfig = {
    confirmed: {
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/20',
      icon: CheckCircle,
      iconColor: 'text-emerald-400'
    },
    pending: {
      color: 'from-amber-500 to-yellow-600',
      bgColor: 'bg-amber-500/20',
      icon: Clock,
      iconColor: 'text-amber-400'
    },
    cancelled: {
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-500/20',
      icon: XCircle,
      iconColor: 'text-red-400'
    }
  };

  const maxRevenue = Math.max(...dashboardData.booking_stats.revenue_by_status.map(s => s.total));
  const totalRevenue = dashboardData.booking_stats.revenue_by_status.reduce((sum, status) => sum + status.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <motion.div
            className="p-2 rounded-lg bg-blue-500/20 mr-3 border border-blue-500/30"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Activity size={20} className="text-blue-400" />
          </motion.div>
          Revenue by Status
        </h3>
        <div className="flex items-center text-sm text-gray-300">
          <Banknote size={14} className="mr-1" />
          <span>Total: {totalRevenue.toLocaleString()} VNĐ</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {dashboardData.booking_stats.revenue_by_status.map((status, index) => {
          const config = statusConfig[status._id as keyof typeof statusConfig] || statusConfig.confirmed;
          const Icon = config.icon;
          const percentage = ((status.total / totalRevenue) * 100).toFixed(1);
          const progressWidth = (status.total / maxRevenue) * 100;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon size={16} className={config.iconColor} />
                  </div>
                  <div>
                    <span className="font-medium text-white capitalize">{status._id}</span>
                    <p className="text-sm text-gray-400">{percentage}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">
                    {status.total.toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className={`h-2 rounded-full bg-gradient-to-r ${config.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-xl border border-slate-700/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">Revenue Performance</h4>
            <p className="text-sm text-gray-300">Based on booking status distribution</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-400">{totalRevenue.toLocaleString()} VNĐ</p>
            <p className="text-sm text-blue-300">Total Revenue</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
