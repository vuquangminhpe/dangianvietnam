/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Users,
  AlertTriangle,
  X,
  MonitorPlay,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

// Import APIs
import {
  getMyShowtimes,
  createShowtime,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
  formatShowtimeDate,
  formatShowtimeTime,
  getShowtimeStatusDisplay,
  getShowtimeStatusColor,
  calculateShowtimeOccupancy,
  formatPrice,
  validateShowtimeData,
  generateTimeSlots,
  type Showtime,
  type ShowtimeCreateRequest,
  type ShowtimeStatus,
  ShowtimeStatusValues,
} from "../../../apis/showtime_staff.api";

import { 
  getMyTheater, 
  getMyMovies,
  formatMovieDuration,
  getMovieStatusDisplay as getStaffMovieStatusDisplay,
  type TheaterResponse,
  type Movie as StaffMovie 
} from "../../../apis/staff.api";

import { getMovieStatusColor } from "../../../apis/movie_staff.api";
import { getMyMovieById } from "../../../apis/staff.api";

// Note: Using getMyMovies from staff.api instead of movie_staff.api for partner-specific movies

import { getTheaterScreens, type Screen } from "../../../apis/staff_screen.api";

// Movie Select Item Component
interface MovieSelectItemProps {
  movie: StaffMovie;
  isSelected: boolean;
  onSelect: (movie: StaffMovie) => void;
}

const MovieSelectItem = ({
  movie,
  isSelected,
  onSelect,
}: MovieSelectItemProps) => (
  <div
    onClick={() => onSelect(movie)}
    className={`p-3 cursor-pointer border-b border-slate-600/50 last:border-b-0 transition-colors ${
      isSelected
        ? "bg-orange-500/20 border-orange-500/30"
        : "hover:bg-slate-600/30"
    }`}
  >
    <div className="flex items-center">
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="w-12 h-16 object-cover rounded mr-3"
        onError={(e) => {
          e.currentTarget.src = "/placeholder-movie.jpg";
        }}
      />
      <div className="flex-1">
        <h4 className="text-white font-medium">{movie.title}</h4>
        <p className="text-slate-400 text-sm">
          {formatMovieDuration(movie.duration)}
        </p>
        <p className="text-slate-400 text-xs">{movie.genre.join(", ")}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`px-2 py-1 rounded text-xs ${getMovieStatusColor(
              movie.status
            )}`}
          >
            {getStaffMovieStatusDisplay(movie.status)}
          </span>
          <span className="text-slate-400 text-xs">
            ⭐ {movie.average_rating.toFixed(1)} ({movie.ratings_count})
          </span>
        </div>
      </div>
    </div>
  </div>
);

