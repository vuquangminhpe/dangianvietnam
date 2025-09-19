/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { Button } from "../../ui/button";
import Test1 from "../../../../public/avatar2.jpg";
import Test2 from "../../../../public/avenger_endgame.jpg";
import Test3 from "../../../../public/spidermanAcross.jpg";
import Test4 from "../../../../public/johnWick4.png";
interface CarouselItem {
  id: number;
  image: string;
  author: string;
  title: string;
  topic: string;
  description: string;
}

interface CarouselBannerProps {
  items?: CarouselItem[];
}

const defaultItems: CarouselItem[] = [
  {
    id: 1,
    image: Test1,
    author: "CINEMA CONNECT",
    title: "MOVIE SLIDER",
    topic: "CINEMA",
    description:
      "Experience the magic of cinema with our curated collection of the latest blockbusters and timeless classics. Immerse yourself in stories that captivate, inspire, and entertain audiences worldwide.",
  },
  {
    id: 2,
    image: Test2,
    author: "CINEMA CONNECT",
    title: "FEATURED FILMS",
    topic: "DRAMA",
    description:
      "Discover compelling narratives and powerful performances in our featured film collection. From award-winning dramas to thrilling adventures, find your next favorite movie experience.",
  },
  {
    id: 3,
    image: Test3,
    author: "CINEMA CONNECT",
    title: "NEW RELEASES",
    topic: "ACTION",
    description:
      "Stay up to date with the latest releases and upcoming blockbusters. Get exclusive access to trailers, behind-the-scenes content, and early screening opportunities.",
  },
  {
    id: 4,
    image: Test4,
    author: "CINEMA CONNECT",
    title: "CLASSIC COLLECTION",
    topic: "VINTAGE",
    description:
      "Revisit the golden age of cinema with our carefully preserved classic collection. Experience the timeless stories that have shaped modern filmmaking and continue to inspire new generations.",
  },
];

