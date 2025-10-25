import { FiX } from "react-icons/fi";
import { getRedirectPathByRole, useAuthStore } from "../../store/useAuthStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// Register modal is controlled by parent (Navbar). Do not render it from here.

const EyeOpenIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M16 8C7.664063 8 1.25 15.34375 1.25 15.34375L0.65625 16L1.25 16.65625C1.25 16.65625 7.097656 23.324219 14.875 23.9375C15.246094 23.984375 15.617188 24 16 24C16.382813 24 16.753906 23.984375 17.125 23.9375C24.902344 23.324219 30.75 16.65625 30.75 16.65625L31.34375 16L30.75 15.34375C30.75 15.34375 24.335938 8 16 8ZM16 10C18.203125 10 20.234375 10.601563 22 11.40625C22.636719 12.460938 23 13.675781 23 15C23 18.613281 20.289063 21.582031 16.78125 21.96875C16.761719 21.972656 16.738281 21.964844 16.71875 21.96875C16.480469 21.980469 16.242188 22 16 22C15.734375 22 15.476563 21.984375 15.21875 21.96875C11.710938 21.582031 9 18.613281 9 15C9 13.695313 9.351563 12.480469 9.96875 11.4375L9.9375 11.4375C11.71875 10.617188 13.773438 10 16 10ZM16 12C14.34375 12 13 13.34375 13 15C13 16.65625 14.34375 18 16 18C17.65625 18 19 16.65625 19 15C19 13.34375 17.65625 12 16 12ZM7.25 12.9375C7.09375 13.609375 7 14.285156 7 15C7 16.753906 7.5 18.394531 8.375 19.78125C5.855469 18.324219 4.105469 16.585938 3.53125 16C4.011719 15.507813 5.351563 14.203125 7.25 12.9375ZM24.75 12.9375C26.648438 14.203125 27.988281 15.507813 28.46875 16C27.894531 16.585938 26.144531 18.324219 23.625 19.78125C24.5 18.394531 25 16.753906 25 15C25 14.285156 24.90625 13.601563 24.75 12.9375Z"
      fill="currentColor"
    />
  </svg>
);

const EyeClosedIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20 14.8335C21.3082 13.3317 22 12 22 12C22 12 18.3636 5 12 5C11.6588 5 11.3254 5.02013 11 5.05822C10.6578 5.09828 10.3244 5.15822 10 5.23552M12 9C12.3506 9 12.6872 9.06015 13 9.17071C13.8524 9.47199 14.528 10.1476 14.8293 11C14.9398 11.3128 15 11.6494 15 12M3 3L21 21M12 15C11.6494 15 11.3128 14.9398 11 14.8293C10.1476 14.528 9.47198 13.8524 9.1707 13C9.11386 12.8392 9.07034 12.6721 9.04147 12.5M4.14701 9C3.83877 9.34451 3.56234 9.68241 3.31864 10C2.45286 11.1282 2 12 2 12C2 12 5.63636 19 12 19C12.3412 19 12.6746 18.9799 13 18.9418"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface LoginModalProps {
  isFormOpen: (value: boolean) => void;
  // Called when user wants to switch from Login -> Register. Parent should close login and open register.
  onSwitchToRegister?: () => void;
}