const Showtimes = () => {
  // State management
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10; // 10 showtimes per page for better pagination

  // Movie search states
  const [movieSearchTerm, setMovieSearchTerm] = useState("");
  const [movieLoading, setMovieLoading] = useState(false);
  const [popularMovies, setPopularMovies] = useState<StaffMovie[]>([]);
  const [searchResults, setSearchResults] = useState<StaffMovie[]>([]);
  const [movieCache, setMovieCache] = useState<Map<string, StaffMovie[]>>(new Map());

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    null
  );
  const [showtimeToDelete, setShowtimeToDelete] = useState<{
    id: string;
    movie: string;
  } | null>(null);

  // Form states for modals
  const [formData, setFormData] = useState<ShowtimeCreateRequest>({
    movie_id: "",
    screen_id: "",
    theater_id: "",
    start_time: "",
    end_time: "",
    price: { regular: 50000, premium: 70000 },
    available_seats: 0,
    status: ShowtimeStatusValues.SCHEDULED,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for create/edit
  const [selectedMovie, setSelectedMovie] = useState<StaffMovie | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [showDate, setShowDate] = useState("");
  const [showTime, setShowTime] = useState("");
  const [timeSlots] = useState(generateTimeSlots(8, 23, 30));

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get theater info first
      const theaterResponse = await getMyTheater();
      setTheater(theaterResponse);

      if (theaterResponse.result?._id) {
        // Get my movies, screens, and showtimes in parallel
        const [myMoviesResponse, screensResponse, showtimesResponse] =
          await Promise.all([
            getMyMovies(1, 100), // Get all movies owned by this partner
            getTheaterScreens(theaterResponse.result._id, 1, 100), // Get all screens
            getMyShowtimes(
              page,
              limit,
              undefined,
              undefined,
              undefined,
              undefined
            ),
          ]);

        setPopularMovies(myMoviesResponse.result.movies);
        setScreens(screensResponse.result.screens);
        setShowtimes(showtimesResponse.result.showtimes);
        setTotalPages(showtimesResponse.result.total_pages);
        setTotal(showtimesResponse.result.total);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search movies function with caching
  const searchMovies = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    // Check cache first
    const cacheKey = `search_${searchTerm}_now_showing`;
    if (movieCache.has(cacheKey)) {
      setSearchResults(movieCache.get(cacheKey)!);
      return;
    }

    try {
      setMovieLoading(true);
      
      // Search through partner's own movies only
      const response = await getMyMovies(1, 50, searchTerm, "now_showing");
      const filteredMovies = response.result.movies.filter((movie) => 
        movie.status === "now_showing" || movie.status === "coming_soon"
      );
      
      // Cache results
      setMovieCache(prev => new Map(prev.set(cacheKey, filteredMovies)));
      setSearchResults(filteredMovies);
    } catch (err) {
      console.error("Error searching movies:", err);
      toast.error("Không thể tìm kiếm phim");
    } finally {
      setMovieLoading(false);
    }
  };

  // Helper function to generate pagination numbers
  const getPaginationNumbers = (): number[] => {
    if (totalPages <= 7) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, -1, totalPages];
    }

    if (page >= totalPages - 3) {
      return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, -1, page - 1, page, page + 1, -1, totalPages];
  };

  // Helper function to format date for input fields
  const formatDateForInput = (
    dateString: string
  ): { date: string; time: string } => {
    const date = new Date(dateString);
    const formattedDate =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    const formattedTime =
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0");
    return { date: formattedDate, time: formattedTime };
  };

  // Helper function to create date from local date and time strings
  const createLocalDateTime = (date: string, time: string): Date => {
    return new Date(`${date}T${time}:00`);
  };

  // Handle form field changes
  const handleFormChange = (field: keyof ShowtimeCreateRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear related errors
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  // Handle movie selection
  const handleMovieSelect = (movie: StaffMovie) => {
    setSelectedMovie(movie);
    handleFormChange("movie_id", movie._id);

    // Auto-calculate end time when movie and start time are selected
    if (showDate && showTime && movie.duration) {
      const startDateTime = createLocalDateTime(showDate, showTime);
      const endDateTime = new Date(
        startDateTime.getTime() + movie.duration * 60 * 1000
      );
      handleFormChange("end_time", endDateTime.toISOString());
    }
  };

  // Handle screen selection
  const handleScreenSelect = (screen: Screen) => {
    setSelectedScreen(screen);
    handleFormChange("screen_id", screen._id);
    handleFormChange("available_seats", screen.capacity);
  };

  // Handle date and time changes
  const handleDateTimeChange = (date: string, time: string) => {
    setShowDate(date);
    setShowTime(time);

    if (date && time) {
      // Create date without timezone offset to maintain local time
      const startDateTime = createLocalDateTime(date, time);

      handleFormChange("start_time", startDateTime.toISOString());

      // Calculate end time if we have movie duration
      if (selectedMovie && selectedMovie.duration) {
        const endDateTime = new Date(
          startDateTime.getTime() + selectedMovie.duration * 60 * 1000
        );
        handleFormChange("end_time", endDateTime.toISOString());
      }
    }
  };

  // Check if showtime has any bookings
  const hasBookings = (showtime: Showtime): boolean => {
    // Check if booked_seats array exists and has any bookings
    if (showtime.booked_seats && showtime.booked_seats.length > 0) {
      return true;
    }

    // Fallback: Check if available seats is less than total capacity
    if (showtime.screen?.capacity) {
      const totalCapacity = showtime.screen.capacity;
      const availableSeats = showtime.available_seats;
      return availableSeats < totalCapacity;
    }

    return false;
  };

  // Check if showtime can be edited/deleted
  const canModifyShowtime = (showtime: Showtime): boolean => {
    // Cannot modify if it has bookings
    if (hasBookings(showtime)) return false;

    // Cannot modify if it's in the past
    const now = new Date();
    const showtimeStart = new Date(showtime.start_time);
    if (showtimeStart <= now) return false;

    // Cannot modify if status is completed or cancelled
    if (
      showtime.status === ShowtimeStatusValues.COMPLETED ||
      showtime.status === ShowtimeStatusValues.CANCELLED
    )
      return false;

    return true;
  };

  // Handle showtime deletion
  const handleDeleteShowtime = async (showtime: Showtime) => {
    try {
      // First, fetch the latest showtime data to get current booking status
      const latestShowtimeResponse = await getShowtimeById(showtime._id);
      const latestShowtime = latestShowtimeResponse.result;

      // Check if showtime can be modified with latest data
      if (!canModifyShowtime(latestShowtime)) {
        if (hasBookings(latestShowtime)) {
          toast.error("Không thể xóa lịch chiếu có đặt vé");
        } else if (new Date(latestShowtime.start_time) <= new Date()) {
          toast.error("Không thể xóa lịch chiếu đã qua");
        } else {
          toast.error("Không thể xóa lịch chiếu này");
        }
        return;
      }

      setShowtimeToDelete({
        id: latestShowtime._id,
        movie: latestShowtime.movie?.title || "Không xác định",
      });
      setShowDeleteModal(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải chi tiết lịch chiếu";
      toast.error(errorMessage);
    }
  };

  // Confirm delete showtime
  const confirmDeleteShowtime = async () => {
    if (!showtimeToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteShowtime(showtimeToDelete.id);
      toast.success("Xóa lịch chiếu thành công");
      setShowDeleteModal(false);
      setShowtimeToDelete(null);
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể xóa lịch chiếu";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel delete showtime
  const cancelDeleteShowtime = () => {
    setShowDeleteModal(false);
    setShowtimeToDelete(null);
  };

  // Modal handlers
  const handleAddShowtime = () => {
    // Check if theater exists
    if (!theater?.result) {
      toast.error("Vui lòng tạo rạp phim trước khi thêm lịch chiếu");
      return;
    }

    // Check if screens exist
    if (!screens || screens.length === 0) {
      toast.error(
        "Vui lòng tạo ít nhất một phòng chiếu cho rạp của bạn trước khi thêm lịch chiếu"
      );
      return;
    }

    setFormData({
      movie_id: "",
      screen_id: "",
      theater_id: theater?.result?._id || "",
      start_time: "",
      end_time: "",
      price: { regular: 50000, premium: 70000 },
      available_seats: 0,
      status: ShowtimeStatusValues.SCHEDULED,
    });
    setSelectedMovie(null);
    setSelectedScreen(null);
    setShowDate("");
    setShowTime("");
    setFormErrors([]);
    setIsSubmitting(false);
    setShowAddModal(true);
  };

  const handleEditShowtime = async (showtime: Showtime) => {
    try {
      // First, fetch the latest showtime data to get current booking status
      const latestShowtimeResponse = await getShowtimeById(showtime._id);
      const latestShowtime = latestShowtimeResponse.result;

      // Check if showtime can be modified with latest data
      if (!canModifyShowtime(latestShowtime)) {
        if (hasBookings(latestShowtime)) {
          toast.error("Không thể chỉnh sửa lịch chiếu có đặt vé");
        } else if (new Date(latestShowtime.start_time) <= new Date()) {
          toast.error("Không thể chỉnh sửa lịch chiếu đã qua");
        } else {
          toast.error("Không thể chỉnh sửa lịch chiếu này");
        }
        return;
      }

      setSelectedShowtime(latestShowtime);
      setFormData({
        movie_id: latestShowtime.movie_id,
        screen_id: latestShowtime.screen_id,
        theater_id: latestShowtime.theater_id,
        start_time: latestShowtime.start_time,
        end_time: latestShowtime.end_time,
        price: latestShowtime.price,
        available_seats: latestShowtime.available_seats,
        status: latestShowtime.status,
      });

      // Fetch movie details and find screen
      const [movieResponse] = await Promise.all([
        getMyMovieById(latestShowtime.movie_id),
      ]);

      const screen = screens.find((s) => s._id === latestShowtime.screen_id);
      setSelectedMovie(movieResponse.result);
      setSelectedScreen(screen || null);

      // Set date and time from start_time - use local timezone
      const { date, time } = formatDateForInput(latestShowtime.start_time);
      setShowDate(date);
      setShowTime(time);

      setFormErrors([]);
      setIsSubmitting(false);
      setShowEditModal(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải chi tiết lịch chiếu";
      toast.error(errorMessage);
    }
  };

  const handleViewDetails = async (showtime: Showtime) => {
    try {
      const response = await getShowtimeById(showtime._id);
      setSelectedShowtime(response.result);
      setShowViewModal(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải chi tiết lịch chiếu";
      toast.error(errorMessage);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedShowtime(null);
    setShowtimeToDelete(null);
    setSelectedMovie(null);
    setSelectedScreen(null);
    setShowDate("");
    setShowTime("");
    setFormErrors([]);
    setIsSubmitting(false);
  };

  // Form validation
  const validateForm = (): string[] => {
    const errors = validateShowtimeData(formData);

  if (!selectedMovie) errors.push("Vui lòng chọn phim");
  if (!selectedScreen) errors.push("Vui lòng chọn phòng chiếu");
  if (!showDate) errors.push("Vui lòng chọn ngày chiếu");
  if (!showTime) errors.push("Vui lòng chọn giờ chiếu");
  if (!formData.end_time) errors.push("Giờ kết thúc là bắt buộc");

    // Check if start time is in the future
    if (formData.start_time) {
      const startTime = new Date(formData.start_time);
      const now = new Date();
      if (startTime <= now) {
  errors.push("Giờ bắt đầu phải ở trong tương lai");
      }
    }

    // Check if end time is after start time
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      if (endTime <= startTime) {
  errors.push("Giờ kết thúc phải sau giờ bắt đầu");
      }
    }

    return errors;
  };

  // Handle form submission for creating showtime
  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure end_time is calculated before validation
    if (selectedMovie && showDate && showTime && selectedMovie.duration) {
      const startDateTime = createLocalDateTime(showDate, showTime);
      const endDateTime = new Date(
        startDateTime.getTime() + selectedMovie.duration * 60 * 1000
      );
      handleFormChange("end_time", endDateTime.toISOString());

      // Update formData with latest end_time
      setFormData((prev) => ({
        ...prev,
        end_time: endDateTime.toISOString(),
      }));
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);

      // Prepare the final data to ensure all fields are included
      const showtimeData: ShowtimeCreateRequest = {
        movie_id: formData.movie_id,
        screen_id: formData.screen_id,
        theater_id: formData.theater_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        price: formData.price,
        available_seats: formData.available_seats,
      };

      // Debug log to check if end_time is included

      // Create showtime
      await createShowtime(showtimeData);
      toast.success("Tạo lịch chiếu thành công");
      closeModals();
      
      // Navigate to page 1 to see the new showtime (since it should appear first)
      if (page !== 1) {
        setPage(1);
        // setPage will trigger useEffect to fetch data, so we don't need to call fetchData here
      } else {
        // If already on page 1, fetch data to update the list
        await fetchData();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tạo lịch chiếu";
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for updating showtime
  const handleUpdateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure end_time is calculated before validation for update
    if (selectedMovie && showDate && showTime && selectedMovie.duration) {
      const startDateTime = createLocalDateTime(showDate, showTime);
      const endDateTime = new Date(
        startDateTime.getTime() + selectedMovie.duration * 60 * 1000
      );
      handleFormChange("end_time", endDateTime.toISOString());

      // Update formData with latest end_time
      setFormData((prev) => ({
        ...prev,
        end_time: endDateTime.toISOString(),
      }));
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedShowtime) {
      toast.error("Thông tin lịch chiếu không có sẵn");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);

      const updateData = {
        start_time: formData.start_time,
        end_time: formData.end_time,
        price: formData.price,
        available_seats: formData.available_seats,
        status: formData.status,
      };

      // Debug log to check if end_time is included in update

      await updateShowtime(selectedShowtime._id, updateData);
      toast.success("Cập nhật lịch chiếu thành công");
      closeModals();
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể cập nhật lịch chiếu";
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [page]);

  // Keyboard shortcuts for pagination
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser shortcuts
      
      if (e.key === 'ArrowLeft' && page > 1) {
        e.preventDefault();
        setPage(page - 1);
      } else if (e.key === 'ArrowRight' && page < totalPages) {
        e.preventDefault();
        setPage(page + 1);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [page, totalPages]);

  // Filter showtimes based on search term
  const filteredShowtimes = showtimes.filter(
    (showtime) =>
      showtime.movie?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      showtime.screen?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Quản Lý Lịch Chiếu
            </h2>
            <p className="text-slate-400 text-sm">
              {theater?.result
                ? `${theater.result.name} - Tìm thấy ${total} lịch chiếu${totalPages > 1 ? ` (Trang ${page}/${totalPages})` : ""}`
                : "Đang tải thông tin rạp..."}
            </p>
          </div>
          <motion.button
            onClick={handleAddShowtime}
            className={`px-6 py-2 rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center ${
              loading || !theater?.result || !screens || screens.length === 0
                ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:shadow-orange-500/30"
            }`}
            whileHover={
              loading || !theater?.result || !screens || screens.length === 0
                ? {}
                : { scale: 1.05 }
            }
            whileTap={
              loading || !theater?.result || !screens || screens.length === 0
                ? {}
                : { scale: 0.95 }
            }
            disabled={
              loading || !theater?.result || !screens || screens.length === 0
            }
            title={
              !theater?.result
                ? "Vui lòng tạo rạp chiếu phim trước"
                : !screens || screens.length === 0
                ? "Vui lòng tạo ít nhất một phòng chiếu trước"
                : "Thêm lịch chiếu mới"
            }
          >
            <Plus size={18} className="mr-2" />
            Thêm Lịch Chiếu
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm lịch chiếu theo phim hoặc phòng chiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-red-400 mr-2" />
              <p className="text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Phim
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Phòng Chiếu
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Ngày & Giờ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Giá Vé
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Ghế Ngồi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Trạng Thái
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-700/50 animate-pulse"
                    >
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-28"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-24"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Screen Requirement Check */}
            {!theater?.result ? (
              <motion.div
                className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertTriangle
                  size={64}
                  className="text-yellow-400 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Cần Có Thông Tin Rạp
                </h3>
                <p className="text-slate-300 mb-6">
                  Bạn cần tạo thông tin rạp trước khi quản lý lịch chiếu. Hãy
                  thiết lập thông tin rạp của bạn để bắt đầu.
                </p>
              </motion.div>
            ) : !screens || screens.length === 0 ? (
              <motion.div
                className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MonitorPlay size={64} className="text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Chưa Có Phòng Chiếu
                </h3>
                <p className="text-slate-300 mb-6">
                  Bạn cần tạo ít nhất một phòng chiếu cho rạp trước khi tạo
                  lịch chiếu. Phòng chiếu xác định khu vực trình chiếu phim.
                </p>
                <motion.button
                  onClick={() => {
                    toast.info(
                      "Vui lòng chuyển đến trang Quản Lý Phòng Chiếu để tạo phòng cho rạp của bạn"
                    );
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={18} className="mr-2" />
                  Quản Lý Phòng Chiếu
                </motion.button>
              </motion.div>
            ) : /* Showtimes Table */
            filteredShowtimes.length > 0 ? (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Phim
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Phòng Chiếu
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Ngày & Giờ
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Giá Vé
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Ghế Ngồi
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Trạng Thái
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShowtimes.map((showtime, index) => (
                        <motion.tr
                          key={showtime._id}
                          className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {showtime.movie?.poster_url && (
                                <img
                                  src={showtime.movie.poster_url}
                                  alt={showtime.movie.title}
                                  className="w-12 h-16 object-cover rounded mr-3"
                                />
                              )}
                              <div>
                                <div className="font-medium text-white">
                                  {showtime.movie?.title || "Phim chưa xác định"}
                                </div>
                                <div className="text-sm text-slate-400">
                                  {showtime.movie?.genre?.join(", ")}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300">
                              {showtime.screen?.name}
                            </div>
                            <div className="text-sm text-slate-400">
                              Sức chứa: {showtime.screen?.capacity}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300">
                              {formatShowtimeDate(showtime.start_time)}
                            </div>
                            <div className="text-sm text-slate-400">
                              {formatShowtimeTime(showtime.start_time)} -{" "}
                              {formatShowtimeTime(showtime.end_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-orange-400 font-medium">
                              {formatPrice(showtime.price.regular)}
                            </div>
                            {showtime.price.premium && (
                              <div className="text-sm text-slate-400">
                                Cao cấp: {formatPrice(showtime.price.premium)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-300">
                              {showtime.available_seats}/
                              {showtime.screen?.capacity || 0}
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2 mt-1">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${calculateShowtimeOccupancy(
                                    showtime
                                  )}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getShowtimeStatusColor(
                                  showtime.status
                                )}`}
                              >
                                {getShowtimeStatusDisplay(showtime.status)}
                              </span>
                              {hasBookings(showtime) && (
                                <div className="flex items-center text-xs text-amber-400">
                                  <Users size={12} className="mr-1" />
                                  Có đặt vé
                                </div>
                              )}
                              {!canModifyShowtime(showtime) &&
                                !hasBookings(showtime) && (
                                  <div className="text-xs text-gray-400">
                                    {new Date(showtime.start_time) <= new Date()
                                      ? "Lịch chiếu đã qua"
                                      : "Không thể chỉnh sửa"}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleEditShowtime(showtime)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-300 flex items-center ${
                                  canModifyShowtime(showtime)
                                    ? "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 cursor-pointer"
                                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                                whileHover={
                                  canModifyShowtime(showtime)
                                    ? { scale: 1.05 }
                                    : {}
                                }
                                whileTap={
                                  canModifyShowtime(showtime)
                                    ? { scale: 0.95 }
                                    : {}
                                }
                                disabled={!canModifyShowtime(showtime)}
                                title={
                                  !canModifyShowtime(showtime)
                                    ? hasBookings(showtime)
                                      ? "Không thể chỉnh sửa lịch chiếu có đặt vé"
                                      : new Date(showtime.start_time) <=
                                        new Date()
                                      ? "Không thể chỉnh sửa lịch chiếu đã qua"
                                      : "Không thể chỉnh sửa lịch chiếu này"
                                    : "Chỉnh sửa lịch chiếu"
                                }
                              >
                                <Edit size={14} className="mr-1" />
                                Sửa
                              </motion.button>
                              <motion.button
                                onClick={() => handleViewDetails(showtime)}
                                className="bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 px-3 py-1 rounded text-sm font-medium transition-colors duration-300 flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye size={14} className="mr-1" />
                                Xem
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteShowtime(showtime)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-300 ${
                                  canModifyShowtime(showtime)
                                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 cursor-pointer"
                                    : "bg-gray-500/20 text-gray-400 cursor-not-allowed opacity-50"
                                }`}
                                whileHover={
                                  canModifyShowtime(showtime)
                                    ? { scale: 1.05 }
                                    : {}
                                }
                                whileTap={
                                  canModifyShowtime(showtime)
                                    ? { scale: 0.95 }
                                    : {}
                                }
                                disabled={!canModifyShowtime(showtime)}
                                title={
                                  !canModifyShowtime(showtime)
                                    ? hasBookings(showtime)
                                      ? "Không thể xóa lịch chiếu có đặt vé"
                                      : new Date(showtime.start_time) <=
                                        new Date()
                                      ? "Không thể xóa lịch chiếu đã qua"
                                      : "Không thể xóa lịch chiếu này"
                                    : "Xóa lịch chiếu"
                                }
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              !loading && (
                <motion.div
                  className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Calendar
                    size={64}
                    className="text-orange-400 mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Không Tìm Thấy Lịch Chiếu
                  </h3>
                  <p className="text-slate-300 mb-6">
                    {searchTerm
                      ? "Không có lịch chiếu nào khớp với từ khóa tìm kiếm. Hãy thử điều chỉnh tìm kiếm."
                      : !screens || screens.length === 0
                      ? "Bạn cần tạo ít nhất một phòng chiếu trước khi thêm lịch chiếu. Phòng chiếu xác định khu vực xem phim."
                      : "Bạn chưa tạo lịch chiếu nào. Hãy tạo lịch chiếu đầu tiên để bắt đầu."}
                  </p>
                  <motion.button
                    onClick={handleAddShowtime}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto ${
                      !theater?.result || !screens || screens.length === 0
                        ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }`}
                    whileHover={
                      !theater?.result || !screens || screens.length === 0
                        ? {}
                        : { scale: 1.05 }
                    }
                    whileTap={
                      !theater?.result || !screens || screens.length === 0
                        ? {}
                        : { scale: 0.95 }
                    }
                    disabled={
                      !theater?.result || !screens || screens.length === 0
                    }
                    title={
                      !theater?.result
                        ? "Vui lòng tạo rạp phim trước"
                        : !screens || screens.length === 0
                        ? "Vui lòng tạo ít nhất một phòng chiếu trước"
                        : "Thêm lịch chiếu mới"
                    }
                  >
                    <Plus size={18} className="mr-2" />
                    {!screens || screens.length === 0
                      ? "Tạo Phòng Chiếu Trước"
                      : "Thêm Lịch Chiếu"}
                  </motion.button>
                </motion.div>
              )
            )}

            {/* Pagination */}
            {filteredShowtimes.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors"
                >
                  Trước
                </button>

                <div className="flex gap-1">
                  {getPaginationNumbers().map((pageNum, index) => {
                    if (pageNum === -1) {
                      return (
                        <span key={index} className="px-3 py-2 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? "bg-orange-500 text-white"
                            : "bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Add Showtime Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                Thêm Lịch Chiếu Mới
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateShowtime} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle
                      size={20}
                      className="text-red-400 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-red-300 font-medium mb-2">
                        Vui lòng sửa các lỗi sau:
                      </p>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Movie Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Chọn Phim <span className="text-red-400">*</span>
                    </label>

                    {/* Movie Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          placeholder="Tìm kiếm phim..."
                          value={movieSearchTerm}
                          onChange={(e) => {
                            setMovieSearchTerm(e.target.value);
                            searchMovies(e.target.value);
                          }}
                          className="w-full bg-slate-700/30 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Movie Selection */}
                    <div className="max-h-48 overflow-y-auto bg-slate-700/30 rounded-lg border border-slate-600">
                      {movieLoading ? (
                        <div className="p-4 text-center text-slate-400">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400 mx-auto"></div>
                          <p className="mt-2">Đang tìm kiếm phim...</p>
                        </div>
                      ) : (
                        <>
                          {/* Search Results */}
                          {movieSearchTerm && searchResults.length > 0 && (
                            <div>
                              <div className="px-3 py-2 bg-slate-600/50 text-slate-300 text-xs font-medium">
                                Kết Quả Tìm Kiếm
                              </div>
                              {searchResults.map((movie) => (
                                <MovieSelectItem
                                  key={movie._id}
                                  movie={movie}
                                  isSelected={selectedMovie?._id === movie._id}
                                  onSelect={handleMovieSelect}
                                />
                              ))}
                            </div>
                          )}

                          {/* Popular Movies */}
                          {(!movieSearchTerm || searchResults.length === 0) && (
                            <div>
                              <div className="px-3 py-2 bg-slate-600/50 text-slate-300 text-xs font-medium">
                                Phim Phổ Biến
                              </div>
                              {popularMovies.map((movie) => (
                                <MovieSelectItem
                                  key={movie._id}
                                  movie={movie}
                                  isSelected={selectedMovie?._id === movie._id}
                                  onSelect={handleMovieSelect}
                                />
                              ))}
                            </div>
                          )}

                          {/* No Results */}
                          {movieSearchTerm &&
                            searchResults.length === 0 &&
                            !movieLoading && (
                              <div className="p-4 text-center text-slate-400">
                                <p>
                                  Không tìm thấy phim khớp với "{movieSearchTerm}"
                                </p>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Screen Selection */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Chọn Phòng Chiếu <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {screens.map((screen) => (
                        <div
                          key={screen._id}
                          onClick={() => handleScreenSelect(screen)}
                          className={`p-3 cursor-pointer rounded-lg border transition-colors ${
                            selectedScreen?._id === screen._id
                              ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                              : "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{screen.name}</h4>
                              <p className="text-sm opacity-70">
                                Sức chứa: {screen.capacity} ghế
                              </p>
                            </div>
                            <MonitorPlay size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date, Time & Pricing */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Ngày Chiếu <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={showDate}
                      onChange={(e) =>
                        handleDateTimeChange(e.target.value, showTime)
                      }
                      min={getMinDate()}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Giờ Chiếu <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={showTime}
                      onChange={(e) =>
                        handleDateTimeChange(showDate, e.target.value)
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="">Chọn giờ chiếu</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Configuration */}
                  <div className="space-y-3">
                    <label className="block text-slate-300 text-sm font-medium">
                      Giá Vé <span className="text-red-400">*</span>
                    </label>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Ghế Thường
                      </label>
                      <input
                        type="number"
                        value={formData.price.regular}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            regular: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Giá (VND)"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Ghế Cao Cấp
                      </label>
                      <input
                        type="number"
                        value={formData.price.premium}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            premium: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Giá (VND)"
                      />
                    </div>

                    {formData.price.vip !== undefined && (
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">
                          Ghế VIP
                        </label>
                        <input
                          type="number"
                          value={formData.price.vip || 0}
                          onChange={(e) =>
                            handleFormChange("price", {
                              ...formData.price,
                              vip: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                          disabled={isSubmitting}
                          placeholder="Giá (VND)"
                        />
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedMovie && selectedScreen && showDate && showTime && (
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">
                        Tóm Tắt Lịch Chiếu
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Phim:</span>{" "}
                          {selectedMovie.title}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Phòng Chiếu:</span>{" "}
                          {selectedScreen.name}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Thời Lượng:</span>{" "}
                          {selectedMovie.duration} phút
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">
                            Ghế Trống:
                          </span>{" "}
                          {formData.available_seats}
                        </p>
                        {formData.end_time && (
                          <p className="text-slate-300">
                            <span className="text-slate-400">Giờ Kết Thúc:</span>{" "}
                            {formatShowtimeTime(formData.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Selection */}
              <div className="px-6 pb-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Trạng Thái Lịch Chiếu <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.status || ShowtimeStatusValues.SCHEDULED}
                    onChange={(e) =>
                      handleFormChange(
                        "status",
                        e.target.value as ShowtimeStatus
                      )
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value={ShowtimeStatusValues.SCHEDULED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.SCHEDULED)}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_OPEN}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_OPEN
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_CLOSED}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_CLOSED
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.CANCELLED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.CANCELLED)}
                    </option>
                    <option value={ShowtimeStatusValues.COMPLETED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.COMPLETED)}
                    </option>
                  </select>
                  <p className="text-slate-400 text-xs mt-1">
                    Đặt trạng thái ban đầu cho lịch chiếu này
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="mr-2" />
                      Tạo Lịch Chiếu
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && showtimeToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-400" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Xóa Lịch Chiếu
                  </h3>
                  <p className="text-slate-300 mb-4">
                    Bạn có chắc chắn muốn xóa lịch chiếu cho phim "
                    {showtimeToDelete.movie}"? Hành động này không thể hoàn tác và
                    sẽ xóa vĩnh viễn lịch chiếu.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteShowtime}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteShowtime}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Xóa Lịch Chiếu
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Showtime Modal */}
      {showEditModal && selectedShowtime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Chỉnh Sửa Lịch Chiếu</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateShowtime} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle
                      size={20}
                      className="text-red-400 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-red-300 font-medium mb-2">
                        Vui lòng sửa các lỗi sau:
                      </p>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Movie Selection - Read Only in Edit Mode */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Phim Đã Chọn{" "}
                      <span className="text-slate-400">
                        (Không thể thay đổi)
                      </span>
                    </label>
                    <div className="bg-slate-700/30 rounded-lg border border-slate-600 p-4">
                      {selectedMovie ? (
                        <div className="flex items-center">
                          <img
                            src={selectedMovie.poster_url}
                            alt={selectedMovie.title}
                            className="w-12 h-16 object-cover rounded mr-3"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-movie.jpg";
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {selectedMovie.title}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {formatMovieDuration(selectedMovie.duration)}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {selectedMovie.genre.join(", ")}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-1 rounded text-xs ${getMovieStatusColor(
                                  selectedMovie.status
                                )}`}
                              >
                                {getStaffMovieStatusDisplay(selectedMovie.status)}
                              </span>
                              <span className="text-slate-400 text-xs">
                                ⭐ {selectedMovie.average_rating.toFixed(1)} (
                                {selectedMovie.ratings_count})
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400">Đang tải thông tin...</p>
                      )}
                    </div>
                  </div>

                  {/* Screen Selection */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Chọn Phòng Chiếu <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {screens.map((screen) => (
                        <div
                          key={screen._id}
                          onClick={() => handleScreenSelect(screen)}
                          className={`p-3 cursor-pointer rounded-lg border transition-colors ${
                            selectedScreen?._id === screen._id
                              ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                              : "bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{screen.name}</h4>
                              <p className="text-sm opacity-70">
                                Sức chứa: {screen.capacity} ghế
                              </p>
                            </div>
                            <MonitorPlay size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date, Time & Pricing */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Ngày Chiếu <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={showDate}
                      onChange={(e) =>
                        handleDateTimeChange(e.target.value, showTime)
                      }
                      min={getMinDate()}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Giờ Chiếu <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={showTime}
                      onChange={(e) =>
                        handleDateTimeChange(showDate, e.target.value)
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      disabled={isSubmitting}
                    >
                      <option value="">Chọn giờ chiếu</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Configuration */}
                  <div className="space-y-3">
                    <label className="block text-slate-300 text-sm font-medium">
                      Giá Vé <span className="text-red-400">*</span>
                    </label>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Ghế Thường
                      </label>
                      <input
                        type="number"
                        value={formData.price.regular}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            regular: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Giá (VND)"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs mb-1">
                        Ghế Cao Cấp
                      </label>
                      <input
                        type="number"
                        value={formData.price.premium}
                        onChange={(e) =>
                          handleFormChange("price", {
                            ...formData.price,
                            premium: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        disabled={isSubmitting}
                        placeholder="Giá (VND)"
                      />
                    </div>

                    {formData.price.vip !== undefined && (
                      <div>
                        <label className="block text-slate-400 text-xs mb-1">
                          Ghế VIP
                        </label>
                        <input
                          type="number"
                          value={formData.price.vip || 0}
                          onChange={(e) =>
                            handleFormChange("price", {
                              ...formData.price,
                              vip: parseInt(e.target.value) || 0,
                            })
                          }
                          min="0"
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                          disabled={isSubmitting}
                          placeholder="Giá (VND)"
                        />
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedMovie && selectedScreen && showDate && showTime && (
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">
                        Tóm Tắt Lịch Chiếu
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Phim:</span>{" "}
                          {selectedMovie.title}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Phòng Chiếu:</span>{" "}
                          {selectedScreen.name}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Thời Lượng:</span>{" "}
                          {selectedMovie.duration} phút
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">
                            Ghế Trống:
                          </span>{" "}
                          {formData.available_seats}
                        </p>
                        {formData.end_time && (
                          <p className="text-slate-300">
                            <span className="text-slate-400">Giờ Kết Thúc:</span>{" "}
                            {formatShowtimeTime(formData.end_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Selection */}
              <div className="px-6 pb-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Trạng Thái Lịch Chiếu <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.status || ShowtimeStatusValues.SCHEDULED}
                    onChange={(e) =>
                      handleFormChange(
                        "status",
                        e.target.value as ShowtimeStatus
                      )
                    }
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value={ShowtimeStatusValues.SCHEDULED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.SCHEDULED)}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_OPEN}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_OPEN
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.BOOKING_CLOSED}>
                      {getShowtimeStatusDisplay(
                        ShowtimeStatusValues.BOOKING_CLOSED
                      )}
                    </option>
                    <option value={ShowtimeStatusValues.CANCELLED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.CANCELLED)}
                    </option>
                    <option value={ShowtimeStatusValues.COMPLETED}>
                      {getShowtimeStatusDisplay(ShowtimeStatusValues.COMPLETED)}
                    </option>
                  </select>
                  <p className="text-slate-400 text-xs mt-1">
                    Cập nhật trạng thái của lịch chiếu này
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Edit size={18} className="mr-2" />
                      Cập Nhật Lịch Chiếu
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Showtime Modal */}
      {showViewModal && selectedShowtime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                Chi Tiết Lịch Chiếu
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Movie Info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      selectedShowtime.movie?.poster_url ||
                      "/placeholder-movie.jpg"
                    }
                    alt={selectedShowtime.movie?.title || "Phim"}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">
                      {selectedShowtime.movie?.title}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-300">
                        <span className="text-slate-400">Thời Lượng:</span>{" "}
                        {selectedShowtime.movie?.duration} phút
                      </p>
                    </div>
                  </div>
                </div>

                {/* Showtime Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                      Thông Tin Lịch Chiếu
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-300">
                        <Calendar size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">Ngày:</span>
                        {formatShowtimeDate(selectedShowtime.start_time)}
                      </div>
                      <div className="flex items-center text-slate-300">
                        <Clock size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">Giờ:</span>
                        {formatShowtimeTime(selectedShowtime.start_time)} -{" "}
                        {formatShowtimeTime(selectedShowtime.end_time)}
                      </div>
                      <div className="flex items-center text-slate-300">
                        <MonitorPlay
                          size={16}
                          className="mr-2 text-slate-400"
                        />
                        <span className="text-slate-400 mr-2">Phòng Chiếu:</span>
                        {selectedShowtime.screen?.name}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                      Ghế Ngồi & Giá Vé
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center text-slate-300">
                        <Users size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">Ghế trống:</span>
                        {selectedShowtime.available_seats} ghế
                      </div>
                      <div className="flex items-center text-slate-300">
                        <Users size={16} className="mr-2 text-slate-400" />
                        <span className="text-slate-400 mr-2">
                          Tổng sức chứa:
                        </span>
                        {selectedShowtime.screen?.capacity} ghế
                      </div>
                      {selectedShowtime.booked_seats &&
                        selectedShowtime.booked_seats.length > 0 && (
                          <div className="flex items-center text-amber-400">
                            <Users size={16} className="mr-2" />
                            <span className="text-slate-400 mr-2">Đã đặt:</span>
                            {selectedShowtime.booked_seats.length} ghế
                          </div>
                        )}
                      <div className="space-y-2">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Ghế Thường:</span>
                          <span>
                            {formatPrice(selectedShowtime.price.regular)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Ghế Cao Cấp:</span>
                          <span>
                            {formatPrice(selectedShowtime.price.premium)}
                          </span>
                        </div>
                        {selectedShowtime.price.vip && (
                          <div className="flex justify-between text-slate-300">
                            <span className="text-slate-400">Ghế VIP:</span>
                            <span>
                              {formatPrice(selectedShowtime.price.vip)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <span className="text-slate-400 mr-2">Trạng thái:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getShowtimeStatusColor(
                            selectedShowtime.status
                          )}`}
                        >
                          {getShowtimeStatusDisplay(selectedShowtime.status)}
                        </span>
                      </div>

                      {hasBookings(selectedShowtime) && (
                        <div className="flex items-center text-amber-400">
                          <Users size={16} className="mr-1" />
                          <span className="text-sm font-medium">
                            Đang có vé đặt
                          </span>
                        </div>
                      )}

                      {!canModifyShowtime(selectedShowtime) && (
                        <div className="flex items-center text-red-400">
                          <AlertTriangle size={16} className="mr-1" />
                          <span className="text-sm font-medium">
                            Không thể chỉnh sửa/xóa
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditShowtime(selectedShowtime)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                          canModifyShowtime(selectedShowtime)
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!canModifyShowtime(selectedShowtime)}
                        title={
                          !canModifyShowtime(selectedShowtime)
                            ? "Không thể chỉnh sửa lịch chiếu có đặt vé hoặc đã qua"
                            : "Chỉnh sửa lịch chiếu"
                        }
                      >
                        <Edit size={16} className="mr-2" />
                        Chỉnh Sửa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Showtimes;
