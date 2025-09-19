import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
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
        className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 px-6 py-4 fixed top-0 z-40 w-full"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <motion.button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 hover:border-orange-500/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {sidebarCollapsed ? (
                  <X size={20} className="text-white" />
                ) : (
                  <Menu size={20} className="text-white" />
                )}
              </motion.div>
            </motion.button> */}

            <div className="flex items-center space-x-4">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-xl shadow-lg shadow-orange-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/logo.png" alt="" className="text-white w-14 h-14" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  CinemaConnect
                </h1>
                <p className="text-slate-400">Partner Management Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="font-medium text-white">
                {user?.name || "Staff User"}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
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
