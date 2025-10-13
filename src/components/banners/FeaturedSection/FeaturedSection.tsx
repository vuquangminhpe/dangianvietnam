import { BsArrowRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMoviesByStatus } from "../../../apis/movie.api";
import { getShowtimeByMovieId } from "../../../apis/showtime.api";
import type { Movie } from "../../../types";
import BlurCircle from "../../layout/BlurCircle";
import Carousel from "../../Carousel";
// import MoviesByTheaters from "../MoviesByTheaters/MoviesByTheaters";

const FeaturedSection = () => {
  const navigate = useNavigate()

  const [getShowingMovies, setGetShowingMovies] = useState<Movie[]>([])
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    let ignore = false
    const fetchData = async () => {
      try {
        const movies = await getMoviesByStatus('now_showing', 9, 1) // Fetch 9 movies for the carousel
        if (!ignore) {
          setGetShowingMovies(movies)
          // Fetch first upcoming showtime for each movie to get time and price
          const enriched = await Promise.all(
            movies.map(async (m) => {
              try {
                const showtimes = await getShowtimeByMovieId(m._id)
                const first = showtimes && showtimes.length > 0 ? showtimes[0] : null
                return {
                  id: m._id,
                  imageUrl: m.poster_url,
                  title: m.title,
                  duration: m.duration,
                  genre: m.genre as string[],
                  release_date: m.release_date,
                  average_rating: m.average_rating,
                  showtimeStart: first?.start_time ?? null,
                  showtimeEnd: first?.end_time ?? null,
                  priceRegular: first?.price?.regular ?? null,
                }
              } catch {
                return {
                  id: m._id,
                  imageUrl: m.poster_url,
                  title: m.title,
                  duration: m.duration,
                  genre: m.genre as string[],
                  release_date: m.release_date,
                  average_rating: m.average_rating,
                  showtimeStart: null,
                  showtimeEnd: null,
                  priceRegular: null,
                }
              }
            })
          )
          if (!ignore) setCards(enriched)
        }
      } catch (error) {
        console.error('Failed to fetch popular movies:', error)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  const formattedMovies = cards.length > 0
    ? cards
    : getShowingMovies.map((movie) => ({
        id: movie._id,
        imageUrl: movie.poster_url,
        title: movie.title,
        duration: movie.duration,
        genre: movie.genre as string[],
        release_date: movie.release_date,
        average_rating: movie.average_rating,
        showtimeStart: null,
        showtimeEnd: null,
        priceRegular: null,
      }))

  return (
    <div className='relative w-11/12 lg:w-4/5 mx-auto overflow-hidden' data-section="featured">

  {/* Nền SVG */}
  <div className="absolute top-0 left-0 w-full h-full">
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 3903 2510"
      enableBackground="new 0 0 3903 2510"
      xmlSpace="preserve"
    >
      <path
        d="M0 0 C27.06 0 54.12 0 82 0 C82 21.12 82 42.24 82 64 C92.89 64 103.78 64 115 64 C115 42.88 115 21.76 115 0 C1271.65 0 2428.3 0 3620 0 C3620 21.12 3620 42.24 3620 64 C3631.22 64 3642.44 64 3654 64 C3654 42.88 3654 21.76 3654 0 C3680.73 0 3707.46 0 3735 0 C3735 25.74 3735 51.48 3735 78 C3712.56 78 3690.12 78 3667 78 C3667 89.22 3667 100.44 3667 112 C3689.44 112 3711.88 112 3735 112 C3735 826.45 3735 1540.9 3735 2277 C3712.56 2277 3690.12 2277 3667 2277 C3667 2288.55 3667 2300.1 3667 2312 C3689.44 2312 3711.88 2312 3735 2312 C3735 2337.41 3735 2362.82 3735 2389 C3708.27 2389 3681.54 2389 3654 2389 C3654 2367.88 3654 2346.76 3654 2325 C3642.78 2325 3631.56 2325 3620 2325 C3620 2346.12 3620 2367.24 3620 2389 C2463.35 2389 1306.7 2389 115 2389 C115 2367.88 115 2346.76 115 2325 C104.11 2325 93.22 2325 82 2325 C82 2346.12 82 2367.24 82 2389 C54.94 2389 27.88 2389 0 2389 C0 2363.59 0 2338.18 0 2312 C22.77 2312 45.54 2312 69 2312 C69 2300.45 69 2288.9 69 2277 C46.23 2277 23.46 2277 0 2277 C0 1562.55 0 848.1 0 112 C22.77 112 45.54 112 69 112 C69 100.78 69 89.56 69 78 C46.23 78 23.46 78 0 78 C0 52.26 0 26.52 0 0 Z M13 13 C13 29.83 13 46.66 13 64 C31.48 64 49.96 64 69 64 C69 47.17 69 30.34 69 13 C50.52 13 32.04 13 13 13 Z M128 13 C128 29.83 128 46.66 128 64 C155.06 64 182.12 64 210 64 C210 84.13 210 104.26 210 125 C182.94 125 155.88 125 128 125 C128 154.7 128 184.4 128 215 C108.53 215 89.06 215 69 215 C69 185.3 69 155.6 69 125 C50.52 125 32.04 125 13 125 C13 830.87 13 1536.74 13 2264 C31.48 2264 49.96 2264 69 2264 C69 2234.3 69 2204.6 69 2174 C88.47 2174 107.94 2174 128 2174 C128 2203.7 128 2233.4 128 2264 C155.06 2264 182.12 2264 210 2264 C210 2284.13 210 2304.26 210 2325 C182.94 2325 155.88 2325 128 2325 C128 2341.83 128 2358.66 128 2376 C1276.07 2376 2424.14 2376 3607 2376 C3607 2359.17 3607 2342.34 3607 2325 C3580.27 2325 3553.54 2325 3526 2325 C3526 2304.87 3526 2284.74 3526 2264 C3552.73 2264 3579.46 2264 3607 2264 C3607 2234.3 3607 2204.6 3607 2174 C3626.8 2174 3646.6 2174 3667 2174 C3667 2203.7 3667 2233.4 3667 2264 C3685.15 2264 3703.3 2264 3722 2264 C3722 1558.13 3722 852.26 3722 125 C3703.85 125 3685.7 125 3667 125 C3667 154.7 3667 184.4 3667 215 C3647.2 215 3627.4 215 3607 215 C3607 185.3 3607 155.6 3607 125 C3580.27 125 3553.54 125 3526 125 C3526 104.87 3526 84.74 3526 64 C3552.73 64 3579.46 64 3607 64 C3607 47.17 3607 30.34 3607 13 C2458.93 13 1310.86 13 128 13 Z M3667 13 C3667 29.83 3667 46.66 3667 64 C3685.15 64 3703.3 64 3722 64 C3722 47.17 3722 30.34 3722 13 C3703.85 13 3685.7 13 3667 13 Z M82 78 C82 89.22 82 100.44 82 112 C92.89 112 103.78 112 115 112 C115 100.78 115 89.56 115 78 C104.11 78 93.22 78 82 78 Z M128 78 C128 89.22 128 100.44 128 112 C150.77 112 173.54 112 197 112 C197 100.78 197 89.56 197 78 C174.23 78 151.46 78 128 78 Z M3539 78 C3539 89.22 3539 100.44 3539 112 C3561.44 112 3583.88 112 3607 112 C3607 100.78 3607 89.56 3607 78 C3584.56 78 3562.12 78 3539 78 Z M3620 78 C3620 89.22 3620 100.44 3620 112 C3631.22 112 3642.44 112 3654 112 C3654 100.78 3654 89.56 3654 78 C3642.78 78 3631.56 78 3620 78 Z M82 125 C82 150.41 82 175.82 82 202 C92.89 202 103.78 202 115 202 C115 176.59 115 151.18 115 125 C104.11 125 93.22 125 82 125 Z M3620 125 C3620 150.41 3620 175.82 3620 202 C3631.22 202 3642.44 202 3654 202 C3654 176.59 3654 151.18 3654 125 C3642.78 125 3631.56 125 3620 125 Z M82 2188 C82 2213.08 82 2238.16 82 2264 C92.89 2264 103.78 2264 115 2264 C115 2238.92 115 2213.84 115 2188 C104.11 2188 93.22 2188 82 2188 Z M3620 2188 C3620 2213.08 3620 2238.16 3620 2264 C3631.22 2264 3642.44 2264 3654 2264 C3654 2238.92 3654 2213.84 3654 2188 C3642.78 2188 3631.56 2188 3620 2188 Z M82 2277 C82 2288.55 82 2300.1 82 2312 C92.89 2312 103.78 2312 115 2312 C115 2300.45 115 2288.9 115 2277 C104.11 2277 93.22 2277 82 2277 Z M128 2277 C128 2288.55 128 2300.1 128 2312 C150.77 2312 173.54 2312 197 2312 C197 2300.45 197 2288.9 197 2277 C174.23 2277 151.46 2277 128 2277 Z M3539 2277 C3539 2288.55 3539 2300.1 3539 2312 C3561.44 2312 3583.88 2312 3607 2312 C3607 2300.45 3607 2288.9 3607 2277 C3584.56 2277 3562.12 2277 3539 2277 Z M3620 2277 C3620 2288.55 3620 2300.1 3620 2312 C3631.22 2312 3642.44 2312 3654 2312 C3654 2300.45 3654 2288.9 3654 2277 C3642.78 2277 3631.56 2277 3620 2277 Z M13 2325 C13 2341.83 13 2358.66 13 2376 C31.48 2376 49.96 2376 69 2376 C69 2359.17 69 2342.34 69 2325 C50.52 2325 32.04 2325 13 2325 Z M3667 2325 C3667 2341.83 3667 2358.66 3667 2376 C3685.15 2376 3703.3 2376 3722 2376 C3722 2359.17 3722 2342.34 3722 2325 C3703.85 2325 3685.7 2325 3667 2325 Z "
        fill="#720300"
        transform="translate(75,50)"
      />
    </svg>
  </div>

  {/* Nội dung bên trong */}
 <div className='relative'>
  <div>
    {/* Thay đổi chính ở dòng dưới: justify-start -> justify-end */}
    <div className='relative flex items-center justify-end sm:pt-20 sm:pb-10'>
      <BlurCircle top={'0'} left={'-60px'} />
      {/* Không cần justify-start ở đây nữa */}
      <div className="group relative flex items-center">
        <h4 
          // Thay đổi chính ở dòng dưới: xóa ml-10, thêm mr-3
          className='text-base sm:text-lg md:text-2xl font-extrabold text-gray-900 text-center tracking-wider flex items-center gap-2 sm:gap-3 cursor-pointer mr-24'
          style={{ 
            fontFamily: 'Merriweather, serif',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          }}
          onClick={() => navigate('/movies')}
        >
          Xem tất cả
          <BsArrowRight
            className='w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6'
          />
        </h4>
      </div>
    </div>
    {getShowingMovies.length > 0 && <Carousel cardData={formattedMovies} />}
  </div>
</div>

      {/* <div>
        <div className="relative flex items-center justify-between pt-20 pb-10">
          <BlurCircle top={"0"} left={"-80px"} />
          <p className="text-gray-300 font-medium text-lg">Lich Chieu Buổi biểu diễn</p>
        </div>
        <MoviesByTheaters />
      </div> */}
    </div>
  );
};

export default FeaturedSection;
