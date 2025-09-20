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

  // Step state for multi-step form (0: basic info, 1: contact info)
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

  // Function to handle blur events - auto trim spaces for text fields
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Only trim text fields, not password fields
    if (name !== "password" && name !== "confirm_password") {
      const trimmedValue = value.trim();

      if (name.includes("address.")) {
        const addressField = name.split(".")[1];
        setFormData({
          ...formData,
          address: {
            ...formData.address,
            [addressField]: trimmedValue,
          },
        });
      } else {
        setFormData({
          ...formData,
          [name]: trimmedValue,
        });
      }
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
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (password.length > 128) {
      newErrors.password = "Password must be less than 128 characters";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    // Validate password confirmation
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Validate date of birth
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (birthDate > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      } else if (age < 13 || (age === 13 && monthDiff < 0)) {
        newErrors.date_of_birth =
          "You must be at least 13 years old to register";
      } else if (age > 120) {
        newErrors.date_of_birth = "Please enter a valid date of birth";
      }
    }

    // Validate phone
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(trimmedPhone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
    }

    // Validate address fields
    const trimmedStreet = formData.address.street.trim();
    if (!trimmedStreet) {
      newErrors["address.street"] = "Street address is required";
    } else if (trimmedStreet.length < 5) {
      newErrors["address.street"] =
        "Street address must be at least 5 characters long";
    } else if (trimmedStreet.length > 100) {
      newErrors["address.street"] = "Street address is too long";
    }

    const trimmedCity = formData.address.city.trim();
    if (!trimmedCity) {
      newErrors["address.city"] = "City is required";
    } else if (
      !/^[a-zA-ZÀ-ÿĂăÂâÊêÔôƠơƯưĐđàáảãạầấẩẫậằắẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ\s\-\.]+$/.test(
        trimmedCity
      )
    ) {
      newErrors["address.city"] =
        "City can only contain letters, spaces, hyphens, and periods";
    } else if (trimmedCity.length < 2) {
      newErrors["address.city"] =
        "City name must be at least 2 characters long";
    }

    const trimmedCountry = formData.address.country.trim();
    if (!trimmedCountry) {
      newErrors["address.country"] = "Country is required";
    } else if (
      !/^[a-zA-ZÀ-ÿĂăÂâÊêÔôƠơƯưĐđàáảãạầấẩẫậằắẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ\s\-\.]+$/.test(
        trimmedCountry
      )
    ) {
      newErrors["address.country"] =
        "Country can only contain letters, spaces, hyphens, and periods";
    } else if (trimmedCountry.length < 2) {
      newErrors["address.country"] =
        "Country name must be at least 2 characters long";
    }

    // Validate state (optional but if provided, should be valid)
    const trimmedState = formData.address.state.trim();
    if (
      trimmedState &&
      trimmedState.length > 0 &&
      !/^[a-zA-ZÀ-ÿĂăÂâÊêÔôƠơƯưĐđàáảãạầấẩẫậằắẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ\s\-\.]+$/.test(
        trimmedState
      )
    ) {
      newErrors["address.state"] =
        "State can only contain letters, spaces, hyphens, and periods";
    }

    // Validate zip code (optional but if provided, should be valid)
    const trimmedZipCode = formData.address.zipCode.trim();
    if (
      trimmedZipCode &&
      trimmedZipCode.length > 0 &&
      !/^[a-zA-Z0-9\s\-]{3,10}$/.test(trimmedZipCode)
    ) {
      newErrors["address.zipCode"] = "Please enter a valid zip code";
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
      const success = await register(formData);

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

  // Function to handle next step
  const handleNextStep = () => {
    // Validate first step fields before proceeding
    if (currentStep === 0) {
      const basicInfoErrors: Record<string, string> = {};

      // Validate name
      const trimmedName = formData.name.trim();
      if (!trimmedName) {
        basicInfoErrors.name = "Name is required";
      } else if (trimmedName.length < 2) {
        basicInfoErrors.name = "Name must be at least 2 characters long";
      } else if (trimmedName.length > 50) {
        basicInfoErrors.name = "Name must be less than 50 characters";
      } else if (
        !/^[a-zA-ZÀ-ÿĂăÂâÊêÔôƠơƯưĐđàáảãạầấẩẫậằắẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ\s]+$/.test(
          trimmedName
        )
      ) {
        basicInfoErrors.name = "Name can only contain letters and spaces";
      } else if (/\s{2,}/.test(trimmedName)) {
        basicInfoErrors.name =
          "Name cannot contain multiple consecutive spaces";
      }

      // Validate email
      const trimmedEmail = formData.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail) {
        basicInfoErrors.email = "Email is required";
      } else if (/\s/.test(trimmedEmail)) {
        basicInfoErrors.email = "Email cannot contain spaces";
      } else if (!emailRegex.test(trimmedEmail)) {
        basicInfoErrors.email =
          "Please enter a valid email address (e.g., user@example.com)";
      } else if (trimmedEmail.length > 254) {
        basicInfoErrors.email = "Email is too long";
      }

      // Validate password
      const password = formData.password;
      if (!password) {
        basicInfoErrors.password = "Password is required";
      } else if (password.length < 8) {
        basicInfoErrors.password =
          "Password must be at least 8 characters long";
      } else if (password.length > 128) {
        basicInfoErrors.password = "Password must be less than 128 characters";
      } else if (!/(?=.*[a-z])/.test(password)) {
        basicInfoErrors.password =
          "Password must contain at least one lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(password)) {
        basicInfoErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!/(?=.*\d)/.test(password)) {
        basicInfoErrors.password = "Password must contain at least one number";
      } else if (
        !/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)
      ) {
        basicInfoErrors.password =
          "Password must contain at least one special character";
      }

      // Validate password confirmation
      if (!formData.confirm_password) {
        basicInfoErrors.confirm_password = "Please confirm your password";
      } else if (formData.password !== formData.confirm_password) {
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
    <div className="">
      <div
        className="fixed inset-0 bg-black/50 background-blur-sm z-50 
        flex items-center justify-center p-4"
        onClick={() => isFormOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-300">Join Us Now</h1>
            <button onClick={() => isFormOpen(false)}>
              <FiX className="w-5 h-5 text-gray-300 font-extrabold" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                  currentStep === 0
                    ? "bg-red-500 text-white"
                    : "bg-gray-600 text-white"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-xs text-gray-300">Basic Info</span>
            </div>
            <div className="flex-grow border-t border-gray-600 mx-2 my-3"></div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                  currentStep === 1
                    ? "bg-red-500 text-white"
                    : "bg-gray-600 text-white"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-xs text-gray-300">Contact Info</span>
            </div>
          </div>

          {/* Input Forms */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {currentStep === 0 ? (
              // Step 1: Basic Information
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Full Name
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
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
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
                    Password
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Confirm Password
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
                  type="button"
                  onClick={handleNextStep}
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600
                    hover:from-red-600 hover:to-pink-600 transition-all duration-300 rounded-lg
                    shadow-md hover:shadow-lg hover:shadow-primary/15"
                >
                  Next →
                </button>
              </div>
            ) : (
              // Step 2: Contact Information
              <div className="space-y-4">
                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.date_of_birth
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.date_of_birth}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-2 border ${
                      errors.phone ? "border-red-500" : "border-gray-600"
                    } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Street */}
                <div>
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Enter your street address"
                    className={`w-full px-4 py-2 border ${
                      errors["address.street"]
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                  />
                  {errors["address.street"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["address.street"]}
                    </p>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City"
                      className={`w-full px-4 py-2 border ${
                        errors["address.city"]
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                    />
                    {errors["address.city"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["address.city"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="State"
                      className={`w-full px-4 py-2 border ${
                        errors["address.state"]
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                    />
                    {errors["address.state"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["address.state"]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country and Zip Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className={`w-full px-4 py-2 border ${
                        errors["address.country"]
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                    />
                    {errors["address.country"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["address.country"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Zip Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Zip code"
                      className={`w-full px-4 py-2 border ${
                        errors["address.zipCode"]
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white`}
                    />
                    {errors["address.zipCode"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["address.zipCode"]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="w-1/3 px-4 py-2 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent rounded-lg transition-all duration-300"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600
                      hover:from-red-600 hover:to-pink-600 transition-all duration-300 rounded-lg
                      shadow-md hover:shadow-lg hover:shadow-primary/15"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </div>
            )}

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
