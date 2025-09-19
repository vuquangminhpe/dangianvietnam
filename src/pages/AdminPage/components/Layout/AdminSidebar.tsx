import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Film,
  BarChart3,
  Settings,
  ChevronRight,
  FileText,
  CreditCard,
  ScanLine,
  Image,
  Tag,
} from "lucide-react";
import { getDashboardStats, getPaymentStats } from "../../../../apis/admin.api";
import { useQuery } from "@tanstack/react-query";
import type {
  DashboardQueryParams,
  PaymentStatsQueryParams,
} from "../../../../types";
import { useState } from "react";
import { BiSolidUserAccount } from "react-icons/bi";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
}

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  isCollapsed,
}: AdminSidebarProps) => {
  const [statsFilter] = useState<PaymentStatsQueryParams["period"]>("month");

  const [selectedPeriod] = useState<DashboardQueryParams["period"]>("month");
  const { data: dataDashboard } = useQuery({
    queryKey: ["admin-dashboard-stats", selectedPeriod],
    queryFn: () => getDashboardStats({ period: selectedPeriod }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const { data: statsData } = useQuery({
    queryKey: ["admin-payment-stats", statsFilter],
    queryFn: () => getPaymentStats({ period: statsFilter }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      count: null,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      count: dataDashboard?.user_stats?.total_users || "0",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "staff",
      label: "Staff Management",
      icon: Users,
      count: dataDashboard?.hr_stats?.total_staff || 0,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "contracts",
      label: "Manager Contracts",
      icon: FileText,
      count: dataDashboard?.hr_stats?.total_contracts || 0,
      color: "from-teal-500 to-green-500",
    },
    {
      id: "banners",
      label: "Banner Management",
      icon: Image,
      count: null,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "coupons",
      label: "Coupon Management",
      icon: Tag,
      count: null,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "payments",
      label: "Payment Management",
      icon: CreditCard,
      count: statsData?.result.overview.total_payments.toLocaleString() || 0,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "ticket-verification",
      label: "Ticket Verification",
      icon: ScanLine,
      count: null,
      color: "from-cyan-500 to-blue-500",
    },
   
    {
      id: "add-concierge-qr",
      label: "Add Concierge QR",
      icon: BiSolidUserAccount,
      count: null,
      color: "from-gray-500 to-slate-500",
    },
  ];

  const bottomMenuItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "from-gray-500 to-slate-500",
    },
  ];

  // Animation variants
  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.2,
      },
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.div
      className="relative h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl flex flex-col"
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial="expanded"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 via-purple-900/20 to-slate-900/50" />

      {/* Logo Section */}
      <motion.div className="relative p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Film size={24} className="text-white" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Cinema Admin
                </h1>
                <p className="text-xs text-gray-400">Management Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        <motion.nav className="space-y-2" initial="hidden" animate="visible">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                custom={index}
                variants={itemVariants}
                onClick={() => onTabChange(item.id)}
                className={`
                  group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                  transition-all duration-300 text-left
                  ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 shadow-lg"
                      : "hover:bg-slate-800/50 hover:border-slate-600/50 border border-transparent"
                  }
                `}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`
                  relative z-10 p-2 rounded-lg transition-all duration-300
                  ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} shadow-lg`
                      : "bg-slate-800/50 group-hover:bg-slate-700/50"
                  }
                `}
                >
                  <Icon
                    size={20}
                    className={`
                      transition-colors duration-300
                      ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-300"
                      }
                    `}
                  />
                </div>

                {/* Label and Count */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      className="flex-1 flex items-center justify-between"
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <span
                        className={`
                        font-medium transition-colors duration-300
                        ${
                          isActive
                            ? "text-white"
                            : "text-gray-300 group-hover:text-white"
                        }
                      `}
                      >
                        {item.label}
                      </span>

                      {item.count && (
                        <motion.span
                          className={`
                            px-2 py-1 text-xs rounded-full font-medium transition-all duration-300
                            ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-700/50 text-gray-400 group-hover:bg-slate-600/50 group-hover:text-gray-300"
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                        >
                          {item.count.toLocaleString()}
                        </motion.span>
                      )}

                      {/* Arrow indicator */}
                      <ChevronRight
                        size={16}
                        className={`
                          transition-all duration-300 ml-2
                          ${
                            isActive
                              ? "text-white opacity-100"
                              : "text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-gray-300"
                          }
                        `}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.nav>
      </div>

      {/* Bottom Menu */}
      <div className="p-3 border-t border-slate-700/50">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                group w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                transition-all duration-300 text-left
                ${
                  isActive
                    ? "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border border-gray-500/30"
                    : "hover:bg-slate-800/50 border border-transparent"
                }
              `}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <div
                className={`
                p-2 rounded-lg transition-all duration-300
                ${
                  isActive
                    ? `bg-gradient-to-r ${item.color}`
                    : "bg-slate-800/50 group-hover:bg-slate-700/50"
                }
              `}
              >
                <Icon
                  size={20}
                  className={`
                    transition-colors duration-300
                    ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-300"
                    }
                  `}
                />
              </div>

              {/* Label */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    className={`
                      font-medium transition-colors duration-300
                      ${
                        isActive
                          ? "text-white"
                          : "text-gray-300 group-hover:text-white"
                      }
                    `}
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Decoration */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="p-4"
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Pro Features</p>
                  <p className="text-xs text-gray-400">Advanced Analytics</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
