import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuthStore, getRedirectPathByRole } from "../../store/useAuthStore";
// Import icons for cinema theme
import { Ticket, Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error } = useAuthStore();

  // Local loading state for better control
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate password
    if (!formData.password) {
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
        toast.success("Login successful! Redirecting...");
        // Get user from store after successful login
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 flex justify-center bg-gray-900 min-h-[calc(100vh-140px)]">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg text-white my-4 h-fit">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Ticket size={40} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-orange-400">Cinema Connect</h1>
          <p className="mt-2 text-gray-300">
            Sign in to book your favorite movies!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200"
            >
              Email
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-600"
                } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200"
            >
              Password
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 block w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-600"
                } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                placeholder="Enter your password"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>
          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              Forgot password?
            </a>
          </div>
          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-300">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
                className="font-medium text-orange-400 hover:text-orange-300 bg-transparent border-none cursor-pointer p-0"
              >
                Sign up
              </button>
            </p>
          </div>{" "}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
