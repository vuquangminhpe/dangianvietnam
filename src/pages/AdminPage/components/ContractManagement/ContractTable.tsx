import { Loader2, Eye, Edit, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface ContractTableProps {
  contracts: Contract[];
  contractsLoading: boolean;
  currentPage: number;
  totalContracts: number;
  limit: number;
  onViewContract: (contractId: string) => void;
  onEditContract: (contract: Contract) => void;
  onActivateContract: (contractId: string) => void;
  onTerminateContract: (contract: Contract) => void;
  onPageChange: (page: number) => void;
}

export const ContractTable = ({
  contracts,
  contractsLoading,
  currentPage,
  totalContracts,
  limit,
  onViewContract,
  onEditContract,
  onActivateContract,
  onTerminateContract,
  onPageChange
}: ContractTableProps) => {
  const totalPages = Math.ceil(totalContracts / limit);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'terminated':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (contractsLoading) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={32} className="text-teal-400" />
          </motion.div>
          <motion.span 
            className="ml-3 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading contracts...
          </motion.span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <motion.thead 
            className="bg-gradient-to-r from-slate-700/80 to-slate-800/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contract</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Staff</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Salary</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </motion.thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {contracts.map((contract, index) => (
                <motion.tr 
                  key={contract._id} 
                  className="hover:bg-slate-800/30 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{contract.contract_number}</div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(contract.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-teal-400 to-green-500 flex items-center justify-center text-white font-semibold">
                        {contract.staff.avatar ? (
                          <img 
                            src={contract.staff.avatar} 
                            alt={contract.staff.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{contract.staff.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{contract.staff.name}</div>
                        <div className="text-sm text-gray-400">{contract.staff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {formatSalary(contract.salary)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      <div>{new Date(contract.start_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">
                        to {new Date(contract.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => onViewContract(contract._id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-lg hover:bg-blue-500/10"
                        title="View Details"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye size={16} />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => onEditContract(contract)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-yellow-500/10"
                        title="Edit Contract"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit size={16} />
                      </motion.button>
                      
                      {contract.status === 'draft' && (
                        <motion.button
                          onClick={() => onActivateContract(contract._id)}
                          className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-lg hover:bg-green-500/10"
                          title="Activate Contract"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play size={16} />
                        </motion.button>
                      )}
                      
                      {contract.status === 'active' && (
                        <motion.button
                          onClick={() => onTerminateContract(contract)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                          title="Terminate Contract"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={16} />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          className="px-6 py-4 bg-slate-700/50 border-t border-slate-600/50 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalContracts)} of {totalContracts} contracts
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg bg-slate-600/50 text-gray-400 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={16} />
            </motion.button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                  page === currentPage
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-600/50 text-gray-400 hover:bg-slate-600 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {page}
              </motion.button>
            ))}
            
            <motion.button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg bg-slate-600/50 text-gray-400 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
