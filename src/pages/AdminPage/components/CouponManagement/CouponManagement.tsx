import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  // bulkUpdateCouponStatus // TODO: Enable when server API is implemented
} from "../../../../apis/coupon.api";
import type {
  CouponsQueryParams,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "../../../../types/Coupon.type";

import { CouponFilters } from "./CouponFilters";
import { CouponTable } from "./CouponTable";
import {
  CouponDetailModal,
  CreateCouponModal,
  EditCouponModal,
  DeleteConfirmModal,
} from "./CouponModals";

export const CouponManagement = () => {
  // Coupon Management States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  // Modal states
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<any | null>(null);

  // Bulk operations
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Coupon Management Functions
  const fetchCoupons = async () => {
    try {
      setCouponsLoading(true);
      const params: CouponsQueryParams = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        status: (statusFilter as any) || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        active_only: activeOnly,
      };

      const response = await getAllCoupons(params);

      if (response?.result?.coupons) {
        setCoupons(response.result.coupons);
        setTotalCoupons(response.result.total);
      } else {
        console.warn("Unexpected response structure:", response);
        setCoupons([]);
        setTotalCoupons(0);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      setCoupons([]);
      setTotalCoupons(0);

      if (error instanceof Error) {
        toast.error(`Failed to load coupons: ${error.message}`);
      } else {
        toast.error("Failed to load coupons");
      }
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleViewCoupon = async (couponId: string) => {
    try {
      const couponDetails = await getCouponById(couponId);
      setSelectedCoupon(couponDetails.result);
      setShowCouponModal(true);
    } catch (error) {
      console.error("Failed to fetch coupon details:", error);
      toast.error("Failed to load coupon details");
    }
  };

  const handleCreateCoupon = async (couponData: CreateCouponRequest) => {
    try {
      await createCoupon(couponData);
      toast.success("Coupon created successfully");
      setShowCreateModal(false);
      fetchCoupons();
    } catch (error) {
      console.error("Failed to create coupon:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create coupon: ${error.message}`);
      } else {
        toast.error("Failed to create coupon");
      }
    }
  };

  const handleEditCoupon = (coupon: any) => {
    setSelectedCoupon(coupon);
    setShowEditModal(true);
  };

  const handleUpdateCoupon = async (
    couponId: string,
    couponData: UpdateCouponRequest
  ) => {
    try {
      await updateCoupon(couponId, couponData);
      toast.success("Coupon updated successfully");
      setShowEditModal(false);
      fetchCoupons();
    } catch (error) {
      console.error("Failed to update coupon:", error);
      if (error instanceof Error) {
        toast.error(`Failed to update coupon: ${error.message}`);
      } else {
        toast.error("Failed to update coupon");
      }
    }
  };

  const handleDeleteCoupon = (coupon: any) => {
    setCouponToDelete(coupon);
    setShowDeleteModal(true);
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      await deleteCoupon(couponToDelete._id);
      toast.success("Coupon deleted successfully");
      setShowDeleteModal(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      if (error instanceof Error) {
        toast.error(`Failed to delete coupon: ${error.message}`);
      } else {
        toast.error("Failed to delete coupon");
      }
    }
  };

  // Bulk operations
  const handleBulkStatusUpdate = async (status: "active" | "inactive") => {
    if (selectedCoupons.length === 0) {
      toast.warning("Please select coupons to update");
      return;
    }

    try {
      setBulkLoading(true);

      // Temporary solution: Update each coupon individually
      // TODO: Implement proper bulk update API on server
      const updatePromises = selectedCoupons.map(async (couponId) => {
        const coupon = coupons.find((c) => c._id === couponId);
        if (coupon) {
          return await updateCoupon(couponId, { ...coupon, status });
        }
      });

      await Promise.all(updatePromises);
      toast.success(`${selectedCoupons.length} coupons updated successfully`);
      setSelectedCoupons([]);
      fetchCoupons();
    } catch (error) {
      console.error("Failed to bulk update coupons:", error);
      if (error instanceof Error) {
        toast.error(`Failed to update coupons: ${error.message}`);
      } else {
        toast.error("Failed to update coupons");
      }
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSelectCoupon = (couponId: string) => {
    setSelectedCoupons((prev) =>
      prev.includes(couponId)
        ? prev.filter((id) => id !== couponId)
        : [...prev, couponId]
    );
  };

  const handleSelectAllCoupons = () => {
    if (selectedCoupons.length === coupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(coupons.map((coupon) => coupon._id));
    }
  };

  // Effects
  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder, activeOnly]);

  // Pagination
  const totalPages = Math.ceil(totalCoupons / limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Coupon Management</h1>
          <p className="text-gray-300 mt-1">
            Manage discount coupons and promotional codes
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg"
        >
          Create New Coupon
        </motion.button>
      </div>

      {/* Filters */}
      <CouponFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        activeOnly={activeOnly}
        onActiveOnlyChange={setActiveOnly}
        selectedCount={selectedCoupons.length}
        onBulkActivate={() => handleBulkStatusUpdate("active")}
        onBulkDeactivate={() => handleBulkStatusUpdate("inactive")}
        bulkLoading={bulkLoading}
      />

      {/* Coupon Table */}
      <CouponTable
        coupons={coupons}
        loading={couponsLoading}
        selectedCoupons={selectedCoupons}
        onSelectCoupon={handleSelectCoupon}
        onSelectAll={handleSelectAllCoupons}
        onViewCoupon={handleViewCoupon}
        onEditCoupon={handleEditCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCoupons={totalCoupons}
      />

      {/* Modals */}
      <AnimatePresence>
        {showCouponModal && selectedCoupon && (
          <CouponDetailModal
            coupon={selectedCoupon}
            isOpen={showCouponModal}
            onClose={() => {
              setShowCouponModal(false);
              setSelectedCoupon(null);
            }}
          />
        )}

        {showCreateModal && (
          <CreateCouponModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCoupon}
          />
        )}

        {showEditModal && selectedCoupon && (
          <EditCouponModal
            coupon={selectedCoupon}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCoupon(null);
            }}
            onSubmit={(data: UpdateCouponRequest) =>
              handleUpdateCoupon(selectedCoupon._id, data)
            }
          />
        )}

        {showDeleteModal && couponToDelete && (
          <DeleteConfirmModal
            coupon={couponToDelete}
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setCouponToDelete(null);
            }}
            onConfirm={confirmDeleteCoupon}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
