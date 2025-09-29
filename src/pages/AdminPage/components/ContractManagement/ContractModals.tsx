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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          text: 'Bản nháp',
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
      case 'active':
        return {
          text: 'Đang hoạt động',
          className: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'terminated':
        return {
          text: 'Đã chấm dứt',
          className: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
      case 'expired':
        return {
          text: 'Đã hết hạn',
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      default:
        return {
          text: 'Không xác định',
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
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
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto font-body"
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
                <h2 className="text-xl font-bold text-white font-heading">Chi tiết hợp đồng</h2>
                <p className="text-gray-400 font-body">{contract.contract_number}</p>
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
            <span className="text-gray-400 font-body">Trạng thái:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${
                getStatusInfo(contract.status).className
              }`}
            >
              {getStatusInfo(contract.status).text}
            </span>
          </div>

          {/* Staff Information */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-heading">
              <User className="w-5 h-5" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 font-body">Tên</label>
                <p className="text-white font-body">{contract.staff.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-body">Email</label>
                <p className="text-white font-body">{contract.staff.email}</p>
              </div>
              {contract.staff.phone && (
                <div>
                  <label className="text-sm text-gray-400 font-body">Điện thoại</label>
                  <p className="text-white font-body">{contract.staff.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contract Information */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-heading">
              <Calendar className="w-5 h-5" />
              Thông tin hợp đồng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 font-body">Ngày bắt đầu</label>
                <p className="text-white font-body">{new Date(contract.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-body">Ngày kết thúc</label>
                <p className="text-white font-body">{new Date(contract.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-body">Lương</label>
                <p className="text-white font-semibold font-body">{formatSalary(contract.salary)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 font-body">Ngày tạo</label>
                <p className="text-white font-body">{new Date(contract.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          {contract.benefits && contract.benefits.length > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 font-heading">
                <Gift className="w-5 h-5" />
                Phúc lợi
              </h3>
              <div className="flex flex-wrap gap-2">
                {contract.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm border border-teal-500/30 font-body"
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
              <h3 className="text-lg font-semibold text-white mb-4 font-heading">Điều khoản & Điều kiện</h3>
              <p className="text-gray-300 whitespace-pre-wrap font-body">{contract.terms}</p>
            </div>
          )}

          {/* Admin Information */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 font-heading">Tạo bởi</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {contract.admin.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium font-body">{contract.admin.name}</p>
                <p className="text-gray-400 text-sm font-body">{contract.admin.email}</p>
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
    'Quản lý rạp',
    'Trợ lý quản lý',
    'Đại diện dịch vụ khách hàng',
    'Nhân viên quầy',
    'Nhân viên bán vé',
    'Kỹ thuật viên bảo trì',
    'Nhân viên bảo vệ',
    'Nhân viên vệ sinh',
    'Kỹ thuật viên chiếu phim',
    'Điều phối viên tiếp thị',
    'Khác (Tùy chỉnh)'
  ];

  const commonBenefits = [
    'Bảo hiểm y tế',
    'Bảo hiểm nha khoa',
    'Bảo hiểm nhân thọ',
    'Nghỉ phép có lương',
    'Nghỉ ốm',
    'Chế độ hưu trí',
    'Giảm giá cho nhân viên',
    'Đào tạo & Phát triển',
    'Lịch làm việc linh hoạt',
    'Thưởng hiệu suất'
  ];

  const commonTerms = [
    'Áp dụng các điều khoản và điều kiện lao động tiêu chuẩn.',
    'Nhân viên phải luôn duy trì thái độ chuyên nghiệp.',
    'Đánh giá hiệu suất định kỳ sẽ được thực hiện.',
    'Phải ký thỏa thuận bảo mật.',
    'Áp dụng thời gian thử việc 90 ngày.',
    'Yêu cầu thông báo trước 30 ngày khi nghỉ việc.',
    'Bồi thường làm thêm giờ theo luật lao động.',
    'Áp dụng các chính sách trong sổ tay nhân viên.',
    'Yêu cầu kiểm tra lý lịch.',
    'Có thể yêu cầu xét nghiệm ma túy.'
  ];

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Position validation
    const finalPosition = formData.position === 'Khác (Tùy chỉnh)' ? formData.customPosition : formData.position;
    if (!finalPosition.trim()) {
      newErrors.position = 'Vị trí là bắt buộc';
    }

    // Salary validation
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary = 'Lương phải lớn hơn 0';
    } else if (formData.salary < 100000) {
      newErrors.salary = 'Lương phải ít nhất là 100,000 VNĐ';
    }

    // Date validations
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc là bắt buộc';
    } else if (endDate <= startDate) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    // Terms validation
    if (!formData.terms.trim()) {
      newErrors.terms = 'Điều khoản và điều kiện là bắt buộc';
    } else if (formData.terms.trim().length < 20) {
      newErrors.terms = 'Điều khoản và điều kiện phải có ít nhất 20 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng sửa tất cả các lỗi trong biểu mẫu trước khi gửi');
      return;
    }

    setLoading(true);
    try {
      const finalPosition = formData.position === 'Khác (Tùy chỉnh)' ? formData.customPosition : formData.position;
      
      await onSave(contract._id, {
        position: finalPosition,
        salary: formData.salary,
        contract_type: formData.contract_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        benefits: formData.benefits,
        terms: formData.terms
      });
      
      toast.success('Cập nhật hợp đồng thành công');
      onClose();
    } catch (error) {
      toast.error('Cập nhật hợp đồng thất bại. Vui lòng thử lại.');
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
      toast.success('Thêm phúc lợi thành công');
    } else if (formData.benefits.includes(benefitInput.trim())) {
      toast.error('Phúc lợi này đã tồn tại');
    }
  };

  const handleAddCommonBenefit = (benefit: string) => {
    if (!formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
      toast.success(`Đã thêm "${benefit}" vào phúc lợi`);
    } else {
      toast.error('Phúc lợi này đã được thêm');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    const removedBenefit = formData.benefits[index];
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
    toast.info(`Đã xóa "${removedBenefit}" khỏi phúc lợi`);
  };

  const handleAddCommonTerm = (term: string) => {
    const currentTerms = formData.terms.trim();
    const newTerm = currentTerms ? `${currentTerms}\n• ${term}` : `• ${term}`;
    setFormData(prev => ({ ...prev, terms: newTerm }));
    toast.success('Đã thêm điều khoản vào hợp đồng');
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
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto font-body"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-heading">Chỉnh sửa hợp đồng</h2>
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
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                <Briefcase className="inline w-4 h-4 mr-1" />
                Vị trí *
              </label>
              <select
                value={formData.position}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, position: e.target.value, customPosition: '' }));
                  if (errors.position) {
                    setErrors(prev => ({ ...prev, position: '' }));
                  }
                }}
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                  errors.position ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              >
                <option value="">Chọn một vị trí...</option>
                {positionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {formData.position === 'Khác (Tùy chỉnh)' && (
                <input
                  type="text"
                  value={formData.customPosition}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, customPosition: e.target.value }));
                    if (errors.position) {
                      setErrors(prev => ({ ...prev, position: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                    errors.position ? 'border-red-500/50' : 'border-slate-600/50'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all mt-2`}
                  placeholder="Nhập vị trí tùy chỉnh..."
                />
              )}
              {errors.position && (
                <p className="text-red-400 text-xs mt-1 font-body">{errors.position}</p>
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Lương (VNĐ) *
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
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                  errors.salary ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
                placeholder="5,000,000"
              />
              {formData.salary > 0 && (
                <p className="text-xs text-gray-400 mt-1 font-body">
                  Đã định dạng: {formatSalary(formData.salary)} VNĐ
                </p>
              )}
              {errors.salary && (
                <p className="text-red-400 text-xs mt-1 font-body">{errors.salary}</p>
              )}
            </div>
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">Loại hợp đồng *</label>
            <select
              value={formData.contract_type}
              onChange={(e) => setFormData(prev => ({ ...prev, contract_type: e.target.value as any }))}
              className="w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-body"
            >
              <option value="full_time">Toàn thời gian</option>
              <option value="part_time">Bán thời gian</option>
              <option value="contract">Hợp đồng</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                <Calendar className="inline w-4 h-4 mr-1" />
                Ngày bắt đầu *
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
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                  errors.start_date ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              />
              {errors.start_date && (
                <p className="text-red-400 text-xs mt-1 font-body">{errors.start_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                <Calendar className="inline w-4 h-4 mr-1" />
                Ngày kết thúc *
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
                className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                  errors.end_date ? 'border-red-500/50' : 'border-slate-600/50'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              />
              {errors.end_date && (
                <p className="text-red-400 text-xs mt-1 font-body">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              <Gift className="inline w-4 h-4 mr-1" />
              Phúc lợi
            </label>
            
            {/* Common Benefits */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2 font-body">Thêm nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {commonBenefits.map((benefit) => (
                  <button
                    key={benefit}
                    type="button"
                    onClick={() => handleAddCommonBenefit(benefit)}
                    disabled={formData.benefits.includes(benefit)}
                    className={`px-2 py-1 rounded text-xs transition-all font-body ${
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
                className="flex-1 px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-body"
                placeholder="Thêm phúc lợi tùy chỉnh..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 bg-teal-600/20 text-teal-400 rounded-lg border border-teal-500/30 hover:bg-teal-600/30 transition-all font-body"
              >
                Thêm
              </button>
            </div>
            
            {/* Added Benefits */}
            {formData.benefits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm border border-teal-500/30 flex items-center gap-2 font-body"
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
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              <FileText className="inline w-4 h-4 mr-1" />
              Điều khoản & Điều kiện *
            </label>
            
            {/* Common Terms */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2 font-body">Thêm nhanh các điều khoản phổ biến:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {commonTerms.map((term, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAddCommonTerm(term)}
                    className="text-left px-2 py-1 rounded text-xs bg-slate-600/20 text-slate-300 hover:bg-slate-600/40 transition-all border border-slate-600/30 font-body"
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
              className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                errors.terms ? 'border-red-500/50' : 'border-slate-600/50'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
              placeholder="Nhập các điều khoản và điều kiện hợp đồng..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.terms && (
                <p className="text-red-400 text-xs font-body">{errors.terms}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto font-body">
                {formData.terms.length} ký tự (tối thiểu 20)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-600/50 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors font-body"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg hover:from-teal-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
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
    'Hiệu suất kém',
    'Hành vi sai trái',
    'Vi phạm chính sách công ty',
    'Kết thúc dự án',
    'Hạn chế ngân sách',
    'Tái cấu trúc',
    'Từ chức',
    'Thỏa thuận chung',
    'Hết hạn hợp đồng',
    'Khác'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Lý do chấm dứt là bắt buộc');
      toast.error('Vui lòng cung cấp lý do chấm dứt');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Lý do phải có ít nhất 10 ký tự');
      toast.error('Vui lòng cung cấp lý do chi tiết hơn');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onConfirm(reason.trim());
      toast.success(`Hợp đồng của ${contract.staff.name} đã được chấm dứt`);
      onClose();
    } catch (error) {
      toast.error('Chấm dứt hợp đồng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReason = (selectedReason: string) => {
    setReason(selectedReason);
    setError('');
    toast.success(`Đã chọn lý do: ${selectedReason}`);
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
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm max-w-md w-full font-body"
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
              <h2 className="text-xl font-bold text-white font-heading">Chấm dứt hợp đồng</h2>
              <p className="text-gray-400 font-body">{contract.contract_number}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm font-body">
              Hành động này sẽ chấm dứt hợp đồng của <strong>{contract.staff.name}</strong>.
              Hành động này không thể hoàn tác.
            </p>
          </div>

          {/* Quick Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Chọn nhanh lý do:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {commonReasons.map((commonReason) => (
                <button
                  key={commonReason}
                  type="button"
                  onClick={() => handleQuickReason(commonReason)}
                  className={`px-3 py-2 rounded text-xs text-left transition-all font-body ${
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
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Lý do chi tiết để chấm dứt *
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={4}
              className={`w-full px-4 py-3 bg-slate-700/50 border font-body ${
                error ? 'border-red-500/50' : 'border-slate-600/50'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
              placeholder="Nhập lý do chi tiết để chấm dứt..."
            />
            <div className="flex justify-between items-center mt-1">
              {error && (
                <p className="text-red-400 text-xs font-body">{error}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto font-body">
                {reason.length} ký tự (tối thiểu 10)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-600/50 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors font-body"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body"
            >
              {loading ? 'Đang chấm dứt...' : 'Chấm dứt hợp đồng'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