const CarouselBanner: React.FC<CarouselBannerProps> = ({
  items = defaultItems,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const timebarRef = useRef<HTMLDivElement>(null);

  const timeRunning = 3000;
  const timeAutoNext = 7000;

  const showSlider = (type: "next" | "prev") => {
    if (isAnimating) return;

    const carousel = carouselRef.current as any;
    const sliderDom = carousel?.querySelector(".list");
    const thumbnailBorderDom = carousel?.querySelector(".thumbnail");

    if (!sliderDom || !thumbnailBorderDom) return;

    setIsAnimating(true);

    const sliderItems = sliderDom.querySelectorAll(".item");
    const thumbnailItems = thumbnailBorderDom.querySelectorAll(".item");

    if (type === "next") {
      // Move first item to end (like original JS)
      if (sliderItems[0]) sliderDom.appendChild(sliderItems[0]);
      if (thumbnailItems[0]) thumbnailBorderDom.appendChild(thumbnailItems[0]);
      carousel.classList.add("next");
    } else {
      // Move last item to front (like original JS)
      if (sliderItems[sliderItems.length - 1]) {
        sliderDom.prepend(sliderItems[sliderItems.length - 1]);
      }
      if (thumbnailItems[thumbnailItems.length - 1]) {
        thumbnailBorderDom.prepend(thumbnailItems[thumbnailItems.length - 1]);
      }
      carousel.classList.add("prev");
    }

    // Clean up after animation
    setTimeout(() => {
      carousel.classList.remove("next", "prev");
      setIsAnimating(false);
    }, timeRunning);

    // Update current index for React state sync
    if (type === "next") {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }

    // Progress bar animation
    if (timebarRef.current) {
      gsap.fromTo(
        timebarRef.current,
        { width: "100%" },
        { width: "0%", duration: timeRunning / 1000, ease: "linear" }
      );
    }
  };

  const handleNext = () => showSlider("next");
  const handlePrev = () => showSlider("prev");

  const handleThumbnailClick = (index: number) => {
    if (index !== currentIndex && !isAnimating) {
      setCurrentIndex(index);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAnimating) return;

    const runNextAuto = setTimeout(() => {
      handleNext();
    }, timeAutoNext);

    return () => clearTimeout(runNextAuto);
  }, [currentIndex]);

  return (
    <>
      <style>{`
        /* Base carousel styles */
        .carousel .list .item {
          position: absolute;
          inset: 0 0 0 0;
        }

        .carousel .list .item:nth-child(1) {
          z-index: 1;
        }

        /* Initial content animations */
        .carousel .list .item:nth-child(1) .content .author,
        .carousel .list .item:nth-child(1) .content .title,
        .carousel .list .item:nth-child(1) .content .topic,
        .carousel .list .item:nth-child(1) .content .des,
        .carousel .list .item:nth-child(1) .content .buttons {
          transform: translateY(50px);
          filter: blur(20px);
          opacity: 0;
          animation: showContent 0.5s 1s linear 1 forwards;
        }

        .carousel .list .item:nth-child(1) .content .title {
          animation-delay: 1.2s !important;
        }
        .carousel .list .item:nth-child(1) .content .topic {
          animation-delay: 1.4s !important;
        }
        .carousel .list .item:nth-child(1) .content .des {
          animation-delay: 1.6s !important;
        }
        .carousel .list .item:nth-child(1) .content .buttons {
          animation-delay: 1.8s !important;
        }

        @keyframes showContent {
          to {
            transform: translateY(0px);
            filter: blur(0px);
            opacity: 1;
          }
        }

        /* Next animations */
        .carousel.next .list .item:nth-child(1) img {
          width: 150px;
          height: 220px;
          position: absolute;
          bottom: 50px;
          left: 50%;
          border-radius: 30px;
          animation: showImage 0.5s linear 1 forwards;
        }

        @keyframes showImage {
          to {
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
        }

        .carousel.next .thumbnail .item:nth-last-child(1) {
          overflow: hidden;
          animation: showThumbnail 0.5s linear 1 forwards;
        }

        @keyframes showThumbnail {
          from {
            width: 0;
            opacity: 0;
          }
        }

        .carousel.next .thumbnail {
          animation: effectNext 0.5s linear 1 forwards;
        }

        @keyframes effectNext {
          from {
            transform: translateX(150px);
          }
        }

        /* Prev animations */
        .carousel.prev .list .item:nth-child(2) {
          z-index: 2;
        }

        .carousel.prev .list .item:nth-child(2) img {
          animation: outFrame 0.5s linear 1 forwards;
          position: absolute;
          bottom: 0;
          left: 0;
        }

        @keyframes outFrame {
          to {
            width: 150px;
            height: 220px;
            bottom: 50px;
            left: 50%;
            border-radius: 20px;
          }
        }

        .carousel.prev .thumbnail .item:nth-child(1) {
          overflow: hidden;
          opacity: 0;
          animation: showThumbnail 0.5s linear 1 forwards;
        }

        .carousel.prev .list .item:nth-child(2) .content .author,
        .carousel.prev .list .item:nth-child(2) .content .title,
        .carousel.prev .list .item:nth-child(2) .content .topic,
        .carousel.prev .list .item:nth-child(2) .content .des,
        .carousel.prev .list .item:nth-child(2) .content .buttons {
          animation: contentOut 1.5s linear 1 forwards !important;
        }

        @keyframes contentOut {
          to {
            transform: translateY(-150px);
            filter: blur(20px);
            opacity: 0;
          }
        }

        /* Disable buttons during animation */
        .carousel.next .arrows button,
        .carousel.prev .arrows button {
          pointer-events: none;
        }
      `}</style>
      <div
        ref={carouselRef}
        className="carousel relative h-screen w-full overflow-hidden bg-black"
      >
        {/* Progress bar */}
        <div
          ref={timebarRef}
          className="absolute top-0 left-0 h-1 bg-orange-500 z-[1000] transition-all duration-300"
          style={{ width: "0%" }}
        />

        {/* Main slider */}
        <div className="list relative w-full h-full">
          {items.map((item) => (
            <div key={item.id} className="item absolute inset-0 w-full h-full">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="content absolute top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-8 text-white">
                <div className="max-w-[60%] pr-[30%]">
                  <div className="author font-bold tracking-[10px] text-sm mb-4 text-white/90">
                    {item.author}
                  </div>
                  <h1 className="title text-6xl md:text-8xl font-bold leading-tight mb-2 drop-shadow-lg">
                    {item.title}
                  </h1>
                  <h2 className="topic text-6xl md:text-8xl font-bold leading-tight mb-6 text-orange-500 drop-shadow-lg">
                    {item.topic}
                  </h2>
                  <p className="des text-lg mb-8 leading-relaxed text-white/90 drop-shadow-md">
                    {item.description}
                  </p>
                  <div className="buttons flex gap-4">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 font-medium tracking-wider px-8"
                    >
                      SEE MORE
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white hover:text-black font-medium tracking-wider px-8"
                    >
                      SUBSCRIBE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Thumbnails */}
        <div
          ref={thumbnailRef}
          className="thumbnail absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-5 z-[100]"
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleThumbnailClick(index)}
              className="item w-36 h-52 flex-shrink-0 cursor-pointer relative"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="content absolute bottom-2 left-2 right-2 text-white">
                <div className="title font-medium text-sm truncate">
                  {item.title}
                </div>
                <div className="description font-light text-xs text-white/70 truncate">
                  {item.topic}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="arrows absolute top-1/2 right-8 transform -translate-y-1/2 flex flex-col gap-3 z-[100]">
          <Button
            onClick={handlePrev}
            disabled={isAnimating}
            size="icon"
            className="w-12 h-12 rounded-full bg-black/60 hover:bg-white hover:text-black border border-white/20 backdrop-blur-md transition-all duration-300 disabled:opacity-30 text-white shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={handleNext}
            disabled={isAnimating}
            size="icon"
            className="w-12 h-12 rounded-full bg-black/60 hover:bg-white hover:text-black border border-white/20 backdrop-blur-md transition-all duration-300 disabled:opacity-30 text-white shadow-lg hover:shadow-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default CarouselBanner;
