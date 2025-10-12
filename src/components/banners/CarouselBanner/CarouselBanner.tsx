/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(!items);
  const [error, setError] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  let timeRunning = 3000;
  let timeAutoNext = 6000;
  const runTimeOutRef = useRef<number | undefined>(undefined);
  const runNextAutoRef = useRef<number | undefined>(undefined);

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
          setCarouselItems([]);
          setError("No active banners found. Please contact administrator.");
        }
      } catch (err) {
        console.error("Error fetching banner slider home:", err);
        setError(err instanceof Error ? err.message : "Failed to load banners");
        setCarouselItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [items]);

  useEffect(() => {
    if (carouselItems.length > 0) {
      // Initialize slider after data is loaded
      initSlider();
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
    let thumbnailBorderDom = carouselRef.current.querySelector('.carousel .thumbnail') as HTMLElement;
    let timeDom = carouselRef.current.querySelector('.carousel .time') as HTMLElement;
    let carouselDom = carouselRef.current.querySelector('.carousel') as HTMLElement;

    let SliderItemsDom = SliderDom.querySelectorAll('.carousel .list .item');
    let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.carousel .thumbnail .item');

    if(type === 'next'){
      SliderDom.appendChild(SliderItemsDom[0]);
      thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
      carouselDom.classList.add('next');
    }else{
      SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
      thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
      carouselDom.classList.add('prev');
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
        .carousel{
            height: 100vh;
            margin-top: -50px;
            width: 100vw;
            overflow: hidden;
            position: relative;
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
            top: 20%;
            width: 1140px;
            max-width: 80%;
            left: 50%;
            transform: translateX(-50%);
            padding-right: 30%;
            box-sizing: border-box;
            color: #fff;
            text-shadow: 0 5px 10px #0004;
            height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }
        .carousel .list .item .author{
            font-weight: bold;
            letter-spacing: 10px;
        }
        .carousel .list .item .title,
        .carousel .list .item .topic{
            font-size: 5em;
            font-weight: bold;
            line-height: 1.3em;
        }
        .carousel .list .item .topic{
            color: #f1683a;
        }
        .carousel .list .item .buttons{
            display: grid;
            grid-template-columns: repeat(2, 130px);
            grid-template-rows: 40px;
            gap: 5px;
            margin-top: auto;
            align-self: flex-start;
            box-sizing: border-box;
        }
        .carousel .list .item .buttons button{
            border: none;
            background-color: #eee;
            letter-spacing: 3px;
            font-family: Poppins;
            font-weight: 500;
        }
        .carousel .list .item .buttons button:nth-child(1){
            background-color: #730109;
            color: #FFFFF;
        }
        .carousel .list .item .buttons button:nth-child(2){
            background-color: transparent;
            border: 1px solid #fff;
            color: #eee;
        }
        /* thumbail */
        .thumbnail{
            position: absolute;
            bottom: 50px;
            left: 50%;
            width: max-content;
            z-index: 100;
            display: flex;
            gap: 20px;
        }
        .thumbnail .item{
            width: 150px;
            height: 220px;
            flex-shrink: 0;
            position: relative;
        }
        .thumbnail .item img{
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 20px;
        }
        .thumbnail .item .content{
            color: #fff;
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
        }
        .thumbnail .item .content .title{
            font-weight: 500;
        }
        .thumbnail .item .content .description{
            font-weight: 300;
        }
        /* arrows */
        .arrows{
            margin-top: 26px;
            margin-left: 40px;
            display: grid;
            grid-template-columns: repeat(2, 130px);
            gap: 5px;
        }
        .arrows button{
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #eee4;
            border: none;
            color: #fff;
            font-family: monospace;
            font-weight: bold;
            transition: .5s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .arrows button:hover{
            background-color: #fff;
            color: #000;
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
        @keyframes showContent{
            to{
                transform: translateY(0px);
                filter: blur(0px);
                opacity: 1;
            }
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
        @keyframes showImage{
            to{
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 0;
            }
        }

        .carousel.next .thumbnail .item:nth-last-child(1){
            overflow: hidden;
            animation: showThumbnail .5s linear 1 forwards;
        }
        .carousel.prev .list .item img{
            z-index: 100;
        }
        @keyframes showThumbnail{
            from{
                width: 0;
                opacity: 0;
            }
        }
        .carousel.next .thumbnail{
            animation: effectNext .5s linear 1 forwards;
        }

        @keyframes effectNext{
            from{
                transform: translateX(150px);
            }
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
        @keyframes runningTime{
            from{ width: 100%}
            to{width: 0}
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
        @keyframes outFrame{
            to{
                width: 150px;
                height: 220px;
                bottom: 50px;
                left: 50%;
                border-radius: 20px;
            }
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

        @keyframes contentOut{
            to{
                transform: translateY(-150px);
                filter: blur(20px);
                opacity: 0;
            }
        }
        @media screen and (max-width: 678px) {
            .carousel .list .item .content{
                padding-right: 0;
            }
            .carousel .list .item .content .title{
                font-size: 30px;
            }
        }
      `}</style>

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
            <div className="list">
              {carouselItems.map((item, index) => (
                <div
                  key={item.id}
                  className="item"
                >
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full"
                    width={1920}
                    height={1080}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <div className="content">
                    <div className="author">{item?.author}</div>
                    <div className="title">{item.title}</div>
                    {/* <div className="topic">{item.topic}</div> */}
                    <div className="des">{item.description}</div>
                    <div className="buttons">
                      <button onClick={() => navigate(`/movie/${item.id}`)}>ĐẶT VÉ</button>
                      <button onClick={() => navigate('/product')}>XEM THÊM</button>
                    </div>
                    <div className="arrows">
                      <button className="prev-btn">&lt;</button>
                      <button className="next-btn">&gt;</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* list thumnail */}
            <div className="thumbnail">
              {carouselItems.map((item, index) => (
                <div
                  key={item.id}
                  className="item"
                >
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full"
                    width={150}
                    height={220}
                    loading="lazy"
                  />
                  <div className="content">
                    <div className="title">{item.title}</div>
                    {/* <div className="description">{item.topic}</div> */}
                  </div>
                </div>
              ))}
            </div>

            {/* time running */}
            <div className="time"></div>
          </>
        )}
      </div>
    </>
  );
};

export default CarouselBanner;
