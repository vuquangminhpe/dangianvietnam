/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  Upload,
  Search,
  Film,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type {
  Banner,
  CreateBannerRequest,
  UpdateBannerRequest,
} from "../../../../types/Banner.type";
import type { Movie } from "../../../../types/Movie.type";
import { createBanner, updateBanner } from "../../../../apis/banner.api";
import { getAllMovies, searchMovies } from "../../../../apis/movie.api";
import mediasApi from "../../../../apis/medias.api";

// Banner Status and Type Constants
const BannerStatus = {
  ACTIVE: "active" as const, // Banner đang hoạt động
  INACTIVE: "inactive" as const, // Banner tạm dừng
  SCHEDULED: "scheduled" as const, // Banner được lên lịch
} as const;

const BannerTypes = {
  HOME_SLIDER: "home_slider" as const, // Banner slider trang chủ
  PROMOTION: "promotion" as const, // Banner khuyến mãi
  ANNOUNCEMENT: "announcement" as const, // Banner thông báo
  MOVIE_PROMOTION: "movie_promotion" as const, // Banner quảng cáo phim
} as const;

type BannerStatusType = (typeof BannerStatus)[keyof typeof BannerStatus];
type BannerTypeType = (typeof BannerTypes)[keyof typeof BannerTypes];

