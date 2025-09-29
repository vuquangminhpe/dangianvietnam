import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MonitorPlay, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  AlertTriangle,
  X
} from "lucide-react";
import { 
  getMyTheater,
  getTheaterScreens,
  createScreen,
  updateScreen,
  deleteScreen,
  getScreenById,
  generateSeatLayout,
  calculateTotalSeats,
  validateSeatLayoutCapacity,
  type Screen as ScreenType,
  type ScreenCreateRequest,
  type TheaterResponse
} from '../../../apis/staff_screen.api';
import { toast } from 'sonner';

const Screen = () => {
  const [screens, setScreens] = useState<ScreenType[]>([]);
  const [theater, setTheater] = useState<TheaterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<ScreenType | null>(null);
  const [screenToDelete, setScreenToDelete] = useState<{id: string, name: string} | null>(null);

  // Form states for modals
  const [formData, setFormData] = useState<ScreenCreateRequest>({
    name: '',
    seat_layout: [],
    capacity: 0,
    screen_type: 'standard'
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seat layout form states
  const [rows, setRows] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(12);
  const [seatType] = useState<'regular' | 'premium'>('regular');
  const [selectedSeatType, setSelectedSeatType] = useState<'regular' | 'premium'>('regular');

  // Fetch theater and screens
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get theater info first
      const theaterResponse = await getMyTheater();
      setTheater(theaterResponse);
      
      if (theaterResponse.result?._id) {
        // Get screens for this theater
        const screensResponse = await getTheaterScreens(
          theaterResponse.result._id,
          page,
          limit
        );
        
        setScreens(screensResponse.result.screens);
        setTotalPages(screensResponse.result.total_pages);
        setTotal(screensResponse.result.total);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle screen deletion
  const handleDeleteScreen = (screenId: string, screenName: string) => {
    setScreenToDelete({ id: screenId, name: screenName });
    setShowDeleteModal(true);
  };

  // Confirm delete screen
  const confirmDeleteScreen = async () => {
    if (!screenToDelete) return;

    try {
      setIsSubmitting(true);
      await deleteScreen(screenToDelete.id);
      toast.success('Screen deleted successfully');
      setShowDeleteModal(false);
      setScreenToDelete(null);
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete screen';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel delete screen
  const cancelDeleteScreen = () => {
    setShowDeleteModal(false);
    setScreenToDelete(null);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Modal handlers
  const handleAddScreen = () => {
    const seatLayout = generateSeatLayout(rows, seatsPerRow, seatType);
    const capacity = calculateTotalSeats(seatLayout);
    
    setFormData({
      name: '',
      seat_layout: seatLayout,
      capacity,
      screen_type: 'standard'
    });
    setFormErrors([]);
    setIsSubmitting(false);
    setSelectedSeatType('regular'); // Initialize seat type selector
    setShowAddModal(true);
  };

  const handleEditScreen = async (screen: ScreenType) => {
    setSelectedScreen(screen);
    setFormData({
      name: screen.name,
      seat_layout: screen.seat_layout,
      capacity: screen.capacity,
      screen_type: screen.screen_type
    });
    setFormErrors([]);
    setIsSubmitting(false);
    setSelectedSeatType('regular'); // Reset to default
    setRows(screen.seat_layout.length);
    setSeatsPerRow(screen.seat_layout[0]?.length || 0);
    setShowEditModal(true);
  };

  const handleViewDetails = async (screen: ScreenType) => {
    try {
      const response = await getScreenById(screen._id);
      setSelectedScreen(response.result);
      setShowDetailsModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch screen details';
      toast.error(errorMessage);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowDeleteModal(false);
    setSelectedScreen(null);
    setScreenToDelete(null);
    setFormErrors([]);
    setIsSubmitting(false);
  };

  // Handle screen operations success
  const handleScreenOperationSuccess = async () => {
    await fetchData(); // Refresh the list
  };

  // Form validation
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('Screen name is required');
    if (formData.capacity <= 0) errors.push('Capacity must be greater than 0');
    if (!validateSeatLayoutCapacity(formData.seat_layout, formData.capacity)) {
      errors.push('Capacity must match total number of seats in layout');
    }
    
    return errors;
  };

  // Handle form submission for creating screen
  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!theater?.result?._id) {
      toast.error('Thông tin rạp không có sẵn');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);
      
      await createScreen(theater.result._id, formData);
      toast.success('Screen created successfully');
      closeModals();
      handleScreenOperationSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create screen';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for updating screen
  const handleUpdateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedScreen) {
      toast.error('Thông tin phòng chiếu không có sẵn');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors([]);
      
      await updateScreen(selectedScreen._id, formData);
      toast.success('Screen updated successfully');
      closeModals();
      handleScreenOperationSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update screen';
      toast.error(errorMessage);
      setFormErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const handleFormChange = (field: keyof ScreenCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  // Update seat layout when parameters change
  const updateSeatLayout = () => {
    const seatLayout = generateSeatLayout(rows, seatsPerRow, seatType);
    const capacity = calculateTotalSeats(seatLayout);
    
    handleFormChange('seat_layout', seatLayout);
    handleFormChange('capacity', capacity);
  };

  // Interactive seat layout manipulation
  const toggleSeat = (rowIndex: number, seatIndex: number) => {
    const newLayout = [...formData.seat_layout];
    const currentSeat = newLayout[rowIndex][seatIndex];
    
    if (currentSeat.status === 'active') {
      // Remove seat
      newLayout[rowIndex][seatIndex] = {
        ...currentSeat,
        status: 'inactive'
      };
    } else {
      // Add seat
      newLayout[rowIndex][seatIndex] = {
        ...currentSeat,
        status: 'active',
        type: selectedSeatType
      };
    }
    
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
  };

  // Change seat type for active seats
  const changeSeatType = (rowIndex: number, seatIndex: number, newType: 'regular' | 'premium') => {
    const newLayout = [...formData.seat_layout];
    if (newLayout[rowIndex][seatIndex].status === 'active') {
      newLayout[rowIndex][seatIndex] = {
        ...newLayout[rowIndex][seatIndex],
        type: newType
      };
      handleFormChange('seat_layout', newLayout);
    }
  };

  // Add or remove entire row
  const addRow = () => {
    if (formData.seat_layout.length >= 26) return; // Max 26 rows (A-Z)
    
    const newRowLetter = String.fromCharCode(65 + formData.seat_layout.length); // A, B, C...
    const newRow = Array.from({ length: seatsPerRow }, (_, index) => ({
      row: newRowLetter,
      number: index + 1,
      type: selectedSeatType,
      status: 'active' as const
    }));
    
    const newLayout = [...formData.seat_layout, newRow];
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setRows(newLayout.length);
  };

  const removeRow = () => {
    if (formData.seat_layout.length <= 1) return; // Keep at least one row
    
    const newLayout = formData.seat_layout.slice(0, -1);
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setRows(newLayout.length);
  };

  // Add or remove seats from all rows
  const addSeatToAllRows = () => {
    const maxSeats = Math.max(...formData.seat_layout.map(row => row.length));
    if (maxSeats >= 50) return; // Max 50 seats per row
    
    const newLayout = formData.seat_layout.map(row => {
      const newSeat = {
        row: row[0].row,
        number: row.length + 1,
        type: selectedSeatType,
        status: 'active' as const
      };
      return [...row, newSeat];
    });
    
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setSeatsPerRow(newLayout[0]?.length || 0);
  };

  const removeSeatFromAllRows = () => {
    const minSeats = Math.min(...formData.seat_layout.map(row => row.length));
    if (minSeats <= 1) return; // Keep at least one seat per row
    
    const newLayout = formData.seat_layout.map(row => row.slice(0, -1));
    const capacity = calculateTotalSeats(newLayout);
    handleFormChange('seat_layout', newLayout);
    handleFormChange('capacity', capacity);
    setSeatsPerRow(newLayout[0]?.length || 0);
  };

  // Reset layout to default grid
  const resetLayout = () => {
    const seatLayout = generateSeatLayout(rows, seatsPerRow, selectedSeatType);
    const capacity = calculateTotalSeats(seatLayout);
    
    handleFormChange('seat_layout', seatLayout);
    handleFormChange('capacity', capacity);
  };

  // Get seat style based on type and status
  const getSeatStyle = (seat: any) => {
    if (seat.status === 'inactive') {
      return 'bg-slate-600/30 border-slate-500/50 text-slate-500 cursor-pointer hover:bg-slate-500/50';
    }
    
    switch (seat.type) {
      case 'premium':
        return 'bg-blue-500/80 border-blue-400/50 text-white cursor-pointer hover:bg-blue-400/80';
      default:
        return 'bg-green-500/80 border-green-400/50 text-white cursor-pointer hover:bg-green-400/80';
    }
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [page]);

  // Update seat layout when parameters change (for initial generation only)
  useEffect(() => {
    if (showAddModal && formData.seat_layout.length === 0) {
      updateSeatLayout();
    }
  }, [rows, seatsPerRow, seatType, showAddModal]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-900/50 min-h-screen">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">Quản Lý Phòng Chiếu</h2>
            <p className="text-slate-400 text-sm font-body">
              {theater?.result ? `${theater.result.name} - Tìm thấy ${total} phòng chiếu` : 'Đang tải thông tin rạp...'}
            </p>
          </div>
          <motion.button
            onClick={handleAddScreen}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center font-body"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || !theater?.result}
          >
            <Plus size={18} className="mr-2" />
            Thêm Phòng Chiếu
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng chiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none font-body"
              />
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              <AlertTriangle size={20} className="text-red-400 mr-2" />
              <p className="text-red-300 font-body">
                Lỗi: {error}. Vui lòng thử lại.
              </p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-700/50 rounded" />
                  <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-slate-700/50 rounded" />
                    <div className="h-16 bg-slate-700/50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Screens Grid */}
            {screens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screens.map((screen, index) => (
                  <motion.div
                    key={screen._id}
                    className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-orange-500/20 hover:shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white truncate group-hover:text-orange-400 transition-colors font-heading">
                            {screen.name}
                          </h3>
                          <span className="text-sm text-slate-400 font-body">{screen.screen_type}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            onClick={() => handleEditScreen(screen)}
                            className="text-slate-400 hover:text-orange-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={loading}
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleViewDetails(screen)}
                            className="text-slate-400 hover:text-blue-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={loading}
                          >
                            <Eye size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteScreen(screen._id, screen.name)}
                            className="text-red-400 hover:text-red-500 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-body">Sức chứa</span>
                          <span className="font-medium text-white font-body">{screen.capacity} ghế</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-body">Số hàng ghế</span>
                          <span className="font-medium text-white font-body">{screen.seat_layout.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-body">Ghế mỗi hàng (trung bình)</span>
                          <span className="font-medium text-white font-body">
                            {(screen.capacity / screen.seat_layout.length).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 pb-4">
                      <motion.button
                        onClick={() => handleViewDetails(screen)}
                        className="w-full text-center bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 font-body"
                        whileHover={{ scale: 1.02 }}
                      >
                        Xem Chi Tiết
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !loading && (
                <motion.div
                  className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <MonitorPlay size={64} className="text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2 font-heading">
                    Không Tìm Thấy Phòng Chiếu
                  </h3>
                  <p className="text-slate-300 mb-6 font-body">
                    Hiện tại không có phòng chiếu nào được tìm thấy.
                    <br />
                    Vui lòng thêm phòng chiếu mới để bắt đầu quản lý.
                  </p>
                  <motion.button
                    onClick={handleAddScreen}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center mx-auto font-body"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!theater?.result}
                  >
                    <Plus size={18} className="mr-2" />
                    Thêm Phòng Chiếu
                  </motion.button>
                </motion.div>
              )
            )}

            {/* Pagination */}
            {screens.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors font-body"
                >
                  Trước
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg transition-colors font-body ${
                        p === page
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors font-body"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Add Screen Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white font-heading">Thêm Phòng Chiếu Mới</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateScreen} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle size={20} className="text-red-400 mr-2" />
                    <h4 className="font-bold text-red-300 font-heading">Lỗi</h4>
                  </div>
                  <ul className="list-disc list-inside text-red-300 space-y-1 font-body">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Tên Phòng Chiếu <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none font-body"
                      placeholder="Ví dụ: Phòng 1"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Loại Phòng Chiếu <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.screen_type}
                      onChange={(e) => handleFormChange('screen_type', e.target.value as any)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none font-body"
                      disabled={isSubmitting}
                    >
                      <option value="standard">Tiêu chuẩn</option>
                      <option value="premium">Cao Cấp</option>
                      <option value="imax">IMAX</option>
                      <option value="dolby">Dolby Atmos</option>
                    </select>
                  </div>

                  {/* Capacity (Read-only) */}
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-slate-300 mb-2 font-body">
                      Sức chứa
                    </label>
                    <input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      readOnly
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed font-body"
                    />
                    <p className="text-xs text-slate-400 mt-1 font-body">
                      Sức chứa được tính tự động từ sơ đồ ghế.
                    </p>
                  </div>

                  {/* Seat Layout Generation */}
                  <div className="space-y-4 pt-4 border-t border-slate-700">
                    <h4 className="text-md font-semibold text-white font-heading">Tạo Sơ Đồ Ghế</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="rows" className="block text-sm font-medium text-slate-300 mb-2 font-body">
                          Số hàng
                        </label>
                        <input
                          id="rows"
                          type="number"
                          value={rows}
                          onChange={(e) => setRows(Number(e.target.value))}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white font-body"
                          min="1"
                          max="26"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="seatsPerRow" className="block text-sm font-medium text-slate-300 mb-2 font-body">
                          Ghế/hàng
                        </label>
                        <input
                          id="seatsPerRow"
                          type="number"
                          value={seatsPerRow}
                          onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white font-body"
                          min="1"
                          max="50"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetLayout}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors font-body"
                      disabled={isSubmitting}
                    >
                      Tạo Lưới Ghế Mới
                    </button>
                  </div>
                </div>

                {/* Right Column: Interactive Seat Layout */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-white font-heading">Sơ Đồ Ghế Tương Tác</h4>
                  
                  {/* Seat Type Selector for Editing */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-300 font-body">Loại ghế để chỉnh sửa:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSeatType('regular')}
                        className={`px-3 py-1 rounded-md text-sm font-body ${selectedSeatType === 'regular' ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'}`}
                      >
                        Thường
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSeatType('premium')}
                        className={`px-3 py-1 rounded-md text-sm font-body ${selectedSeatType === 'premium' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300'}`}
                      >
                        Premium
                      </button>
                    </div>
                  </div>

                  {/* Seat Layout Display */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-2 overflow-x-auto">
                    <div className="w-full h-2 bg-slate-500 rounded-full mb-4" title="Màn hình"></div>
                    {formData.seat_layout.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex items-center gap-2">
                        <span className="w-6 text-center text-slate-400 font-bold font-body">{row[0]?.row}</span>
                        <div className="flex gap-1.5">
                          {row.map((seat, seatIndex) => (
                            <button
                              key={seatIndex}
                              type="button"
                              onClick={() => toggleSeat(rowIndex, seatIndex)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (seat.status === 'active') {
                                  const types: ('regular' | 'premium' )[] = ['regular', 'premium'];
                                  const currentIndex = types.indexOf(seat.type === 'vip' ? 'premium' : seat.type as 'regular' | 'premium');
                                  const nextType = types[(currentIndex + 1) % types.length];
                                  changeSeatType(rowIndex, seatIndex, nextType);
                                }
                              }}
                              className={`w-6 h-6 rounded text-xs font-medium border transition-all duration-200 ${getSeatStyle(seat)}`}
                              title={`${seat.row}${seat.number} - ${seat.type} - ${seat.status === 'active' ? 'Available' : 'Disabled'}\nLeft click: Toggle seat\nRight click: Change type`}
                              disabled={isSubmitting}
                            >
                              {seat.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Layout Manipulation Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <button type="button" onClick={addRow} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Thêm hàng</button>
                    <button type="button" onClick={removeRow} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Xóa hàng</button>
                    <button type="button" onClick={addSeatToAllRows} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Thêm ghế</button>
                    <button type="button" onClick={removeSeatFromAllRows} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Xóa ghế</button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors font-body"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center font-body"
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
                      Tạo Phòng Chiếu
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Screen Modal */}
      {showEditModal && selectedScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white font-heading">Chỉnh Sửa Phòng Chiếu</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateScreen} className="p-6 space-y-6">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle size={20} className="text-red-400 mr-2" />
                    <h4 className="font-bold text-red-300 font-heading">Lỗi</h4>
                  </div>
                  <ul className="list-disc list-inside text-red-300 space-y-1 font-body">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Tên Phòng Chiếu <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none font-body"
                      placeholder="Ví dụ: Phòng 1"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Loại Phòng Chiếu <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.screen_type}
                      onChange={(e) => handleFormChange('screen_type', e.target.value as any)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none font-body"
                      disabled={isSubmitting}
                    >
                      <option value="standard">Tiêu chuẩn</option>
                      <option value="premium">Cao Cấp</option>
                      <option value="imax">IMAX</option>
                      <option value="dolby">Dolby Atmos</option>
                    </select>
                  </div>

                  {/* Capacity (Read-only) */}
                  <div>
                    <label htmlFor="editCapacity" className="block text-sm font-medium text-slate-300 mb-2 font-body">
                      Sức chứa
                    </label>
                    <input
                      id="editCapacity"
                      type="number"
                      value={formData.capacity}
                      readOnly
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed font-body"
                    />
                    <p className="text-xs text-slate-400 mt-1 font-body">
                      Sức chứa được tính tự động từ sơ đồ ghế.
                    </p>
                  </div>
                </div>

                {/* Right Column: Interactive Seat Layout */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-white font-heading">Sơ Đồ Ghế Tương Tác</h4>
                  
                  {/* Seat Type Selector for Editing */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-slate-300 font-body">Loại ghế để chỉnh sửa:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSeatType('regular')}
                        className={`px-3 py-1 rounded-md text-sm font-body ${selectedSeatType === 'regular' ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'}`}
                      >
                        Thường
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSeatType('premium')}
                        className={`px-3 py-1 rounded-md text-sm font-body ${selectedSeatType === 'premium' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300'}`}
                      >
                        Premium
                      </button>
                    </div>
                  </div>

                  {/* Seat Layout Display */}
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-2 overflow-x-auto">
                    <div className="w-full h-2 bg-slate-500 rounded-full mb-4" title="Màn hình"></div>
                    {formData.seat_layout.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex items-center gap-2">
                        <span className="w-6 text-center text-slate-400 font-bold font-body">{row[0]?.row}</span>
                        <div className="flex gap-1.5">
                          {row.map((seat, seatIndex) => (
                            <button
                              key={seatIndex}
                              type="button"
                              onClick={() => toggleSeat(rowIndex, seatIndex)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (seat.status === 'active') {
                                  const types: ('regular' | 'premium' )[] = ['regular', 'premium'];
                                  const currentIndex = types.indexOf(seat.type === 'vip' ? 'premium' : seat.type as 'regular' | 'premium');
                                  const nextType = types[(currentIndex + 1) % types.length];
                                  changeSeatType(rowIndex, seatIndex, nextType);
                                }
                              }}
                              className={`w-6 h-6 rounded text-xs font-medium border transition-all duration-200 ${getSeatStyle(seat)}`}
                              title={`${seat.row}${seat.number} - ${seat.type} - ${seat.status === 'active' ? 'Available' : 'Disabled'}\nLeft click: Toggle seat\nRight click: Change type`}
                              disabled={isSubmitting}
                            >
                              {seat.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Layout Manipulation Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <button type="button" onClick={addRow} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Thêm hàng</button>
                    <button type="button" onClick={removeRow} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Xóa hàng</button>
                    <button type="button" onClick={addSeatToAllRows} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Thêm ghế</button>
                    <button type="button" onClick={removeSeatFromAllRows} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-body">Xóa ghế</button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors font-body"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center font-body"
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
                      Cập Nhật Phòng Chiếu
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Screen Details Modal */}
      {showDetailsModal && selectedScreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white font-heading">Chi Tiết Phòng Chiếu</h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Screen Info */}
                <div className="lg:col-span-1 space-y-4">
                  <h4 className="text-lg font-semibold text-white font-heading">{selectedScreen.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-body">Loại phòng:</span>
                      <span className="text-white font-medium font-body">{selectedScreen.screen_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-body">Sức chứa:</span>
                      <span className="text-white font-medium font-body">{selectedScreen.capacity} ghế</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-body">Ngày tạo:</span>
                      <span className="text-white font-medium font-body">{new Date(selectedScreen.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Seat Layout */}
                <div className="lg:col-span-2 bg-slate-900 p-4 rounded-lg border border-slate-700">
                  <h4 className="text-lg font-semibold text-white mb-4 text-center font-heading">Sơ Đồ Ghế</h4>
                  <div className="space-y-2 overflow-x-auto">
                    <div className="w-full h-2 bg-slate-500 rounded-full mb-4" title="Màn hình"></div>
                    {selectedScreen.seat_layout.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex items-center gap-2">
                        <span className="w-6 text-center text-slate-400 font-bold font-body">{row[0]?.row}</span>
                        <div className="flex gap-1.5">
                          {row.map((seat, seatIndex) => (
                            <div
                              key={seatIndex}
                              className={`w-4 h-4 rounded text-xs flex items-center justify-center ${
                                seat.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                              title={`${seat.row}${seat.number} - ${seat.type} - ${seat.status}`}
                            >
                              {seat.number}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="bg-slate-700/30 p-3 rounded-lg mt-4">
                    <p className="text-slate-400 text-xs mb-2">Nhấp để bật/tắt ghế, chuột phải để đổi loại</p>
                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-green-500/80"></div>
                        <span className="text-slate-400 font-body">Thường</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-blue-500/80"></div>
                        <span className="text-slate-400 font-body">Premium</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded bg-slate-600/30"></div>
                        <span className="text-slate-400 font-body">Lối đi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && screenToDelete && (
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
                  <h3 className="text-lg leading-6 font-bold text-white font-heading" id="modal-title">
                    Xóa Phòng Chiếu
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-slate-300 font-body">
                      Bạn có chắc chắn muốn xóa phòng chiếu <strong className="font-bold text-white">{screenToDelete.name}</strong>? Hành động này không thể được hoàn tác.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelDeleteScreen}
                  className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-600 text-base font-medium text-white hover:bg-slate-700 focus:outline-none sm:text-sm font-body"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteScreen}
                  className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:text-sm font-body"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Screen;
