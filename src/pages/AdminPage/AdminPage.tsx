import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";
import {
  AdminHeader,
  AdminSidebar,
  Dashboard,
  UserManagement,
  StaffManagement,
  ContractManagement,
  CouponManagement,
  BannerManagement,
  BannerSliderHomeManagement,
  TicketVerification,
} from "./components";
import { PaymentManagement } from "../../components/admin/PaymentManagement";
import ConciergeManagement from "./components/ConciergeManagement";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UserManagement />;
      case "staff":
        return <StaffManagement />;
      case "contracts":
        return <ContractManagement />;
      case "coupons":
        return <CouponManagement />;
      case "banners":
        return <BannerManagement />;
      case "banner-slider-home":
        return <BannerSliderHomeManagement />;
      case "payments":
        return <PaymentManagement />;
      case "ticket-verification":
        return <TicketVerification />;
      case "add-concierge-qr":
        return <ConciergeManagement />;
      default:
        return <Dashboard />;
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeader
          user={user}
          onLogout={handleLogout}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Page Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
