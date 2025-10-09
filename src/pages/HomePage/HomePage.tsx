import { lazy, Suspense } from 'react'
import CarouselBanner from '../../components/banners/CarouselBanner/CarouselBanner'
import LazyLoad from '../../components/ui/LazyLoad'
import ImagePreloader from '../../components/ui/ImagePreloader'
import bgImage from '../../assets/background home-01.png'

// Lazy load components
const FeaturedSection = lazy(() => import('../../components/banners/FeaturedSection/FeaturedSection'))
const TrailerSection = lazy(() => import('../../components/movies/TrailerSection/TrailerSection'))
const Trending = lazy(() => import('../../components/Trending/Trending'))
const ComingSoon = lazy(() => import('../../components/ComingSoon/ComingSoon'))
const Category = lazy(() => import('../../components/Category/Category'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
  </div>
)

// Section placeholder
const SectionPlaceholder = () => (
  <div className="flex justify-center items-center py-24">
    <div className="text-gray-400 text-lg">Đang tải...</div>
  </div>
)

const Home = () => {
  return (
    <div
      className='bg-cover bg-center bg-no-repeat w-full min-h-screen'
      style={{
        backgroundImage: `url(${bgImage})`,
        fontFamily: 'Roboto, sans-serif'
      }}
    >
      {/* Preload critical images */}
      <ImagePreloader images={[bgImage]} />
      
      {/* min-h-screen bg-gradient-to-br from-slate-900 via-primary/40 to-slate-900 py-8 */}
      <CarouselBanner />
      
      {/* Section spacing with title */}
      <div className='flex justify-center items-center py-12' style={{ marginTop: '75px' }}>
        <div className="group relative flex items-center justify-center">
          <h2 
            className='text-5xl md:text-7xl font-extrabold text-gray-800 text-center tracking-wider transition-colors duration-200 cursor-pointer group-hover:text-red-500'
            style={{ 
              fontFamily: 'Merriweather, serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            ĐANG CÔNG CHIẾU
          </h2>
        </div>
      </div>
      
      {/* Lazy loaded components with intersection observer */}
      <LazyLoad fallback={<SectionPlaceholder />} rootMargin="200px">
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedSection />
        </Suspense>
      </LazyLoad>
      
      <LazyLoad fallback={<SectionPlaceholder />} rootMargin="200px">
        <Suspense fallback={<LoadingSpinner />}>
          <Trending />
        </Suspense>
      </LazyLoad>
      
      <LazyLoad fallback={<SectionPlaceholder />} rootMargin="200px">
        <Suspense fallback={<LoadingSpinner />}>
          <ComingSoon />
        </Suspense>
      </LazyLoad>
      
      <LazyLoad fallback={<SectionPlaceholder />} rootMargin="200px">
        <Suspense fallback={<LoadingSpinner />}>
          <Category />
        </Suspense>
      </LazyLoad>
      
      <LazyLoad fallback={<SectionPlaceholder />} rootMargin="200px">
        <Suspense fallback={<LoadingSpinner />}>
          <TrailerSection />
        </Suspense>
      </LazyLoad>
    </div>
  )
}

export default Home
