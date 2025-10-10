import { useEffect, useState } from 'react';
import { getTopRevenueMovies } from '../../apis/movie.api';
import type { Movie } from '../../types';
import { useNavigate } from 'react-router-dom';
import { FaFire } from 'react-icons/fa';
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
        <div className='flex items-center justify-center gap-3'>
          <FaFire className='text-4xl md:text-5xl text-orange-500 animate-pulse' />
          <h2 
            className='text-4xl md:text-5xl font-extrabold text-center tracking-wider'
            style={{ 
              fontFamily: 'Merriweather, serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              color: '#730109'
            }}
          >
            SỰ KIỆN XU HƯỚNG
          </h2>
        </div>
      </div>

      {/* Top Movies Display */}
      {topMovies && topMovies.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-7xl mx-auto justify-items-center'>
          {topMovies.map((movie) => {
            return (
              <div
                key={movie._id}
                className="relative group cursor-pointer transition-all duration-300"
                onClick={() => {
                  navigate(`/movies/${movie._id}`);
                  window.scrollTo(0, 0);
                }}
              >
                {/* Movie Card */}
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-300 
                  bg-white shadow-lg group-hover:shadow-xl transition-all duration-300
                  w-64 h-80 sm:w-72 sm:h-96 lg:w-80 lg:h-[400px]">
                  
                  {/* Movie Poster */}
                  <div className="relative h-full overflow-hidden">
                    <LazyImage
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300"
                      width={320}
                      height={400}
                      loading="lazy"
                    />
                    
                    {/* Movie Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                      <h3 className="font-bold text-sm sm:text-base text-white line-clamp-2" style={{ fontFamily: 'Merriweather, serif' }}>
                        {movie.title}
                      </h3>
                      {(movie as any).revenue && (
                        <p className="text-xs sm:text-sm text-yellow-300 font-semibold mt-1">
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