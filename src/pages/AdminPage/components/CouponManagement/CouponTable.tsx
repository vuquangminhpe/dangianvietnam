import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Percent,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';

interface CouponTableProps {
  coupons: any[];
  loading: boolean;
  selectedCoupons: string[];
  onSelectCoupon: (couponId: string) => void;
  onSelectAll: () => void;
  onViewCoupon: (couponId: string) => void;
  onEditCoupon: (coupon: any) => void;
  onDeleteCoupon: (coupon: any) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCoupons: number;
}

export const CouponTable = ({
  coupons,
  loading,
  selectedCoupons,
  onSelectCoupon,
  onSelectAll,
  onViewCoupon,
  onEditCoupon,
  onDeleteCoupon,
  currentPage,
  totalPages,
  onPageChange,
  totalCoupons
}: CouponTableProps) => {
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      expired: 'bg-red-100 text-red-800 border-red-200'
    };

    const statusText = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      expired: 'Hết hạn'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.inactive} font-body`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  const getTypeIcon = (type: string | null) => {
    if (type === 'percentage') {
      return <Percent className="h-4 w-4 text-blue-600" />;
    } else if (type === 'fixed') {
      return <DollarSign className="h-4 w-4 text-green-600" />;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatValue = (type: string | null, value: number | null) => {
    if (!type || !value) return 'N/A';
    
    if (type === 'percentage') {
      return `${value}%`;
    } else if (type === 'fixed') {
      return `${value.toLocaleString()} VNĐ`;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 font-body">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-300">Đang tải mã giảm giá...</p>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 font-body">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-700">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-white font-heading">Không tìm thấy mã giảm giá</h3>
          <p className="mt-1 text-sm text-gray-400 font-body">
            Bắt đầu bằng cách tạo một mã giảm giá mới.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 font-body">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white font-heading">
            Mã giảm giá ({totalCoupons})
          </h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-body">
              {coupons.filter(c => c.status === 'active').length} đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCoupons.length === coupons.length && coupons.length > 0}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">
                Mã
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">
                Loại & Giá trị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">
                Sử dụng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {coupons.map((coupon, index) => (
              <motion.tr
                key={coupon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCoupons.includes(coupon._id)}
                    onChange={() => onSelectCoupon(coupon._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white font-body">
                      {coupon.code}
                    </div>
                    <div className="text-sm text-gray-400 max-w-xs truncate font-body">
                      {coupon.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(coupon.type)}
                    <span className="text-sm font-medium text-white font-body">
                      {formatValue(coupon.type, coupon.value)}
                    </span>
                  </div>
                  {coupon.min_purchase > 0 && (
                    <div className="text-xs text-gray-400 font-body">
                      Tối thiểu: {coupon.min_purchase.toLocaleString()}VNĐ
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(coupon.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className='font-body'>{formatDate(coupon.start_date)}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-body">
                    đến {formatDate(coupon.end_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-white font-body">
                      {coupon.usage_count}
                    </span>
                    {coupon.usage_limit > 0 && (
                      <span className="text-xs text-gray-400 font-body">
                        / {coupon.usage_limit}
                      </span>
                    )}
                  </div>
                  {coupon.usage_limit > 0 && (
                    <div className="w-16 bg-slate-600 rounded-full h-1 mt-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full"
                        style={{
                          width: `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%`
                        }}
                      />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onViewCoupon(coupon._id)}
                      className="text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-slate-600 transition-colors duration-150"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEditCoupon(coupon)}
                      className="text-green-400 hover:text-green-300 p-1 rounded-full hover:bg-slate-600 transition-colors duration-150"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteCoupon(coupon)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-slate-600 transition-colors duration-150"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300 font-body">
              Hiển thị {((currentPage - 1) * 10) + 1} đến{' '}
              {Math.min(currentPage * 10, totalCoupons)} của {totalCoupons} kết quả
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-body"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </motion.button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 font-body ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 bg-slate-700 border border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </motion.button>
                  );
                })}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 bg-slate-700 border border-slate-600 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-body"
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
