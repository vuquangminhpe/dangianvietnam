import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllContracts,
  getContractById,
  updateContract,
  activateContract,
  terminateContract,
  checkExpiredContracts
} from '../../../../apis/admin.api';

import { ContractFilters } from './ContractFilters';
import { ContractTable } from './ContractTable';
import { ContractDetailModal, EditContractModal, TerminateContractModal } from './ContractModals';

type Contract = {
  _id: string;
  staff_id: string;
  admin_id: string;
  contract_number: string;
  staff_name: string | null;
  staff_email: string | null;
  staff_phone: string | null;
  theater_name: string | null;
  theater_location: string | null;
  salary: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'terminated' | 'expired';
  terms: string;
  responsibilities: string[];
  benefits: string[];
  contract_file_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
  staff: {
    _id: string;
    email: string;
    name: string;
    avatar: string;
    phone?: string;
  };
  admin: {
    _id: string;
    email: string;
    name: string;
  };
};

export const ContractManagement = () => {
  // Contract Management States
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [totalContracts, setTotalContracts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [contractToTerminate, setContractToTerminate] = useState<Contract | null>(null);

  // Contract Management Functions
  const fetchContracts = async () => {
    try {
      setContractsLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      const response = await getAllContracts(params);
      
      if (response?.result?.contracts) {
        setContracts(response.result.contracts);
        setTotalContracts(response.result.total);
      } else {
        setContracts([]);
        setTotalContracts(0);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      setContracts([]);
      setTotalContracts(0);
      
      if (error instanceof Error) {
        toast.error(`Failed to load contracts: ${error.message}`);
      } else {
        toast.error('Failed to load contracts');
      }
    } finally {
      setContractsLoading(false);
    }
  };

  const handleViewContract = async (contractId: string) => {
    try {
      const contractDetails = await getContractById(contractId);
      setSelectedContract(contractDetails.result);
      setShowContractModal(true);
    } catch (error) {
      console.error('Failed to fetch contract details:', error);
      toast.error('Failed to load contract details');
    }
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowEditModal(true);
  };

  const handleUpdateContract = async (contractId: string, contractData: {
    position?: string;
    salary?: number;
    contract_type?: 'full_time' | 'part_time' | 'contract';
    start_date?: string;
    end_date?: string;
    benefits?: string[];
    terms?: string;
  }) => {
    try {
      await updateContract(contractId, contractData);
      toast.success('Contract updated successfully');
      setShowEditModal(false);
      fetchContracts();
    } catch (error) {
      console.error('Failed to update contract:', error);
      toast.error('Failed to update contract');
    }
  };

  const handleActivateContract = async (contractId: string) => {
    try {
      await activateContract(contractId);
      toast.success('Contract activated successfully');
      fetchContracts();
    } catch (error) {
      console.error('Failed to activate contract:', error);
      toast.error('Failed to activate contract');
    }
  };

  const handleTerminateContract = async (reason: string) => {
    if (!contractToTerminate) return;
    
    try {
      await terminateContract(contractToTerminate._id, reason);
      toast.success('Contract terminated successfully');
      setShowTerminateModal(false);
      setContractToTerminate(null);
      fetchContracts();
    } catch (error) {
      console.error('Failed to terminate contract:', error);
      toast.error('Failed to terminate contract');
    }
  };

  const confirmTerminateContract = (contract: Contract) => {
    setContractToTerminate(contract);
    setShowTerminateModal(true);
  };

  const handleCheckExpiredContracts = async () => {
    try {
      const response = await checkExpiredContracts();
      toast.success(`Checked expired contracts. Found ${response.result.expired_count} expired contracts.`);
      fetchContracts();
    } catch (error) {
      console.error('Failed to check expired contracts:', error);
      toast.error('Failed to check expired contracts');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContracts();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Effect to fetch contracts when dependencies change
  useEffect(() => {
    fetchContracts();
  }, [currentPage, sortBy, sortOrder]);

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
        <ContractFilters
          totalContracts={totalContracts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onSearch={handleSearch}
          onRefresh={fetchContracts}
          onCheckExpired={handleCheckExpiredContracts}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ContractTable
          contracts={contracts}
          contractsLoading={contractsLoading}
          currentPage={currentPage}
          totalContracts={totalContracts}
          limit={limit}
          onViewContract={handleViewContract}
          onEditContract={handleEditContract}
          onActivateContract={handleActivateContract}
          onTerminateContract={confirmTerminateContract}
          onPageChange={handlePageChange}
        />
      </motion.div>

      {/* Modals with AnimatePresence */}
      <AnimatePresence mode="wait">
        {showContractModal && selectedContract && (
          <ContractDetailModal
            contract={selectedContract}
            onClose={() => {
              setShowContractModal(false);
              setSelectedContract(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showEditModal && selectedContract && (
          <EditContractModal
            contract={selectedContract}
            onClose={() => {
              setShowEditModal(false);
              setSelectedContract(null);
            }}
            onSave={handleUpdateContract}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showTerminateModal && contractToTerminate && (
          <TerminateContractModal
            contract={contractToTerminate}
            onClose={() => {
              setShowTerminateModal(false);
              setContractToTerminate(null);
            }}
            onConfirm={handleTerminateContract}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
