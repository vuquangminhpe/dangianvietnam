import { IoIosCalendar } from "react-icons/io";
import { GoClock } from "react-icons/go";
import { BsArrowRight } from "react-icons/bs";
import { RefreshCw } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getHomeSliderBanners } from "../../../apis/banner.api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Banner } from "../../../types";

const HeroSection = () => {
  const {
    isLoading: isLoadingBanners,
    isError: isErrorBanners,
    data: sliderBanners,
    error: errorBanners,
    refetch,
  } = useQuery({
    queryKey: ["bannerSliders"],
    queryFn: () => getHomeSliderBanners(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: "linear",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case "home_slider":
        return "Featured";
      case "movie_promotion":
        return "Movie";
      case "promotion":
        return "Promotion";
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const handleExploreClick = (banner: Banner) => {
    if (banner.link_url) {
      window.location.href = banner.link_url;
    } else {
      // Fallback to movies page
      window.location.href = "/movies";
    }
  };

  // Loading state
  if (isLoadingBanners) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-white"
        >
          <RefreshCw className="animate-spin w-8 h-8 text-orange-500" />
          <p className="text-lg font-medium">Loading amazing content...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (isErrorBanners) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white max-w-md px-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-300 mb-6">
            {errorBanners instanceof Error
              ? errorBanners.message
              : "Failed to load banners"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium mx-auto transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Slider {...settings}>
        {sliderBanners?.map((banner, index) => (
          <div key={banner._id} className="relative h-screen w-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${banner.image_url}')`,
              }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60" />

            {/* Content */}
            <div className="relative z-10 flex items-center h-full px-6 md:px-16 lg:px-36">
              <motion.div
                className="flex flex-col gap-4 max-w-2xl"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                {/* Position Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                    #{banner.position}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Position {banner.position} of {sliderBanners.length}
                  </span>
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {banner.title}
                </motion.h1>

                <motion.div
                  className="flex items-center gap-4 text-gray-300 flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <span className="bg-primary px-3 py-1 rounded-full text-sm font-medium">
                    {getTypeDisplay(banner.type)}
                  </span>

                  {banner.start_date && (
                    <div className="flex items-center gap-1">
                      <IoIosCalendar className="w-4 h-4" />
                      <span className="text-sm">
                        From {formatDate(banner.start_date)}
                      </span>
                    </div>
                  )}

                  {banner.end_date && (
                    <div className="flex items-center gap-1">
                      <GoClock className="w-4 h-4" />
                      <span className="text-sm">
                        Until {formatDate(banner.end_date)}
                      </span>
                    </div>
                  )}
                </motion.div>

                <motion.p
                  className="text-lg text-gray-200 leading-relaxed max-h-20 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {banner.description}
                </motion.p>

                <motion.button
                  className="flex items-center gap-2 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition-all duration-300 rounded-full font-medium cursor-pointer max-w-fit text-white group"
                  onClick={() => handleExploreClick(banner)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {banner.link_url ? "View Details" : "Explore Movies"}
                  <BsArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>

                {/* Banner Info */}
                <motion.div
                  className="mt-4 text-xs text-gray-400 opacity-70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {banner.status === "active" ? (
                    <span className="text-green-400">● Active Banner</span>
                  ) : (
                    <span className="text-gray-500">● Inactive Banner</span>
                  )}
                  {banner.movie_id && (
                    <span className="ml-3">Movie ID: {banner.movie_id}</span>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSection;
