import { useEffect, useState } from 'react';
import { getTopRevenueMovies } from '../../apis/movie.api';
import type { Movie } from '../../types';
import { useNavigate } from 'react-router-dom';
import { FaFire } from 'react-icons/fa';

let stylesInjected = false;

const injectGlobalStyles = () => {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes move-gradient {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
};

const Trending = () => {
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    injectGlobalStyles();
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchTopMovies = async () => {
      try {
        setLoading(true);
        console.log('Fetching top revenue movies...');
        const movies = await getTopRevenueMovies(3); // Get top 3 movies
        console.log('Top revenue movies received:', movies);
        if (!ignore && movies) {
          setTopMovies(movies || []);
        }
      } catch (error) {
        console.error('Failed to fetch top revenue movies:', error);
        setTopMovies([]); // Set empty array on error
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
      <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 py-8'>
        <div className='flex items-center justify-center py-20'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500'></div>
        </div>
      </div>
    );
  }

  // If no movies, show message instead of hiding
  if (!topMovies || topMovies.length === 0) {
    return (
      <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 py-8' style={{ marginTop: '20px' }}>
        {/* Title with fire icon */}
        <div className='flex justify-center items-center py-12'>
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
                // Ensure consistent hover effect across all characters
                e.currentTarget.style.webkitTextStroke = '2px #fbbf24'
                e.currentTarget.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.5)'
              }}
            >
              SỰ KIỆN XU HƯỚNG
            </h2>
            <FaFire className='text-4xl md:text-5xl text-orange-500 animate-pulse' />
          </div>
        </div>
        <div className='flex items-center justify-center py-10'>
          <p className='text-gray-600 text-lg' style={{ fontFamily: 'Merriweather, serif' }}>
            Đang cập nhật dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 py-8 overflow-hidden' style={{ marginTop: '20px' }}>
      {/* Title with fire icon */}
      <div className='flex justify-center items-center py-12' style={{ marginBottom: '10px' }}>
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
              // Ensure consistent hover effect across all characters
              e.currentTarget.style.webkitTextStroke = '2px #fbbf24'
              e.currentTarget.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.5)'
            }}
          >
            SỰ KIỆN XU HƯỚNG
          </h2>
          <FaFire className='text-4xl md:text-5xl text-orange-500 animate-pulse' />
        </div>
      </div>

      {/* Movies Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 max-w-full'>
        {topMovies.map((movie, index) => {
          return (
            <div
              key={movie._id}
              className='relative w-full flex justify-center'
            >
              {/* Yellow Background Container - Taller */}
              <div 
                className='relative rounded-3xl p-4 md:p-5 lg:p-6 border-4 max-w-full overflow-hidden'
                style={{
                  backgroundColor: '#ffb000',
                  borderColor: '#ffd700',
                  boxShadow: '0 8px 16px rgba(255, 176, 0, 0.3)',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  width: '100%',
                  maxWidth: '480px',
                  paddingRight: '2rem'
                }}
              >
                {/* Ranking Number - Bottom left corner */}
                <div 
                  className='flex items-end justify-center font-black flex-shrink-0'
                  style={{
                    fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                    color: '#be0500',
                    fontFamily: 'Merriweather, serif',
                    fontWeight: '900',
                    textShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)',
                    WebkitTextStroke: '2px #ffd700',
                    lineHeight: '0.75',
                    transform: 'scaleY(1.6)',
                    transformOrigin: 'bottom',
                    width: '70px',
                    marginRight: '15px'
                  }}
                >
                  {index + 1}
                </div>

                {/* Movie Card - Bottom aligned with Simple Border */}
                <div className='relative group flex-shrink-0' style={{ width: '240px', maxWidth: '100%', marginLeft: '20px' }}>
                  {/* Simple Border */}
                  <div
                    className="relative rounded-xl border-2 border-orange-500 transition-all duration-300 hover:border-orange-400"
                    style={{
                      width: '100%'
                    }}
                  >
                    {/* Inner Card */}
                    <div
                      className='rounded-xl hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer'
                      style={{
                        backgroundColor: '#fff',
                      }}
                      onClick={() => {
                        navigate(`/movies/${movie._id}`);
                        scrollTo(0, 0);
                      }}
                    >
                      {/* Poster Section */}
                      <div className='aspect-[3/4] overflow-hidden'>
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className='w-full h-full object-cover'
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.png';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Trending;