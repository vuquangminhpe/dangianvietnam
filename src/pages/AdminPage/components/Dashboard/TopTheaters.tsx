import { Building2, MapPin, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../../../types/Admin.type';

interface TopTheatersProps {
  dashboardData: DashboardStats | null;
}

export const TopTheaters = ({ dashboardData }: TopTheatersProps) => {
  if (!dashboardData?.top_performers?.top_theaters || dashboardData.top_performers.top_theaters.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No theater data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <motion.div
            className="p-2 rounded-lg bg-blue-500/20 mr-3 border border-blue-500/30"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Building2 size={20} className="text-blue-400" />
          </motion.div>
          Top Theaters
        </h3>
        <span className="text-sm text-gray-400">This month</span>
      </div>
      
      <div className="space-y-4">
        {dashboardData.top_performers.top_theaters.slice(0, 4).map((theater, index) => (
          <motion.div
            key={theater._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            className="p-4 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-white">{theater.name}</h4>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <MapPin size={12} className="mr-1" />
                    {theater.location}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-sm text-green-400 font-medium">
                  <TrendingUp size={12} className="mr-1" />
                  {theater.revenue.toLocaleString()} VNĐ
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {theater.bookings_count} bookings
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Performance</span>
                <span>
                  {Math.min(
                    (theater.bookings_count / Math.max(...dashboardData.top_performers.top_theaters.map(t => t.bookings_count))) * 100, 
                    100
                  ).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(
                      (theater.bookings_count / Math.max(...dashboardData.top_performers.top_theaters.map(t => t.bookings_count))) * 100, 
                      100
                    )}%`
                  }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
