import { Link } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import LoginModal from "../user/LoginModal";
import RegisterModal from "../user/RegisterModal";
import { searchMovies } from "../../apis/movie.api";
import type { Movie } from "../../types/Movie.type";
import { useAuthStore } from "../../store/useAuthStore";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Avatar from "../ui/Avatar";
import { useWindowScroll } from "react-use";
import gsap from "gsap";
import { FaBars } from "react-icons/fa";
import logoImage from "../../assets/Giao dien home-06.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [isRegisterForm, setIsRegisterForm] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user, logout } = useAuthStore();

  const searchRef = useRef<HTMLDivElement>(null);

  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(false);

  const navContainerRef = useRef<HTMLDivElement>(null);

  const { y: currentSrollY } = useWindowScroll();

  useEffect(() => {
    if (currentSrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.remove("floating-nav");
    } else if (currentSrollY > lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current?.classList.add("floating-nav");
    }

    setLastScrollY(currentSrollY);
  }, [currentSrollY, lastScrollY]);

  // Determine navbar background color based on scroll position
  const getNavbarBackground = () => {
    return currentSrollY === 0 ? '#730109' : '#730109'; // Dark gray when at top, red when scrolled
  };

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 1 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  // Handle search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await searchMovies(query.trim(), 5);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { title: "Trang chủ", link: "/" },
      { title: "SỰ KIỆN", link: "/movies" },
      { title: "Sản phẩm", link: "/product" },
    ];

    if (!user) {
      return baseItems;
    }

    switch (user.role) {
      case "admin":
        return [...baseItems, { title: "Quản trị viên", link: "/admin" }];
      case "staff":
        return [...baseItems, { title: "Đối tác", link: "/partner" }];
      case "customer":
        return [...baseItems, { title: "Đặt chỗ của tôi", link: "/my-bookings" }];
      default:
        return [...baseItems];
    }
  };

  const navigationItems = getNavigationItems();

  const getUserQuickAccess = () => {
    const baseActions = [
      {
        title: "Đăng xuất",
        link: "",
        action: () => logout(),
      },
    ];

    // All roles should have access to profile, payment history, and bookings
    return [
      {
        title: "Hồ sơ",
        link: "/profile",
      },
      {
        title: "Lịch sử thanh toán",
        link: "/payment-history",
      },
      {
        title: "Đặt chỗ của tôi",
        link: "/my-bookings",
      },
      ...baseActions,
    ];
  };

  const userQuickAccess = getUserQuickAccess();

  return (
    <>

      {/* Mobile Navbar: always visible on small screens */}
      <div className="fixed top-0 left-0 right-0 z-[200] md:hidden flex items-center justify-between px-4 h-16 bg-[#730109]">
        <Link to="/" className="flex-shrink-0">
          <img src={logoImage} alt="Dân Gian Việt Nam Logo" className="w-20 h-auto" />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-gray-800 text-white transition-all duration-300"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Menu dropdown khi mở */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-[140] bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-64 bg-gray-600 shadow-lg flex flex-col pt-16 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                className="nav-hover-btn py-3 rounded-md text-base"
                to={item.link}
                onClick={() => setIsOpen(false)}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {item.title}
              </Link>
            ))}

            <div className="w-full border-b border-gray-500 " />

            <div>
              {user ? (
                <div>
                  <Popover as="div" className="relative inline-block text-left">
                    <PopoverButton
                      className={`p-1 rounded-full transition-all duration-300 flex mt-2 items-center`}
                    >
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        size="lg"
                        className={`transition-all duration-300 `}
                      />

                      <div className="flex flex-col items-start">
                        {userQuickAccess.map((item, index) =>
                          item.link ? (
                            <Link
                              key={index}
                              to={item.link}
                              className={`block px-4 py-2 text-sm transition-all duration-200 `}
                              onClick={() => setIsOpen(false)}
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <button
                              key={index}
                              onClick={() => {
                                if ("action" in item && item.action) {
                                  item.action();
                                }
                                setIsOpen(false);
                              }}
                              className={`block px-4 py-2 text-sm transition-all duration-200 text-left w-full`}
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              {item.title}
                            </button>
                          )
                        )}
                      </div>
                    </PopoverButton>
                  </Popover>
                </div>
              ) : (
                <button
                  className="px-4 py-1 sm:px-7 sm:py-2 bg-[#F84565] hover:bg-[#D63854]
            transition rounded-full font-medium cursor-pointer w-full mt-3 text-base"
                  onClick={() => setIsLoginForm(true)}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Desktop Navbar: only visible on md+ screens */}
      <div
        ref={navContainerRef}
        className={`fixed left-0 right-0 z-[150] h-20 border-none transition-all duration-700 flex items-center justify-between px-8 hidden md:flex`}
        style={{ 
          margin: 0, 
          width: '100vw', 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: getNavbarBackground(),
          transition: 'background-color 0.3s ease'
        }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Logo section */}
          <Link to={"/"} className="flex-shrink-0">
            <img 
              src={logoImage} 
              alt="Dân Gian Việt Nam Logo" 
              className="w-24 h-auto"
            />
          </Link>

          {/* Search bar positioned towards center-left */}
          <div ref={searchRef} className="relative w-80 ml-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full px-4 py-2.5 pl-11 pr-4 border-2 rounded-lg focus:outline-none transition-colors text-sm placeholder-[#630c09]"
                style={{ 
                  fontFamily: 'Merriweather, serif',
                  backgroundColor: '#ffebd3',
                  color: '#630c09',
                  borderColor: '#630c09'
                }}
              />
              <IoIosSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#630c09' }} />
            </div>

            {/* Search dropdown */}
            {isSearchOpen && (searchQuery.trim() || searchResults.length > 0) && (
              <div className="absolute left-0 top-10 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[160]">
                {/* Search results */}
                <div className="max-h-80 overflow-y-auto">
                  {searchLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    </div>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <div className="p-2">
                      {searchResults.map((movie) => (
                        <Link
                          key={movie._id}
                          to={`/movies/${movie._id}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                            setSearchResults([]);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate" style={{ fontFamily: 'Merriweather, serif' }}>
                              {movie.title}
                            </h4>
                            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Merriweather, serif' }}>
                              {new Date(movie.release_date).getFullYear()} •{" "}
                              {movie.duration} min
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-gray-400 text-sm" style={{ fontFamily: 'Merriweather, serif' }}>
                                {movie.average_rating}/10
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!searchLoading &&
                    searchResults.length === 0 &&
                    searchQuery.trim() && (
                      <div className="p-8 text-center">
                        <p className="text-gray-400" style={{ fontFamily: 'Merriweather, serif' }}>
                          Không tìm thấy sự kiện nào cho "{searchQuery}"
                        </p>
                      </div>
                    )}

                  {!searchQuery.trim() && (
                    <div className="p-8 text-center">
                      <p className="text-gray-400" style={{ fontFamily: 'Merriweather, serif' }}>
                        Bắt đầu nhập để tìm kiếm sự kiện...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation items - centered in remaining space */}
          <div className="flex items-center justify-center flex-1">
            {navigationItems.map((item, index) => {
              if (item.title === "Sản phẩm") {
                return (
                  <Popover key={index} as="div" className="relative inline-block text-left">
                    <PopoverButton
                      className="nav-hover-btn text-2xl font-bold px-8 hover:opacity-80 transition-opacity"
                      style={{ fontFamily: 'Merriweather, serif', color: '#f4c5b4' }}
                    >
                      {item.title}
                    </PopoverButton>

                    <PopoverPanel
                      className="absolute left-0 z-[160] mt-2 w-48 origin-top-left rounded-md shadow-lg ring-1 ring-black/5"
                      style={{ backgroundColor: '#730109' }}
                    >
                      <div className="py-1">
                        <Link
                          to="/product"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          style={{ fontFamily: 'Merriweather, serif' }}
                        >
                          Múa rối nước
                        </Link>
                        <Link
                          to="/product-cai-luong"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          style={{ fontFamily: 'Merriweather, serif' }}
                        >
                          Cải lương
                        </Link>
                        <Link
                          to="/product-tuong"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          style={{ fontFamily: 'Merriweather, serif' }}
                        >
                          Tuồng
                        </Link>
                        <Link
                          to="/product-cheo"
                          className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                          style={{ fontFamily: 'Merriweather, serif' }}
                        >
                          Chèo
                        </Link>
                      </div>
                    </PopoverPanel>
                  </Popover>
                );
              }

              return (
                <Link
                  key={index}
                  className="nav-hover-btn text-2xl font-bold px-8 hover:opacity-80 transition-opacity"
                  to={item.link}
                  onClick={() => setIsOpen(!isOpen)}
                  style={{ fontFamily: 'Merriweather, serif', color: '#f4c5b4' }}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          {/* User section */}
          <div className="flex items-center gap-4 flex-shrink-0">
          {user ? (
            <div>
              <Popover as="div" className="relative inline-block text-left">
                <PopoverButton
                  className={`p-1 rounded-full transition-all duration-300 `}
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    size="lg"
                    className={`transition-all duration-300 `}
                  />
                </PopoverButton>

                <PopoverPanel
                  className={`absolute right-0 z-[160] mt-2 w-56 origin-top-right rounded-lg shadow-lg ring-1 
                    ring-black/5 transition-all duration-300 user-dropdown`}
                >
                  <div
                    className={`text-sm py-2 px-4 text-center border-b transition-colors duration-300`}
                    style={{ fontFamily: 'Merriweather, serif' }}
                  >
                    <p>Xin chào {user.name}</p>
                  </div>
                  <div className="py-1">
                    {userQuickAccess.map((item, index) =>
                      item.link ? (
                        <Link
                          key={index}
                          to={item.link}
                          className={`block px-4 py-2 text-sm transition-all duration-200 hover:bg-white/10`}
                          style={{ fontFamily: 'Merriweather, serif' }}
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <button
                          key={index}
                          onClick={() => {
                            if ("action" in item && item.action) {
                              item.action();
                            }
                          }}
                          className={`block px-4 py-2 text-sm transition-all duration-200 text-left w-full hover:bg-white/10`}
                          style={{ fontFamily: 'Merriweather, serif' }}
                        >
                          {item.title}
                        </button>
                      )
                    )}
                  </div>
                </PopoverPanel>
              </Popover>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                className="px-6 py-2 sm:px-8 sm:py-3 transition-all duration-300 rounded-full font-bold cursor-pointer text-lg transform hover:scale-105 hover:shadow-lg"
                onClick={() => setIsLoginForm(true)}
                style={{ 
                  fontFamily: 'Merriweather, serif',
                  backgroundColor: '#fbf5e7',
                  color: '#dc2626'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.color = '#fbf5e7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fbf5e7';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                Đăng nhập
              </button>
              
              <button
                className="px-6 py-2 sm:px-8 sm:py-3 transition-all duration-300 rounded-full font-bold cursor-pointer text-lg transform hover:scale-105 hover:shadow-lg border-2"
                onClick={() => setIsRegisterForm(true)}
                style={{ 
                  fontFamily: 'Merriweather, serif',
                  backgroundColor: 'transparent',
                  color: '#fbf5e7',
                  borderColor: '#fbf5e7'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fbf5e7';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#fbf5e7';
                }}
              >
                Đăng ký
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {isLoginForm && <LoginModal isFormOpen={setIsLoginForm} />}
      {isRegisterForm && <RegisterModal isFormOpen={setIsRegisterForm} onSwitchToLogin={() => {
        setIsRegisterForm(false);
        setIsLoginForm(true);
      }} />}
    </>
  );
};

export default Navbar;
