import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiEdit3,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiSave,
  FiX,
  FiLock,
} from "react-icons/fi";
import { useAuthStore } from "../../store/useAuthStore";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../../apis/user.api";
import mediasApi from "../../apis/medias.api";
import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../../types/User.type";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(authUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });

  // Password form states
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  // Load user profile function
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      setUser(response.result);
      updateUser(response.result); // Update auth store
      // Initialize form data with current user data
      setFormData({
        name: response.result.name || "",
        username: response.result.username || "",
        bio: response.result.bio || "",
        location: response.result.location || "",
        website: response.result.website || "",
        phone: response.result.phone || "",
        address: response.result.address || {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load user profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setAvatarLoading(true);
      const response = await mediasApi.uploadImages(file);
      const imageUrl = response.data.result[0].url;

      // Update profile with new avatar
      await updateUserProfile({ avatar: imageUrl });

      // Reload profile to get latest data
      await loadProfile();

      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload avatar"
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    field: keyof UpdateProfileRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle address input changes
  const handleAddressChange = (
    field: keyof NonNullable<UpdateProfileRequest["address"]>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value,
      },
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (
    field: keyof ChangePasswordRequest,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setPasswordLoading(true);
      await changeUserPassword(passwordData);
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });
      setIsChangingPassword(false);
      toast.success("Password changed successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Cancel password change
  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      old_password: "",
      new_password: "",
      confirm_new_password: "",
    });
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateUserProfile(formData);

      // Reload profile to get latest data
      await loadProfile();

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        phone: user.phone || "",
        address: user.address || {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
      });
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900">Loading profile...</div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setIsEditing(true);
    const element = document.getElementById("information");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToChangePass = () => {
    setIsChangingPassword(true);
    const element = document.getElementById("changePassword");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Background Elements - matching MovieDetailPage design */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-100/30 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 px-6 md:px-16 lg:px-24 xl:px-44 pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8" style={{ backgroundColor: '#730109' }}>
            <div className="md:flex md:flex-row flex-col items-center justify-between gap-3">
              <h1 className="text-3xl font-bold text-white">My Profile</h1>
              {!isEditing ? (
                <div className="flex gap-3 mt-3">
                  <motion.button
                    onClick={scrollToChangePass}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 
                      text-white rounded-lg transition-all font-medium backdrop-blur-sm"
                  >
                    <FiLock className="w-4 h-4" />
                    Change Password
                  </motion.button>
                  <motion.button
                    onClick={handleEditProfile}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 
                      text-white rounded-lg transition-all font-medium backdrop-blur-sm"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <motion.button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                      text-white rounded-lg transition-all disabled:opacity-50 font-medium"
                  >
                    <FiSave className="w-4 h-4" />
                    {loading ? "Saving..." : "Save"}
                  </motion.button>
                  <motion.button
                    onClick={handleCancelEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                      text-white rounded-lg transition-all font-medium"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Section */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-2xl">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-16 h-16 text-gray-400" />
                  )}
                </div>                  {/* Avatar Upload Button */}
                  <label
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-[#F84565] to-[#D63854] hover:from-[#D63854] hover:to-[#F84565] 
                    p-2 rounded-full cursor-pointer transition-all transform hover:scale-110 shadow-lg"
                  >
                    <FiCamera className="w-4 h-4 text-[#730109]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={avatarLoading}
                    />
                  </label>

                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <div className="text-white text-sm animate-pulse">
                        Uploading...
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.name}
                  </h2>
                  <p className="text-white capitalize font-medium px-3 py-1 rounded-full text-sm mt-2" style={{ backgroundColor: '#730109' }}>
                    {user?.role}
                  </p>
                </div>
              </motion.div>

              {/* Profile Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
                id="information"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Basic Information
                    </h3>

                    {/* Name */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                            focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-800 bg-gray-50 p-3 rounded-lg">
                          <FiUser className="w-4 h-4 text-[#730109]" />
                          {user?.name || "Not provided"}
                        </div>
                      )}
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Username
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            handleInputChange("username", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                            focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                        />
                      ) : (
                        <div className="text-gray-800 font-medium bg-gray-50 p-3 rounded-lg">
                          @{user?.username || "Not set"}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Email
                      </label>
                      <div className="flex items-center gap-2 text-gray-800 bg-gray-50 p-3 rounded-lg">
                        <FiMail className="w-4 h-4 text-[#730109]" />
                        {user?.email}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                            focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-800 bg-gray-50 p-3 rounded-lg">
                          <FiPhone className="w-4 h-4 text-[#730109]" />
                          {user?.phone || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Additional Information
                    </h3>

                    {/* Bio */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                            focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <div className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                          {user?.bio || "No bio provided"}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                            focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                          placeholder="e.g., New York, USA"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-800 bg-gray-50 p-3 rounded-lg">
                          <FiMapPin className="w-4 h-4 text-[#730109]" />
                          {user?.location || "Not provided"}
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            handleInputChange("website", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                            focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                          placeholder="https://example.com"
                        />
                      ) : (
                        <div className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                          {user?.website ? (
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#730109] hover:text-[#5a0a0d] hover:underline transition-colors"
                            >
                              {user.website}
                            </a>
                          ) : (
                            "Not provided"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Street"
                        value={formData.address?.street || ""}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        className="px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                          focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.address?.city || ""}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        className="px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                          focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.address?.state || ""}
                        onChange={(e) =>
                          handleAddressChange("state", e.target.value)
                        }
                        className="px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                          focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={formData.address?.country || ""}
                        onChange={(e) =>
                          handleAddressChange("country", e.target.value)
                        }
                        className="px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                          focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={formData.address?.zipCode || ""}
                        onChange={(e) =>
                          handleAddressChange("zipCode", e.target.value)
                        }
                        className="px-3 py-2 bg-gray-50 text-gray-900 rounded-lg 
                          focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Password Change Section */}
                <div id="changePassword">
                  {isChangingPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Change Password
                          </h3>
                          <button
                            onClick={handleCancelPasswordChange}
                            className="text-white transition-colors"
                            style={{ backgroundColor: '#730109' }}
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm mb-2 font-medium">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.old_password}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "old_password",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg 
                              focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                              placeholder="Enter your current password"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm mb-2 font-medium">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.new_password}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "new_password",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg 
                              focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                              placeholder="Enter your new password"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm mb-2 font-medium">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.confirm_new_password}
                              onChange={(e) =>
                                handlePasswordChange(
                                  "confirm_new_password",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg 
                              focus:ring-2 focus:ring-purple-500 border border-gray-300 transition-all"
                              placeholder="Confirm your new password"
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <motion.button
                              onClick={handleChangePassword}
                              disabled={passwordLoading}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all 
                              disabled:opacity-50 font-medium"
                              style={{ backgroundColor: '#730109' }}
                            >
                              <FiLock className="w-4 h-4" />
                              {passwordLoading
                                ? "Changing..."
                                : "Change Password"}
                            </motion.button>
                            <motion.button
                              onClick={handleCancelPasswordChange}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg 
                              transition-all font-medium"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
