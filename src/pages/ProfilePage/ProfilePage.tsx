import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiEdit3,
  FiUser,
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
        error instanceof Error ? error.message : "Không thể tải thông tin hồ sơ"
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
      toast.error("Vui lòng chọn một tệp hình ảnh");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh phải nhỏ hơn 5MB");
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

      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Tải ảnh đại diện thất bại"
      );
    } finally {
      setAvatarLoading(false);
    }
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
      toast.error("Mật khẩu mới không trùng khớp");
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
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
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại"
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
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Cập nhật hồ sơ thất bại"
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
        <div className="text-gray-900">Đang tải hồ sơ...</div>
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
              <h1 className="text-3xl font-bold text-white">Hồ sơ của tôi</h1>
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
                    Đổi mật khẩu
                  </motion.button>
                  <motion.button
                    onClick={handleEditProfile}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 
                      text-white rounded-lg transition-all font-medium backdrop-blur-sm"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Chỉnh sửa hồ sơ
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
                    {loading ? "Đang lưu..." : "Lưu"}
                  </motion.button>
                  <motion.button
                    onClick={handleCancelEdit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                      text-white rounded-lg transition-all font-medium"
                  >
                    <FiX className="w-4 h-4" />
                    Hủy
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
                  </div>
                  {/* Avatar Upload Button */}
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
                      <div className="text-white text-sm animate-pulse">Đang tải...</div>
                    </div>
                  )}
                </div>
              </motion.div>

              {isChangingPassword && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 w-full"
                  id="changePassword"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Đổi mật khẩu</h2>
                    <p className="text-gray-500 mt-2">
                      Nhập mật khẩu hiện tại và mật khẩu mới của bạn để tiếp tục
                    </p>

                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          value={passwordData.old_password}
                          onChange={(e) =>
                            handlePasswordChange("old_password", e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#730109]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) =>
                            handlePasswordChange("new_password", e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#730109]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Xác nhận mật khẩu mới
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
                          className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#730109]"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <motion.button
                          onClick={handleChangePassword}
                          disabled={passwordLoading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all disabled:opacity-50 font-medium"
                          style={{ backgroundColor: '#730109' }}
                        >
                          <FiLock className="w-4 h-4" />
                          {passwordLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                        </motion.button>
                        <motion.button
                          onClick={handleCancelPasswordChange}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all font-medium"
                        >
                          Hủy
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
