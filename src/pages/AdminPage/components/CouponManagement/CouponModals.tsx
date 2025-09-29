import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Percent, 
  DollarSign, 
  Users, 
  Tag,
  Info,
  Clock,
  TrendingUp,
  Search,
  Check
} from 'lucide-react';
import type { CreateCouponRequest, UpdateCouponRequest } from '../../../../types/Coupon.type';
import { getAllUsers } from '../../../../apis/admin.api';
import { getAllMovies } from '../../../../apis/movie.api';

// Modal backdrop component
const ModalBackdrop = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 font-body"
    >
      {children}
    </motion.div>
  </motion.div>
);

// Selection Modal for Users or Movies
interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'users' | 'movies';
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const SelectionModal = ({ isOpen, onClose, type, selectedIds, onSelectionChange }: SelectionModalProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (isOpen) {
      setTempSelectedIds(selectedIds);
      fetchItems();
    }
  }, [isOpen, selectedIds]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (type === 'users') {
        const response = await getAllUsers({ limit: 100 });
        setItems(response.result.users);
      } else {
        const response = await getAllMovies({ limit: 100 });
        setItems(response.result.movies);
      }
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (type === 'users') {
      return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.email?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const genreMatch = Array.isArray(item.genre) 
        ? item.genre.some((g: any) => typeof g === 'string' && g.toLowerCase().includes(searchTerm.toLowerCase()))
        : typeof item.genre === 'string' && item.genre?.toLowerCase().includes(searchTerm.toLowerCase());
      return titleMatch || genreMatch;
    }
  });

  const handleToggleSelection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTempSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSave = () => {
    onSelectionChange(tempSelectedIds);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <ModalBackdrop onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-heading">
            Chọn {type === 'users' ? 'Thành viên' : 'Phim'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Tìm kiếm ${type === 'users' ? 'thành viên' : 'phim'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
            />
          </div>
        </div>

        {/* Selection Counter */}
        <div className="mb-4 text-sm text-gray-300 font-body">
          Đã chọn: {tempSelectedIds.length} {type === 'users' ? 'thành viên' : 'phim'}
        </div>

        {/* Items List */}
        <div className="max-h-96 overflow-y-auto mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={(e) => handleToggleSelection(e, item._id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors duration-150 ${
                    tempSelectedIds.includes(item._id)
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {type === 'users' ? (
                        <div>
                          <div className="font-medium text-white font-body">{item.name || 'Không có tên'}</div>
                          <div className="text-sm text-gray-400 font-body">{item.email || 'Không có email'}</div>
                          <div className="text-xs text-gray-500 capitalize font-body">{item.role || 'Không có vai trò'}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-white font-body">{item.title || 'Không có tiêu đề'}</div>
                          <div className="text-sm text-gray-400 font-body">
                            {Array.isArray(item.genre) 
                              ? item.genre.filter((g: any) => typeof g === 'string').join(', ') || 'Không có thể loại'
                              : (typeof item.genre === 'string' ? item.genre : 'Không có thể loại')
                            }
                          </div>
                          <div className="text-xs text-gray-500 font-body">
                            {item.release_date ? new Date(item.release_date).toLocaleDateString('vi-VN') : 'Không có ngày phát hành'}
                          </div>
                        </div>
                      )}
                    </div>
                    {tempSelectedIds.includes(item._id) && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150 font-body"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-150 font-body"
          >
            Lưu lựa chọn ({tempSelectedIds.length})
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );

  return createPortal(modalContent, document.body);
};

// Coupon Detail Modal
interface CouponDetailModalProps {
  coupon: any;
  isOpen: boolean;
  onClose: () => void;
}

export const CouponDetailModal = ({ coupon, isOpen, onClose }: CouponDetailModalProps) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-slate-700 text-gray-300 border-slate-600',
      expired: 'bg-red-100 text-red-800 border-red-200'
    };
    const statusText = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      expired: 'Hết hạn'
    }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.inactive} font-body`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-heading">Chi tiết mã giảm giá</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Mã giảm giá
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-700 rounded-lg">
                <Tag className="h-5 w-5 text-gray-400" />
                <span className="font-mono text-lg font-semibold text-white">{coupon.code}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Trạng thái
              </label>
              <div className="p-3">
                {getStatusBadge(coupon.status)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Mô tả
            </label>
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-white font-body">{coupon.description}</p>
            </div>
          </div>

          {/* Discount Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-600 rounded-lg bg-slate-700">
              <div className="flex items-center gap-2 mb-2">
                {coupon.type === 'percentage' ? (
                  <Percent className="h-5 w-5 text-blue-600" />
                ) : (
                  <DollarSign className="h-5 w-5 text-green-600" />
                )}
                <span className="font-medium text-gray-300 font-body">Giảm giá</span>
              </div>
              <p className="text-2xl font-bold text-white font-body">
                {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value.toLocaleString()} VNĐ`}
              </p>
            </div>

            <div className="p-4 border border-slate-600 rounded-lg bg-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-300 font-body">Tối thiểu</span>
              </div>
              <p className="text-2xl font-bold text-white font-body">
                {coupon.min_purchase.toLocaleString()} VNĐ
              </p>
            </div>

            <div className="p-4 border border-slate-600 rounded-lg bg-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-300 font-body">Giảm tối đa</span>
              </div>
              <p className="text-2xl font-bold text-white font-body">
                {coupon.max_discount > 0 ? `${coupon.max_discount.toLocaleString()} VNĐ` : 'Không giới hạn'}
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-300 font-body">Lượt sử dụng</span>
              </div>
              <p className="text-2xl font-bold text-white font-body">
                {coupon.usage_count} 
                {coupon.usage_limit > 0 && (
                  <span className="text-base text-gray-400 font-body"> / {coupon.usage_limit}</span>
                )}
              </p>
              {coupon.usage_limit > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-gray-300 font-body">Áp dụng cho</span>
              </div>
              <p className="text-lg font-semibold text-white capitalize font-body">
                {coupon.applicable_to === 'all' ? 'Tất cả' : coupon.applicable_to === 'movies' ? 'Phim' : 'Thành viên'}
              </p>
              {coupon.applicable_ids.length > 0 && (
                <p className="text-sm text-gray-400 mt-1 font-body">
                  {coupon.applicable_ids.length} mục
                </p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-300 font-body">Ngày bắt đầu</span>
              </div>
              <p className="text-white font-body">{formatDate(coupon.start_date)}</p>
            </div>

            <div className="p-4 border border-slate-600 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-300 font-body">Ngày kết thúc</span>
              </div>
              <p className="text-white font-body">{formatDate(coupon.end_date)}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-300 font-body">Tạo lúc</span>
              </div>
              <p className="text-sm text-gray-400 font-body">{formatDate(coupon.created_at)}</p>
            </div>

            <div className="p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-300 font-body">Cập nhật lần cuối</span>
              </div>
              <p className="text-sm text-gray-400 font-body">{formatDate(coupon.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};

// Create Coupon Modal
interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCouponRequest) => void;
}

export const CreateCouponModal = ({ isOpen, onClose, onSubmit }: CreateCouponModalProps) => {
  const [formData, setFormData] = useState<CreateCouponRequest>({
    code: '',
    description: '',
    type: 'percentage',
    value: 0,
    min_purchase: 0,
    max_discount: 0,
    start_date: '',
    end_date: '',
    status: 'active',
    usage_limit: 0,
    applicable_to: 'all',
    applicable_ids: []
  });

  const [loading, setLoading] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const now = new Date();
    const startDate = formData.start_date ? new Date(formData.start_date) : null;
    const endDate = formData.end_date ? new Date(formData.end_date) : null;

    // Validate dates
    if (formData.start_date && startDate && startDate <= now) {
      newErrors.start_date = 'Ngày bắt đầu phải trong tương lai';
    }

    if (formData.end_date && endDate && endDate <= now) {
      newErrors.end_date = 'Ngày kết thúc phải trong tương lai';
    }

    if (formData.start_date && formData.end_date && startDate && endDate && endDate <= startDate) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    // Validate max discount vs min purchase
    if ((formData.max_discount ?? 0) > 0 && (formData.min_purchase ?? 0) > 0 && (formData.max_discount ?? 0) <= (formData.min_purchase ?? 0)) {
      newErrors.max_discount = 'Giảm giá tối đa phải lớn hơn giá trị tối thiểu';
    }

    // Validate discount value
    if (formData.type === 'percentage' && ((formData.value ?? 0) <= 0 || (formData.value ?? 0) > 100)) {
      newErrors.value = 'Phần trăm phải từ 1 đến 100';
    }

    if (formData.type === 'fixed' && (formData.value ?? 0) <= 0) {
      newErrors.value = 'Số tiền cố định phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-heading">Tạo mã giảm giá mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Mã giảm giá *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
                placeholder="VD: SUMMER2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Mô tả *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
              placeholder="Nhập mô tả mã giảm giá..."
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Loại giảm giá *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
              >
                <option value="percentage">Giảm theo phần trăm (%)</option>
                <option value="fixed">Giảm theo số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giá trị giảm giá *
                {errors.value && <span className="text-red-400 text-sm ml-2">{errors.value}</span>}
              </label>
              <div className="relative">
                {formData.type === 'percentage' ? (
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    step="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className={`w-full px-3 py-2 pr-10 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                      errors.value ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="20"
                  />
                ) : (
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className={`w-full px-3 py-2 pr-12 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                      errors.value ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="10000"
                  />
                )}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {formData.type === 'percentage' ? (
                    <span className="text-gray-400 text-sm">%</span>
                  ) : (
                    <span className="text-gray-400 text-sm">VNĐ</span>
                  )}
                </div>
              </div>
              {formData.type === 'percentage' && (
                <p className="text-xs text-gray-400 mt-1 font-body">Nhập giá trị từ 1% đến 100%</p>
              )}
              {formData.type === 'fixed' && (
                <p className="text-xs text-gray-400 mt-1 font-body">Nhập số tiền tối thiểu 1,000 VNĐ</p>
              )}
            </div>
          </div>

          {/* Purchase Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Giá trị đơn hàng tối thiểu để áp dụng coupon</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giảm giá tối đa (VNĐ)
                {errors.max_discount && <span className="text-red-400 text-sm ml-2">{errors.max_discount}</span>}
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.max_discount}
                onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                  errors.max_discount ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0 (0 = không giới hạn)"
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Số tiền giảm tối đa (phải lớn hơn giá trị đơn hàng tối thiểu)</p>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Ngày bắt đầu *
                {errors.start_date && <span className="text-red-400 text-sm ml-2">{errors.start_date}</span>}
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                  errors.start_date ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Thời gian bắt đầu có hiệu lực (phải sau thời điểm hiện tại)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Ngày kết thúc *
                {errors.end_date && <span className="text-red-400 text-sm ml-2">{errors.end_date}</span>}
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                  errors.end_date ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Thời gian hết hiệu lực (phải sau thời gian bắt đầu)</p>
            </div>
          </div>

          {/* Usage Limit and Applicable To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giới hạn sử dụng
              </label>
              <input
                type="number"
                min="0"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
                placeholder="0 (0 = không giới hạn)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Áp dụng cho
              </label>
              <select
                value={formData.applicable_to}
                onChange={(e) => {
                  const newApplicableTo = e.target.value as 'all' | 'movies' | 'members';
                  setFormData({ 
                    ...formData, 
                    applicable_to: newApplicableTo,
                    applicable_ids: [] // Reset selected IDs when changing type
                  });
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
              >
                <option value="all">Tất cả đơn đặt vé</option>
                <option value="movies">Phim cụ thể</option>
                <option value="members">Thành viên cụ thể</option>
              </select>
            </div>
          </div>

          {/* Specific Selection for Movies or Members */}
          {(formData.applicable_to === 'movies' || formData.applicable_to === 'members') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Đã chọn {formData.applicable_to === 'movies' ? 'Phim' : 'Thành viên'}
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSelectionModal(true)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors duration-150 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-body">
                      {(formData.applicable_ids?.length || 0) === 0
                        ? `Chọn ${formData.applicable_to === 'movies' ? 'Phim' : 'Thành viên'}`
                        : `${formData.applicable_ids?.length || 0} ${formData.applicable_to === 'movies' ? 'phim' : 'thành viên'} đã chọn`
                      }
                    </span>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                
                {(formData.applicable_ids?.length || 0) > 0 && (
                  <div className="text-sm text-gray-400 font-body">
                    Nhấp vào nút trên để sửa đổi lựa chọn của bạn
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150 font-body"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50 font-body"
            >
              {loading ? 'Đang tạo...' : 'Tạo mã giảm giá'}
            </button>
          </div>
        </form>

        {/* Selection Modal */}
        {showSelectionModal && (
          <SelectionModal
            isOpen={showSelectionModal}
            onClose={() => setShowSelectionModal(false)}
            type={formData.applicable_to === 'movies' ? 'movies' : 'users'}
            selectedIds={formData.applicable_ids || []}
            onSelectionChange={(ids) => {
              setFormData({ ...formData, applicable_ids: ids });
            }}
          />
        )}
      </div>
    </ModalBackdrop>
  );
};

// Edit Coupon Modal
interface EditCouponModalProps {
  coupon: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateCouponRequest) => void;
}

export const EditCouponModal = ({ coupon, isOpen, onClose, onSubmit }: EditCouponModalProps) => {
  const [formData, setFormData] = useState<UpdateCouponRequest>({
    description: coupon?.description || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || 0,
    min_purchase: coupon?.min_purchase || 0,
    max_discount: coupon?.max_discount || 0,
    start_date: coupon?.start_date ? new Date(coupon.start_date).toISOString().slice(0, 16) : '',
    end_date: coupon?.end_date ? new Date(coupon.end_date).toISOString().slice(0, 16) : '',
    status: coupon?.status || 'active',
    usage_limit: coupon?.usage_limit || 0,
    applicable_to: coupon?.applicable_to || 'all',
    applicable_ids: coupon?.applicable_ids || []
  });

  const [loading, setLoading] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const now = new Date();
    const startDate = formData.start_date ? new Date(formData.start_date) : null;
    const endDate = formData.end_date ? new Date(formData.end_date) : null;

    // Validate dates
    if (formData.start_date && startDate && startDate <= now) {
      newErrors.start_date = 'Ngày bắt đầu phải trong tương lai';
    }

    if (formData.end_date && endDate && endDate <= now) {
      newErrors.end_date = 'Ngày kết thúc phải trong tương lai';
    }

    if (formData.start_date && formData.end_date && startDate && endDate && endDate <= startDate) {
      newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    // Validate max discount vs min purchase
    if ((formData.max_discount ?? 0) > 0 && (formData.min_purchase ?? 0) > 0 && (formData.max_discount ?? 0) <= (formData.min_purchase ?? 0)) {
      newErrors.max_discount = 'Giảm giá tối đa phải lớn hơn giá trị tối thiểu';
    }

    // Validate discount value
    if (formData.type === 'percentage' && ((formData.value ?? 0) <= 0 || (formData.value ?? 0) > 100)) {
      newErrors.value = 'Phần trăm phải từ 1 đến 100';
    }

    if (formData.type === 'fixed' && (formData.value ?? 0) <= 0) {
      newErrors.value = 'Số tiền cố định phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">Chỉnh sửa mã giảm giá</h2>
            <p className="text-gray-400 mt-1 font-body">Mã: {coupon.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors duration-150"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
              placeholder="Nhập mô tả mã giảm giá..."
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Loại giảm giá
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
              >
                <option value="percentage">Giảm theo phần trăm (%)</option>
                <option value="fixed">Giảm theo số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giá trị giảm giá
                {errors.value && <span className="text-red-400 text-sm ml-2">{errors.value}</span>}
              </label>
              <div className="relative">
                {formData.type === 'percentage' ? (
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className={`w-full px-3 py-2 pr-10 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                      errors.value ? 'border-red-500' : 'border-slate-600'
                    }`}
                  />
                ) : (
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className={`w-full px-3 py-2 pr-12 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                      errors.value ? 'border-red-500' : 'border-slate-600'
                    }`}
                  />
                )}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {formData.type === 'percentage' ? (
                    <span className="text-gray-400 text-sm">%</span>
                  ) : (
                    <span className="text-gray-400 text-sm">VNĐ</span>
                  )}
                </div>
              </div>
              {formData.type === 'percentage' && (
                <p className="text-xs text-gray-400 mt-1 font-body">Nhập giá trị từ 1% đến 100%</p>
              )}
              {formData.type === 'fixed' && (
                <p className="text-xs text-gray-400 mt-1 font-body">Nhập số tiền tối thiểu 1,000 VNĐ</p>
              )}
            </div>
          </div>

          {/* Purchase Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Giá trị đơn hàng tối thiểu để áp dụng coupon</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giảm giá tối đa (VNĐ)
                {errors.max_discount && <span className="text-red-400 text-sm ml-2">{errors.max_discount}</span>}
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.max_discount}
                onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                  errors.max_discount ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0 (0 = không giới hạn)"
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Số tiền giảm tối đa (phải lớn hơn giá trị đơn hàng tối thiểu)</p>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Ngày bắt đầu *
                {errors.start_date && <span className="text-red-400 text-sm ml-2">{errors.start_date}</span>}
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                  errors.start_date ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Thời gian bắt đầu có hiệu lực (phải sau thời điểm hiện tại)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Ngày kết thúc *
                {errors.end_date && <span className="text-red-400 text-sm ml-2">{errors.end_date}</span>}
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body ${
                  errors.end_date ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1 font-body">Thời gian hết hiệu lực (phải sau thời gian bắt đầu)</p>
            </div>
          </div>

          {/* Usage Limit and Applicable To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Giới hạn sử dụng
              </label>
              <input
                type="number"
                min="0"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
                placeholder="0 (0 = không giới hạn)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Áp dụng cho
              </label>
              <select
                value={formData.applicable_to}
                onChange={(e) => {
                  const newApplicableTo = e.target.value as 'all' | 'movies' | 'members';
                  setFormData({ 
                    ...formData, 
                    applicable_to: newApplicableTo,
                    applicable_ids: [] // Reset selected IDs when changing type
                  });
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-body"
              >
                <option value="all">Tất cả đơn đặt vé</option>
                <option value="movies">Phim cụ thể</option>
                <option value="members">Thành viên cụ thể</option>
              </select>
            </div>
          </div>

          {/* Specific Selection for Movies or Members */}
          {(formData.applicable_to === 'movies' || formData.applicable_to === 'members') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                Đã chọn {formData.applicable_to === 'movies' ? 'Phim' : 'Thành viên'}
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSelectionModal(true)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 transition-colors duration-150 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-body">
                      {(formData.applicable_ids?.length || 0) === 0
                        ? `Chọn ${formData.applicable_to === 'movies' ? 'Phim' : 'Thành viên'}`
                        : `${formData.applicable_ids?.length || 0} ${formData.applicable_to === 'movies' ? 'phim' : 'thành viên'} đã chọn`
                      }
                    </span>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                
                {(formData.applicable_ids?.length || 0) > 0 && (
                  <div className="text-sm text-gray-400 font-body">
                    Nhấp vào nút trên để sửa đổi lựa chọn của bạn
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150 font-body"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-150 disabled:opacity-50 font-body"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật mã giảm giá'}
            </button>
          </div>
        </form>

        {/* Selection Modal */}
        {showSelectionModal && (
          <SelectionModal
            isOpen={showSelectionModal}
            onClose={() => setShowSelectionModal(false)}
            type={formData.applicable_to === 'movies' ? 'movies' : 'users'}
            selectedIds={formData.applicable_ids || []}
            onSelectionChange={(ids) => {
              setFormData({ ...formData, applicable_ids: ids });
            }}
          />
        )}
      </div>
    </ModalBackdrop>
  );
};

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
  coupon: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({ coupon, isOpen, onClose, onConfirm }: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Xóa mã giảm giá</h2>
            <p className="text-gray-400 mt-1 font-body">Hành động này không thể hoàn tác</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-5 w-5 text-gray-400" />
              <span className="font-medium font-body">Mã giảm giá:</span>
              <span className="font-mono font-semibold">{coupon.code}</span>
            </div>
            <p className="text-gray-400 font-body">{coupon.description}</p>
            
            {coupon.usage_count > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-body">
                    Mã này đã được sử dụng {coupon.usage_count} lần
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150 font-body"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-150 font-body"
          >
            Xóa mã giảm giá
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};


