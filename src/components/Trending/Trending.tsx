import { useEffect, useState } from 'react';
import { getTopRevenueMovies } from '../../apis/movie.api';
import type { Movie } from '../../types';
import { useNavigate } from 'react-router-dom';
import { FaFire, FaCrown, FaTrophy, FaMedal } from 'react-icons/fa';
import LazyImage from '../ui/LazyImage';

const Trending = () => {
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchTopMovies = async () => {
      try {
        setLoading(true);
        const movies = await getTopRevenueMovies(3);
        if (!ignore && movies) {
          setTopMovies(movies || []);
        }
      } catch (error) {
        console.error('Failed to fetch top revenue movies:', error);
        setTopMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovies();

    return () => {
      ignore = true;
    };
  }, []);

  // Icons for rankings
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <FaCrown className="text-yellow-400" />;
      case 1: return <FaTrophy className="text-gray-400" />;
      case 2: return <FaMedal className="text-amber-600" />;
      default: return null;
    }
  };

  // Colors for rankings
  const getRankColors = (index: number) => {
    switch (index) {
      case 0: return {
        bg: 'from-yellow-500 via-yellow-400 to-yellow-300',
        border: 'border-yellow-400',
        text: 'text-yellow-900',
        shadow: 'shadow-yellow-500/50'
      };
      case 1: return {
        bg: 'from-gray-400 via-gray-300 to-gray-200',
        border: 'border-gray-400',
        text: 'text-gray-900',
        shadow: 'shadow-gray-500/50'
      };
      case 2: return {
        bg: 'from-amber-600 via-amber-500 to-amber-400',
        border: 'border-amber-500',
        text: 'text-amber-900',
        shadow: 'shadow-amber-500/50'
      };
      default: return {
        bg: 'from-gray-600 via-gray-500 to-gray-400',
        border: 'border-gray-500',
        text: 'text-gray-900',
        shadow: 'shadow-gray-500/50'
      };
    }
  };

  if (loading) {
    return (
      <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 py-12'>
        <div className='flex items-center justify-center py-20'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 py-12'>
      {/* Title Section */}
      <div className='flex justify-center items-center py-12 mb-8'>
        <div className='group relative flex items-center justify-center gap-3'>
          <FaFire className='text-4xl md:text-5xl text-orange-500 animate-pulse' />
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
              e.currentTarget.style.webkitTextStroke = '2px #fbbf24'
              e.currentTarget.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.5)'
            }}
          >
            SỰ KIỆN XU HƯỚNG
          </h2>
          <FaFire className='text-4xl md:text-5xl text-orange-500 animate-pulse' />
        </div>
      </div>

      {/* Top Movies Display */}
      {topMovies && topMovies.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20 xl:gap-24 max-w-none mx-auto justify-items-center'>
          {topMovies.map((movie, index) => {
            const colors = getRankColors(index);
            
            return (
              <div
                key={movie._id}
                className="relative group cursor-pointer transition-all duration-500 hover:scale-105"
                onClick={() => {
                  navigate(`/movies/${movie._id}`);
                  window.scrollTo(0, 0);
                }}
              >
                {/* Ranking Badge */}
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 
                  bg-gradient-to-r ${colors.bg} ${colors.border} border-2 rounded-full 
                  w-20 h-20 flex items-center justify-center text-2xl font-bold ${colors.text}
                  shadow-lg ${colors.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <div className="flex flex-col items-center">
                    {getRankIcon(index)}
                    <span className="text-sm font-black">{index + 1}</span>
                  </div>
                </div>

                {/* Movie Card */}
                <div className={`relative overflow-hidden rounded-2xl ${colors.border} border-2 
                  bg-white shadow-2xl ${colors.shadow} group-hover:shadow-3xl transition-all duration-500
                  w-96 h-[500px]`}>
                  
                  {/* Movie Poster */}
                  <div className="relative h-full overflow-hidden">
                    <LazyImage
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      width={400}
                      height={500}
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Movie Info on Hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-bold text-xl mb-3 line-clamp-2" style={{ fontFamily: 'Merriweather, serif' }}>
                        {movie.title}
                      </h3>
                      {(movie as any).revenue && (
                        <p className="text-base text-yellow-300 font-semibold">
                          Doanh thu: {(movie as any).revenue.toLocaleString('vi-VN')} VNĐ
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className="text-gray-600 text-xl mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
            Đang cập nhật dữ liệu...
          </div>
          <FaFire className="text-4xl text-orange-500 animate-bounce" />
        </div>
      )}
    </div>
  );
};

export default Trending;