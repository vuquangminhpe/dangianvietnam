import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';
import { resendOtpCode } from '../../apis/user.api';
import { Mail } from 'lucide-react';
import RegisterModal from '../../components/user/RegisterModal';

const VerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const { verifyOtp, error, tempEmail } = useAuthStore();
  
  // Local loading states for better control
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Clear form on mount
  useEffect(() => {
    setOtpCode('');
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  // If no email is provided in URL or store, redirect to register
  useEffect(() => {
    if (!email && !tempEmail) {
      toast.error('Không tìm thấy email để xác minh. Vui lòng đăng ký trước.');
      navigate('/register');
    }
  }, [email, tempEmail, navigate]);
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 chữ số hợp lệ');
      return;
    }
    
    const emailToUse = email || tempEmail;
    
    if (!emailToUse) {
      toast.error('Thiếu địa chỉ email');
      return;
    }
    
    try {
      setIsVerifying(true);
      toast.loading('Đang xác minh email của bạn...');
      
      const success = await verifyOtp({
        email: emailToUse,
        otpVerify: otpCode
      });
      
      toast.dismiss();
      
      if (success) {
        toast.success('Xác minh email thành công! Tài khoản của bạn đã được tạo.');
        // Delay navigation to allow the user to see the success message
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error) {
        toast.error(error);
        // Clear OTP field for retry
        setOtpCode('');
      }
    } finally {
      setIsVerifying(false);
    }
  };    // Function to resend OTP code
  const handleResendOtp = async () => {
    const emailToUse = email || tempEmail;
    

    if (!emailToUse) {
      toast.error('Thiếu địa chỉ email');
      return;
    }
    
    if (resendCooldown > 0) {
      toast.error(`Vui lòng đợi ${resendCooldown} giây trước khi yêu cầu mã mới`);
      return;
    }
    
    try {
      setIsResending(true);
      toast.loading('Đang gửi mã xác minh mới...');
      await resendOtpCode(emailToUse);
      toast.dismiss();
      toast.success('Mã xác minh mới đã được gửi đến email của bạn');
      setOtpCode(''); // Clear the current OTP input
      setResendCooldown(60); // Set 60-second cooldown
    } catch (error) {
      toast.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'Gửi mã xác minh thất bại';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 flex justify-center items-center bg-[#ffffff] text-[#730109]"
           style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
          
          </div>
          <h1 className="text-3xl font-bold text-[#730109]">Dan Gian</h1>
          <p className="mt-2 text-[#730109]">Xác minh email để hoàn tất đăng ký</p>
        </div>
        
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <Mail size={30} className="text-pink-500" />
            </div>
            <h2 className="text-xl font-medium text-[#730109]">Xác minh email của bạn</h2>
            <p className="mt-2 text-sm text-[#730109]">
              Chúng tôi đã gửi mã 6 chữ số tới {email || tempEmail || 'email của bạn'}.<br />
              Mã có hiệu lực trong 2 phút.
            </p>
          </div>
          
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-[#730109]">
              Nhập mã xác minh
            </label>            <input
              type="text"
              id="otp"
              name="otp"
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setOtpCode(value);
              }}
              placeholder="000000"
              className="mt-1 block w-full px-3 py-2 border border-[#730109] bg-white rounded-md shadow-sm text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#730109] focus:border-[#730109] text-[#730109]"
              autoComplete="one-time-code"
            />
          </div>
            <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-600 transition-all duration-300 rounded-lg shadow-md hover:shadow-lg hover:shadow-pink-500/15 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isVerifying}
            >
              {isVerifying ? 'Đang xác minh...' : 'Xác minh email'}
            </button>
          </div>
            <div className="text-center mt-4 flex items-center justify-center">
            <button 
              type="button"
              onClick={handleResendOtp}
              className={`text-sm flex items-center transition-colors ${
                resendCooldown > 0 || isResending
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-pink-400 hover:text-pink-300'
              }`}
              disabled={isResending || resendCooldown > 0}
            >
              {/* <RefreshCw size={14} className="mr-1" />
              {resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : isResending 
                  ? 'Sending...'
                  : 'Resend verification code'
              } */}
            </button>
          </div>

          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="text-[#730109] hover:text-[#730109]/80 text-sm transition-colors"
            >
              Quay lại đăng ký
            </button>
          </div>        </form>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal 
          isFormOpen={setShowRegisterModal}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            // After closing register modal, user stays on verify page
          }}
        />
      )}
    </div>
  );
};

export default VerifyPage;