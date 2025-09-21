import { FiX } from "react-icons/fi";
import { getRedirectPathByRole, useAuthStore } from "../../store/useAuthStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import RegisterModal from "./RegisterModal";

interface LoginModalProps {
  isFormOpen: (value: boolean) => void;
}

const LoginModal = ({ isFormOpen }: LoginModalProps) => {
  const { login, error } = useAuthStore();
  const navigate = useNavigate();
  // Local loading state for better control
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state to switch between login and register
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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
      newErrors.email = "Email is required";
    } else if (/^\s|\s$/.test(formData.email)) {
      newErrors.email = "Email cannot start or end with spaces";
    } else if (/\s/.test(trimmedEmail)) {
      newErrors.email = "Email cannot contain spaces";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email =
        "Please enter a valid email address (e.g., user@example.com)";
    } else if (trimmedEmail.length > 254) {
      newErrors.email = "Email is too long";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (/^\s|\s$/.test(formData.password)) {
      newErrors.password = "Password cannot start or end with spaces";
    } else if (formData.password.length < 1) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await login(formData);

      if (success) {
        toast.success("Login successful!");
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
        const errorMessage = error || "Login failed";
        if (
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("user not found")
        ) {
          setErrors({ email: "Email not found or invalid" });
          toast.error("Email not found or invalid");
        } else if (
          errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("incorrect")
        ) {
          setErrors({ password: "Incorrect password" });
          toast.error("Incorrect password");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <div
        className="fixed inset-0 bg-black/50 background-blur-sm z-50 
        flex items-center justify-center p-4"
        onClick={() => isFormOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-300">Get In Touch</h1>

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
                placeholder="Your Email"
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
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Your Password"
                className={`w-full px-4 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-600"
                } rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-700 text-white`}
                onChange={handleChange}
                value={formData.password}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end text-xs pb-3">
              <p className="cursor-pointer hover:text-primary hover:underline transition">
                Forgot password?
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600
              hover:from-red-600 hover:to-pink-600 transition-all duration-300 rounded-lg
              shadow-md hover:shadow-lg hover:shadow-primary/15"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
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
                <span className="text-gray-700 font-medium">Đăng nhập với Google</span>
              </button>
            </div>
            <p className="text-center text-sm text-gray-300">
              Don't have account?{" "}
              <span
                className="cursor-pointer text-red-400 hover:text-red-300 hover:underline transition"
                onClick={() => setShowRegisterModal(true)}
              >
                Register
              </span>{" "}
            </p>
          </form>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          isFormOpen={setShowRegisterModal}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            // Keep login modal open
          }}
        />
      )}
    </div>
  );
};

export default LoginModal;
