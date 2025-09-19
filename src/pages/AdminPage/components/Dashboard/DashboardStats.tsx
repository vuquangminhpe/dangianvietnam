import { motion } from 'framer-motion';
import { 
  Banknote, 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Star
} from 'lucide-react';
import type { DashboardStats } from '../../../../types/Admin.type';

interface DashboardStatsComponentProps {
  dashboardData: DashboardStats | null;
}

export const DashboardStatsComponent = ({ dashboardData }: DashboardStatsComponentProps) => {
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
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const stats = [
    {
      title: "Total Revenue",
      value: `${dashboardData?.booking_stats?.revenue?.toLocaleString() || '0'} VNĐ`,
      change: "+12.5%",
      changeType: "increase" as const,
      icon: Banknote,
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-slate-800/40 to-slate-900/60",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    {
      title: "Total Users",
      value: dashboardData?.user_stats?.total_users?.toLocaleString() || '0',
      change: "+8.2%",
      changeType: "increase" as const,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-slate-800/40 to-slate-900/60",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      title: "Total Bookings",
      value: dashboardData?.booking_stats?.total_bookings?.toLocaleString() || '0',
      change: "+15.3%",
      changeType: "increase" as const,
      icon: Calendar,
      color: "from-purple-500 to-violet-600",
      bgColor: "from-slate-800/40 to-slate-900/60",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400"
    },
    {
      title: "Active Movies",
      value: `${dashboardData?.content_stats?.total_movies?.toLocaleString() || '0'}`,
      change: "+0.2",
      changeType: "increase" as const,
      icon: Star,
      color: "from-amber-500 to-orange-600",
      bgColor: "from-slate-800/40 to-slate-900/60",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400"
    }
  ];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isIncrease = stat.changeType === 'increase';
        
        return (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02, 
              y: -4,
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            className="group relative overflow-hidden"
          >
            {/* Main Card */}
            <div className={`
              relative p-6 rounded-2xl bg-gradient-to-br ${stat.bgColor} 
              border border-slate-700/50 shadow-lg backdrop-blur-sm
              hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300
              group-hover:border-slate-600/50
            `}>
              {/* Background Gradient Overlay */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${stat.color} 
                opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl
              `} />
              
              {/* Floating Decoration */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl opacity-50" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    p-3 rounded-xl ${stat.iconBg} 
                    group-hover:scale-110 transition-transform duration-300
                    shadow-lg
                  `}>
                    <Icon size={28} className={`${stat.iconColor}`} />
                  </div>
                  
                  {/* Change Indicator */}
                  <motion.div 
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${isIncrease 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }
                    `}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                  >
                    {isIncrease ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {stat.change}
                  </motion.div>
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <motion.h3 
                    className="text-3xl font-bold text-white group-hover:text-gray-100 transition-colors"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                  >
                    {stat.value}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-sm text-gray-300 font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    {stat.title}
                  </motion.p>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity size={12} />
                    <span>Since last period</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ delay: index * 0.1 + 0.6, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
