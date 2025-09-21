/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Loader,
  Calendar,
  User,
  Type,
  FileText,
  ToggleLeft,
  ToggleRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import {
  createBannerSliderHome,
  updateBannerSliderHome,
  type BannerSliderHome,
  type CreateBannerSliderHomeRequest,
  type UpdateBannerSliderHomeRequest,
} from "../../../../apis/bannerSliderHome.api";
import { ImageUploadField } from "./ImageUploadField";

// Common Modal wrapper
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Form Field Component
const FormField: React.FC<{
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, icon, required, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
      {icon}
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

// Create Banner Modal
export const CreateBannerSliderHomeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateBannerSliderHomeRequest>({
    image: "",
    author: "",
    title: "",
    topic: "",
    description: "",
    active: false,
    time_active: "",
    auto_active: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !formData.image ||
        !formData.author ||
        !formData.title ||
        !formData.description
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate auto-active logic
      if (formData.auto_active && !formData.time_active) {
        throw new Error("Time active is required when auto-active is enabled");
      }

      // Validate future time
      if (formData.time_active) {
        const activationTime = new Date(formData.time_active);
        const now = new Date();
        if (activationTime <= now) {
          throw new Error("Activation time must be in the future");
        }
      }

      const submitData = { ...formData };
      if (!submitData.time_active) {
        delete submitData.time_active;
      }
      if (!submitData.topic) {
        delete submitData.topic;
      }

      await createBannerSliderHome(submitData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof CreateBannerSliderHomeRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Banner Slider">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={16} />
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <ImageUploadField
            value={formData.image}
            onChange={(url) => handleChange("image", url)}
            label="Banner Image"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Author" icon={<User size={16} />} required>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => handleChange("author", e.target.value)}
              placeholder="Author name"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </FormField>

          <FormField label="Title" icon={<Type size={16} />} required>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Banner title"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </FormField>

          <FormField label="Topic" icon={<Type size={16} />}>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
              placeholder="Banner topic (optional)"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </FormField>
        </div>

        <FormField label="Description" icon={<FileText size={16} />} required>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Banner description"
            rows={3}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            required
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleChange("active", !formData.active)}
                className="flex items-center gap-2"
              >
                {formData.active ? (
                  <ToggleRight size={20} className="text-green-400" />
                ) : (
                  <ToggleLeft size={20} className="text-slate-400" />
                )}
                <span className="text-slate-300">Active Status</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleChange("auto_active", !formData.auto_active)
                }
                className="flex items-center gap-2"
              >
                {formData.auto_active ? (
                  <ToggleRight size={20} className="text-blue-400" />
                ) : (
                  <ToggleLeft size={20} className="text-slate-400" />
                )}
                <span className="text-slate-300">Auto-Active</span>
              </button>
            </div>
          </div>

          <FormField
            label="Activation Time"
            icon={<Clock size={16} />}
            required={formData.auto_active}
          >
            <input
              type="datetime-local"
              value={formData.time_active}
              onChange={(e) => handleChange("time_active", e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              min={new Date().toISOString().slice(0, 16)}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Creating..." : "Create Banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Edit Banner Modal
export const EditBannerSliderHomeModal: React.FC<{
  isOpen: boolean;
  banner: BannerSliderHome;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, banner, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateBannerSliderHomeRequest>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        image: banner.image,
        author: banner.author,
        title: banner.title,
        topic: banner.topic,
        description: banner.description,
        active: banner.active,
        time_active: banner.time_active ? banner.time_active.slice(0, 16) : "",
        auto_active: banner.auto_active,
      });
    }
  }, [banner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate auto-active logic
      if (formData.auto_active && !formData.time_active) {
        throw new Error("Time active is required when auto-active is enabled");
      }

      // Validate future time
      if (formData.time_active) {
        const activationTime = new Date(formData.time_active);
        const now = new Date();
        if (activationTime <= now) {
          throw new Error("Activation time must be in the future");
        }
      }

      const submitData = { ...formData };
      if (!submitData.time_active) {
        submitData.time_active = null;
      }

      await updateBannerSliderHome(banner._id, submitData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update banner");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof UpdateBannerSliderHomeRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Banner Slider">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={16} />
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <ImageUploadField
            value={formData.image || ""}
            onChange={(url) => handleChange("image", url)}
            label="Banner Image"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Author" icon={<User size={16} />}>
            <input
              type="text"
              value={formData.author || ""}
              onChange={(e) => handleChange("author", e.target.value)}
              placeholder="Author name"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </FormField>

          <FormField label="Title" icon={<Type size={16} />}>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Banner title"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </FormField>

          <FormField label="Topic" icon={<Type size={16} />}>
            <input
              type="text"
              value={formData.topic || ""}
              onChange={(e) => handleChange("topic", e.target.value)}
              placeholder="Banner topic"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </FormField>
        </div>

        <FormField label="Description" icon={<FileText size={16} />}>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Banner description"
            rows={3}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleChange("active", !formData.active)}
                className="flex items-center gap-2"
              >
                {formData.active ? (
                  <ToggleRight size={20} className="text-green-400" />
                ) : (
                  <ToggleLeft size={20} className="text-slate-400" />
                )}
                <span className="text-slate-300">Active Status</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleChange("auto_active", !formData.auto_active)
                }
                className="flex items-center gap-2"
              >
                {formData.auto_active ? (
                  <ToggleRight size={20} className="text-blue-400" />
                ) : (
                  <ToggleLeft size={20} className="text-slate-400" />
                )}
                <span className="text-slate-300">Auto-Active</span>
              </button>
            </div>
          </div>

          <FormField
            label="Activation Time"
            icon={<Clock size={16} />}
            required={formData.auto_active}
          >
            <input
              type="datetime-local"
              value={formData.time_active || ""}
              onChange={(e) => handleChange("time_active", e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              min={new Date().toISOString().slice(0, 16)}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Updating..." : "Update Banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Preview Banner Modal
export const PreviewBannerSliderHomeModal: React.FC<{
  isOpen: boolean;
  banner: BannerSliderHome;
  onClose: () => void;
}> = ({ isOpen, banner, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Banner Preview">
      <div className="p-6">
        <div className="space-y-6">
          {/* Banner Image */}
          <div className="aspect-video rounded-lg overflow-hidden bg-slate-700">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-image.jpg";
              }}
            />
          </div>

          {/* Banner Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {banner.title}
              </h3>
              {banner.topic && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">
                  {banner.topic}
                </span>
              )}
            </div>

            <div className="text-slate-300">
              <strong>Author:</strong> {banner.author}
            </div>

            <div className="text-slate-300">
              <strong>Description:</strong>
              <p className="mt-1 text-slate-400">{banner.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <strong className="text-slate-300">Status:</strong>
                <div className="flex items-center gap-2 mt-1">
                  {banner.active ? (
                    <ToggleRight size={18} className="text-green-400" />
                  ) : (
                    <ToggleLeft size={18} className="text-slate-400" />
                  )}
                  <span
                    className={
                      banner.active ? "text-green-400" : "text-slate-400"
                    }
                  >
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div>
                <strong className="text-slate-300">Auto-Active:</strong>
                <div className="flex items-center gap-2 mt-1">
                  {banner.auto_active ? (
                    <ToggleRight size={18} className="text-blue-400" />
                  ) : (
                    <ToggleLeft size={18} className="text-slate-400" />
                  )}
                  <span
                    className={
                      banner.auto_active ? "text-blue-400" : "text-slate-400"
                    }
                  >
                    {banner.auto_active ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              {banner.time_active && (
                <div className="col-span-2">
                  <strong className="text-slate-300">Activation Time:</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-slate-400">
                      {format(new Date(banner.time_active), "PPP 'at' p")}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <strong className="text-slate-300">Created:</strong>
                <div className="text-slate-400 mt-1">
                  {format(new Date(banner.created_at), "PPP")}
                </div>
              </div>

              <div>
                <strong className="text-slate-300">Updated:</strong>
                <div className="text-slate-400 mt-1">
                  {format(new Date(banner.updated_at), "PPP")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Delete Banner Modal
export const DeleteBannerSliderHomeModal: React.FC<{
  isOpen: boolean;
  banner: BannerSliderHome;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ isOpen, banner, onClose, onConfirm, isDeleting }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Banner">
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle size={20} />
            <span className="font-semibold">Are you sure?</span>
          </div>

          <p className="text-slate-300">
            This action cannot be undone. This will permanently delete the
            banner:
          </p>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-16 h-12 rounded object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
              <div>
                <div className="font-semibold text-white">{banner.title}</div>
                <div className="text-sm text-slate-400">by {banner.author}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {isDeleting ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <AlertTriangle size={18} />
              )}
              {isDeleting ? "Deleting..." : "Delete Banner"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
