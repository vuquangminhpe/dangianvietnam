/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3,
  Filter,
  Download,
  Building2,
  Film,
  Users,
  DollarSign,
  Percent,
} from "lucide-react";
import {
  getRevenueStats,
  formatRevenue,
  formatRevenueShort,
  type RevenueStatsParams,
} from "../../../apis/analytics_staff.api";

const Statistics: React.FC = () => {
  const [filters, setFilters] = useState<RevenueStatsParams>({
    period: "day",
    group_by: "date",
    sort_by: "date",
    sort_order: "desc",
    limit: 20,
  });

  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  // Fetch revenue statistics
  const {
    data: revenueStats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["revenue-stats", { ...filters, ...dateRange }],
    queryFn: () => getRevenueStats({ ...filters, ...dateRange }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFilterChange = (key: keyof RevenueStatsParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (key: string, value: string) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">
            Failed to load statistics: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const summary = revenueStats?.result.summary;
  const data = revenueStats?.result.data || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Revenue Statistics
          </h1>
          <p className="text-slate-400">
            Comprehensive revenue analysis and insights
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl p-6 border border-slate-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">
            Filters & Options
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) =>
                handleDateRangeChange("start_date", e.target.value)
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                handleDateRangeChange("end_date", e.target.value)
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Period
            </label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange("period", e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Group By
            </label>
            <select
              value={filters.group_by}
              onChange={(e) => handleFilterChange("group_by", e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="date">Date</option>
              <option value="theater">Theater</option>
              <option value="movie">Movie</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                Total Revenue
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {formatRevenueShort(summary.total_revenue)}
              </p>
              <p className="text-green-400 text-sm">
                Avg: {formatRevenueShort(summary.average_revenue_per_period)}/
                {filters.period}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                Total Bookings
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {summary.total_bookings.toLocaleString()}
              </p>
              <p className="text-blue-400 text-sm">
                {summary.total_tickets_sold.toLocaleString()} tickets sold
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Percent className="h-8 w-8 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">
                Occupancy Rate
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {summary.average_occupancy_rate.toFixed(1)}%
              </p>
              <p className="text-purple-400 text-sm">
                Average across all shows
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">
                Performance
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">
                {summary.theaters_count} Theaters
              </p>
              <p className="text-orange-400 text-sm">
                {summary.movies_count} Movies
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Performers */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Top Performing Theater
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Theater Name</p>
                <p className="text-white font-medium">
                  {summary.top_performing_theater.theater_name}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Revenue</p>
                <p className="text-green-400 font-bold text-xl">
                  {formatRevenue(summary.top_performing_theater.revenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Film className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                Top Performing Movie
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Movie Title</p>
                <p className="text-white font-medium">
                  {summary.top_performing_movie.movie_title}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Revenue</p>
                <p className="text-green-400 font-bold text-xl">
                  {formatRevenue(summary.top_performing_movie.revenue)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Revenue Data</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {filters.group_by === "theater"
                    ? "Theater"
                    : filters.group_by === "movie"
                    ? "Movie"
                    : "Date"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Avg Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">
                      {filters.group_by === "theater" && item.theater_info
                        ? item.theater_info.theater_name
                        : filters.group_by === "movie" && item.movie_info
                        ? item.movie_info.movie_title
                        : item.date}
                    </div>
                    {filters.group_by === "theater" && item.theater_info && (
                      <div className="text-slate-400 text-sm">
                        {item.theater_info.theater_location}
                      </div>
                    )}
                    {filters.group_by === "movie" && item.movie_info && (
                      <div className="text-slate-400 text-sm">
                        {item.movie_info.movie_genre.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-400 font-semibold">
                      {formatRevenue(item.revenue)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {item.bookings_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {item.tickets_sold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-slate-600 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${Math.min(item.occupancy_rate, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">
                        {item.occupancy_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatRevenue(item.average_booking_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Statistics;
