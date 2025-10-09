/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import LazyImage from "../../ui/LazyImage";
import {
  getActiveBannerSliderHome,
  type BannerSliderHome,
} from "../../../apis/bannerSliderHome.api";

interface CarouselItem {
  id: string;
  image: string;
  author: string;
  title: string;
  topic: string;
  description: string;
}

interface CarouselBannerProps {
  items?: CarouselItem[];
}

// Transform API data to CarouselItem format
const transformBannerToCarouselItem = (
  banner: BannerSliderHome
): CarouselItem => ({
  id: banner._id,
  image: banner.image,
  author: banner.author,
  title: banner.title,
  topic: banner.topic || "FEATURED",
  description: banner.description,
});

const CarouselBanner: React.FC<CarouselBannerProps> = ({ items }) => {
  const navigate = useNavigate();
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>(
    items || []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(!items);
  const [error, setError] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const timebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const timeRunning = 1800;
  const timeAutoNext = 7000;

  // Fetch active banners from API
  useEffect(() => {
    if (items) {
      setCarouselItems(items);
      setLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const banners = await getActiveBannerSliderHome();

        if (banners && banners.length > 0) {
          const transformedItems = banners.map(transformBannerToCarouselItem);
          setCarouselItems(transformedItems);
        } else {
          // No banners available
          setCarouselItems([]);
          setError("No active banners found. Please contact administrator.");
        }
      } catch (err) {
        console.error("Error fetching banner slider home:", err);
        setError(err instanceof Error ? err.message : "Failed to load banners");
        // No fallback - show error instead
        setCarouselItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [items]);

  const createSilkyTransition = (
    newIdx: number,
    direction?: "next" | "prev"
  ) => {
    if (isAnimating || newIdx === currentIndex) return;

    setIsAnimating(true);

    const carousel = carouselRef.current;
    if (!carousel) {
      setIsAnimating(false);
      return;
    }

    const currentSlide = carousel.querySelector(
      `[data-slide="${currentIndex}"]`
    );
    const newSlide = carousel.querySelector(`[data-slide="${newIdx}"]`);
    const overlay = overlayRef.current;

    if (!currentSlide || !newSlide) {
      setIsAnimating(false);
      return;
    }

    // Get elements for animation
    const currentImg = currentSlide.querySelector("img");
    const currentContent = currentSlide.querySelectorAll(".content > div > *");
    const newImg = newSlide.querySelector("img");
    const newContent = newSlide.querySelectorAll(".content > div > *");

    // ULTRA SMOOTH GSAP Timeline
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        // Clean up and update state
        gsap.set([currentSlide, newSlide], { clearProps: "all" });
        gsap.set([currentImg, newImg], { clearProps: "all" });
        gsap.set([currentContent, newContent], { clearProps: "all" });
        if (overlay) gsap.set(overlay, { clearProps: "all" });

        // Update current index AFTER animation completes
        setCurrentIndex(newIdx);
        setIsAnimating(false);
      },
    });

    // Set initial states
    tl.set(newSlide, { zIndex: 3, opacity: 1 })
      .set(currentSlide, { zIndex: 2 })

      // SPECIAL EFFECT: Magic overlay
      .to(
        overlay,
        {
          duration: 0.4,
          opacity: 0.6,
          scale: 1.1,
          ease: "power1.inOut",
        },
        0
      )

      // PHASE 1: Silky smooth shrink to center
      .to(
        currentImg,
        {
          duration: 0.8,
          scale: 0.02,
          x: 0,
          y: 0,
          transformOrigin: "center center",
          opacity: 0,
          filter: "blur(8px)",
          ease: "power2.inOut",
        },
        0
      )

      // PHASE 1: Gentle content fade
      .to(
        currentContent,
        {
          duration: 0.6,
          y: direction === "next" ? -30 : 30,
          opacity: 0,
          scale: 0.95,
          filter: "blur(4px)",
          stagger: 0.06,
          ease: "power2.inOut",
        },
        0
      )

      // PHASE 2: New image magical appearance from center
      .fromTo(
        newImg,
        {
          scale: 0.02,
          x: 0,
          y: 0,
          transformOrigin: "center center",
          opacity: 0,
          filter: "blur(12px)",
        },
        {
          duration: 1,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          ease: "power2.out",
        },
        0.4
      )

      // PHASE 3: Content graceful entrance
      .fromTo(
        newContent,
        {
          y: direction === "next" ? 50 : -50,
          opacity: 0,
          scale: 0.9,
          filter: "blur(6px)",
        },
        {
          duration: 0.9,
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          stagger: 0.08,
          ease: "power2.out",
        },
        0.7
      )

      // Clear overlay
      .to(
        overlay,
        {
          duration: 0.5,
          opacity: 0,
          scale: 1,
          ease: "power1.inOut",
        },
        0.8
      )

      // Clean up z-index
      .set(currentSlide, { zIndex: 1 }, 1.3);

    // Enhanced progress bar
    if (timebarRef.current) {
      gsap.fromTo(
        timebarRef.current,
        { width: "100%" },
        {
          width: "0%",
          duration: timeRunning / 1000,
          ease: "linear",
        }
      );
    }
  };

  const handleNext = () => {
    if (isAnimating) return;
    const newIndex = (currentIndex + 1) % carouselItems.length;
    createSilkyTransition(newIndex, "next");
  };

  const handlePrev = () => {
    if (isAnimating) return;
    const newIndex =
      (currentIndex - 1 + carouselItems.length) % carouselItems.length;
    createSilkyTransition(newIndex, "prev");
  };

  const handleThumbnailClick = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    const direction = index > currentIndex ? "next" : "prev";
    createSilkyTransition(index, direction);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAnimating) return;

    const runNextAuto = setTimeout(() => {
      handleNext();
    }, timeAutoNext);

    return () => clearTimeout(runNextAuto);
  }, [currentIndex, isAnimating]);

  // Initialize first slide
  useEffect(() => {
    if (carouselRef.current) {
      const firstSlide = carouselRef.current.querySelector(`[data-slide="0"]`);
      if (firstSlide) {
        // Set all slides to proper initial state
        const allSlides = carouselRef.current.querySelectorAll("[data-slide]");
        allSlides.forEach((slide, index) => {
          if (index === 0) {
            gsap.set(slide, { opacity: 1, zIndex: 2 });
          } else {
            gsap.set(slide, { opacity: 0, zIndex: 1 });
          }
        });

        // Initial animation for first slide
        gsap.fromTo(
          firstSlide.querySelector("img"),
          {
            scale: 0.8,
            opacity: 0,
            filter: "blur(20px)",
          },
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "power2.out",
          }
        );

        gsap.fromTo(
          firstSlide.querySelectorAll(".content > div > *"),
          {
            y: 80,
            opacity: 0,
            scale: 0.8,
            filter: "blur(10px)",
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.2,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.8,
          }
        );
      }
    }
  }, []);

  return (
    <>
      <style>{`
        /* Simplified base styles */
        .carousel {
          position: relative;
        }

        .carousel .list .item {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .carousel .list .item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Simple overlay */
        .magic-overlay {
          background: rgba(0, 0, 0, 0.4);
        }

        /* Simple thumbnails */
        .thumbnail .item {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .thumbnail .item:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .thumbnail .item.active {
          border-color: #f97316 !important;
          box-shadow: 0 4px 8px rgba(249, 115, 22, 0.5);
        }

        /* Simple buttons */
        .navigation-button {
          transition: all 0.2s ease;
          cursor: pointer;
          pointer-events: auto;
        }

        .navigation-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        .navigation-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        /* Simple progress bar */
        .progress-bar {
          background: #f97316;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .content {
            padding: 0 1rem !important;
            top: 15% !important;
          }
          
          .content > div {
            max-width: 90% !important;
            padding-right: 10% !important;
          }
          
          .title {
            font-size: 3rem !important;
          }
          
          .topic {
            font-size: 3rem !important;
          }
          
          .des {
            font-size: 0.875rem !important;
          }
          
          .thumbnail {
            bottom: 6rem !important;
            right: 1rem !important;
            flex-direction: row !important;
            gap: 0.75rem !important;
          }
          
          .thumbnail .item {
            width: 4rem !important;
            height: 5rem !important;
          }
          
          .arrows {
            bottom: 1rem !important;
            right: 1rem !important;
            flex-direction: row !important;
            gap: 1rem !important;
          }
          
          .navigation-button {
            width: 3rem !important;
            height: 3rem !important;
          }
        }

        @media (max-width: 480px) {
          .title {
            font-size: 2.5rem !important;
          }
          
          .topic {
            font-size: 2.5rem !important;
          }
          
          .buttons {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          
          .buttons button {
            font-size: 0.875rem !important;
            padding: 0.75rem 1.5rem !important;
          }
        }
      `}</style>

      <div
        ref={carouselRef}
        className="carousel relative h-screen w-full overflow-hidden bg-black"
      >
        {/* Magic transition overlay */}
        <div
          ref={overlayRef}
          className="magic-overlay absolute inset-0 z-[50] opacity-0 pointer-events-none"
        />

        {/* Enhanced progress bar */}
        <div
          ref={timebarRef}
          className="progress-bar absolute top-0 left-0 h-1 z-[1000]"
          style={{ width: "0%" }}
        />

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-[100]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <div className="text-white text-xl">Loading banners...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-[100]">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-2">
                Error Loading Banners
              </div>
              <div className="text-slate-400 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && carouselItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-[100]">
            <div className="text-center">
              <div className="text-slate-400 text-xl mb-2">
                No Banners Available
              </div>
              <div className="text-slate-500 text-sm">
                Please contact administrator to add banners
              </div>
            </div>
          </div>
        )}

        {/* Main slider - Only render if we have data */}
        {carouselItems.length > 0 && (
          <>
            <div className="list relative w-full h-full">
              {carouselItems.map((item, index) => (
                <div
                  key={item.id}
                  data-slide={index}
                  className="item"
                  style={{
                    opacity: index === currentIndex ? 1 : 0,
                    zIndex: index === currentIndex ? 2 : 1,
                  }}
                >
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full"
                    width={1920}
                    height={1080}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <div className="content absolute top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-8 text-white">
                    <div className="max-w-[60%] pr-[30%]">
                      <div 
                        className="author font-bold tracking-[10px] text-sm mb-4 text-white/90 drop-shadow-md"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        {item?.author}
                      </div>
                      <h1 
                        className="title text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 drop-shadow-2xl"
                        style={{ fontFamily: 'Merriweather, serif' }}
                      >
                        {item.title}
                      </h1>
                      <h2 
                        className="topic text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-orange-500 drop-shadow-2xl"
                        style={{ fontFamily: 'Merriweather, serif' }}
                      >
                        {item.topic}
                      </h2>
                      <p 
                        className="des text-base lg:text-lg mb-8 leading-relaxed text-white/90 drop-shadow-lg"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        {item.description}
                      </p>
                      <div className="buttons flex gap-6">
                        <Button
                          size="lg"
                          onClick={() => navigate(`/movie/${item.id}`)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-black tracking-wider px-10 lg:px-12 py-4 lg:py-5 transition-colors duration-200 shadow-lg border-2 border-orange-400 rounded-xl"
                          style={{ 
                            fontFamily: 'Inter, system-ui, sans-serif',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                            fontSize: '1.1rem',
                            fontWeight: '900'
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span 
                              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: '900' }}
                            >
                              MUA VÉ
                            </span>
                          </span>
                        </Button>
                        <Button
                          onClick={() => navigate('/product')}
                          className="bg-slate-700 hover:bg-slate-800 text-white font-black tracking-wider px-10 lg:px-12 py-4 lg:py-5 transition-colors duration-200 shadow-lg border-2 border-slate-500 rounded-xl"
                          style={{ 
                            fontFamily: 'Inter, system-ui, sans-serif',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                            fontSize: '1.1rem',
                            fontWeight: '900'
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span 
                              style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: '900' }}
                            >
                              CHI TIẾT
                            </span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation arrows with fixed interaction */}
            <div className="arrows absolute bottom-12 right-8 flex flex-col gap-4 z-[300]">
              <Button
                onClick={handlePrev}
                disabled={isAnimating}
                size="icon"
                className="navigation-button w-14 h-14 rounded-full bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-2xl"
                style={{ pointerEvents: "auto" }}
              >
                <ChevronLeft className="w-7 h-7" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={isAnimating}
                size="icon"
                className="navigation-button w-14 h-14 rounded-full bg-black/20 hover:bg-black/40 border border-white/30 text-white shadow-2xl"
                style={{ pointerEvents: "auto" }}
              >
                <ChevronRight className="w-7 h-7" />
              </Button>
            </div>

            {/* Fixed thumbnails with correct active state */}
            <div className="thumbnail absolute bottom-16 right-36 flex flex-col gap-4 z-[200]">
              {carouselItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleThumbnailClick(index)}
                  className={`item w-24 h-32 lg:w-28 lg:h-36 flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    index === currentIndex
                      ? "active border-orange-500"
                      : "border-white/20 hover:border-white/60"
                  }`}
                  style={{
                    pointerEvents: isAnimating ? "none" : "auto",
                    cursor: isAnimating ? "default" : "pointer",
                  }}
                >
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full"
                    width={112}
                    height={144}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="content absolute bottom-2 left-2 right-2 text-white">
                    <div 
                      className="title font-semibold text-xs truncate drop-shadow-md"
                      style={{ fontFamily: 'Merriweather, serif' }}
                    >
                      {item.title}
                    </div>
                    <div 
                      className="description font-light text-xs text-orange-300 truncate"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {item.topic}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CarouselBanner;
