import { Link } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { FaTimes, FaFilter } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import LoginModal from "../user/LoginModal";
import { searchMovies } from "../../apis/movie.api";
import type { Movie } from "../../types/Movie.type";
import { useAuthStore } from "../../store/useAuthStore";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Avatar from "../ui/Avatar";
import { useWindowScroll } from "react-use";
import gsap from "gsap";
import { FaBars } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(false);
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

  const handleSearchIconClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus on input when opening
      setTimeout(() => {
        const input = searchRef.current?.querySelector("input");
        input?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleViewAllResults = () => {
    // Navigate to advanced search page with the current query
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { title: "Home", link: "/" },
      { title: "EVENTS", link: "/movies" },
      { title: "My Product", link: "/product" },
    ];

    if (!user) {
      return baseItems;
    }

    switch (user.role) {
      case "admin":
        return [...baseItems, { title: "Admin Dashboard", link: "/admin" }];
      case "staff":
        return [...baseItems, { title: "Partner Dashboard", link: "/partner" }];
      case "customer":
        return [...baseItems, { title: "My Bookings", link: "/my-bookings" }];
      default:
        return [...baseItems];
    }
  };

  const navigationItems = getNavigationItems();

  const getUserQuickAccess = () => {
    const baseActions = [
      {
        title: "Sign out",
        link: "",
        action: () => logout(),
      },
    ];

    // All roles should have access to profile, payment history, and bookings
    return [
      {
        title: "Profile",
        link: "/profile",
      },
      {
        title: "Payment History",
        link: "/payment-history",
      },
      {
        title: "My Bookings",
        link: "/my-bookings",
      },
      ...baseActions,
    ];
  };

  const userQuickAccess = getUserQuickAccess();

  return (
    <>
      <div className="md:hidden fixed top-4 right-4 z-50 flex gap-40 items-center">
        <div ref={searchRef} className="relative">
          {isOpen ? (
            <IoIosSearch
              onClick={handleSearchIconClick}
              className={`w-6 h-6 cursor-pointer transition-colors duration-300 hover:text-orange-500 ${
                isSearchOpen ? "text-orange-500" : ""
              }`}
            />
          ) : (
            <></>
          )}

          {/* Search input and dropdown */}
          {isSearchOpen && (
            <div className="absolute right-0 top-8 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
              {/* Search input */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for event s..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                    autoFocus
                  />
                  <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

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
                          <h4 className="text-white font-medium truncate">
                            {movie.title}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {new Date(movie.release_date).getFullYear()} •{" "}
                            {movie.duration} min
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-gray-400 text-sm">
                              {movie.average_rating}/10
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {/* View all results button */}
                    <button
                      onClick={handleViewAllResults}
                      className="w-full mt-2 p-3 text-center text-orange-500 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-colors border-t border-gray-700"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}

                {!searchLoading &&
                  searchResults.length === 0 &&
                  searchQuery.trim() && (
                    <div className="p-8 text-center">
                      <p className="text-gray-400">
                        No movies found for "{searchQuery}"
                      </p>
                      <button
                        onClick={handleViewAllResults}
                        className="mt-2 text-orange-500 hover:text-orange-400 transition-colors"
                      >
                        Try advanced search
                      </button>
                    </div>
                  )}

                {!searchQuery.trim() && (
                  <div className="p-8 text-center">
                    <p className="text-gray-400">
                      Start typing to Search for event s...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-64 bg-gray-600 shadow-lg flex flex-col pt-16 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                className="nav-hover-btn py-3 rounded-md"
                to={item.link}
                onClick={() => setIsOpen(false)}
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
            transition rounded-full font-medium cursor-pointer w-full mt-3"
                  onClick={() => setIsLoginForm(true)}
                >
                  Login
                </button>
              )}
            </div>

            <div className="w-full border-b border-gray-500 " />

            <div className="mt-4">
              <Link
                to="/search"
                className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaFilter size={14} />
                Advanced
              </Link>
            </div>
          </div>
        </div>
      )}
      <div
        ref={navContainerRef}
        className={`fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700
        sm:inset-x-6 flex items-center justify-between px-4 max-md:hidden`}
      >
        <Link to={"/"} className="max-md:flex-1">
          <svg
            width="80"
            height="80"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="modernBg" cx="50%" cy="40%" r="60%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#CC1A1A", stopOpacity: 1 }}
                />
                <stop
                  offset="70%"
                  style={{ stopColor: "#8B0000", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#4A0000", stopOpacity: 1 }}
                />
              </radialGradient>

              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#FFE55C", stopOpacity: 1 }}
                />
                <stop
                  offset="50%"
                  style={{ stopColor: "#FFD700", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#DAA520", stopOpacity: 1 }}
                />
              </linearGradient>

              <filter
                id="dropShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="2"
                  dy="4"
                  stdDeviation="3"
                  flood-opacity="0.3"
                />
              </filter>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="200"
              cy="200"
              r="190"
              fill="url(#modernBg)"
              stroke="url(#goldGrad)"
              stroke-width="4"
              filter="url(#dropShadow)"
            />

            <circle
              cx="200"
              cy="200"
              r="170"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="2"
              opacity="0.6"
            />

            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="4"
              filter="url(#glow)"
            />
            <circle
              cx="200"
              cy="200"
              r="120"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="3"
              opacity="0.8"
            />
            <circle
              cx="200"
              cy="200"
              r="100"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="2"
              opacity="0.6"
            />
            <circle
              cx="200"
              cy="200"
              r="80"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="2"
              opacity="0.4"
            />

            <circle
              cx="200"
              cy="200"
              r="35"
              fill="url(#goldGrad)"
              filter="url(#glow)"
            />
            <circle cx="200" cy="200" r="28" fill="#FFE55C" opacity="0.8" />

            <g
              stroke="url(#goldGrad)"
              stroke-width="3"
              fill="none"
              filter="url(#glow)"
            >
              <line x1="200" y1="165" x2="200" y2="150" />
              <line x1="225" y1="175" x2="235" y2="165" />
              <line x1="235" y1="200" x2="250" y2="200" />
              <line x1="225" y1="225" x2="235" y2="235" />
              <line x1="200" y1="235" x2="200" y2="250" />
              <line x1="175" y1="225" x2="165" y2="235" />
              <line x1="165" y1="200" x2="150" y2="200" />
              <line x1="175" y1="175" x2="165" y2="165" />
            </g>

            <g transform="translate(170, 150)" filter="url(#dropShadow)">
              <rect
                x="25"
                y="25"
                width="14"
                height="45"
                fill="url(#goldGrad)"
                rx="7"
              />
              <circle cx="32" cy="20" r="12" fill="url(#goldGrad)" />
              <line
                x1="18"
                y1="35"
                x2="8"
                y2="25"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />
              <circle cx="8" cy="25" r="3" fill="#DAA520" />
              <line
                x1="46"
                y1="35"
                x2="56"
                y2="25"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />
              <circle cx="56" cy="25" r="3" fill="#DAA520" />
              <line
                x1="28"
                y1="70"
                x2="22"
                y2="85"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />
              <line
                x1="36"
                y1="70"
                x2="42"
                y2="85"
                stroke="url(#goldGrad)"
                stroke-width="4"
              />

              <line
                x1="8"
                y1="25"
                x2="2"
                y2="18"
                stroke="#8B4513"
                stroke-width="3"
              />
              <line
                x1="56"
                y1="25"
                x2="62"
                y2="18"
                stroke="#8B4513"
                stroke-width="3"
              />
            </g>

            <g
              transform="translate(90, 80) scale(1.2)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
              <path
                d="M15,17 Q12,25 15,30"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="1"
              />
            </g>

            <g
              transform="translate(280, 90) scale(1.2) rotate(30)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(320, 200) scale(1.2) rotate(90)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(290, 310) scale(1.2) rotate(150)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(110, 320) scale(1.2) rotate(210)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <g
              transform="translate(70, 200) scale(1.2) rotate(270)"
              filter="url(#dropShadow)"
            >
              <path
                d="M0,15 Q15,0 30,15 Q20,20 15,17 Q10,20 0,15"
                fill="url(#goldGrad)"
              />
              <path
                d="M5,15 Q20,8 35,15"
                fill="none"
                stroke="url(#goldGrad)"
                stroke-width="2"
              />
              <circle cx="20" cy="12" r="2" fill="#8B0000" />
            </g>

            <text
              x="200"
              y="60"
              font-family="Georgia, serif"
              font-size="24"
              fill="url(#goldGrad)"
              text-anchor="middle"
              font-weight="bold"
              filter="url(#glow)"
            >
              DÂN GIAN
            </text>

            <text
              x="200"
              y="360"
              font-family="Georgia, serif"
              font-size="24"
              fill="url(#goldGrad)"
              text-anchor="middle"
              font-weight="bold"
              filter="url(#glow)"
            >
              VIỆT NAM
            </text>

            <g opacity="0.4">
              <path
                d="M30,30 Q45,15 60,30 Q45,45 30,30"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
              <path
                d="M340,30 Q355,15 370,30 Q355,45 340,30"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
              <path
                d="M30,370 Q45,355 60,370 Q45,385 30,370"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
              <path
                d="M340,370 Q355,355 370,370 Q355,385 340,370"
                fill="url(#goldGrad)"
                filter="url(#glow)"
              />
            </g>

            <circle
              cx="200"
              cy="200"
              r="185"
              fill="none"
              stroke="url(#goldGrad)"
              stroke-width="1"
              opacity="0.3"
            />
          </svg>
        </Link>

        <div>
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              className="nav-hover-btn"
              to={item.link}
              onClick={() => setIsOpen(!isOpen)}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Search functionality */}
          <div ref={searchRef} className="relative">
            <IoIosSearch
              onClick={handleSearchIconClick}
              className={`w-6 h-6 cursor-pointer transition-colors duration-300 hover:text-orange-500 ${
                isSearchOpen ? "text-orange-500" : ""
              }`}
            />

            {/* Search input and dropdown */}
            {isSearchOpen && (
              <div className="absolute right-0 top-8 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
                {/* Search input */}
                <div className="p-4 border-b border-gray-700">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for event s..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                      autoFocus
                    />
                    <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

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
                            <h4 className="text-white font-medium truncate">
                              {movie.title}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {new Date(movie.release_date).getFullYear()} •{" "}
                              {movie.duration} min
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-gray-400 text-sm">
                                {movie.average_rating}/10
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}

                      {/* View all results button */}
                      <button
                        onClick={handleViewAllResults}
                        className="w-full mt-2 p-3 text-center text-orange-500 hover:text-orange-400 hover:bg-gray-800 rounded-lg transition-colors border-t border-gray-700"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  )}

                  {!searchLoading &&
                    searchResults.length === 0 &&
                    searchQuery.trim() && (
                      <div className="p-8 text-center">
                        <p className="text-gray-400">
                          No movies found for "{searchQuery}"
                        </p>
                        <button
                          onClick={handleViewAllResults}
                          className="mt-2 text-orange-500 hover:text-orange-400 transition-colors"
                        >
                          Try advanced search
                        </button>
                      </div>
                    )}

                  {!searchQuery.trim() && (
                    <div className="p-8 text-center">
                      <p className="text-gray-400">
                        Start typing to Search for event s...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/search"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaFilter size={14} />
            Advanced
          </Link>

          {user ? (
            <div>
              <Popover as="div" className="relative inline-block text-left">
                <PopoverButton
                  className={`p-1 rounded-full transition-all duration-300 `}
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    size="md"
                    className={`transition-all duration-300 `}
                  />
                </PopoverButton>

                <PopoverPanel
                  className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg shadow-lg ring-1 
                    ring-black/5 transition-all duration-300 bg-primary-dull`}
                >
                  <div
                    className={`text-sm py-2 px-4 text-center border-b transition-colors duration-300 `}
                  >
                    <p>Hello {user.name}</p>
                  </div>
                  <div className="py-1">
                    {userQuickAccess.map((item, index) =>
                      item.link ? (
                        <Link
                          key={index}
                          to={item.link}
                          className={`block px-4 py-2 text-sm transition-all duration-200 `}
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
                          className={`block px-4 py-2 text-sm transition-all duration-200 text-left w-full hover:bg-gray-700`}
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
            <button
              className="px-4 py-1 sm:px-7 sm:py-2 bg-[#F84565] hover:bg-[#D63854]
            transition rounded-full font-medium cursor-pointer"
              onClick={() => setIsLoginForm(true)}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {isLoginForm && <LoginModal isFormOpen={setIsLoginForm} />}
    </>
  );
};

export default Navbar;
