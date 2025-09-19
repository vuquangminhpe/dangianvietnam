import { Film } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../../../types/Admin.type';

interface TopMoviesProps {
  dashboardData: DashboardStats | null;
}

export const TopMovies = ({ dashboardData }: TopMoviesProps) => {
  if (!dashboardData?.top_performers?.top_movies || dashboardData.top_performers.top_movies.length === 0) {
    return (
      <div className="text-center py-8">
        <Film size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No movie data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <motion.div
            className="p-2 rounded-lg bg-purple-500/20 mr-3 border border-purple-500/30"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Film size={20} className="text-purple-400" />
          </motion.div>
          Top Movies
        </h3>
        <span className="text-sm text-gray-400">This month</span>
      </div>
      
      <div className="space-y-3">
        {dashboardData.top_performers.top_movies.slice(0, 5).map((movie, index) => (
          <motion.div
            key={movie._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            className="p-3 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={movie.poster_url} 
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-movie.png';
                  }}
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{movie.title}</h4>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-400">{movie.bookings_count} bookings</span>
                  <span className="text-sm font-medium text-green-400">{movie.revenue.toLocaleString()} VNĐ</span>
                </div>
                
                <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(
                        (movie.bookings_count / Math.max(...dashboardData.top_performers.top_movies.map(m => m.bookings_count))) * 100, 
                        100
                      )}%`
                    }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
