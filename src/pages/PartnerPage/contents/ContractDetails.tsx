import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { checkStaffContract } from '../../../apis/staff.api';
import { getMyTheater } from '../../../apis/staff.api';
import type { ContractCheckResponse, TheaterResponse } from '../../../apis/staff.api';
import { toast } from 'sonner';

const ContractDetails = () => {
  const [contract, setContract] = useState<ContractCheckResponse | null>(null);
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContractDetails();
  }, []);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both contract and theater information
      const [contractResponse, theaterResponse] = await Promise.all([
        checkStaffContract(),
        getMyTheater().catch(() => null) // Handle case where theater doesn't exist yet
      ]);
      
      setContract(contractResponse);
      setTheater(theaterResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contract details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'inactive':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'expired':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'inactive':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'expired':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  if (loading) {
    return (
      <motion.div
        className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-300 font-body">Đang tải thông tin hợp đồng...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !contract?.result) {
    return (
      <motion.div
        className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center min-h-96 flex items-center justify-center">
          <div>
            <AlertCircle size={64} className="text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2 font-heading">Không Tìm Thấy Hợp Đồng</h3>
            <p className="text-slate-300 mb-4 font-body">
              {error || 'Bạn không có hợp đồng đang hoạt động. Vui lòng liên hệ với quản trị viên.'}
            </p>
            <button
              onClick={fetchContractDetails}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const contractData = contract.result;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText size={32} className="text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-white font-heading">Thông Tin Hợp Đồng</h1>
              <p className="text-slate-300 font-body">Hợp đồng #{contractData.contract_number}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor(contractData.status)}`}>
            {getStatusIcon(contractData.status)}
            <span className="font-medium capitalize">{contractData.status}</span>
          </div>
        </div>
      </div>

      {/* Contract Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center font-heading">
            <User size={20} className="text-orange-400 mr-2" />
            Thông Tin Cơ Bản
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Tên nhân viên:</span>
              <span className="text-white font-body">{contractData.staff_name || 'Chưa xác định'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Email:</span>
              <span className="text-white flex items-center font-body">
                {contractData.staff_email || 'Chưa xác định'}
                {contractData.staff_email && <Mail size={14} className="ml-2 text-slate-400" />}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Số điện thoại:</span>
              <span className="text-white flex items-center font-body">
                {contractData.staff_phone || 'Chưa xác định'}
                {contractData.staff_phone && <Phone size={14} className="ml-2 text-slate-400" />}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center font-heading">
            
            Thông Tin Tài Chính
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Lương tháng:</span>
              <span className="text-white font-semibold font-body">{formatCurrency(contractData.salary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Đơn vị tiền tệ:</span>
              <span className="text-white font-body">VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Phương thức thanh toán:</span>
              <span className="text-white font-body">Chuyển khoản ngân hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Period */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center font-heading">
          <Calendar size={20} className="text-orange-400 mr-2" />
          Thời Gian Hợp Đồng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Ngày bắt đầu:</span>
              <span className="text-white font-body">{formatDate(contractData.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Ngày kết thúc:</span>
              <span className="text-white font-body">{formatDate(contractData.end_date)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Ngày tạo:</span>
              <span className="text-white font-body">{formatDate(contractData.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Cập nhật lần cuối:</span>
              <span className="text-white font-body">{formatDate(contractData.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theater Information */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center font-heading">
          <Building size={20} className="text-orange-400 mr-2" />
          Phân Công Rạp Chiếu
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 font-body">Tên rạp:</span>
            <span className="text-white font-body">
              {theater?.result?.name || contractData.theater_name || 'Chưa được phân công'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-body">Địa chỉ:</span>
            <span className="text-white flex items-center font-body">
              {theater?.result?.address || contractData.theater_location || 'Chưa xác định'}
              {(theater?.result?.address || contractData.theater_location) && (
                <MapPin size={14} className="ml-2 text-slate-400" />
              )}
            </span>
          </div>
          {theater?.result?.city && theater?.result?.state && (
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Thành phố/Tỉnh:</span>
              <span className="text-white font-body">
                {theater.result.city}, {theater.result.state}
              </span>
            </div>
          )}
          {theater?.result?.pincode && (
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Mã bưu điện:</span>
              <span className="text-white font-body">{theater.result.pincode}</span>
            </div>
          )}
          {theater?.result?.screens !== undefined && (
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Số lượng màn hình:</span>
              <span className="text-white font-body">{theater.result.screens}</span>
            </div>
          )}
          {theater?.result?.description && (
            <div className="flex justify-between">
              <span className="text-slate-400 font-body">Mô tả:</span>
              <span className="text-white font-body">{theater.result.description}</span>
            </div>
          )}
          {theater?.result?.amenities && theater.result.amenities.length > 0 && (
            <div className="mt-4">
              <span className="text-slate-400 block mb-2 font-body">Tiện ích:</span>
              <div className="flex flex-wrap gap-2">
                {theater.result.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-md text-sm font-body"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      {contractData.terms && (
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center font-heading">
            <FileText size={20} className="text-orange-400 mr-2" />
            Điều Khoản & Điều Kiện
          </h2>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <p className="text-slate-300 leading-relaxed font-body">{contractData.terms}</p>
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {contractData.responsibilities && contractData.responsibilities.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 font-heading">Trách Nhiệm</h2>
          <ul className="space-y-2">
            {contractData.responsibilities.map((responsibility, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 font-body">{responsibility}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {contractData.benefits && contractData.benefits.length > 0 && (
        <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4 font-heading">Quyền Lợi</h2>
          <ul className="space-y-2">
            {contractData.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 font-body">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Admin Contact */}
      <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center font-heading">
          <User size={20} className="text-orange-400 mr-2" />
          Liên Hệ Quản Trị Viên
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 font-body">Tên quản trị viên:</span>
            <span className="text-white font-body">{contractData.admin.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-body">Email quản trị viên:</span>
            <span className="text-white flex items-center font-body">
              {contractData.admin.email}
              <Mail size={14} className="ml-2 text-slate-400" />
            </span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchContractDetails}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <Clock size={18} />
          <span className='font-body'>Làm Mới Thông Tin Hợp Đồng</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ContractDetails;
