import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { 
  RefreshCw, 
  Loader2, 
  Activity, 
  Users,
  UserCheck,
  Ticket,
  Star
} from 'lucide-react';
import { getDashboardStats, getQuickStats, getRecentActivities } from '../../../../apis/admin.api';
import type { DashboardStats, DashboardQueryParams } from '../../../../types/Admin.type';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

import { DashboardStatsComponent } from './DashboardStats';
import { TopMovies } from './TopMovies';
import { TopTheaters } from './TopTheaters';
import { BookingsChart } from './BookingsChart';
import { RevenueByStatus } from './RevenueByStatus';

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardQueryParams['period']>('month');

  // Fetch quick stats
  const { data: quickStatsData } = useQuery({
    queryKey: ["admin-quick-stats"],
    queryFn: () => getQuickStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent activities
  const { data: recentActivitiesData } = useQuery({
    queryKey: ["admin-recent-activities"],
    queryFn: () => getRecentActivities(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats({ period: selectedPeriod });
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = () => {
    fetchDashboardData();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Simple loading state
  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 font-body">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dashboard Header with Gradient */}
      <motion.div 
        className="relative p-8 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/20 overflow-hidden"
        variants={itemVariants}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <motion.h2 
              className="text-3xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent font-heading"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Tổng quan bảng điều khiển
            </motion.h2>
            <motion.p 
              className="text-gray-300 mt-2 flex items-center gap-2 font-body"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Activity size={16} />
              Theo dõi hiệu suất và thống kê hệ thống
            </motion.p>
          </div>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as DashboardQueryParams['period'])}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-body"
            >
              <option value="today" className="bg-gray-800 text-white">Hôm nay</option>
              <option value="week" className="bg-gray-800 text-white">Tuần này</option>
              <option value="month" className="bg-gray-800 text-white">Tháng này</option>
              <option value="year" className="bg-gray-800 text-white">Năm nay</option>
              <option value="all" className="bg-gray-800 text-white">Tất cả</option>
            </select>
            
            <Button
              onClick={handleRefreshData}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 font-body"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="ml-2">Làm mới</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <DashboardStatsComponent dashboardData={dashboardData} />
      </motion.div>

     
      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Info Cards */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-sm p-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white font-heading">Thống kê nhanh</h3>
            <Users size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-4 font-body">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Người dùng hoạt động</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.active_users || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Lượt đặt vé mới</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.new_bookings_this_month || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Đánh giá chờ duyệt</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.pending_ratings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Phản hồi chờ duyệt</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.pending_feedbacks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Hợp đồng chờ duyệt</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.pending_contracts || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tổng nhân viên</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.total_staff || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tổng rạp chiếu</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.total_theaters || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tổng màn hình</span>
              <span className="font-semibold text-white">{quickStatsData?.result?.total_screens || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Top Movies */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-sm p-6"
          variants={itemVariants}
        >
          <TopMovies dashboardData={dashboardData} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-sm p-6"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white font-heading">Hoạt động gần đây</h3>
            <Activity size={20} className="text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {[
              { 
                action: 'Người dùng mới đăng ký', 
                count: recentActivitiesData?.result?.summary?.new_users || 0,
                type: 'user',
                icon: UserCheck
              },
              { 
                action: 'Đặt vé thành công', 
                count: recentActivitiesData?.result?.summary?.successful_bookings || 0,
                type: 'booking',
                icon: Ticket
              },
              { 
                action: 'Đánh giá mới', 
                count: recentActivitiesData?.result?.summary?.new_ratings || 0,
                type: 'review',
                icon: Star
              },
              { 
                action: 'Thanh toán hoàn thành', 
                count: recentActivitiesData?.result?.summary?.completed_payments || 0,
                type: 'payment',
                icon: Activity
              }
            ].map((activity, index) => (
              <motion.div 
                key={index}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'booking' ? 'bg-green-500' :
                  activity.type === 'review' ? 'bg-yellow-500' : 'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-white font-body">{activity.action}</p>
                  <p className="text-xs text-gray-400 font-body">{activity.count} hoạt động</p>
                </div>
              </motion.div>
            ))}
          </div>
          
       
        </motion.div>
      </div>

      {/* Legacy Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-sm p-6"
          variants={itemVariants}
        >
          <TopTheaters dashboardData={dashboardData} />
        </motion.div>
        
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-sm p-6"
          variants={itemVariants}
        >
          <BookingsChart dashboardData={dashboardData} />
        </motion.div>
      </div>

      <motion.div 
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-sm p-6"
        variants={itemVariants}
      >
        <RevenueByStatus dashboardData={dashboardData} />
      </motion.div>
    </motion.div>
  );
};
