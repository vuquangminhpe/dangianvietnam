import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllUsers,
  promoteUserToStaff
} from '../../../../apis/admin.api';
import type {
  AdminUser,
  UsersQueryParams
} from '../../../../types/Admin.type';

import { CustomerList } from './CustomerList';
import { StaffList } from './StaffList';
import { PromoteModal } from './PromoteModal';

export const StaffManagement = () => {
  // States
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'promote' | 'staff'>('promote');
  
  // Modal states
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUser | null>(null);

  // Fetch customers (role = customer)
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: UsersQueryParams = {
        role: 'customer',
        limit: 100,
        page: 1
      };
      
      const response = await getAllUsers(params);
      if (response?.result?.users) {
        setCustomers(response.result.users);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
      toast.error('Tải danh sách khách hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff (role = staff)
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params: UsersQueryParams = {
        role: 'staff',
        limit: 100,
        page: 1
      };
      
      const response = await getAllUsers(params);
      if (response?.result?.users) {
        setStaff(response.result.users);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      setStaff([]);
      toast.error('Tải danh sách nhân viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Handle promote user to staff
  const handlePromoteUser = (customer: AdminUser) => {
    setSelectedCustomer(customer);
    setShowPromoteModal(true);
  };

  // Handle promote submission
  const handlePromoteSubmit = async (contractData: {
    position: string;
    salary: number;
    start_date: string;
    end_date: string;
    contract_type: 'full_time' | 'part_time' | 'contract';
    benefits: string[];
    terms: string;
  }) => {
    if (!selectedCustomer) return;

    try {
      await promoteUserToStaff(selectedCustomer._id, contractData);
      toast.success('Thăng chức người dùng lên nhân viên thành công!');
      setShowPromoteModal(false);
      setSelectedCustomer(null);
      
      // Refresh both lists
      fetchCustomers();
      fetchStaff();
    } catch (error) {
      console.error('Failed to promote user:', error);
      toast.error('Thăng chức người dùng lên nhân viên thất bại');
    }
  };

  // Effects
  useEffect(() => {
    fetchCustomers();
    fetchStaff();
  }, []);

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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-heading">Quản lý nhân viên</h1>
          <p className="text-gray-400 font-body">Thăng chức khách hàng lên nhân viên và quản lý hợp đồng nhân viên</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="border-b border-slate-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('promote')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors font-body ${
              activeTab === 'promote'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Thăng chức thành nhân viên
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors font-body ${
              activeTab === 'staff'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Nhân viên hiện tại ({staff.length})
          </button>
        </nav>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {activeTab === 'promote' ? (
            <CustomerList
              customers={customers}
              loading={loading}
              onPromote={handlePromoteUser}
              onRefresh={fetchCustomers}
            />
          ) : (
            <StaffList
              staff={staff}
              loading={loading}
              onRefresh={fetchStaff}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Promote Modal */}
      <AnimatePresence mode="wait">
        {showPromoteModal && selectedCustomer && (
          <PromoteModal
            customer={selectedCustomer}
            onClose={() => {
              setShowPromoteModal(false);
              setSelectedCustomer(null);
            }}
            onSubmit={handlePromoteSubmit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