// File Upload Component
interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImage,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || "");

  // Update preview when currentImage changes (for edit mode)
  useEffect(() => {
    setPreviewUrl(currentImage || "");
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    try {
      // Upload to server first
      const response = await mediasApi.uploadImages(file);
      const imageUrl = response.data.result[0].url;

      // Create preview after successful upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Notify parent component
      onImageUploaded(imageUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
      // Reset preview on error
      setPreviewUrl(currentImage || "");
      // Reset input
      e.target.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Banner Image *
      </label>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />

        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <div className="text-white text-center">
                    <Upload className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm">Click to change</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-gray-400">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-500">Max 5MB, JPG/PNG</p>
                </>
              )}
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

// Movie Selection Component
interface MovieSelectionProps {
  onMovieSelected: (movie: Movie | null) => void;
  selectedMovie?: Movie | null;
}

const MovieSelection: React.FC<MovieSelectionProps> = ({
  onMovieSelected,
  selectedMovie,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMovies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm && isOpen) {
      const timeoutId = setTimeout(() => {
        searchMoviesData();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (isOpen) {
      loadMovies();
    }
  }, [searchTerm, isOpen]);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const response = await getAllMovies({ status: "now_showing" });
      setMovies(response.result.movies);
    } catch (error) {
      console.error("Failed to load movies:", error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMoviesData = async () => {
    setIsLoading(true);
    try {
      const moviesData = await searchMovies(searchTerm);
      setMovies(moviesData);
    } catch (error) {
      console.error("Failed to search movies:", error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    onMovieSelected(movie);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Prevent event bubbling
    onMovieSelected(null);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Prevent event bubbling
    setIsOpen(!isOpen);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Link to Movie (Optional)
      </label>

      {selectedMovie ? (
        <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
          <img
            src={selectedMovie.poster_url}
            alt={selectedMovie.title}
            className="w-12 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="text-white font-medium">{selectedMovie.title}</h4>
            <p className="text-gray-400 text-sm">/movies/{selectedMovie._id}</p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={toggleDropdown}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-left hover:bg-gray-600 transition-colors flex items-center justify-between"
          >
            <span className="text-gray-400">Select a movie...</span>
            <Film size={16} className="text-gray-400" />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10 max-h-64 overflow-hidden">
              <div className="p-3 border-b border-gray-600">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search movies..."
                    className="w-full pl-10 pr-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-6 w-6 text-gray-400 mx-auto animate-spin" />
                  </div>
                ) : movies.length > 0 ? (
                  movies.map((movie) => (
                    <button
                      key={movie._id}
                      type="button"
                      onClick={() => handleMovieSelect(movie)}
                      className="w-full p-3 text-left hover:bg-gray-600 transition-colors flex items-center space-x-3"
                    >
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-8 h-10 object-cover rounded"
                      />
                      <div>
                        <div className="text-white font-medium text-sm">
                          {movie.title}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {movie.genre?.join(", ")}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    {searchTerm ? "No movies found" : "No movies available"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Create Banner Modal
interface CreateBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBannerModal: React.FC<CreateBannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    type: BannerTypes.HOME_SLIDER as BannerTypeType,
    position: 1,
    status: BannerStatus.ACTIVE as BannerStatusType,
    start_date: "",
    end_date: "",
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedMovie) {
      setFormData((prev) => ({
        ...prev,
        link_url: `/movies/${selectedMovie._id}`,
      }));
    }
  }, [selectedMovie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url) {
      return;
    }

    setIsLoading(true);
    try {
      const bannerData: CreateBannerRequest = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        link_url: formData.link_url,
        type: formData.type as any, // Type casting for API compatibility
        position: formData.position,
        status: formData.status === BannerStatus.SCHEDULED ? BannerStatus.ACTIVE : formData.status, // Map scheduled to active for API
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      await createBanner(bannerData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: "",
        description: "",
        image_url: "",
        link_url: "",
        type: BannerTypes.HOME_SLIDER as BannerTypeType,
        position: 1,
        status: BannerStatus.ACTIVE as BannerStatusType,
        start_date: "",
        end_date: "",
      });
      setSelectedMovie(null);
    } catch (error) {
      console.error("Failed to create banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, image_url: imageUrl }));
  };

  const handleMovieSelected = (movie: Movie | null) => {
    setSelectedMovie(movie);
    if (!movie) {
      setFormData((prev) => ({ ...prev, link_url: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Create New Banner</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter banner title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter banner description"
              rows={3}
            />
          </div>

          <ImageUpload
            onImageUploaded={handleImageUploaded}
            currentImage={formData.image_url}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Banner Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="home_slider">Home Slider</option>
              <option value="movie_banner">Movie Banner</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Position
            </label>
            <input
              type="number"
              value={formData.position}
              onChange={(e) =>
                handleInputChange("position", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <MovieSelection
            onMovieSelected={handleMovieSelected}
            selectedMovie={selectedMovie}
          />

          {/* Manual Link Input */}
          {!selectedMovie && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Custom Link (Optional)
              </label>
              <div className="relative">
                <ExternalLink
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) =>
                    handleInputChange("link_url", e.target.value)
                  }
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom link URL"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) =>
                  handleInputChange("start_date", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Banner Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={BannerStatus.ACTIVE}>Active</option>
              <option value={BannerStatus.INACTIVE}>Inactive</option>
              <option value={BannerStatus.SCHEDULED}>Scheduled</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.image_url}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Create Banner
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Edit Banner Modal
interface EditBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  banner: Banner | null;
}

export const EditBannerModal: React.FC<EditBannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  banner,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    type: BannerTypes.HOME_SLIDER as BannerTypeType,
    position: 1,
    status: BannerStatus.ACTIVE as BannerStatusType,
    start_date: "",
    end_date: "",
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (banner) {
      // Map banner.status to our status, fallback to checking is_active for backward compatibility
      let mappedStatus: BannerStatusType = BannerStatus.INACTIVE;
      if (
        banner.status === "active" ||
        (banner.status !== "inactive" && banner.is_active)
      ) {
        mappedStatus = BannerStatus.ACTIVE;
      } else if ((banner.status as string) === "scheduled") {
        mappedStatus = BannerStatus.SCHEDULED;
      }

      setFormData({
        title: banner.title,
        description: banner.description || "",
        image_url: banner.image_url,
        link_url: banner.link_url || "",
        type: banner.type as BannerTypeType,
        position: banner.position,
        status: mappedStatus,
        start_date: banner.start_date
          ? new Date(banner.start_date).toISOString().slice(0, 16)
          : "",
        end_date: banner.end_date
          ? new Date(banner.end_date).toISOString().slice(0, 16)
          : "",
      });

      // Check if link_url is a movie link
      if (banner.link_url && banner.link_url.startsWith("/movies/")) {
        // You might want to fetch movie details here if needed
      }
    }
  }, [banner]);

  useEffect(() => {
    if (selectedMovie) {
      setFormData((prev) => ({
        ...prev,
        link_url: `/movies/${selectedMovie._id}`,
      }));
    }
  }, [selectedMovie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!banner || !formData.title || !formData.image_url) {
      return;
    }

    setIsLoading(true);
    try {
      const updateData: UpdateBannerRequest = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        link_url: formData.link_url,
        type: formData.type as any, // Type casting for API compatibility
        position: formData.position,
        status: formData.status === BannerStatus.SCHEDULED ? BannerStatus.ACTIVE : formData.status, // Map scheduled to active for API
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      await updateBanner(banner._id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, image_url: imageUrl }));
  };

  const handleMovieSelected = (movie: Movie | null) => {
    setSelectedMovie(movie);
    if (!movie) {
      setFormData((prev) => ({ ...prev, link_url: "" }));
    }
  };

  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Edit Banner</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter banner title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter banner description"
              rows={3}
            />
          </div>

          <ImageUpload
            onImageUploaded={handleImageUploaded}
            currentImage={formData.image_url}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Banner Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="home_slider">Home Slider</option>
              <option value="movie_banner">Movie Banner</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Position
            </label>
            <input
              type="number"
              value={formData.position}
              onChange={(e) =>
                handleInputChange("position", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <MovieSelection
            onMovieSelected={handleMovieSelected}
            selectedMovie={selectedMovie}
          />

          {/* Manual Link Input */}
          {!selectedMovie && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Custom Link (Optional)
              </label>
              <div className="relative">
                <ExternalLink
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) =>
                    handleInputChange("link_url", e.target.value)
                  }
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom link URL"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) =>
                  handleInputChange("start_date", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Banner Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={BannerStatus.ACTIVE}>Active</option>
              <option value={BannerStatus.INACTIVE}>Inactive</option>
              <option value={BannerStatus.SCHEDULED}>Scheduled</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.image_url}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Banner
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Preview Banner Modal
interface PreviewBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
}

export const PreviewBannerModal: React.FC<PreviewBannerModalProps> = ({
  isOpen,
  onClose,
  banner,
}) => {
  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Banner Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-2xl font-bold">{banner.title}</h3>
              {banner.description && (
                <p className="text-gray-200 mt-1">{banner.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Type:</span>
              <span className="ml-2 text-white capitalize">
                {banner.type.replace("_", " ")}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Position:</span>
              <span className="ml-2 text-white">{banner.position}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span
                className={`ml-2 ${
                  banner.is_active ? "text-green-400" : "text-red-400"
                }`}
              >
                {banner.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Link:</span>
              <span className="ml-2 text-blue-400">
                {banner.link_url || "No link"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface DeleteBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  banner: Banner | null;
  isDeleting: boolean;
}

export const DeleteBannerModal: React.FC<DeleteBannerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  banner,
  isDeleting,
}) => {
  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md w-full mx-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Trash2 className="text-red-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Delete Banner</h2>
            <p className="text-slate-400 text-sm">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-start gap-3">
              {banner.image_url && (
                <div className="w-16 h-12 bg-slate-600 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {banner.title}
                </h3>
                <p className="text-slate-400 text-sm">
                  {banner.type.replace("_", " ")} • Position #{banner.position}
                </p>
                {banner.description && (
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                    {banner.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-slate-300 mt-4">
            Are you sure you want to delete "
            <span className="font-medium text-white">{banner.title}</span>"?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Banner
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
