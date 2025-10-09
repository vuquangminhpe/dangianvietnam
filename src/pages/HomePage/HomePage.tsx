import FeaturedSection from '../../components/banners/FeaturedSection/FeaturedSection'
import CarouselBanner from '../../components/banners/CarouselBanner/CarouselBanner'
import TrailerSection from '../../components/movies/TrailerSection/TrailerSection'
import Trending from '../../components/Trending/Trending'
import ComingSoon from '../../components/ComingSoon/ComingSoon'
import Category from '../../components/Category/Category'
import bgImage from '../../assets/background home-01.png'

const Home = () => {
  return (
    <div
      className='bg-cover bg-center bg-no-repeat w-full min-h-screen'
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: 'fixed',
        fontFamily: 'Roboto, sans-serif'
      }}
    >
      {/* min-h-screen bg-gradient-to-br from-slate-900 via-primary/40 to-slate-900 py-8 */}
      <CarouselBanner />
      
      {/* Section spacing with title */}
      <div className='flex justify-center items-center py-12' style={{ marginTop: '75px' }}>
        <div className="group relative flex items-center justify-center">
          <h2 
            className='text-5xl md:text-7xl font-extrabold text-gray-800 text-center tracking-wider transition-all duration-500 cursor-pointer group-hover:text-red-500'
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
            ĐANG CÔNG CHIẾU
          </h2>
        </div>
      </div>
      <FeaturedSection />
      <Trending />
      <ComingSoon />
      <Category />
      <TrailerSection />
    </div>
  )
}

export default Home
