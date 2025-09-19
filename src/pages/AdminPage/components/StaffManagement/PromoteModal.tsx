import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, Calendar, DollarSign, FileText, Gift, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUser } from '../../../../types/Admin.type';

interface PromoteModalProps {
  customer: AdminUser;
  onClose: () => void;
  onSubmit: (contractData: {
    position: string;
    salary: number;
    start_date: string;
    end_date: string;
    contract_type: 'full_time' | 'part_time' | 'contract';
    benefits: string[];
    terms: string;
  }) => void;
}

export const PromoteModal = ({ customer, onClose, onSubmit }: PromoteModalProps) => {
  const [formData, setFormData] = useState({
    position: '',
    customPosition: '',
    salary: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    contract_type: 'full_time' as 'full_time' | 'part_time' | 'contract',
    benefits: [] as string[],
    terms: ''
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
    } else if (startDate < today) {
      newErrors.start_date = 'Start date must be today or in the future';
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
      // Convert dates to ISO format
      const startDate = new Date(formData.start_date).toISOString();
      const endDate = new Date(formData.end_date).toISOString();
      
      const finalPosition = formData.position === 'Other (Custom)' ? formData.customPosition : formData.position;
      
      await onSubmit({
        position: finalPosition,
        salary: formData.salary,
        start_date: startDate,
        end_date: endDate,
        contract_type: formData.contract_type,
        benefits: formData.benefits,
        terms: formData.terms
      });
      
      toast.success(`Successfully promoted ${customer.name} to ${finalPosition}`);
    } catch (error) {
      toast.error('Failed to promote user. Please try again.');
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Promote to Staff</h2>
              <p className="text-sm text-gray-400">Create contract for {customer.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                    customer.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                {customer.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white ml-2">{customer.phone}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white ml-2">{new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
                {customer.stats && (
                  <div>
                    <span className="text-gray-400">Bookings:</span>
                    <span className="text-white ml-2">{customer.stats.bookings_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contract Form */}
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
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
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
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all mt-2`}
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
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
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

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, start_date: e.target.value }));
                    if (errors.start_date) {
                      setErrors(prev => ({ ...prev, start_date: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                    errors.start_date ? 'border-red-500/50' : 'border-slate-600/50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                />
                {errors.start_date && (
                  <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, end_date: e.target.value }));
                    if (errors.end_date) {
                      setErrors(prev => ({ ...prev, end_date: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border ${
                    errors.end_date ? 'border-red-500/50' : 'border-slate-600/50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                />
                {errors.end_date && (
                  <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>
                )}
              </div>

              {/* Contract Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contract Type *
                </label>
                <select
                  value={formData.contract_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_type: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
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
                          : 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
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
                  className="flex-1 px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Add custom benefit..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-all"
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
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30 flex items-center gap-2"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(index)}
                        className="text-green-300 hover:text-red-400 transition-colors"
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
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-600/50 text-gray-300 rounded-lg hover:bg-slate-600/70 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Promoting...' : 'Promote to Staff'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
