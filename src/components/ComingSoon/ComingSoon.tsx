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
        
        // If no data from API, use hardcoded data
        if (!data || data.length === 0) {
          const moviesList = [
            {
              _id: '1',
              title: 'Avengers: Secret Wars',
              poster_url: '/avenger_endgame.jpg',
              release_date: '2026-05-01',
              description: 'Phim siêu anh hùng Marvel sắp ra mắt',
              duration: 180,
              director: 'Marvel Studios',
              cast: [],
              genre: ['Hành động', 'Phiêu lưu'],
              trailer_url: '',
              average_rating: 0,
              ratings_count: 0,
              status: 'coming_soon',
              language: 'Tiếng Anh',
              is_featured: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              _id: '2',
              title: 'Spider-Man: Beyond the Spider-Verse',
              poster_url: '/spidermanAcross.jpg',
              release_date: '2026-03-29',
              description: 'Phần tiếp theo của Into the Spider-Verse',
              duration: 150,
              director: 'Sony Pictures',
              cast: [],
              genre: ['Animation', 'Hành động'],
              trailer_url: '',
              average_rating: 0,
              ratings_count: 0,
              status: 'coming_soon',
              language: 'Tiếng Anh',
              is_featured: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              _id: '3',
              title: 'John Wick: Chapter 5',
              poster_url: '/johnWick4.png',
              release_date: '2026-06-15',
              description: 'Sát thủ John Wick trở lại',
              duration: 160,
              director: 'Lionsgate',
              cast: [],
              genre: ['Hành động', 'Thriller'],
              trailer_url: '',
              average_rating: 0,
              ratings_count: 0,
              status: 'coming_soon',
              language: 'Tiếng Anh',
              is_featured: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              _id: '4',
              title: 'Guardians of the Galaxy Vol. 4',
              poster_url: '/guardiansGalaxy.jpg',
              release_date: '2026-07-20',
              description: 'Đội vệ binh dải ngân hà tiếp tục cuộc phiêu lưu',
              duration: 145,
              director: 'Marvel Studios',
              cast: [],
              genre: ['Hành động', 'Sci-Fi', 'Hài'],
              trailer_url: '',
              average_rating: 0,
              ratings_count: 0,
              status: 'coming_soon',
              language: 'Tiếng Anh',
              is_featured: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
          
          // Duplicate the list 4 times (original + 3 copies = 16 movies total)
          const duplicatedMovies = [
            ...moviesList,
            ...moviesList.map(m => ({ ...m, _id: m._id + '-copy1' })),
            ...moviesList.map(m => ({ ...m, _id: m._id + '-copy2' })),
            ...moviesList.map(m => ({ ...m, _id: m._id + '-copy3' })),
          ];
          
          setMovies(duplicatedMovies as Movie[]);
        } else {
          setMovies(data);
        }
      } catch (error) {
        console.error('Failed to fetch coming soon movies:', error);
        // Fallback with hardcoded data if API fails
        const moviesList = [
          {
            _id: '1',
            title: 'Avengers: Secret Wars',
            poster_url: '/avenger_endgame.jpg',
            release_date: '2026-05-01',
            description: 'Phim siêu anh hùng Marvel sắp ra mắt',
            duration: 180,
            director: 'Marvel Studios',
            cast: [],
            genre: ['Hành động', 'Phiêu lưu'],
            trailer_url: '',
            average_rating: 0,
            ratings_count: 0,
            status: 'coming_soon',
            language: 'Tiếng Anh',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            _id: '2',
            title: 'Spider-Man: Beyond the Spider-Verse',
            poster_url: '/spidermanAcross.jpg',
            release_date: '2026-03-29',
            description: 'Phần tiếp theo của Into the Spider-Verse',
            duration: 150,
            director: 'Sony Pictures',
            cast: [],
            genre: ['Animation', 'Hành động'],
            trailer_url: '',
            average_rating: 0,
            ratings_count: 0,
            status: 'coming_soon',
            language: 'Tiếng Anh',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            _id: '3',
            title: 'John Wick: Chapter 5',
            poster_url: '/johnWick4.png',
            release_date: '2026-06-15',
            description: 'Sát thủ John Wick trở lại',
            duration: 160,
            director: 'Lionsgate',
            cast: [],
            genre: ['Hành động', 'Thriller'],
            trailer_url: '',
            average_rating: 0,
            ratings_count: 0,
            status: 'coming_soon',
            language: 'Tiếng Anh',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            _id: '4',
            title: 'Guardians of the Galaxy Vol. 4',
            poster_url: '/guardiansGalaxy.jpg',
            release_date: '2026-07-20',
            description: 'Đội vệ binh dải ngân hà tiếp tục cuộc phiêu lưu',
            duration: 145,
            director: 'Marvel Studios',
            cast: [],
            genre: ['Hành động', 'Sci-Fi', 'Hài'],
            trailer_url: '',
            average_rating: 0,
            ratings_count: 0,
            status: 'coming_soon',
            language: 'Tiếng Anh',
            is_featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        
        // Duplicate the list 4 times (original + 3 copies = 16 movies total)
        const duplicatedMovies = [
          ...moviesList,
          ...moviesList.map(m => ({ ...m, _id: m._id + '-copy1' })),
          ...moviesList.map(m => ({ ...m, _id: m._id + '-copy2' })),
          ...moviesList.map(m => ({ ...m, _id: m._id + '-copy3' })),
        ];
        
        setMovies(duplicatedMovies as Movie[]);
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
      <div className="w-full py-16 text-center">
        <p className="text-white text-lg">Đang tải phim sắp chiếu...</p>
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4 lg:px-8">
      {/* Title Section - matching "SỰ KIỆN XU HƯỚNG" style */}
      <div className='flex justify-center items-center py-12'>
        <div className="group relative flex items-center justify-center gap-3">
          <FaCalendarAlt className='text-4xl md:text-5xl text-yellow-500 animate-pulse' />
          <h2
            className='text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 text-center tracking-wider transition-all duration-500 cursor-pointer group-hover:text-red-500'
            style={{
              fontFamily: 'Merriweather, serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              WebkitTextStroke: '0px transparent',
              transition: 'all 0.5s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.webkitTextStroke = '2px #fbbf24'
              e.currentTarget.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.webkitTextStroke = '0px transparent'
              e.currentTarget.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}
            onMouseMove={(e) => {
              // Ensure consistent hover effect across all characters
              e.currentTarget.style.webkitTextStroke = '2px #fbbf24'
              e.currentTarget.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.5)'
            }}
          >
            SẮP CÔNG CHIẾU
          </h2>
          <FaCalendarAlt className='text-4xl md:text-5xl text-yellow-500 animate-pulse' />
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
        {movies.map((movie, index) => (
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
                transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)',
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
          height: 8px;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: #730109;
          border-radius: 4px;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: #a01414;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;