import { useEffect, useRef, useState } from 'react';
import { getComingSoonMovies } from '../../apis/movie.api';

import type { Movie } from '../../types/Movie.type';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import LazyImage from '../ui/LazyImage';

const ComingSoon = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchComingSoonMovies = async () => {
      try {
        setLoading(true);
        const data = await getComingSoonMovies(20);

        console.log('Coming Soon Movies:', data);
        setMovies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch coming soon movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComingSoonMovies();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMovieClick = (movieId: string) => {
    if (!isDragging) {
      navigate(`/movies/${movieId}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-red-500">
        <p className="text-red-500 text-lg">Đang tải phim sắp chiếu...</p>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="w-full py-16 text-center text-red-500">
        <p className="text-red-500 text-lg">Hiện chưa có suất chiếu mới.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4 lg:px-8">
      {/* Title Section - matching "SỰ KIỆN XU HƯỚNG" style */}
      <div className='flex justify-center items-center py-12'>
        <div className="flex items-center justify-center gap-3">
          <FaCalendarAlt className='text-4xl md:text-5xl text-yellow-500 animate-pulse' />
          <h2
            className='text-4xl md:text-5xl font-extrabold text-center tracking-wider'
            style={{
              fontFamily: 'Merriweather, serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              color: '#730109'
            }}
          >
            SẮP CÔNG CHIẾU
          </h2>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{
          scrollBehavior: isDragging ? 'auto' : 'smooth',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="flex-shrink-0 group"
            style={{ width: '240px' }}
            onClick={() => handleMovieClick(movie._id)}
          >
            {/* Movie Card with Red Border and Diagonal Tilt */}
            <div
              className="relative overflow-hidden rounded-lg transition-shadow duration-200 cursor-pointer"
              style={{
                border: '3px solid #730109',
                boxShadow: '0 4px 6px rgba(115, 1, 9, 0.3)',
              
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(115, 1, 9, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(115, 1, 9, 0.3)';
              }}
            >
              {/* Poster Image */}
              <div className="relative w-full h-80 overflow-hidden bg-gray-800">
                <LazyImage
                  src={movie.poster_url || '/placeholder-movie.jpg'}
                  alt={movie.title}
                  className="w-full h-full"
                  width={240}
                  height={320}
                  loading="lazy"
                  placeholderSrc="/placeholder-movie.jpg"
                />
                {/* Simple Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                  <p
                    className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200 text-center px-4"
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                    }}
                  >
                    Nhấn để xem chi tiết
                  </p>
                </div>
              </div>
            </div>

            {/* Movie Title */}
            <div className="mt-3 text-center px-2">
              <h3
                className="font-bold line-clamp-2 transition-colors duration-300 group-hover:text-red-600"
                style={{
                  fontFamily: 'Merriweather, serif',
                  fontSize: '16px',
                  minHeight: '48px',
                  color: '#2d3748',
                }}
              >
                {movie.title}
              </h3>
              {movie.release_date && (
                <p
                  className="text-sm mt-1"
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    color: '#2d3748',
                  }}
                >
                  {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;