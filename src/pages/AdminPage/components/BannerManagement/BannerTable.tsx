import React from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import type { Banner } from '../../../../types/Banner.type';

interface BannerTableProps {
  banners: Banner[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
 
  onEdit: (banner: Banner) => void;
  onDelete: (bannerId: string) => void;
  onPreview: (banner: Banner) => void;
  onRefresh: () => void;
}

export const BannerTable: React.FC<BannerTableProps> = ({
  banners,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  sortBy,
  onSortChange,
  onEdit,
  onDelete,
  onPreview,
  onRefresh,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'home_slider':
        return 'Home Slider';
      case 'promotion':
        return 'Promotion';
      case 'announcement':
        return 'Announcement';
      case 'movie_promotion':
        return 'Movie Promotion';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'home_slider':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'promotion':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'announcement':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'movie_promotion':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPositionBadgeColor = (position: number) => {
    // Color coding for positions
    if (position === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (position <= 3) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (position <= 5) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const checkPositionConflicts = () => {
    const positionCounts = banners.reduce((acc, banner) => {
      acc[banner.position] = (acc[banner.position] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return Object.entries(positionCounts)
      .filter(([_, count]) => count > 1)
      .map(([position, count]) => ({ position: Number(position), count }));
  };

  const positionConflicts = checkPositionConflicts();

  const SortButton: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => onSortChange(field)}
      className="flex items-center gap-1 hover:text-orange-400 transition-colors duration-200"
    >
      {children}
      <ArrowUpDown
        size={14}
        className={`transition-colors duration-200 ${
          sortBy === field ? 'text-orange-400' : 'text-slate-500'
        }`}
      />
    </button>
  );

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
      >
        <div className="text-red-400 mb-4">Error loading banners</div>
        <p className="text-slate-400 mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200"
        >
          <RefreshCw size={16} />
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden"
    >
      {/* Table Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Banners ({banners.length})</h3>
          {positionConflicts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <span className="text-red-400 text-sm">⚠️</span>
              <span className="text-red-400 text-sm font-medium">
                {positionConflicts.length} Position Conflict{positionConflicts.length > 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </motion.button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/30">
            <tr>
              <th className="text-left p-4 text-slate-300 font-medium">Image</th>
              <th className="text-left p-4 text-slate-300 font-medium">
                <SortButton field="title">Title</SortButton>
              </th>
              <th className="text-left p-4 text-slate-300 font-medium">
                <SortButton field="type">Type</SortButton>
              </th>
              <th className="text-left p-4 text-slate-300 font-medium">
                <SortButton field="position">Position</SortButton>
              </th>
              <th className="text-left p-4 text-slate-300 font-medium">Status</th>
              <th className="text-left p-4 text-slate-300 font-medium">Dates</th>
              <th className="text-left p-4 text-slate-300 font-medium">
                <SortButton field="created_at">Created</SortButton>
              </th>
              <th className="text-right p-4 text-slate-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin text-orange-500 mr-2" size={20} />
                    <span className="text-slate-400">Loading banners...</span>
                  </div>
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="text-slate-400">
                    <ImageIcon className="mx-auto mb-2" size={48} />
                    <p>No banners found</p>
                  </div>
                </td>
              </tr>
            ) : (
              banners.map((banner, index) => (
                <motion.tr
                  key={banner._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200"
                >
                  {/* Image */}
                  <td className="p-4">
                    <div className="w-16 h-12 bg-slate-700 rounded-lg overflow-hidden">
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="text-slate-400" size={20} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium truncate max-w-xs">{banner.title}</p>
                      {banner.description && (
                        <p className="text-slate-400 text-sm truncate max-w-xs mt-1">
                          {banner.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(banner.type)}`}>
                      {getTypeDisplay(banner.type)}
                    </span>
                  </td>

                  {/* Position */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPositionBadgeColor(banner.position)}`}>
                        #{banner.position}
                      </span>
                      {positionConflicts.some(conflict => conflict.position === banner.position) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded border border-red-500/30"
                          title={`Duplicate position! ${positionConflicts.find(c => c.position === banner.position)?.count} banners use position ${banner.position}`}
                        >
                          ⚠️ Duplicate
                        </motion.span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <button
                      onClick={() => {}}
                      className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
                    >
                      {banner.status === 'active' ? (
                        <>
                          <ToggleRight className="text-green-400" size={20} />
                          <span className="text-green-400 text-sm">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="text-slate-500" size={20} />
                          <span className="text-slate-500 text-sm">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Dates */}
                  <td className="p-4">
                    <div className="text-sm">
                      {banner.start_date && (
                        <div className="text-slate-300">
                          Start: {formatDate(banner.start_date)}
                        </div>
                      )}
                      {banner.end_date && (
                        <div className="text-slate-300">
                          End: {formatDate(banner.end_date)}
                        </div>
                      )}
                      {!banner.start_date && !banner.end_date && (
                        <span className="text-slate-500">No dates set</span>
                      )}
                    </div>
                  </td>

                  {/* Created */}
                  <td className="p-4">
                    <span className="text-slate-300 text-sm">
                      {formatDate(banner.created_at)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onPreview(banner)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                        title="Preview Banner"
                      >
                        <Eye size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(banner)}
                        className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-500/20 rounded-lg transition-all duration-200"
                        title="Edit Banner"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(banner._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                        title="Delete Banner"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
          <div className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
