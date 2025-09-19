import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, User, Calendar, DollarSign, AlertTriangle, Plus, Gift, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

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

interface ContractDetailModalProps {
  contract: Contract;
  onClose: () => void;
}

interface EditContractModalProps {
  contract: Contract;
  onClose: () => void;
  onSave: (contractId: string, data: {
    position?: string;
    salary?: number;
    contract_type?: 'full_time' | 'part_time' | 'contract';
    start_date?: string;
    end_date?: string;
    benefits?: string[];
    terms?: string;
  }) => void;
}

interface TerminateContractModalProps {
  contract: Contract;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const ContractDetailModal = ({ contract, onClose }: ContractDetailModalProps) => {
  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'terminated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Contract Details</h2>
                <p className="text-gray-400">{contract.contract_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(contract.status)}`}>
              {contract.status}
            </span>
          </div>

          {/* Staff Information */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Staff Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <p className="text-white">{contract.staff.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white">{contract.staff.email}</p>
              </div>
              {contract.staff.phone && (
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white">{contract.staff.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contract Information */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Contract Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Start Date</label>
                <p className="text-white">{new Date(contract.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">End Date</label>
                <p className="text-white">{new Date(contract.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Salary</label>
                <p className="text-white font-semibold">{formatSalary(contract.salary)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Created</label>
                <p className="text-white">{new Date(contract.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          {contract.benefits && contract.benefits.length > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Benefits
              </h3>
              <div className="flex flex-wrap gap-2">
                {contract.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm border border-teal-500/30"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Terms */}
          {contract.terms && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Terms & Conditions</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{contract.terms}</p>
            </div>
          )}

          {/* Admin Information */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Created By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {contract.admin.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{contract.admin.name}</p>
                <p className="text-gray-400 text-sm">{contract.admin.email}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const EditContractModal = ({ contract, onClose, onSave }: EditContractModalProps) => {
  const [formData, setFormData] = useState({
    position: '',
    customPosition: '',
    salary: contract.salary,
    contract_type: 'full_time' as 'full_time' | 'part_time' | 'contract',
    start_date: contract.start_date.split('T')[0],
    end_date: contract.end_date.split('T')[0],
    benefits: contract.benefits || [],
    terms: contract.terms
  });

  const [benefitInput, setBenefitInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Predefined options
  const positionOptions = [
    'Theater Manager',
    'Assistant Manager', 
    'Customer Service Representative',
    'Concession Staff',
    'Ticket Sales Associate',
    'Maintenance Technician',
    'Security Guard',
    'Cleaning Staff',
    'Projectionist',
    'Marketing Coordinator',
    'Other (Custom)'
  ];

  const commonBenefits = [
    'Health Insurance',
    'Dental Insurance',
    'Life Insurance',
    'Paid Time Off',
    'Sick Leave',
    'Retirement Plan',
    'Employee Discounts',
    'Training & Development',
    'Flexible Schedule',
    'Performance Bonuses'
  ];

  const commonTerms = [
    'Standard employment terms and conditions apply.',
    'Employee must maintain professional conduct at all times.',
    'Regular performance evaluations will be conducted.',
    'Confidentiality agreement must be signed.',
    'Probationary period of 90 days applies.',
    'Notice period of 30 days required for resignation.',
    'Overtime compensation as per labor laws.',
    'Employee handbook policies apply.',
    'Background check required.',
    'Drug testing may be required.'
  ];

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Position validation
    const finalPosition = formData.position === 'Other (Custom)' ? formData.customPosition : formData.position;
    if (!finalPosition.trim()) {
      newErrors.position = 'Position is required';
    }

    // Salary validation
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary = 'Salary must be greater than 0';
    } else if (formData.salary < 100000) {
      newErrors.salary = 'Salary should be at least 100,000 VNĐ';
    }

    // Date validations
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (endDate <= startDate) {
      newErrors.end_date = 'End date must be after start date';
    }

    // Terms validation
    if (!formData.terms.trim()) {
      newErrors.terms = 'Terms and conditions are required';
    } else if (formData.terms.trim().length < 20) {
      newErrors.terms = 'Terms and conditions must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all form errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const finalPosition = formData.position === 'Other (Custom)' ? formData.customPosition : formData.position;
      
      await onSave(contract._id, {
        position: finalPosition,
        salary: formData.salary,
        contract_type: formData.contract_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        benefits: formData.benefits,
        terms: formData.terms
      });
      
      toast.success('Contract updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBenefit = () => {
    if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()]
      }));
      setBenefitInput('');
      toast.success('Benefit added successfully');
    } else if (formData.benefits.includes(benefitInput.trim())) {
      toast.error('This benefit already exists');
    }
  };

  const handleAddCommonBenefit = (benefit: string) => {
    if (!formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
      toast.success(`Added "${benefit}" to benefits`);
    } else {
      toast.error('This benefit is already added');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    const removedBenefit = formData.benefits[index];
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
    toast.info(`Removed "${removedBenefit}" from benefits`);
  };

  const handleAddCommonTerm = (term: string) => {
    const currentTerms = formData.terms.trim();
    const newTerm = currentTerms ? `${currentTerms}\n• ${term}` : `• ${term}`;
    setFormData(prev => ({ ...prev, terms: newTerm }));
    toast.success('Term added to contract');
  };

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Contract</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Briefcase className="inline w-4 h-4 mr-1" />
                Position *
              </label>
              <select
                value={formData.position}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, position: e.target.value, customPosition: '' }));
                  if (errors.position) {
                    setErrors(prev => ({ ...prev, position: '' }));
                  }
                }}
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                  errors.position ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              >
                <option value="">Select a position...</option>
                {positionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {formData.position === 'Other (Custom)' && (
                <input
                  type="text"
                  value={formData.customPosition}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, customPosition: e.target.value }));
                    if (errors.position) {
                      setErrors(prev => ({ ...prev, position: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                    errors.position ? 'border-red-500/50' : 'border-slate-600/50'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all mt-2`}
                  placeholder="Enter custom position..."
                />
              )}
              {errors.position && (
                <p className="text-red-400 text-xs mt-1">{errors.position}</p>
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Salary (VNĐ) *
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={formData.salary}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, salary: Number(e.target.value) }));
                  if (errors.salary) {
                    setErrors(prev => ({ ...prev, salary: '' }));
                  }
                }}
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                  errors.salary ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
                placeholder="5,000,000"
              />
              {formData.salary > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Formatted: {formatSalary(formData.salary)} VNĐ
                </p>
              )}
              {errors.salary && (
                <p className="text-red-400 text-xs mt-1">{errors.salary}</p>
              )}
            </div>
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contract Type *</label>
            <select
              value={formData.contract_type}
              onChange={(e) => setFormData(prev => ({ ...prev, contract_type: e.target.value as any }))}
              className="w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, start_date: e.target.value }));
                  if (errors.start_date) {
                    setErrors(prev => ({ ...prev, start_date: '' }));
                  }
                }}
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                  errors.start_date ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              />
              {errors.start_date && (
                <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, end_date: e.target.value }));
                  if (errors.end_date) {
                    setErrors(prev => ({ ...prev, end_date: '' }));
                  }
                }}
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                  errors.end_date ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              />
              {errors.end_date && (
                <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Gift className="inline w-4 h-4 mr-1" />
              Benefits
            </label>
            
            {/* Common Benefits */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {commonBenefits.map((benefit) => (
                  <button
                    key={benefit}
                    type="button"
                    onClick={() => handleAddCommonBenefit(benefit)}
                    disabled={formData.benefits.includes(benefit)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      formData.benefits.includes(benefit)
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        : 'bg-teal-600/20 text-teal-400 border border-teal-500/30 hover:bg-teal-600/30'
                    }`}
                  >
                    <Plus className="inline w-3 h-3 mr-1" />
                    {benefit}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Benefit Input */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                placeholder="Add custom benefit..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 bg-teal-600/20 text-teal-400 rounded-lg border border-teal-500/30 hover:bg-teal-600/30 transition-all"
              >
                Add
              </button>
            </div>
            
            {/* Added Benefits */}
            {formData.benefits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm border border-teal-500/30 flex items-center gap-2"
                  >
                    {benefit}
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="text-teal-300 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Terms & Conditions *
            </label>
            
            {/* Common Terms */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Quick Add Common Terms:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {commonTerms.map((term, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAddCommonTerm(term)}
                    className="text-left px-2 py-1 rounded text-xs bg-slate-600/20 text-slate-300 hover:bg-slate-600/40 transition-all border border-slate-600/30"
                  >
                    <Plus className="inline w-3 h-3 mr-1" />
                    {term.length > 50 ? `${term.substring(0, 50)}...` : term}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={formData.terms}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, terms: e.target.value }));
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              rows={6}
              className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                errors.terms ? 'border-red-500/50' : 'border-slate-600/50'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              placeholder="Enter contract terms and conditions..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.terms && (
                <p className="text-red-400 text-xs">{errors.terms}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">
                {formData.terms.length} characters (minimum 20)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-600/50 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg hover:from-teal-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const TerminateContractModal = ({ contract, onClose, onConfirm }: TerminateContractModalProps) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonReasons = [
    'Poor performance',
    'Misconduct',
    'Violation of company policies',
    'End of project',
    'Budget constraints',
    'Restructuring',
    'Resignation',
    'Mutual agreement',
    'Contract expiration',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Termination reason is required');
      toast.error('Please provide a reason for termination');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      toast.error('Please provide a more detailed reason');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onConfirm(reason.trim());
      toast.success(`Contract for ${contract.staff.name} has been terminated`);
      onClose();
    } catch (error) {
      toast.error('Failed to terminate contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReason = (selectedReason: string) => {
    setReason(selectedReason);
    setError('');
    toast.success(`Selected reason: ${selectedReason}`);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm max-w-md w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Terminate Contract</h2>
              <p className="text-gray-400">{contract.contract_number}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              This action will terminate the contract for <strong>{contract.staff.name}</strong>. 
              This cannot be undone.
            </p>
          </div>

          {/* Quick Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Select Reason:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {commonReasons.map((commonReason) => (
                <button
                  key={commonReason}
                  type="button"
                  onClick={() => handleQuickReason(commonReason)}
                  className={`px-3 py-2 rounded text-xs text-left transition-all ${
                    reason === commonReason
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                      : 'bg-slate-600/20 text-slate-300 hover:bg-slate-600/40 border border-slate-600/30'
                  }`}
                >
                  {commonReason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detailed reason for termination *
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={4}
              className={`w-full px-4 py-3 bg-slate-700/50 border ${
                error ? 'border-red-500/50' : 'border-slate-600/50'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
              placeholder="Enter detailed reason for termination..."
            />
            <div className="flex justify-between items-center mt-1">
              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">
                {reason.length} characters (minimum 10)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-600/50 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Terminating...' : 'Terminate Contract'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
