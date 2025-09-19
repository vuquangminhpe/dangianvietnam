import { FiX } from "react-icons/fi";
import { getRedirectPathByRole, useAuthStore} from "../../store/useAuthStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import RegisterModal from "./RegisterModal";

interface LoginModalProps {
  isFormOpen: (value: boolean) => void;
}

const LoginModal = ({ isFormOpen }: LoginModalProps) => {
  const { login, error} = useAuthStore();
  const navigate = useNavigate();
  // Local loading state for better control
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state to switch between login and register
  const [showRegisterModal, setShowRegisterModal] = useState(false);


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
    if (name === 'email') {
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
      newErrors.email = "Please enter a valid email address (e.g., user@example.com)";
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
