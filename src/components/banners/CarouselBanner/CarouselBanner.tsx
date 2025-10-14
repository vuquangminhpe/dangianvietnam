/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Import banner images
import { bannerImages } from "../../../assets/bn";

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

// Local banner data
const localBannerData: CarouselItem[] = bannerImages.map((banner: any) => ({
  id: banner.id,
  image: banner.src,
  author: banner.author,
  title: banner.title,
  topic: banner.topic,
  description: banner.description,
}));

const CarouselBanner: React.FC<CarouselBannerProps> = ({ items }) => {
  const navigate = useNavigate();
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>(
    items || []
  );
  const [loading, setLoading] = useState(!items);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  let timeRunning = 3000;
  let timeAutoNext = 6000;
  const runTimeOutRef = useRef<number | undefined>(undefined);
  const runNextAutoRef = useRef<number | undefined>(undefined);

  // Function to scroll to featured section
  const scrollToFeaturedSection = () => {
    const featuredSection = document.querySelector('[data-section="featured"]');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: scroll to a reasonable position
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  // Load local banner data
  useEffect(() => {
    if (items) {
      setCarouselItems(items);
      setLoading(false);
      return;
    }

    // Use local banner data instead of API
    setCarouselItems(localBannerData);
    setLoading(false);
  }, [items]);

  useEffect(() => {
    if (carouselItems.length > 0) {
      // Initialize slider after data is loaded
      initSlider();
      setCurrentIndex(0); // Reset to first slide when data changes
    }
    return () => {
      if (runNextAutoRef.current) {
        clearInterval(runNextAutoRef.current);
        runNextAutoRef.current = undefined;
      }
      if (runTimeOutRef.current) {
        clearTimeout(runTimeOutRef.current);
        runTimeOutRef.current = undefined;
      }
    };
  }, [carouselItems]);

  const initSlider = () => {
    if (!carouselRef.current) return;

    const nextDoms = carouselRef.current.querySelectorAll('.next-btn');
    const prevDoms = carouselRef.current.querySelectorAll('.prev-btn');

    nextDoms.forEach(dom => {
      (dom as HTMLElement).onclick = function(){
        console.log('next clicked');
        showSlider('next');
      }
    });

    prevDoms.forEach(dom => {
      (dom as HTMLElement).onclick = function(){
        console.log('prev clicked');
        showSlider('prev');
      }
    });

    runNextAutoRef.current = setInterval(() => {
      console.log('Auto next interval');
      const nextDom = carouselRef.current?.querySelector('.next-btn') as HTMLElement;
      if (nextDom) nextDom.click();
    }, timeAutoNext);
  };

  const showSlider = (type: string) => {
    console.log('showSlider called with type:', type);
    if (!carouselRef.current) return;

    let SliderDom = carouselRef.current.querySelector('.carousel .list') as HTMLElement;
    let carouselDom = carouselRef.current.querySelector('.carousel') as HTMLElement;

    let SliderItemsDom = SliderDom.querySelectorAll('.carousel .list .item');

    if(type === 'next'){
      SliderDom.appendChild(SliderItemsDom[0]);
      carouselDom.classList.add('next');
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }else{
      SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
      carouselDom.classList.add('prev');
      setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    }

    clearTimeout(runTimeOutRef.current);
    runTimeOutRef.current = setTimeout(() => {
      carouselDom.classList.remove('next');
      carouselDom.classList.remove('prev');
    }, timeRunning);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        body{
            margin: 0;
            background-color: #000;
            color: #eee;
            font-family: Poppins;
            font-size: 12px;
        }
        a{
            text-decoration: none;
        }
        /* carousel */
        .carousel-container {
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .carousel{
            height: 80vh; /* Reverted to original height */
            width: 90%; /* Changed width to 90% */
            overflow: hidden;
            position: relative;
            border-radius: 20px;
            margin: 0 auto;
        }
        .carousel .list .item{
            width: 100%;
            height: 100%;
            position: absolute;
            inset: 0 0 0 0;
        }
        .carousel .list .item img{
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .carousel .list .item .content{
            position: absolute;
            bottom: 15%;
            left: 5%;
            right: 5%;
            color: #fff;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
            z-index: 10;
        }
        .carousel .list .item .author{
            font-weight: 600;
            font-size: 0.9em;
            letter-spacing: 2px;
            margin-bottom: 8px;
            opacity: 0.9;
        }
        .carousel .list .item .title{
            font-size: 3.5em;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 12px;
        }
        .carousel .list .item .topic{
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 8px;
            color: #fef3c7;
        }
        .carousel .list .item .des{
            font-size: 1em;
            font-weight: 400;
            line-height: 1.4;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        .carousel .list .item .buttons{
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        .carousel .list .item .buttons button{
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-family: Poppins;
            font-weight: 600;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .carousel .list .item .buttons button:nth-child(1){
            background-color: #730109;
            color: #fff;
        }
        .carousel .list .item .buttons button:nth-child(1):hover{
            background-color: #5a0708;
        }
        .carousel .list .item .buttons button:nth-child(2){
            background-color: transparent;
            border: 2px solid #fff;
            color: #fff;
        }
        .carousel .list .item .buttons button:nth-child(2):hover{
            background-color: #fff;
            color: #000;
        }
        /* thumbail */
        .thumbnail{
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            width: max-content;
            z-index: 100;
            display: flex;
            gap: 15px;
            padding: 0 20px;
        }
        .thumbnail .item{
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            position: relative;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0.5;
        }
        .thumbnail .item.active{
            opacity: 1;
            transform: scale(1.2);
        }
        .thumbnail .item img{
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid transparent;
            transition: all 0.3s ease;
        }
        /* Removed green border for active thumbnail */
        /* .thumbnail .item.active img{
            border-color: #10b981;
        } */
        .thumbnail .item:hover{
            opacity: 0.8;
            transform: scale(1.1);
        }
        .thumbnail .item .content{
            display: none;
        }
        /* arrows */
        .arrows{
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 100;
            pointer-events: none;
        }
        .arrows button{
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            font-family: monospace;
            font-weight: bold;
            font-size: 18px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(10px);
            pointer-events: auto;
        }
        .arrows button:hover{
            background-color: rgba(0, 0, 0, 0.8);
            border-color: rgba(255, 255, 255, 0.8);
            transform: scale(1.1);
        }

        /* animation */
        .carousel .list .item:nth-child(1){
            z-index: 1;
        }

        /* animation text in first item */

        .carousel .list .item:nth-child(1) .content .author,
        .carousel .list .item:nth-child(1) .content .title,
        .carousel .list .item:nth-child(1) .content .topic,
        .carousel .list .item:nth-child(1) .content .des,
        .carousel .list .item:nth-child(1) .content .buttons,
        .carousel .list .item:nth-child(1) .content .arrows
        {
            transform: translateY(50px);
            filter: blur(20px);
            opacity: 0;
            animation: showContent .5s 1s linear 1 forwards;
        }
       
        .carousel .list .item:nth-child(1) .content .title{
            animation-delay: 1.2s!important;
        }
        .carousel .list .item:nth-child(1) .content .topic{
            animation-delay: 1.4s!important;
        }
        .carousel .list .item:nth-child(1) .content .des{
            animation-delay: 1.6s!important;
        }
        .carousel .list .item:nth-child(1) .content .buttons{
            animation-delay: 1.8s!important;
        }
        .carousel .list .item:nth-child(1) .content .arrows{
            animation-delay: 1s!important;
        }
        /* create animation when next click */
        .carousel.next .list .item:nth-child(1) img{
            width: 150px;
            height: 220px;
            position: absolute;
            bottom: 50px;
            left: 50%;
            border-radius: 30px;
            animation: showImage .5s linear 1 forwards;
        }
       

        .carousel.next .thumbnail .item:nth-last-child(1){
            overflow: hidden;
            animation: showThumbnail .5s linear 1 forwards;
        }
        .carousel.prev .list .item img{
            z-index: 100;
        }
      
        .carousel.next .thumbnail{
            animation: effectNext .5s linear 1 forwards;
        }

       

        /* running time */

        .carousel .time{
            position: absolute;
            z-index: 1000;
            width: 0%;
            height: 3px;
            background-color: #f1683a;
            left: 0;
            top: 0;
        }

        .carousel.next .time,
        .carousel.prev .time{
            animation: runningTime 3s linear 1 forwards;
        }
      


        /* prev click */

        .carousel.prev .list .item:nth-child(2){
            z-index: 2;
        }

        .carousel.prev .list .item:nth-child(2) img{
            animation: outFrame 0.5s linear 1 forwards;
            position: absolute;
            bottom: 0;
            left: 0;
        }
       

        .carousel.prev .thumbnail .item:nth-child(1){
            overflow: hidden;
            opacity: 0;
            animation: showThumbnail .5s linear 1 forwards;
        }
        .carousel.prev .list .item:nth-child(2) .content .author,
        .carousel.prev .list .item:nth-child(2) .content .title,
        .carousel.prev .list .item:nth-child(2) .content .topic,
        .carousel.prev .list .item:nth-child(2) .content .des,
        .carousel.prev .list .item:nth-child(2) .content .buttons,
        .carousel.prev .list .item:nth-child(2) .content .arrows
        {
            animation: contentOut 1.5s linear 1 forwards!important;
        }

      
        @media screen and (max-width: 768px) {
            .carousel{
                width: 95%; /* Adjust width for smaller screens */
                height: 70vh;
                border-radius: 15px;
            }
            .carousel .list .item .content{
                bottom: 10%;
                left: 3%;
                right: 3%;
            }
            .carousel .list .item .title{
                font-size: 2.5em;
            }
            .carousel .list .item .buttons{
                flex-direction: column;
                gap: 10px;
            }
            .carousel .list .item .buttons button{
                width: 100%;
                max-width: 200px;
            }
            .thumbnail{
                bottom: 25px;
                gap: 10px;
            }
         0thumbnail .item{
                width: 30px;
                height: 30px;
            }
            .arrows {
                width: calc(100% + 40px);
                left: -20px;
            }
            .arrows button{
                width: 40px;
                height: 40px;
                font-size: 16px;
            }
        }
      `}</style>

      {/* Wrapper with black background */}
      <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
        <div className="carousel-container">
          <div
            ref={carouselRef}
            className="carousel"
          >
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-[100]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <div className="text-white text-xl">Loading banners...</div>
              </div>
            </div>
          )}

          {/* Error State - Removed since we use local data */}
          {/* {!loading && !error && carouselItems.length === 0 && (
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
          )} */}

          {/* Main slider - Only render if we have data */}
          {carouselItems.length > 0 && (
            <>
              <div className="list">
                {carouselItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="item"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full"
                      width={1920}
                      height={1080}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="content">
                     
                      <div className="buttons">
                        <button onClick={scrollToFeaturedSection}>ĐẶT VÉ</button>
                        <button onClick={() => navigate('/product')}>XEM THÊM</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
              <div className="arrows">
                <button className="prev-btn ">&lt;</button>
                <button className="next-btn">&gt;</button>
              </div>

              {/* time running */}
              <div className="time"></div>
            </>
          )}
          </div>

          {/* list thumnail - moved outside carousel */}
          {carouselItems.length > 0 && (
            <div className="thumbnail">
              {carouselItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`item ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => {
                    // Handle thumbnail click to go to specific slide
                    const targetIndex = index;
                    if (targetIndex > currentIndex) {
                      for (let i = 0; i < targetIndex - currentIndex; i++) {
                        const nextBtn = carouselRef.current?.querySelector('.next-btn') as HTMLElement;
                        if (nextBtn) nextBtn.click();
                      }
                    } else if (targetIndex < currentIndex) {
                      for (let i = 0; i < currentIndex - targetIndex; i++) {
                        const prevBtn = carouselRef.current?.querySelector('.prev-btn') as HTMLElement;
                        if (prevBtn) prevBtn.click();
                      }
                    }
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full"
                    width={40}
                    height={40}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CarouselBanner;