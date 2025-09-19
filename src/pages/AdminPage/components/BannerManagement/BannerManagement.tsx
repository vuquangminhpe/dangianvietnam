/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Plus, ToggleRight, Calendar, ExternalLink } from "lucide-react";

// Import APIs and types
import {
  getAllBannersAdmin,
  deleteBanner,
} from "../../../../apis/banner.api";

import type {
  Banner,
  BannerQueryParams,
  GetBannersResponse,
} from "../../../../types/Banner.type";

// Import components (will create these)
import { BannerTable } from "./BannerTable";
import { BannerFilters } from "./BannerFilters";
import {
  CreateBannerModal,
  EditBannerModal,
  PreviewBannerModal,
  DeleteBannerModal,
} from "./BannerModals";

export const BannerManagement: React.FC = () => {
  // State management
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Pagination & filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);
  const [itemsPerPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: BannerQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy as any,
        sortOrder,
      };

      // Add filters if they exist
      if (typeFilter) params.type = typeFilter as any;
      if (statusFilter !== "") params.is_active = statusFilter === "true";

      const response: GetBannersResponse = await getAllBannersAdmin(params);

      setBanners(response.result.banners);
      if (response.result.pagination) {
        setTotalPages(response.result.pagination.totalPages);
        setTotalBanners(response.result.pagination.totalBanners);
      } else {
        setTotalPages(1);
        setTotalBanners(response.result.banners.length);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  // Filter banners based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBanners(banners);
      return;
    }

    const filtered = banners.filter(
      (banner) =>
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (banner.description &&
          banner.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        banner.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredBanners(filtered);
  }, [banners, searchTerm]);

  // Fetch banners on component mount and filter changes
  useEffect(() => {
    fetchBanners();
  }, [currentPage, typeFilter, statusFilter, sortBy, sortOrder]);



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
      await deleteBanner(bannerToDelete._id);
      setShowDeleteModal(false);
      setBannerToDelete(null);
      fetchBanners(); // Refresh data
    } catch (err) {
      console.error("Error deleting banner:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
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
    setTypeFilter("");
    setStatusFilter("");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Handle modal actions
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setShowEditModal(true);
  };

  const handlePreview = (banner: Banner) => {
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
            Banner Management
          </h1>
          <p className="text-slate-400">
            Manage website banners, promotions, and announcements
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
        >
          <Plus size={20} />
          Create Banner
        </motion.button>
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
            value: banners.filter((b) => b.is_active).length,
            icon: ToggleRight,
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Home Sliders",
            value: banners.filter((b) => b.type === "home_slider").length,
            icon: Calendar,
            color: "from-orange-500 to-amber-500",
          },
          {
            label: "Promotions",
            value: banners.filter((b) => b.type === "promotion").length,
            icon: ExternalLink,
            color: "from-purple-500 to-pink-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
      {/* Filters */}
      <BannerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onResetFilters={resetFilters}
      />
      {/* Banner Table */}{" "}
      <BannerTable
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
          <CreateBannerModal
            isOpen={showCreateModal}
            onClose={handleCloseModals}
            onSuccess={handleModalSuccess}
          />
        )}

        {showEditModal && selectedBanner && (
          <EditBannerModal
            isOpen={showEditModal}
            banner={selectedBanner}
            onClose={handleCloseModals}
            onSuccess={handleModalSuccess}
          />
        )}

        {showPreviewModal && selectedBanner && (
          <PreviewBannerModal
            isOpen={showPreviewModal}
            banner={selectedBanner}
            onClose={handleCloseModals}
          />
        )}

        {showDeleteModal && bannerToDelete && (
          <DeleteBannerModal
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
