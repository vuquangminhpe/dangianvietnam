import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Edit3,
  Plus,
  CheckCircle,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import {
  getMyTheater,
  createTheater,
  updateTheater,
  type TheaterResponse,
  type TheaterCreateRequest,
} from "../../../apis/staff.api";
import { toast } from "sonner";
const TheaterForm = ({
  isEdit = false,
  onSubmit,
  onCancel,
  formData,
  loading,
  availableAmenities,
  handleInputChange,
  handleInputBlur,
  addAmenity,
  removeAmenity,
  amenityInput,
  setAmenityInput,
  formErrors,
  isSubmitting,
}: {
  isEdit?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formData: TheaterCreateRequest;
  loading: boolean;
  availableAmenities: string[];
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleInputBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  addAmenity: (amenity: string) => void;
  removeAmenity: (amenityToRemove: string) => void;
  amenityInput: string;
  setAmenityInput: React.Dispatch<React.SetStateAction<string>>;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
}) => (
  <motion.div
    className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-white flex items-center">
        {isEdit ? (
          <Edit3 size={24} className="mr-2 text-orange-400" />
        ) : (
          <Plus size={24} className="mr-2 text-orange-400" />
    )}
    {isEdit ? "Chỉnh Sửa Thông Tin Rạp" : "Tạo Rạp Mới"}
      </h3>
      <button
        onClick={onCancel}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>
    </div>

    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Tên Rạp
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.name
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
            placeholder="Tên rạp chiếu phim"
            required
          />
          {formErrors.name && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.name}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Khu Vực
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.location
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
            placeholder="Ví dụ: Trung tâm thành phố"
            required
          />
          {formErrors.location && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.location}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Địa Chỉ
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
            formErrors.address
              ? "border-red-500 focus:border-red-400"
              : "border-slate-600 focus:border-orange-500"
          }`}
          placeholder="Ví dụ: 123 Đường Chính"
          required
        />
        {formErrors.address && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {formErrors.address}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Thành Phố
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.city
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
            placeholder="Hà Nội"
            required
          />
          {formErrors.city && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.city}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Tỉnh/Thành
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.state
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
            placeholder="Hà Nội"
            required
          />
          {formErrors.state && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.state}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Mã Bưu Chính
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.pincode
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
            placeholder="8000"
            required
          />
          {formErrors.pincode && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.pincode}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Số Phòng Chiếu
          </label>
          <input
            type="number"
            name="screens"
            value={formData.screens}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min="1"
            max="50"
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.screens
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
            required
          />
          {formErrors.screens && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.screens}
            </p>
          )}
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Số Điện Thoại Liên Hệ
          </label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
              formErrors.contact_phone
                ? "border-red-500 focus:border-red-400"
                : "border-slate-600 focus:border-orange-500"
            }`}
            placeholder="0947679302"
            required
          />
          {formErrors.contact_phone && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {formErrors.contact_phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Email Liên Hệ
        </label>
        <input
          type="email"
          name="contact_email"
          value={formData.contact_email}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
            formErrors.contact_email
              ? "border-red-500 focus:border-red-400"
              : "border-slate-600 focus:border-orange-500"
          }`}
          placeholder="rap@example.com"
          required
        />
        {formErrors.contact_email && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {formErrors.contact_email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Mô Tả
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          rows={3}
          className={`w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-white focus:outline-none transition-colors ${
            formErrors.description
              ? "border-red-500 focus:border-red-400"
              : "border-slate-600 focus:border-orange-500"
          }`}
          placeholder="Mô tả ngắn gọn về rạp..."
          required
        />
        {formErrors.description && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {formErrors.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Tiện Ích
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.amenities.map((amenity, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30 flex items-center"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(amenity)}
                className="ml-2 text-orange-300 hover:text-orange-200"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>{" "}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
            placeholder="Nhập tiện ích và nhấn Enter"
            onKeyPress={(e) =>
              e.key === "Enter" &&
              (e.preventDefault(), addAmenity(amenityInput))
            }
          />
          <button
            type="button"
            onClick={() => addAmenity(amenityInput)}
            className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
          >
            Thêm
          </button>
        </div>
        {formErrors.amenities && (
          <p className="text-red-400 text-xs mb-2 flex items-center">
            <AlertCircle size={12} className="mr-1" />
            {formErrors.amenities}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {availableAmenities
            .filter((amenity) => !formData.amenities.includes(amenity))
            .map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => addAmenity(amenity)}
                className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
              >
                + {amenity}
              </button>
            ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {isSubmitting || loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <Save size={18} className="mr-2" />
          )}
          {isEdit ? "Cập Nhật Rạp" : "Tạo Rạp"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  </motion.div>
);

const TheaterInfo = () => {
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState<TheaterCreateRequest>({
    name: "",
    location: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    screens: 1,
    amenities: [],
    contact_phone: "",
    contact_email: "",
    description: "",
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableAmenities = [
    "Bãi đỗ xe",
    "Khu ẩm thực",
    "Hệ thống điều hòa",
    "Công nghệ 3D",
    "IMAX",
    "Dolby Atmos",
    "Ghế VIP",
    "Âm thanh cao cấp",
    "Ghế ngả",
    "4DX",
    "Phòng chờ VIP",
    "Quầy bắp nước",
    "Khu Bar & Grill",
    "WiFi miễn phí",
    "Thang máy",
  ];

  const statusLabels: Record<string, string> = {
    active: "Đang hoạt động",
    inactive: "Ngừng hoạt động",
    pending: "Đang chờ",
  };

  const statusBadgeClasses: Record<string, string> = {
    active:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    pending: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    inactive: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  const getStatusBadgeClass = (status: string) =>
    statusBadgeClasses[status] || "bg-slate-600/30 text-slate-300 border border-slate-600/50";

  // Các biểu thức kiểm tra
  const validationPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+84|0)[3-9]\d{8}$/,
    pincode: /^\d{4,6}$/,
    name: /^[a-zA-ZÀ-ỹĐđ0-9\s\-&.()]{2,50}$/,
    text: /^[a-zA-ZÀ-ỹĐđ0-9\s\-,.()&]{2,100}$/,
    description: /^[a-zA-ZÀ-ỹĐđ0-9\s\-,.()&!?'"]{10,500}$/,
  };

  useEffect(() => {
    fetchTheaterData();
  }, []);

  const fetchTheaterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyTheater();
      setTheater(response);
      if (response.result) {
        setFormData({
          name: response.result.name,
          location: response.result.location,
          address: response.result.address,
          city: response.result.city,
          state: response.result.state,
          pincode: response.result.pincode,
          screens: response.result.screens,
          amenities: response.result.amenities,
          contact_phone: response.result.contact_phone,
          contact_email: response.result.contact_email,
          description: response.result.description,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải thông tin rạp";
      setError(errorMessage);
      console.error("Lỗi tải thông tin rạp:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra tính hợp lệ
  const validateField = (name: string, value: string): string => {
    const trimmedValue = value.trim();

    switch (name) {
      case "name":
        if (!trimmedValue) return "Tên rạp là bắt buộc";
        if (trimmedValue.length < 2)
          return "Tên rạp phải có ít nhất 2 ký tự";
        if (trimmedValue.length > 50)
          return "Tên rạp phải ít hơn 50 ký tự";
        if (!validationPatterns.name.test(trimmedValue))
          return "Tên rạp chứa ký tự không hợp lệ (chỉ cho phép chữ cái, số, dấu cách và một số ký tự đặc biệt cơ bản)";
        return "";

      case "location":
        if (!trimmedValue) return "Khu vực là bắt buộc";
        if (trimmedValue.length < 2)
          return "Khu vực phải có ít nhất 2 ký tự";
        if (trimmedValue.length > 100)
          return "Khu vực phải ít hơn 100 ký tự";
        if (!validationPatterns.text.test(trimmedValue))
          return "Khu vực chứa ký tự không hợp lệ (chỉ cho phép chữ cái, số, dấu cách và một số ký tự đặc biệt cơ bản)";
        return "";

      case "address":
        if (!trimmedValue) return "Địa chỉ là bắt buộc";
        if (trimmedValue.length < 5)
          return "Địa chỉ phải có ít nhất 5 ký tự";
        if (trimmedValue.length > 100)
          return "Địa chỉ phải ít hơn 100 ký tự";
        if (!validationPatterns.text.test(trimmedValue))
          return "Địa chỉ chứa ký tự không hợp lệ (chỉ cho phép chữ cái, số, dấu cách và một số ký tự đặc biệt cơ bản)";
        return "";

      case "city":
        if (!trimmedValue) return "Thành phố là bắt buộc";
        if (trimmedValue.length < 2)
          return "Thành phố phải có ít nhất 2 ký tự";
        if (trimmedValue.length > 50)
          return "Thành phố phải ít hơn 50 ký tự";
        if (!validationPatterns.name.test(trimmedValue))
          return "Thành phố chứa ký tự không hợp lệ (chỉ cho phép chữ cái, số, dấu cách và một số ký tự đặc biệt cơ bản)";
        return "";

      case "state":
        if (!trimmedValue) return "Tỉnh/thành là bắt buộc";
        if (trimmedValue.length < 2)
          return "Tỉnh/thành phải có ít nhất 2 ký tự";
        if (trimmedValue.length > 50)
          return "Tỉnh/thành phải ít hơn 50 ký tự";
        if (!validationPatterns.name.test(trimmedValue))
          return "Tỉnh/thành chứa ký tự không hợp lệ (chỉ cho phép chữ cái, số, dấu cách và một số ký tự đặc biệt cơ bản)";
        return "";

      case "pincode":
        if (!trimmedValue) return "Mã bưu chính là bắt buộc";
        if (!validationPatterns.pincode.test(trimmedValue))
          return "Mã bưu chính phải gồm 4-6 chữ số";
        return "";

      case "contact_phone":
        if (!trimmedValue) return "Số điện thoại liên hệ là bắt buộc";
        if (!validationPatterns.phone.test(trimmedValue))
          return "Vui lòng nhập số điện thoại Việt Nam hợp lệ (ví dụ: 0947679302 hoặc +84947679302)";
        return "";

      case "contact_email":
        if (!trimmedValue) return "Email liên hệ là bắt buộc";
        if (!validationPatterns.email.test(trimmedValue))
          return "Vui lòng nhập địa chỉ email hợp lệ";
        return "";

      case "description":
        if (!trimmedValue) return "Mô tả là bắt buộc";
        if (trimmedValue.length < 10)
          return "Mô tả phải có ít nhất 10 ký tự";
        if (trimmedValue.length > 500)
          return "Mô tả phải ít hơn 500 ký tự";
        if (!validationPatterns.description.test(trimmedValue))
          return "Mô tả chứa ký tự không hợp lệ (chỉ cho phép chữ cái, số, dấu cách và một số ký tự đặc biệt cơ bản)";
        return "";

      case "screens":
        const screenCount = parseInt(trimmedValue);
        if (!screenCount || screenCount < 1)
          return "Số phòng chiếu phải từ 1 trở lên";
        if (screenCount > 50) return "Số phòng chiếu không được vượt quá 50";
        return "";

      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedFormData: any = {};

  // Xử lý tất cả các trường
    Object.keys(formData).forEach((key) => {
      if (key !== "amenities") {
        const value = formData[key as keyof TheaterCreateRequest];
        const stringValue = String(value || "");
        const trimmedValue = stringValue.trim();

        if (key === "screens") {
          const numValue = parseInt(trimmedValue) || 1;
          trimmedFormData[key] = Math.max(1, numValue);
        } else {
          trimmedFormData[key] = trimmedValue;
        }

        const error = validateField(key, trimmedValue);
        if (error) errors[key] = error;
      } else {
        trimmedFormData[key] = formData[key];
      }
    });

  // Cập nhật dữ liệu biểu mẫu với giá trị đã loại bỏ khoảng trắng
    setFormData(trimmedFormData);

  // Kiểm tra danh sách tiện ích
    if (formData.amenities.length === 0) {
      errors.amenities = "Cần ít nhất một tiện ích";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Cập nhật dữ liệu biểu mẫu trong khi người dùng nhập
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi cho trường hiện tại nếu có
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Xử lý khi người dùng rời khỏi trường nhập liệu
  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Loại bỏ khoảng trắng và xử lý các trường hợp đặc biệt
    const stringValue = String(value);
    const trimmedValue = stringValue.trim();

    let finalValue: string | number;
    if (name === "screens") {
      // Với số phòng chiếu, đảm bảo tối thiểu là 1
      const numValue = parseInt(trimmedValue) || 1;
      finalValue = Math.max(1, numValue);
    } else {
      finalValue = trimmedValue;
    }

    // Cập nhật dữ liệu biểu mẫu với giá trị đã xử lý
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Kiểm tra tính hợp lệ khi rời khỏi trường
    const error = validateField(name, trimmedValue);
    if (error) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const addAmenity = (amenity: string) => {
    const trimmedAmenity = amenity.trim();
    if (trimmedAmenity && !formData.amenities.includes(trimmedAmenity)) {
      if (trimmedAmenity.length < 2) {
        toast.error("Tiện ích phải có ít nhất 2 ký tự");
        return;
      }
      if (trimmedAmenity.length > 30) {
        toast.error("Tiện ích phải ít hơn 30 ký tự");
        return;
      }
      if (!/^[a-zA-ZÀ-ỹĐđ0-9\s\-&.()]{2,30}$/.test(trimmedAmenity)) {
        toast.error(
          "Tiện ích chứa ký tự không hợp lệ (chỉ cho phép chữ cái, số, dấu cách và một số ký tự đặc biệt cơ bản)"
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmedAmenity],
      }));

      // Xóa lỗi tiện ích nếu đã tồn tại
      if (formErrors.amenities) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.amenities;
          return newErrors;
        });
      }
    } else if (formData.amenities.includes(trimmedAmenity)) {
      toast.error("Tiện ích này đã tồn tại");
    }
    setAmenityInput("");
  };

  const removeAmenity = (amenityToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter(
        (amenity) => amenity !== amenityToRemove
      ),
    }));
  };

  const handleCreateTheater = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng sửa tất cả lỗi trước khi gửi");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      await createTheater(formData);
      toast.success("Tạo rạp thành công!");
      setShowCreateForm(false);
      setFormErrors({});
      await fetchTheaterData(); // Tải lại dữ liệu
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tạo rạp";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleUpdateTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theater?.result?._id) return;

    if (!validateForm()) {
      toast.error("Vui lòng sửa tất cả lỗi trước khi gửi");
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      await updateTheater(theater.result._id, formData);
      toast.success("Cập nhật rạp thành công!");
      setShowEditForm(false);
      setFormErrors({});
      await fetchTheaterData(); // Tải lại dữ liệu
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể cập nhật rạp";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      screens: 1,
      amenities: [],
      contact_phone: "",
      contact_email: "",
      description: "",
    });
    setAmenityInput("");
    setFormErrors({});
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading && !theater) {
    return (
      <motion.div
        className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Đang tải thông tin rạp...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Quản Lý Rạp</h2>
          {theater?.result && !showEditForm && !showCreateForm && (
            <button
              onClick={() => {
                // Khởi tạo biểu mẫu với dữ liệu rạp hiện tại khi chỉnh sửa
                if (theater.result) {
                  setFormData({
                    name: theater.result.name,
                    location: theater.result.location,
                    address: theater.result.address,
                    city: theater.result.city,
                    state: theater.result.state,
                    pincode: theater.result.pincode,
                    screens: theater.result.screens,
                    amenities: theater.result.amenities,
                    contact_phone: theater.result.contact_phone,
                    contact_email: theater.result.contact_email,
                    description: theater.result.description,
                  });
                  setFormErrors({});
                }
                setShowEditForm(true);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center"
            >
              <Edit3 size={18} className="mr-2" />
              Chỉnh Sửa Rạp
            </button>
          )}
        </div>

        {showCreateForm && (
          <TheaterForm
            onSubmit={handleCreateTheater}
            onCancel={() => {
              setShowCreateForm(false);
              resetForm();
            }}
            formData={formData}
            loading={loading}
            availableAmenities={availableAmenities}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            addAmenity={addAmenity}
            removeAmenity={removeAmenity}
            amenityInput={amenityInput}
            setAmenityInput={setAmenityInput}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}

        {showEditForm && theater?.result && (
          <TheaterForm
            isEdit
            onSubmit={handleUpdateTheater}
            onCancel={() => {
              setShowEditForm(false);
              setFormErrors({});
            }}
            formData={formData}
            loading={loading}
            availableAmenities={availableAmenities}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
            addAmenity={addAmenity}
            removeAmenity={removeAmenity}
            amenityInput={amenityInput}
            setAmenityInput={setAmenityInput}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}

        {!showCreateForm && !showEditForm && (
          <>
            {error && (
              <motion.div
                className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-400 mr-2" />
                  <p className="text-red-300">{error}</p>
                </div>
              </motion.div>
            )}

            {!theater?.result ? (
              <motion.div
                className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Building2 size={64} className="text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Chưa Có Rạp
                </h3>
                <p className="text-slate-300 mb-6">
                  Bạn chưa tạo rạp nào. Hãy tạo rạp đầu tiên để bắt đầu quản
                  lý hệ thống của bạn.
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(true);
                  }}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <Plus size={18} className="mr-2" />
                  Tạo Rạp
                </button>
              </motion.div>
            ) : (
              <motion.div
                className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {theater.result.name}
                    </h3>
                    <p className="text-slate-400 flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {theater.result.location}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeClass(
                      theater.result.status
                    )}`}
                  >
                    <CheckCircle size={16} className="inline mr-1" />
                    {statusLabels[theater.result.status] ||
                      theater.result.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Phòng chiếu</p>
                    <p className="text-white font-bold text-xl">
                      {theater.result.screens}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Thành phố</p>
                    <p className="text-white font-bold">
                      {theater.result.city}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Mã bưu chính</p>
                    <p className="text-white font-bold">
                      {theater.result.pincode}
                    </p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm">Ngày tạo</p>
                    <p className="text-orange-400 font-bold text-sm">
                      {formatDate(theater.result.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Thông Tin Liên Hệ
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-300">
                        <Phone size={16} className="mr-3 text-orange-400" />
                        {theater.result.contact_phone}
                      </div>
                      <div className="flex items-center text-slate-300">
                        <Mail size={16} className="mr-3 text-orange-400" />
                        {theater.result.contact_email}
                      </div>
                      <div className="flex items-start text-slate-300">
                        <MapPin
                          size={16}
                          className="mr-3 text-orange-400 mt-0.5"
                        />
                        <div>
                          <p>{theater.result.address}</p>
                          <p>
                            {theater.result.city}, {theater.result.state}{" "}
                            {theater.result.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Mô Tả
                    </h4>
                    <p className="text-slate-300 leading-relaxed">
                      {theater.result.description}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Tiện Ích
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {theater.result.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700/50">
                  <div className="text-sm text-slate-400">
                    <p>Cập nhật lần cuối: {formatDate(theater.result.updated_at)}</p>
                  </div>
                  <button
                    onClick={fetchTheaterData}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Làm Mới
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TheaterInfo;