const LoginModal = ({ isFormOpen, onSwitchToRegister }: LoginModalProps) => {
  const { login, error } = useAuthStore();
  const navigate = useNavigate();
  // Local loading state for better control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // Add state to track if user is selecting text
  const [isSelecting, setIsSelecting] = useState(false);

  const getGoogleAuthUrl = () => {
    const url = "https://accounts.google.com/o/oauth2/auth";
    const query = {
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      prompt: "consent",
      access_type: "offline",
    };
    const queryString = new URLSearchParams(query).toString();
    return `${url}?${queryString}`;
  };

  const googleOAuthUrl = getGoogleAuthUrl();

  // Login form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear form and errors when component mounts
  useEffect(() => {
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Function to handle blur events - auto trim spaces
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only trim email field, not password
    if (name === "email") {
      setFormData({
        ...formData,
        [name]: value.trim().toLowerCase(),
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate email
    const trimmedEmail = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Email là bắt buộc";
    } else if (/^\s|\s$/.test(formData.email)) {
      newErrors.email = "Email không được bắt đầu hoặc kết thúc bằng khoảng trắng";
    } else if (/\s/.test(trimmedEmail)) {
      newErrors.email = "Email không được chứa khoảng trắng";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email =
        "Vui lòng nhập địa chỉ email hợp lệ (ví dụ: user@example.com)";
    } else if (trimmedEmail.length > 254) {
      newErrors.email = "Email quá dài";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (/^\s|\s$/.test(formData.password)) {
      newErrors.password = "Mật khẩu không được bắt đầu hoặc kết thúc bằng khoảng trắng";
    } else if (formData.password.length < 1) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng sửa các lỗi trong biểu mẫu trước khi gửi");
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await login(formData);

      if (success) {
        toast.success("Đăng nhập thành công!");
        // Get user from store after successful login
        isFormOpen(false);
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          const redirectPath = getRedirectPathByRole(currentUser.role);
          setTimeout(() => {
            navigate(redirectPath);
          }, 1500);
        } else {
          // Fallback to default home if user data is not available
          setTimeout(() => {
            navigate("/home");
          }, 1500);
        }
      } else {
        // Handle specific error messages from API
        const errorMessage = error || "Đăng nhập thất bại";
        if (
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("user not found")
        ) {
          setErrors({ email: "Email không tồn tại hoặc không hợp lệ" });
          toast.error("Email không tồn tại hoặc không hợp lệ");
        } else if (
          errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("incorrect")
        ) {
          setErrors({ password: "Mật khẩu không chính xác" });
          toast.error("Mật khẩu không chính xác");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Đã xảy ra lỗi không mong muốn";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle overlay click - only close when clicking directly on overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't close if user is selecting text
    if (isSelecting) {
      setIsSelecting(false);
      return;
    }
    
    // Only close if clicking directly on the overlay background
    if (e.target === e.currentTarget) {
      isFormOpen(false);
    }
  };

  // Handle mouse down to track selection start
  const handleMouseDown = () => {
    setIsSelecting(false);
  };

  // Handle mouse move to detect text selection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) { // Left mouse button is pressed
      setIsSelecting(true);
    }
  };

  return (
    <div className="">
      <div
        className="fixed inset-0 bg-black/50 background-blur-sm z-50 
        flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-300">Đăng nhập</h1>

            <button onClick={() => isFormOpen(false)}>
              <FiX className="w-5 h-5 text-gray-300 font-extrabold" />
            </button>
          </div>

          {/* Input Forms */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email của bạn"
                className={`w-full px-4 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-600"
                } rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-700 text-white`}
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.email}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="Password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Mật khẩu của bạn"
                  className={`w-full px-4 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-700 text-white pr-10`}
                  onChange={handleChange}
                  value={formData.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white focus:outline-none"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end text-xs pb-3">
              <p className="cursor-pointer hover:text-primary hover:underline transition">
                Quên mật khẩu?
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600
              hover:from-red-600 hover:to-pink-600 transition-all duration-300 rounded-lg
              shadow-md hover:shadow-lg hover:shadow-primary/15"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-sm text-gray-400">hoặc</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => (window.location.href = googleOAuthUrl)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white
                         hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200
                         shadow-sm hover:shadow-md group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Đăng nhập bằng Google</span>
              </button>
            </div>
            <p className="text-center text-sm text-gray-300">
              Chưa có tài khoản?{" "}
              <span
                className="cursor-pointer text-red-400 hover:text-red-300 hover:underline transition"
                onClick={() => {
                  // ask parent to switch to register modal
                  if (onSwitchToRegister) onSwitchToRegister();
                }}
              >
                Đăng ký
              </span>{" "}
            </p>
          </form>
        </div>
      </div>
      {/* Register modal should be rendered by the parent so only one modal shows at a time */}
    </div>
  );
};

export default LoginModal;
