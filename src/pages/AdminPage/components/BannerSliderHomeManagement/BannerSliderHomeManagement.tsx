/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Plus,
  ToggleRight,
  Calendar,
  Play,
  AlertCircle,
  RefreshCw,
  Settings
} from "lucide-react";

// Import APIs and types
import {
  getAllBannerSliderHomeAdmin,
  deleteBannerSliderHome,
  manualActivateBannerSliderHome,
  getBannerSliderHomeStatus,
  type BannerSliderHome,
  type BannerSliderHomeQueryParams,
  type GetBannerSliderHomeResponse,
} from "../../../../apis/bannerSliderHome.api";

// Import components (will create these)
import { BannerSliderHomeTable } from "./BannerSliderHomeTable";
import { BannerSliderHomeFilters } from "./BannerSliderHomeFilters";
import {
  CreateBannerSliderHomeModal,
  EditBannerSliderHomeModal,
  PreviewBannerSliderHomeModal,
  DeleteBannerSliderHomeModal,
} from "./BannerSliderHomeModals";

export const BannerSliderHomeManagement: React.FC = () => {
  // State management
  const [banners, setBanners] = useState<BannerSliderHome[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<BannerSliderHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<BannerSliderHome | null>(null);

  // Pagination & filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);
  const [itemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [autoActiveFilter, setAutoActiveFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerSliderHome | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Admin operations
  const [isActivating, setIsActivating] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: BannerSliderHomeQueryParams = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Add filters if they exist
      if (activeFilter !== "") params.active_only = activeFilter;

      const response: GetBannerSliderHomeResponse = await getAllBannerSliderHomeAdmin(params);

      setBanners(response.result.banners);
      setTotalPages(response.result.total_pages);
      setTotalBanners(response.result.total);
    } catch (err) {
      console.error("Error fetching banner slider home:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  // Fetch scheduler status
  const fetchSchedulerStatus = async () => {
    try {
      setStatusLoading(true);
      const status = await getBannerSliderHomeStatus();
      setSchedulerStatus(status.data);
    } catch (err) {
      console.error("Error fetching scheduler status:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Filter banners based on search term and auto_active
  useEffect(() => {
    let filtered = banners;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (banner) =>
          banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          banner.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (banner.topic && banner.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
          banner.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Auto-active filter
    if (autoActiveFilter !== "") {
      const isAutoActive = autoActiveFilter === "true";
      filtered = filtered.filter((banner) => banner.auto_active === isAutoActive);
    }

    setFilteredBanners(filtered);
  }, [banners, searchTerm, autoActiveFilter]);

  // Fetch banners on component mount and filter changes
  useEffect(() => {
    fetchBanners();
  }, [currentPage, activeFilter, sortBy, sortOrder]);

  // Fetch scheduler status on mount
  useEffect(() => {
    fetchSchedulerStatus();
  }, []);

  // Handle banner deletion
  const handleDeleteBanner = (bannerId: string) => {
    const banner = banners.find((b) => b._id === bannerId);
    if (banner) {
      setBannerToDelete(banner);
      setShowDeleteModal(true);
    }
  };

  // Confirm banner deletion
  const confirmDeleteBanner = async () => {
    if (!bannerToDelete) return;

    try {
      setIsDeleting(true);
      await deleteBannerSliderHome(bannerToDelete._id);
      setShowDeleteModal(false);
      setBannerToDelete(null);
      fetchBanners(); // Refresh data
    } catch (err) {
      console.error("Error deleting banner slider home:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
  };

  // Handle manual activation
  const handleManualActivation = async () => {
    try {
      setIsActivating(true);
      const result = await manualActivateBannerSliderHome();

      // Show success message or handle result
      console.log("Manual activation result:", result);

      // Refresh banners and status
      fetchBanners();
      fetchSchedulerStatus();
    } catch (err) {
      console.error("Error during manual activation:", err);
      setError(err instanceof Error ? err.message : "Manual activation failed");
    } finally {
      setIsActivating(false);
    }
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setActiveFilter("");
    setAutoActiveFilter("");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Handle modal actions
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (banner: BannerSliderHome) => {
    setSelectedBanner(banner);
    setShowEditModal(true);
  };

  const handlePreview = (banner: BannerSliderHome) => {
    setSelectedBanner(banner);
    setShowPreviewModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowPreviewModal(false);
    setSelectedBanner(null);
  };

  const handleModalSuccess = () => {
    fetchBanners(); // Refresh data after create/edit
    handleCloseModals();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Banner Slider Home Management
          </h1>
          <p className="text-slate-400">
            Manage home page slider banners with auto-activation scheduling
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleManualActivation}
            disabled={isActivating}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50"
          >
            {isActivating ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            Manual Activate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
          >
            <Plus size={20} />
            Create Banner
          </motion.button>
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-slate-400" />
            <span className="text-white font-medium">Auto-Activation System</span>
          </div>
          <div className="flex items-center gap-4">
            {statusLoading ? (
              <RefreshCw size={16} className="animate-spin text-slate-400" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    schedulerStatus?.is_running ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-slate-300">
                    {schedulerStatus?.is_running ? 'Running' : 'Stopped'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    schedulerStatus?.socket_connected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-slate-300">
                    Socket {schedulerStatus?.socket_connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <button
                  onClick={fetchSchedulerStatus}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </>
            )}
          </div>
        </div>
        {schedulerStatus?.next_check && (
          <p className="text-sm text-slate-400 mt-2">
            {schedulerStatus.next_check}
          </p>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Banners",
            value: totalBanners,
            icon: Image,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Active Banners",
            value: banners.filter((b) => b.active).length,
            icon: ToggleRight,
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Auto-Active Enabled",
            value: banners.filter((b) => b.auto_active).length,
            icon: Calendar,
            color: "from-orange-500 to-amber-500",
          },
          {
            label: "Scheduled",
            value: banners.filter((b) => b.auto_active && !b.active && b.time_active).length,
            icon: AlertCircle,
            color: "from-purple-500 to-pink-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-red-400">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <BannerSliderHomeFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        autoActiveFilter={autoActiveFilter}
        onAutoActiveFilterChange={setAutoActiveFilter}
        onResetFilters={resetFilters}
      />

      {/* Banner Table */}
      <BannerSliderHomeTable
        banners={filteredBanners}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onEdit={handleEdit}
        onDelete={handleDeleteBanner}
        onPreview={handlePreview}
        onRefresh={fetchBanners}
      />

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateBannerSliderHomeModal
            isOpen={showCreateModal}
            onClose={handleCloseModals}
            onSuccess={handleModalSuccess}
          />
        )}

        {showEditModal && selectedBanner && (
          <EditBannerSliderHomeModal
            isOpen={showEditModal}
            banner={selectedBanner}
            onClose={handleCloseModals}
            onSuccess={handleModalSuccess}
          />
        )}

        {showPreviewModal && selectedBanner && (
          <PreviewBannerSliderHomeModal
            isOpen={showPreviewModal}
            banner={selectedBanner}
            onClose={handleCloseModals}
          />
        )}

        {showDeleteModal && bannerToDelete && (
          <DeleteBannerSliderHomeModal
            isOpen={showDeleteModal}
            banner={bannerToDelete}
            onClose={closeDeleteModal}
            onConfirm={confirmDeleteBanner}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};