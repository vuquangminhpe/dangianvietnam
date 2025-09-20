import FeaturedSection from "../../components/banners/FeaturedSection/FeaturedSection";
import CarouselBanner from "../../components/banners/CarouselBanner/CarouselBanner";
import TrailerSection from "../../components/movies/TrailerSection/TrailerSection";

const Home = () => {
  return (
    <div className="">
      {/* min-h-screen bg-gradient-to-br from-slate-900 via-primary/40 to-slate-900 py-8 */}
      <CarouselBanner />
      <FeaturedSection />
      <TrailerSection />
    </div>
  );
};

export default Home;
