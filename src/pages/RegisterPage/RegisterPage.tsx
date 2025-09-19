import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../store/useAuthStore";
// Import icons for cinema theme
import {
  Ticket,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error } = useAuthStore();

  // Local loading state for better control
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step state for multi-step form (0: basic info, 1: address info)
  const [currentStep, setCurrentStep] = useState(0);

  // Registration form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    date_of_birth: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
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
      date_of_birth: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
    });
    setErrors({});
    setCurrentStep(0);
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle address fields
    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      // Handle regular fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }

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

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Validate password confirmation
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Validate date of birth
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }

    // Validate phone
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    // Validate address fields
    if (!formData.address.street) {
      newErrors["address.street"] = "Street is required";
    }

    if (!formData.address.city) {
      newErrors["address.city"] = "City is required";
    }

    if (!formData.address.country) {
      newErrors["address.country"] = "Country is required";
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
      const success = await register(formData);

      if (success) {
        toast.success(
          "Registration successful! Check your email for verification code."
        );
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
  }; // Function to handle next step
  const handleNextStep = () => {
    // Validate first step fields before proceeding
    if (currentStep === 0) {
      const basicInfoErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        basicInfoErrors.name = "Name is required";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        basicInfoErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        basicInfoErrors.email = "Invalid email format";
      }

      if (!formData.password) {
        basicInfoErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        basicInfoErrors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.confirm_password) {
        basicInfoErrors.confirm_password = "Passwords do not match";
      }

      if (Object.keys(basicInfoErrors).length > 0) {
        setErrors(basicInfoErrors);
        toast.error("Please fix the errors before proceeding");
        return;
      }

      // Clear any existing errors if validation passes
      setErrors({});
    }

    setCurrentStep(1);
  };

  // Function to go back to previous step
  const handlePreviousStep = () => {
    setCurrentStep(0);
    // Clear errors when going back
    setErrors({});
  };
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 flex justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg text-white my-4">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Ticket size={40} className="text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-orange-400">Cinema Connect</h1>
          <p className="mt-2 text-gray-300">
            Sign up to book your favorite movies!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step indicator */}
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 0 ? "bg-orange-500" : "bg-gray-600"
                } text-white`}
              >
                1
              </div>
              <span className="ml-2 text-sm">Basic Info</span>
            </div>
            <div className="flex-grow border-t border-gray-600 mx-4 my-4"></div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 1 ? "bg-orange-500" : "bg-gray-600"
                } text-white`}
              >
                2
              </div>
              <span className="ml-2 text-sm">Contact Info</span>
            </div>
          </div>
          {currentStep === 0 ? (
            // Step 1: Basic Information
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-200"
                >
                  Full Name
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 block w-full px-3 py-2 border ${
                      errors.name ? "border-red-500" : "border-gray-600"
                    } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-200"
                >
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`pl-10 block w-full px-3 py-2 border ${
                      errors.confirm_password
                        ? "border-red-500"
                        : "border-gray-600"
                    } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirm_password}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex justify-center items-center py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Next <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Contact Information
            <div className="space-y-4">
              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="date_of_birth"
                  className="block text-sm font-medium text-gray-200"
                >
                  Date of Birth
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border ${
                      errors["date_of_birth"]
                        ? "border-red-500"
                        : "border-gray-600"
                    } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                  />
                </div>
                {errors["date_of_birth"] && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors["date_of_birth"]}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-200"
                >
                  Phone Number
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 block w-full px-3 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-600"
                    } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>

              {/* Street */}
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-200"
                >
                  Street
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <MapPin size={18} />
                  </span>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`pl-10 block w-full px-3 py-2 border ${
                      errors["address.street"]
                        ? "border-red-500"
                        : "border-gray-600"
                    } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                    placeholder="Enter your street address"
                  />
                </div>
                {errors["address.street"] && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors["address.street"]}
                  </p>
                )}
              </div>

              {/* City and State in a row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-200"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors["address.city"]
                        ? "border-red-500"
                        : "border-gray-600"
                    } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                    placeholder="City"
                  />
                  {errors["address.city"] && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors["address.city"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-200"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white"
                    placeholder="State"
                  />
                </div>
              </div>

              {/* Country and Zip Code in a row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-200"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors["address.country"]
                        ? "border-red-500"
                        : "border-gray-600"
                    } bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white`}
                    placeholder="Country"
                  />
                  {errors["address.country"] && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors["address.country"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-200"
                  >
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-white"
                    placeholder="Zip code"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  className="w-1/3 flex justify-center items-center py-2 px-4 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back
                </Button>{" "}
                <Button
                  type="submit"
                  className="w-2/3 flex justify-center py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Complete Registration"}
                </Button>
              </div>
            </div>
          )}{" "}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
                className="font-medium text-orange-400 hover:text-orange-300 bg-transparent border-none cursor-pointer p-0"
              >
                Sign in
              </button>{" "}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
