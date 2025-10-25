import { FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

interface RegisterModalProps {
  isFormOpen: (value: boolean) => void;
  onSwitchToLogin: () => void;
}

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

const RegisterModal = ({ isFormOpen, onSwitchToLogin }: RegisterModalProps) => {
  const navigate = useNavigate();
  const { register, error, validationErrors } = useAuthStore();

  // Local loading state for better control
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      };
      
      const success = await register(registerData);

      if (success) {
        setErrors({});
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
        const latestValidationErrors =
          useAuthStore.getState().validationErrors || validationErrors;

        if (latestValidationErrors && Object.keys(latestValidationErrors).length) {
          const allowedFields = new Set([
            "name",
            "email",
            "password",
            "confirm_password",
          ]);

          const filteredValidationErrors = Object.fromEntries(
            Object.entries(latestValidationErrors).filter(([field]) =>
              allowedFields.has(field)
            )
          );

          if (Object.keys(filteredValidationErrors).length) {
            setErrors((prev) => ({
              ...prev,
              ...filteredValidationErrors,
            }));
          }

          const firstValidationMessage = Object.values(filteredValidationErrors)[0];
          toast.error(firstValidationMessage || errorMessage);
        } else {
          toast.error(errorMessage);
        }
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-600"
                    } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
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
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-2 border ${
                      errors.confirm_password
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white focus:outline-none"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
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
