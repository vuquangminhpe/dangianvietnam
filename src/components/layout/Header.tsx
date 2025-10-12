import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  FiLinkedin,
  FiMenu,
  FiTwitter,
  FiX,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { IoSearchOutline } from "react-icons/io5";
import { headerItems } from "../../const/index";
import { IoIosArrowUp } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Avatar from "../ui/Avatar";
import logoImage from "../../assets/Giao dien home-06.png";

const Header = () => {
  // Toogle the Menu open/close
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  // Get auth state from zustand store
  const { user, isAuthenticated, logout } = useAuthStore();

  // State to track if the user dropdown is open
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleLogin = () => {
    navigate("/login");
    setIsOpen(false); // Close mobile menu
  };

  const handleRegister = () => {
    navigate("/register");
    setIsOpen(false); // Close mobile menu
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
    setUserDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setUserDropdownOpen(false);
  };

  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <header
      className="fixed w-full h-fit z-[150] transition-all 
    duration-300 border-b-gray-600 border-b-[1px] bg-gradient-to-r from-violet-900 to-gray-800"
    >
      <div
        className="container mx-auto px-4 sm:px-6 
      lg:px-8 flex items-center justify-between h-16 md:h-20"
      >
        {/* logo name */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 25,
            delay: 0.3,
            duration: 1.2,
          }}
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img 
            src={logoImage} 
            alt="Dân Gian Việt Nam Logo" 
            className="h-12 w-auto mr-3"
          />

          <span
            className="text-xl font-bold bg-gradient-to-r from-gray-300 to-gray-100
            bg-clip-text text-transparent"
          >
            Dân Gian Việt Nam
          </span>
        </motion.div>
        {/* Destop navigation */}
        <nav className="lg:flex hidden space-x-8">
          {headerItems.map((item, index) => {
            return (
              <motion.a
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.7 + index * 0.2,
                }}
                href=""
                className="relative text-gray-200 dark:text-gray-200
                  hover:via-violet-600 dark:hover:text-violet-400 font-medium
                  transition-colors duration-300 group"
              >
                <div className="flex items-center gap-2 group">
                  {item.title}
                  {item.content && item.content.length > 0 && (
                    <span>
                      <IoIosArrowUp className="rotate-180 group-hover:rotate-0 transition-all duration-300" />
                    </span>
                  )}
                </div>

                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5
                  bg-violet-600 group-hover:w-full transition-all
                  duration-300"
                ></span>
              </motion.a>
            );
          })}
        </nav>{" "}
        {/* Navbar shortlink */}
        <div className="md:flex hidden items-center space-x-1">
          {" "}
          {isAuthenticated ? (
            // User is logged in - show user dropdown
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={toggleUserDropdown}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="flex items-center space-x-2 text-gray-300 hover:text-violet-400
                transition-colors duration-300"
              >
                {/* Avatar with fallback */}
                <Avatar src={user?.avatar} alt={user?.name} size="md" />
                <span className="hidden lg:block font-medium">
                  {user?.name}
                </span>
                <IoIosArrowUp
                  className={`transition-transform duration-300 ${
                    userDropdownOpen ? "rotate-0" : "rotate-180"
                  }`}
                />
              </motion.button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-[160]"
                  >
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-600">
                        <p className="text-sm text-gray-300">{user?.email}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {user?.role}
                        </p>
                      </div>
                      <button
                        onClick={handleProfile}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <FiLogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // User is not logged in - show login/register buttons
            <>
              <motion.button
                onClick={handleLogin}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400
    text-white font-bold hover:from-orange-600 hover:to-orange-500
    transition-all duration-500 cursor-pointer"
              >
                Login
              </motion.button>

              <motion.button
                onClick={handleRegister}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-400
    text-white font-bold hover:from-violet-700 hover:to-purple-700
    transition-all duration-500 cursor-pointer"
              >
                Sign Up
              </motion.button>
            </>
          )}
          {/* Search Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.5,
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className="ml-4 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-100
          text-violet-700 font-bold hover:from-violet-700 hover:to-purple-700
          hover:text-white transition-all duration-500 cursor-pointer"
          >
            <IoSearchOutline />
          </motion.button>
        </div>
        {/* Mobile Menu Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="md:hidden flex items-center"
        >
          <motion.button
            whileTap={{ scale: 0.7 }}
            onClick={toggleMenu}
            className="text-gray-300 cursor-pointer"
          >
            {isOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </motion.button>
        </motion.div>
      </div>{" "}
      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? "auto" : 0,
        }}
        transition={{ duration: 0.5 }}
        className="md:hidden overflow-hidden bg-white dark:bg-gray-900 shadow-lg
      px-4 py-5 space-y-5"
      >
        <nav className="flex flex-col space-y-3">
          {headerItems.map((item, index) => (
            <a href="#" key={index} className="text-gray-300 font-medium py-2">
              {item.title}
            </a>
          ))}
        </nav>
        <div
          className="pt-4 border-t border-gray-200 
        dark:border-gray-700"
        >
          {isAuthenticated ? (
            // Mobile user menu for logged in users
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                {/* Mobile Avatar */}
                <Avatar src={user?.avatar} alt={user?.name} size="lg" />
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                  className="text-left text-gray-300 py-2"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="text-left text-gray-300 py-2 flex items-center space-x-2"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            // Mobile login/register buttons
            <div className="space-y-3">
              <div className="flex space-x-5">
                <button onClick={handleLogin}>
                  <FiUser className="h-5 w-5 text-gray-300" />
                </button>
                <a href="#">
                  <FiTwitter className="h-5 w-5 text-gray-300" />
                </a>
                <a href="#">
                  <FiLinkedin className="h-5 w-5 text-gray-300" />
                </a>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleLogin}
                  className="block w-full px-4 py-2 rounded-lg text-gray-300 border border-gray-600
                  hover:bg-gray-700 transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={handleRegister}
                  className="block w-full px-4 py-2 rounded-lg
                  bg-gradient-to-r from-violet-600 to-violet-400 font-bold text-white"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          <button
            className="mt-4 block w-full px-4 py-2 rounded-lg
          bg-gradient-to-r from-gray-600 to-gray-400 font-bold"
          >
            <IoSearchOutline />
          </button>
        </div>{" "}
      </motion.div>
    </header>
  );
};

export default Header;
