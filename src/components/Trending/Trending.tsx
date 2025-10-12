import { useEffect, useState, useRef } from "react";
import { getTopRevenueMovies } from "../../apis/movie.api";
import type { Movie } from "../../types";
import { useNavigate } from "react-router-dom";
import { FaFire } from "react-icons/fa";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import LazyImage from "../ui/LazyImage";
import BlurCircle from "../layout/BlurCircle";

const Trending = () => {
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch more movies for carousel (10 instead of 3)
  useEffect(() => {
    let ignore = false;
    const fetchTopMovies = async () => {
      try {
        setLoading(true);
        const movies = await getTopRevenueMovies(10);
        if (!ignore && movies) {
          setTopMovies(movies || []);
        }
      } catch (error) {
        console.error("Failed to fetch top revenue movies:", error);
        setTopMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovies();

    return () => {
      ignore = true;
    };
  }, []);

  // Calculate items per view based on screen size
  const getItemsPerView = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 640) return 2; // sm
    return 1;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, topMovies.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (loading) {
    return (
      <div className="relative px-6 md:px-16 lg:px-24 xl:px-44 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Red brick color for all numbers
  const strokeColor = "#730109"; // Red brick stroke
  const fillColor = "#730109"; // Red brick fill on hover

  // Get SVG number component
  const getNumberSVG = (index: number) => {
    const number = index + 1;

    switch (number) {
      case 1:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="65"
            viewBox="0 0 32 65"
            fill="none"
            className="w-10 h-auto transition-all duration-300"
          >
            <path
              d="M19.0979 1H31V64H15.3353V16.6879V15.4342L14.1129 15.713L4.15686 17.984L1.20327 6.04715L19.0979 1Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 2:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="59"
            height="77"
            viewBox="0 0 59 77"
            fill="none"
            className="w-12 h-auto transition-all duration-300"
          >
            <path
              d="M28.222 60.9129H58V76H1V61.7008L28.5152 40.3718L28.5152 40.3719L28.5257 40.3636C35.4513 34.8455 38.4874 31.1186 38.4874 25.9551C38.4874 23.3328 37.5702 21.1313 35.8852 19.593C34.2107 18.0641 31.874 17.2767 29.1805 17.2767C23.8926 17.2767 19.7986 20.2982 14.2688 26.609L1.80485 16.0778C5.5601 11.3021 9.27649 7.61654 13.6656 5.08384C18.2679 2.42817 23.6804 1 30.778 1C38.672 1 45.294 3.39823 49.9277 7.45726C54.5512 11.5074 57.2545 17.2599 57.2545 24.1166V24.3329C57.2545 30.193 55.7684 34.5832 52.9681 38.4997C50.1403 42.4547 45.943 45.9704 40.4167 50.0176L27.6427 59.0979L25.0892 60.9129H28.222Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 3:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="62"
            height="77"
            viewBox="0 0 62 77"
            fill="none"
            className="w-12 h-auto transition-all duration-300"
          >
            <path
              d="M34.493 15.9314H6.23944V1H59.4718V14.5263L41.5971 29.6483L40.0529 30.9547L42.0285 31.3885C47.3297 32.5524 52.0756 34.5961 55.485 37.8364C58.8655 41.0493 61 45.5011 61 51.6569V51.8725C61 59.177 57.9949 65.1782 52.9682 69.3705C47.9265 73.5754 40.7983 76 32.5282 76C18.3855 76 8.5626 71.2301 1.39151 63.6584L13.3236 51.8697C18.7877 57.0622 24.5127 60.098 31.5458 60.098C34.7551 60.098 37.4519 59.3062 39.3693 57.7937C41.3116 56.2616 42.3697 54.053 42.3697 51.4412V51.2255C42.3697 48.4351 41.0569 46.184 38.6697 44.6776C36.3331 43.2032 33.0093 42.4608 28.9261 42.4608H20.7334L18.0507 32.9002L35.1577 17.6784L37.1212 15.9314H34.493Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 4:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="71"
            height="76"
            viewBox="0 0 71 76"
            fill="none"
            className="w-14 h-auto transition-all duration-300"
          >
            <path
              d="M40.2342 1H60.2485V45.7078V46.7078H61.2485H70V60.339H61.2485H60.2485V61.339V75H41.6497V61.339V60.339H40.6497H4.29656L1.09028 46.8334L40.2342 1ZM21.5878 45.1704L20.1985 46.8156H22.3519H40.6497H41.6497V45.8156V24.1475V21.4134L39.8857 23.5023L21.5878 45.1704Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 5:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="61"
            height="76"
            viewBox="0 0 61 76"
            fill="none"
            className="w-12 h-auto transition-all duration-300"
          >
            <path
              d="M8.82308 1H56.6998V16.0308H24.1658H23.2208L23.1674 16.9743L22.5287 28.2572L22.4339 29.9304L23.9514 29.2192C27.248 27.6742 30.6166 26.6527 35.4503 26.6527C41.9302 26.6527 48.0753 28.468 52.5801 32.1729C57.058 35.8556 60 41.4721 60 49.2829V49.4958C60 57.5223 56.9491 63.8603 51.7612 68.2084C46.5538 72.5728 39.1089 75 30.2339 75C17.7096 75 8.84675 70.8077 1.38783 64.0996L11.937 51.7464C17.8052 56.5415 23.463 59.437 29.9145 59.437C33.4693 59.437 36.4554 58.5773 38.5746 56.8911C40.7215 55.1829 41.8796 52.7028 41.8796 49.7087V49.4958C41.8796 46.475 40.6206 44.0241 38.4401 42.3551C36.2882 40.708 33.3122 39.874 29.9145 39.874C25.3101 39.874 21.4454 41.4103 17.9741 43.4455L6.78235 37.2179L8.82308 1Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 6:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="62"
            height="78"
            viewBox="0 0 62 78"
            fill="none"
            className="w-12 h-auto transition-all duration-300"
          >
            <path
              d="M49.8393 21.5048C45.4437 18.356 41.1133 16.25 35.1834 16.25C30.4544 16.25 26.8636 18.0017 24.3539 21.0624C21.8767 24.0834 20.523 28.2915 20.0294 33.1124L19.7956 35.3966L21.6272 34.012C25.5004 31.0844 30.1185 28.4286 37.2215 28.4286C43.6142 28.4286 49.5642 30.4534 53.9011 34.2358C58.2214 38.0038 61 43.5648 61 50.7857V51C61 59.0681 57.7732 65.541 52.5912 70.0106C47.395 74.4925 40.1824 77 32.1799 77C21.6919 77 15.1968 73.9802 9.93161 68.7211C4.5933 63.3889 1 55.2108 1 41.3571V41.1429C1 29.611 3.80854 19.5674 9.40831 12.4298C14.9821 5.32525 23.3968 1 34.8616 1C44.8812 1 51.629 3.51789 58.4943 8.48979L49.8393 21.5048ZM31.3218 62.8214C34.8107 62.8214 37.6755 61.7033 39.6738 59.7673C41.6718 57.8316 42.7266 55.1518 42.7266 52.1786V51.9643C42.7266 48.9747 41.6067 46.2943 39.5558 44.3653C37.5069 42.4383 34.5947 41.3214 31.1073 41.3214C27.6257 41.3214 24.7617 42.4082 22.7609 44.3166C20.7584 46.2265 19.7024 48.8826 19.7024 51.8571V52.0714C19.7024 55.0595 20.8211 57.764 22.8677 59.7187C24.9141 61.6732 27.8273 62.8214 31.3218 62.8214Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 7:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="58"
            height="75"
            viewBox="0 0 58 75"
            fill="none"
            className="w-12 h-auto transition-all duration-300"
          >
            <path
              d="M3.45179 74L35.7311 17.9634L36.5946 16.4643H34.8646H1V1H57V15.3819L24.1635 74H3.45179Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 8:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="62"
            height="77"
            viewBox="0 0 62 77"
            fill="none"
            className="w-12 h-auto transition-all duration-300"
          >
            <path
              d="M31 35.5C36.5 35.5 41.5 33.5 44.5 30C47.5 26.5 49 21.5 49 16C49 10.5 47.5 6 44.5 3C41.5 0 36.5 -1 31 -1C25.5 -1 20.5 0 17.5 3C14.5 6 13 10.5 13 16C13 21.5 14.5 26.5 17.5 30C20.5 33.5 25.5 35.5 31 35.5ZM31 77C36.5 77 42 75.5 46 72C50 68.5 52.5 63.5 52.5 57C52.5 50.5 50 45.5 46 42C42 38.5 36.5 37 31 37C25.5 37 20 38.5 16 42C12 45.5 9.5 50.5 9.5 57C9.5 63.5 12 68.5 16 72C20 75.5 25.5 77 31 77Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 9:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="62"
            height="78"
            viewBox="0 0 62 78"
            fill="none"
            className="w-12 h-auto transition-all duration-300"
          >
            <path
              d="M12.1607 56.4952C16.5563 59.644 20.8867 61.75 26.8166 61.75C31.5456 61.75 35.1364 59.9983 37.6461 56.9376C40.1233 53.9166 41.477 49.7085 41.9706 44.8876L42.2044 42.6034L40.3728 43.988C36.4996 46.9156 31.8815 49.5714 24.7785 49.5714C18.3858 49.5714 12.4358 47.5466 7.09892 43.7642C2.77858 39.9962 1 34.4352 1 27.2143V27C1 18.9319 4.22683 12.459 9.40879 7.98936C14.605 3.50754 21.8176 1 29.8201 1C40.3081 1 46.8032 4.01981 52.0684 9.27887C57.4067 14.6111 61 22.7892 61 36.6429V36.8571C61 48.389 58.1915 58.4326 52.5917 65.5702C47.0179 72.6747 38.6032 77 27.1384 77C17.1188 77 10.371 74.4821 3.50572 69.5102L12.1607 56.4952ZM30.6782 15.1786C27.1893 15.1786 24.3245 16.2967 22.3262 18.2327C20.3282 20.1684 19.2734 22.8482 19.2734 25.8214V26.0357C19.2734 29.0253 20.3933 31.7057 22.4442 33.6347C24.4931 35.5617 27.4053 36.6786 30.8927 36.6786C34.3743 36.6786 37.2383 35.5918 39.2391 33.6834C41.2416 31.7735 42.2976 29.1174 42.2976 26.1429V25.9286C42.2976 22.9405 41.1789 20.236 39.1323 18.2813C37.0859 16.3268 34.1727 15.1786 30.6782 15.1786Z"
              stroke={strokeColor}
              strokeWidth="2"
              fill="transparent"
              className="group-hover:fill-[var(--fill-color)]"
              style={{ "--fill-color": fillColor } as React.CSSProperties}
            />
          </svg>
        );
      case 10:
        return (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="65"
              viewBox="0 0 32 65"
              fill="none"
              className="w-8 h-auto transition-all duration-300"
            >
              <path
                d="M19.0979 1H31V64H15.3353V16.6879V15.4342L14.1129 15.713L4.15686 17.984L1.20327 6.04715L19.0979 1Z"
                stroke={strokeColor}
                strokeWidth="2"
                fill="transparent"
                className="group-hover:fill-[var(--fill-color)]"
                style={{ "--fill-color": fillColor } as React.CSSProperties}
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="62"
              height="78"
              viewBox="0 0 62 78"
              fill="none"
              className="w-8 h-auto transition-all duration-300"
            >
              <path
                d="M31 1C40.3888 1 47.5 4 52 9C56.5 14 59 21 59 30V48C59 57 56.5 64 52 69C47.5 74 40.3888 77 31 77C21.6112 77 14.5 74 10 69C5.5 64 3 57 3 48V30C3 21 5.5 14 10 9C14.5 4 21.6112 1 31 1ZM31 17C26.5 17 23 18.5 20.5 21.5C18 24.5 17 28.5 17 33V45C17 49.5 18 53.5 20.5 56.5C23 59.5 26.5 61 31 61C35.5 61 39 59.5 41.5 56.5C44 53.5 45 49.5 45 45V33C45 28.5 44 24.5 41.5 21.5C39 18.5 35.5 17 31 17Z"
                stroke={strokeColor}
                strokeWidth="2"
                fill="transparent"
                className="group-hover:fill-[var(--fill-color)]"
                style={{ "--fill-color": fillColor } as React.CSSProperties}
              />
            </svg>
          </div>
        );
      default:
        return <span className="text-2xl font-black text-white">{number}</span>;
    }
  };

  return (
    <div className="relative px-6 md:px-16 lg:px-24 xl:px-44 py-12 overflow-hidden">
      {/* Red Striped Background SVG */}
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

      {/* Content */}
      <div className="relative">
        {/* Title Section with Navigation */}
        <div className="flex justify-between items-center py-12 mb-8">
          <BlurCircle top={"0"} left={"-80px"} />
          <div className="flex items-center gap-3 flex-1 justify-center">
            <FaFire className="text-4xl md:text-5xl text-orange-500" />
            <h2
              className="text-4xl md:text-5xl font-extrabold text-center tracking-wider"
              style={{
                fontFamily: "Merriweather, serif",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                color: "#730109",
              }}
            >
              SỰ KIỆN XU HƯỚNG
            </h2>
          </div>

          {/* Navigation Buttons */}
          {topMovies && topMovies.length > itemsPerView && (
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-orange-500"
                aria-label="Previous"
              >
                <BsChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="p-2 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-orange-500"
                aria-label="Next"
              >
                <BsChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        {topMovies && topMovies.length > 0 ? (
          <div className="relative overflow-hidden pt-16 pb-8 -mt-8 pl-8">
            <div
              ref={carouselRef}
              className="flex transition-transform duration-500 ease-in-out gap-6 pr-6"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerView + itemsPerView * 1.5)
                }%)`,
              }}
            >
              {topMovies.map((movie, index) => {
                return (
                  <div
                    key={movie._id}
                    className="relative group cursor-pointer flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
                  >
                    {/* Ranking Number with SVG - Outside card to prevent clipping */}
                    <div className="absolute -top-6 -left-6 z-30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 pointer-events-none">
                      {getNumberSVG(index)}
                    </div>

                    {/* Movie Card */}
                    <div
                      className="relative overflow-hidden rounded-xl border-2 border-gray-300 bg-white shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 h-[400px] w-full"
                      onClick={() => {
                        navigate(`/movies/${movie._id}`);
                        window.scrollTo(0, 0);
                      }}
                    >
                      {/* Movie Poster */}
                      <div className="relative h-full w-full overflow-hidden">
                        <LazyImage
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          width={320}
                          height={400}
                          loading="lazy"
                        />

                        {/* Movie Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                          <h3
                            className="font-bold text-sm sm:text-base text-white line-clamp-2"
                            style={{ fontFamily: "Merriweather, serif" }}
                          >
                            {movie.title}
                          </h3>
                          {"revenue" in movie && movie.revenue ? (
                            <p className="text-xs sm:text-sm text-yellow-300 font-semibold mt-1">
                              Doanh thu:{" "}
                              {(movie.revenue as number).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VNĐ
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="text-gray-600 text-xl mb-4"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Đang cập nhật dữ liệu...
            </div>
            <FaFire className="text-4xl text-orange-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
