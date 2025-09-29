/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '../../../../apis/admin.api';
import type {
  AdminUser,
  UsersQueryParams,
  UpdateUserRequest
} from '../../../../types/Admin.type';

import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { UserDetailModal, EditUserModal, DeleteConfirmModal } from './UserModals';

export const UserManagement = () => {
  // User Management States
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // User Management Functions
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params: UsersQueryParams = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        sort_by: sortBy as any,
        sort_order: sortOrder
      };
      
      const response = await getAllUsers(params);
      
      if (response?.result?.users) {
        setUsers(response.result.users);
        setTotalUsers(response.result.total);
      } else {
        console.warn('Unexpected response structure:', response);
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setTotalUsers(0);
      
      // Only show toast error for actual errors, not for empty responses
      if (error instanceof Error) {
        toast.error(`Tải người dùng thất bại: ${error.message}`);
      } else {
        toast.error('Tải người dùng thất bại');
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const userDetails = await getUserById(userId);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Tải chi tiết người dùng thất bại');
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (userId: string, userData: UpdateUserRequest) => {
    try {
      await updateUser(userId, userData);
      toast.success('Cập nhật người dùng thành công');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Cập nhật người dùng thất bại');
    }
  };

  const handleToggleUserStatus = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      const action = isCurrentlyActive ? 'ban' : 'unban';
      await toggleUserStatus(userId, action);
      toast.success(`Người dùng đã ${action === 'ban' ? 'bị chặn' : 'được bỏ chặn'} thành công`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Cập nhật trạng thái người dùng thất bại');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete._id);
      toast.success('Xóa người dùng thành công');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Xóa người dùng thất bại');
    }
  };

  const confirmDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Effect to fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, sortBy, sortOrder]);

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <UserFilters
          totalUsers={totalUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onSearch={handleSearch}
          onRefresh={fetchUsers}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <UserTable
          users={users}
          usersLoading={usersLoading}
          currentPage={currentPage}
          totalUsers={totalUsers}
          limit={limit}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onToggleUserStatus={handleToggleUserStatus}
          onDeleteUser={confirmDeleteUser}
          onPageChange={handlePageChange}
        />
      </motion.div>

      {/* Modals with AnimatePresence */}
      <AnimatePresence mode="wait">
        {showUserModal && selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSave={handleUpdateUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showDeleteModal && userToDelete && (
          <DeleteConfirmModal
            user={userToDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
            onConfirm={handleDeleteUser}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
