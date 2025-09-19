import { Shield, LogOut, Bell, Settings, Search, Menu, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface AdminHeaderProps {
  user: any;
  onLogout: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const AdminHeader = ({ user, onLogout, isSidebarCollapsed, onToggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors duration-200"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <Menu size={20} className="text-slate-300" /> : <X size={20} className="text-slate-300" />}
          </button>

          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Cinema Admin Console
              </h1>
              <p className="text-slate-400 text-sm">
                Manage your cinema ecosystem
              </p>
            </div>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, analytics..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200">
            <Settings size={20} />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-400">{user?.role?.toUpperCase() || 'ADMIN'}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-600/50 hover:bg-slate-700/50 hover:text-white transition-colors duration-200"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
