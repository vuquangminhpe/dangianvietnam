import { FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

interface RegisterModalProps {
  isFormOpen: (value: boolean) => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isFormOpen, onSwitchToLogin }: RegisterModalProps) => {
  const navigate = useNavigate();
  const { register, error } = useAuthStore();

  // Local loading state for better control
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state to track if user is selecting text
  const [isSelecting, setIsSelecting] = useState(false);

  // Registration form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear form and errors when component mounts
  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    });
    setErrors({});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle regular fields
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

  // Function to handle blur events - auto trim spaces for text fields
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only trim text fields, not password fields
    if (name !== "password" && name !== "confirm_password") {
      const trimmedValue = value.trim();
      setFormData({
        ...formData,
        [name]: trimmedValue,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (trimmedName.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    } else if (
      !/^[a-zA-ZÀ-ÿĂăÂâÊêÔôƠơƯưĐđàáảãạầấẩẫậằắẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ\s]+$/.test(
        trimmedName
      )
    ) {
      newErrors.name = "Name can only contain letters and spaces";
    } else if (/\s{2,}/.test(trimmedName)) {
      newErrors.name = "Name cannot contain multiple consecutive spaces";
    }

    // Validate email
    const trimmedEmail = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (/\s/.test(trimmedEmail)) {
      newErrors.email = "Email cannot contain spaces";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email =
        "Please enter a valid email address (e.g., user@example.com)";
    } else if (trimmedEmail.length > 254) {
      newErrors.email = "Email is too long";
    }

    // Validate password
    const password = formData.password;
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (password.length > 50) {
      newErrors.password = "Password must be less than 50 characters";
    }

    // Validate password confirmation
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = validateForm();

    if (!validationResult) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create request data with only basic info
      const registerData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        // Add optional fields as empty/default values
        date_of_birth: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
        phone: "",
      };
      
      const success = await register(registerData);

      if (success) {
        toast.success(
          "Registration successful! Check your email for verification code."
        );
        isFormOpen(false);
        // Navigate to verify page with email parameter
        setTimeout(() => {
          navigate(`/verify?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
      } else {
        const errorMessage = error || "Registration failed";
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-300">Create Account</h1>
            <button onClick={() => isFormOpen(false)}>
              <FiX className="w-5 h-5 text-gray-300 font-extrabold" />
            </button>
          </div>

          {/* Input Forms */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Registration Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Password must be 6-50 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-2 border ${
                    errors.confirm_password
                      ? "border-red-500"
                      : "border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirm_password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600
                  hover:from-red-600 hover:to-pink-600 transition-all duration-300 rounded-lg
                  shadow-md hover:shadow-lg hover:shadow-primary/15"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <p className="text-center text-sm text-gray-300">
              Already have an account?{" "}
              <span
                className="cursor-pointer text-red-400 hover:text-red-300 hover:underline transition"
                onClick={onSwitchToLogin}
              >
                Sign in
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
