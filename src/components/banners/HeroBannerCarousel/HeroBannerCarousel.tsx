import { useState, useEffect, useRef } from "react";
import { Button } from "../../ui/button";
import { ChevronLeft, ChevronRight, Play, ExternalLink } from "lucide-react";
import type { Banner } from "../../../types/Banner.type";

interface HeroBannerCarouselProps {
  banners?: Banner[];
  isLoading?: boolean;
  autoSlide?: boolean;
  slideInterval?: number;
}

export const HeroBannerCarousel = ({
  banners = [],
  isLoading = false,
  autoSlide = true,
  slideInterval = 5000,
}: HeroBannerCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoSlide);
  const intervalRef = useRef<number | null>(null);

  // Auto slide functionality
  useEffect(() => {
    if (isAutoPlaying && banners && banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (banners?.length || 1));
      }, slideInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, banners?.length, slideInterval]);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false);

    // Resume auto play after 10 seconds
    setTimeout(() => setIsAutoPlaying(autoSlide), 10000);
  };
  const goToPrevious = () => {
    if (!banners || banners.length === 0) return;
    const newSlide = currentSlide === 0 ? banners.length - 1 : currentSlide - 1;
    goToSlide(newSlide);
  };

  const goToNext = () => {
    if (!banners || banners.length === 0) return;
    const newSlide = (currentSlide + 1) % banners.length;
    goToSlide(newSlide);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.link_url) {
      window.open(banner.link_url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <section className="relative h-[70vh] bg-gradient-to-r from-gray-900 to-gray-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400 text-lg">Đang tải banner...</div>
        </div>
      </section>
    );
  }
  if (!banners || !banners.length) {
    return (
      <section className="relative h-[70vh] bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Chào mừng đến với Cinema Connect
          </h2>
          <p className="text-xl text-gray-300">
            Trải nghiệm điện ảnh tuyệt vời
          </p>
          {isLoading && (
            <p className="text-sm text-gray-400 mt-4">Đang tải banner...</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[70vh] overflow-hidden bg-black">
      {/* Banner Slides */}
      <div className="relative h-full">
        {" "}
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 z-0"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback cho ảnh bị lỗi
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  // Hiển thị background gradient thay thế
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background =
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                  }
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  {/* Badge */}
                  {banner.type && (
                    <div className="inline-block mb-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide">
                        {banner.type === "home_slider"
                          ? "Nổi bật"
                          : banner.type === "promotion"
                          ? "Khuyến mãi"
                          : "Thông báo"}
                      </span>
                    </div>
                  )}{" "}
                  {/* Title */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                    {banner.title}
                  </h1>
                  {/* Description */}
                  {banner.description && (
                    <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed max-w-xl line-clamp-3">
                      {banner.description}
                    </p>
                  )}{" "}
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {banner.link_url && (
                      <Button
                        onClick={() => handleBannerClick(banner)}
                        className="group bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-medium shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 ease-in-out transform"
                        size="lg"
                      >
                        <Play
                          className="mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                          size={18}
                        />
                        Đặt vé ngay
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="group border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white hover:scale-105 active:scale-95 hover:border-purple-400 px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-medium transition-all duration-300 ease-in-out transform bg-transparent backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/25"
                      size="lg"
                    >
                      <ExternalLink
                        className="mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                        size={18}
                      />
                      Tìm hiểu thêm
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>{" "}
      {/* Navigation Arrows */}
      {banners && banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="group absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 hover:scale-110 active:scale-95 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft
              className="transition-transform duration-300 group-hover:-translate-x-1"
              size={24}
            />
          </button>

          <button
            onClick={goToNext}
            className="group absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/60 hover:scale-110 active:scale-95 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight
              className="transition-transform duration-300 group-hover:translate-x-1"
              size={24}
            />
          </button>
        </>
      )}{" "}
      {/* Slide Indicators */}
      {banners && banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentSlide
                  ? "bg-orange-500 scale-125 shadow-lg shadow-orange-500/50"
                  : "bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      {/* Auto-play indicator */}
      {isAutoPlaying && banners && banners.length > 1 && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            Auto-play: ON
          </div>
        </div>
      )}
    </section>
  );
};
