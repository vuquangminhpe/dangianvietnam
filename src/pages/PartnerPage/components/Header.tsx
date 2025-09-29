import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

  return (
    <div>
      <motion.header
        className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 px-6 py-2 fixed top-0 z-40 w-full"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="flex items-center justify-between h-16 ">
          
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
            <Link to={"/"} className="flex items-center">
              <svg
                width="50"
                height="50"
                viewBox="0 0 400 400"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-4"
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
                      floodOpacity="0.3"
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
                  strokeWidth="4"
                  filter="url(#dropShadow)"
                />

                <circle
                  cx="200"
                  cy="200"
                  r="170"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="2"
                  opacity="0.6"
                />

                <circle
                  cx="200"
                  cy="200"
                  r="140"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="4"
                  filter="url(#glow)"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="120"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="3"
                  opacity="0.8"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="100"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="80"
                  fill="none"
                  stroke="url(#goldGrad)"
                  strokeWidth="2"
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
                  strokeWidth="3"
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
                    strokeWidth="4"
                  />
                  <circle cx="8" cy="25" r="3" fill="#DAA520" />
                  <line
                    x1="46"
                    y1="35"
                    x2="56"
                    y2="25"
                    stroke="url(#goldGrad)"
                    strokeWidth="4"
                  />
                  <circle cx="56" cy="25" r="3" fill="#DAA520" />
                  <line
                    x1="28"
                    y1="70"
                    x2="22"
                    y2="85"
                    stroke="url(#goldGrad)"
                    strokeWidth="4"
                  />
                  <line
                    x1="36"
                    y1="70"
                    x2="42"
                    y2="85"
                    stroke="url(#goldGrad)"
                    strokeWidth="4"
                  />

                  <line
                    x1="8"
                    y1="25"
                    x2="2"
                    y2="18"
                    stroke="#8B4513"
                    strokeWidth="3"
                  />
                  <line
                    x1="56"
                    y1="25"
                    x2="62"
                    y2="18"
                    stroke="#8B4513"
                    strokeWidth="3"
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
                    strokeWidth="2"
                  />
                  <circle cx="20" cy="12" r="2" fill="#8B0000" />
                  <path
                    d="M15,17 Q12,25 15,30"
                    fill="none"
                    stroke="url(#goldGrad)"
                    strokeWidth="1"
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
                    strokeWidth="2"
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
                    strokeWidth="2"
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
                    strokeWidth="2"
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
                    strokeWidth="2"
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
                    strokeWidth="2"
                  />
                  <circle cx="20" cy="12" r="2" fill="#8B0000" />
                </g>

                <text
                  x="200"
                  y="60"
                  fontFamily="Georgia, serif"
                  fontSize="24"
                  fill="url(#goldGrad)"
                  textAnchor="middle"
                  fontWeight="bold"
                  filter="url(#glow)"
                >
                  DÂN GIAN
                </text>

                <text
                  x="200"
                  y="360"
                  fontFamily="Georgia, serif"
                  fontSize="24"
                  fill="url(#goldGrad)"
                  textAnchor="middle"
                  fontWeight="bold"
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
                  strokeWidth="1"
                  opacity="0.3"
                />
              </svg>
            </Link>
            
            <div className="flex flex-col">
              <span className="text-sm text-slate-400">
                Partner Dashboard
              </span>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="font-medium text-white font-body">
                {user?.name || "Staff User"}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-body">
                {user?.role?.toUpperCase() || "STAFF"}
              </span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600/50 hover:bg-slate-700/50 hover:border-purple-500/30 transition-all duration-300"
              >
                <LogOut size={16} />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </div>
  );
};

export default Header;
