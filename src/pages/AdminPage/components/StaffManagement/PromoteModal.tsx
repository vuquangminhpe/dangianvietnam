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
    const finalPosition = formData.position === 'Other (Custom)' ? formData.customPosition : formData.position;
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
    } else if (startDate < today) {
      newErrors.start_date = 'Ngày bắt đầu phải là hôm nay hoặc trong tương lai';
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
      
      toast.success(`Thăng chức thành công ${customer.name} lên ${finalPosition}`);
    } catch (error) {
      toast.error('Thăng chức người dùng thất bại. Vui lòng thử lại.');
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
      toast.success('Thêm quyền lợi thành công');
    } else if (formData.benefits.includes(benefitInput.trim())) {
      toast.error('Quyền lợi này đã tồn tại');
    }
  };

  const handleAddCommonBenefit = (benefit: string) => {
    if (!formData.benefits.includes(benefit)) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit]
      }));
      toast.success(`Đã thêm "${benefit}" vào quyền lợi`);
    } else {
      toast.error('Quyền lợi này đã được thêm');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    const removedBenefit = formData.benefits[index];
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
    toast.info(`Đã xóa "${removedBenefit}" khỏi quyền lợi`);
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
              <h2 className="text-xl font-semibold text-white font-heading">Thăng chức thành nhân viên</h2>
              <p className="text-sm text-gray-400 font-body">Tạo hợp đồng cho {customer.name}</p>
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
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2 font-heading">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                    customer.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                {customer.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-body">
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div>
                    <span className="text-gray-400">Điện thoại:</span>
                    <span className="text-white ml-2">{customer.phone}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Thành viên từ:</span>
                  <span className="text-white ml-2">{new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
                {customer.stats && (
                  <div>
                    <span className="text-gray-400">Lượt đặt vé:</span>
                    <span className="text-white ml-2">{customer.stats.bookings_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contract Form */}
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
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                >
                  <option value="">Chọn một vị trí...</option>
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
                    className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                      errors.position ? 'border-red-500/50' : 'border-slate-600/50'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all mt-2`}
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
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
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

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Ngày bắt đầu *
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
                  className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                    errors.start_date ? 'border-red-500/50' : 'border-slate-600/50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                />
                {errors.start_date && (
                  <p className="text-red-400 text-xs mt-1 font-body">{errors.start_date}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Ngày kết thúc *
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
                  className={`w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border font-body ${
                    errors.end_date ? 'border-red-500/50' : 'border-slate-600/50'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                />
                {errors.end_date && (
                  <p className="text-red-400 text-xs mt-1 font-body">{errors.end_date}</p>
                )}
              </div>

              {/* Contract Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                  Loại hợp đồng *
                </label>
                <select
                  value={formData.contract_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_type: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-body"
                >
                  <option value="full_time">Toàn thời gian</option>
                  <option value="part_time">Bán thời gian</option>
                  <option value="contract">Hợp đồng</option>
                </select>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                <Gift className="inline w-4 h-4 mr-1" />
                Quyền lợi
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
                  className="flex-1 px-3 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-body"
                  placeholder="Thêm quyền lợi tùy chỉnh..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-all font-body"
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
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30 flex items-center gap-2 font-body"
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
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-600/50 text-gray-300 rounded-lg hover:bg-slate-600/70 transition-all font-body"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                {loading ? 'Đang thăng chức...' : 'Thăng chức thành nhân viên'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
