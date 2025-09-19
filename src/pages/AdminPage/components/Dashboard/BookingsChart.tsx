import { BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../../../types/Admin.type';

interface BookingsChartProps {
  dashboardData: DashboardStats | null;
}

export const BookingsChart = ({ dashboardData }: BookingsChartProps) => {
  if (!dashboardData?.charts?.bookings_per_day || dashboardData.charts.bookings_per_day.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No booking data available</p>
      </div>
    );
  }

  const maxBookings = Math.max(...dashboardData.charts.bookings_per_day.map(d => d.bookings));
  const maxRevenue = Math.max(...dashboardData.charts.bookings_per_day.map(d => d.revenue));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <motion.div
            className="p-2 rounded-lg bg-emerald-500/20 mr-3 border border-emerald-500/30"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <BarChart3 size={20} className="text-emerald-400" />
          </motion.div>
          Daily Performance
        </h3>
        <div className="flex items-center text-sm text-emerald-400">
          <TrendingUp size={14} className="mr-1" />
          <span>+12.5%</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Chart Container */}
        <div className="flex items-end justify-between h-48 px-2 mb-4 space-x-1">
          {dashboardData.charts.bookings_per_day.map((day, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center flex-1 max-w-[40px]"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-col justify-end h-40 w-full space-y-1">
                {/* Bookings Bar */}
                <motion.div
                  className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm w-full"
                  style={{
                    height: `${(day.bookings / maxBookings) * 100}px`
                  }}
                  whileHover={{ scale: 1.05 }}
                  title={`${day.bookings} bookings`}
                />
                
                {/* Revenue Bar */}
                <motion.div
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm w-full"
                  style={{
                    height: `${(day.revenue / maxRevenue) * 60}px`
                  }}
                  whileHover={{ scale: 1.05 }}
                  title={`${day.revenue.toLocaleString()} VNĐ revenue`}
                />
              </div>
              
              {/* Date Label */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-400 font-medium">
                  {new Date(day.date).toLocaleDateString('en', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
            <span className="text-gray-300 text-sm font-medium">Bookings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
            <span className="text-gray-300 text-sm font-medium">Revenue</span>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-gray-400">Total Bookings</p>
            <p className="text-lg font-bold text-emerald-400">
              {dashboardData.charts.bookings_per_day.reduce((sum, day) => sum + day.bookings, 0)}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-lg font-bold text-blue-400">
              {dashboardData.charts.bookings_per_day.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()} VNĐ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
