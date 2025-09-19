import { useEffect, useRef } from 'react';
import { X, Play, Ticket } from 'lucide-react';
import { Button } from '../../ui/button';
import type { Movie } from '../../../types/Movie.type';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  onBookTicket?: (movieId: string) => void;
}

export const TrailerModal = ({ isOpen, onClose, movie, onBookTicket }: TrailerModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes} phút`;
  };

  // Format release date
  const formatReleaseDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Đóng modal khi click bên ngoài
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Chuyển đổi YouTube URL thành embeddable format
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Xử lý các định dạng YouTube URL khác nhau
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
    }
    
    return url;
  };

  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-5xl mx-4 bg-gray-900 rounded-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Play className="text-orange-500" size={20} />
            <h3 className="text-white font-semibold text-lg">
              Trailer: {movie.title}
            </h3>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
          >
            <X size={18} />
          </Button>
        </div>        <div className="flex flex-col lg:flex-row">
          {/* Video Container - Smaller size */}
          <div className="lg:w-2/3 p-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              {movie.trailer_url ? (
                <iframe
                  src={getEmbedUrl(movie.trailer_url)}
                  title={`${movie.title} Trailer`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Play size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Trailer không khả dụng</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Movie Info Section */}
          <div className="lg:w-1/3 p-4 lg:border-l border-gray-700">
            <div className="flex flex-col h-full">
              {/* Movie Poster */}
              <div className="mb-4 flex justify-center lg:justify-start">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-32 lg:w-full max-w-[200px] rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x450/374151/ffffff?text=No+Image';
                  }}
                />
              </div>

              {/* Movie Details */}
              <div className="flex-1 space-y-3">
                <h4 className="text-white font-bold text-xl">{movie.title}</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <span className="text-orange-400 font-medium mr-2">Thể loại:</span>
                    {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <span className="text-orange-400 font-medium mr-2">Thời lượng:</span>
                    {formatDuration(movie.duration)}
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <span className="text-orange-400 font-medium mr-2">Khởi chiếu:</span>
                    {formatReleaseDate(movie.release_date)}
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <span className="text-orange-400 font-medium mr-2">Ngôn ngữ:</span>
                    {movie.language}
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <span className="text-orange-400 font-medium mr-2">Đánh giá:</span>
                    {movie.average_rating > 0 ? `${movie.average_rating.toFixed(1)}/5` : 'Chưa có đánh giá'}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-gray-400 text-sm line-clamp-4">{movie.description}</p>
                </div>
              </div>              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {onBookTicket && (
                  <Button
                    onClick={() => onBookTicket(movie._id)}
                    className="w-full bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 text-white font-medium py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                    size="lg"
                  >
                    <Ticket size={18} className="mr-2" />
                    Đặt vé ngay
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-gray-600 text-purple-600 hover:text-purple-950 hover:border-gray-500 hover:scale-105 active:scale-95 transition-all duration-300"
                  size="lg"
                >
                  <X size={18} className="mr-2" />
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="p-3 bg-gray-800 text-center border-t border-gray-700">
          <p className="text-gray-400 text-xs">
            Nhấn ESC hoặc click bên ngoài để đóng
          </p>
        </div>
      </div>
    </div>
  );
};
