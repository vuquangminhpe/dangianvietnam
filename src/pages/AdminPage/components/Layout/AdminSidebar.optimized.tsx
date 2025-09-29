import { 
  Home, 
  Users, 
  Film, 
  Calendar, 
  BarChart3, 
  Settings, 
  Ticket, 
  Building, 
  ChevronRight 
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
}

export const AdminSidebar = ({ activeTab, onTabChange, isCollapsed }: AdminSidebarProps) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Bảng điều khiển',
      icon: Home,
      count: null,
    },
    {
      id: 'users',
      label: 'Quản lý người dùng',
      icon: Users,
      count: 1247,
    },
    {
      id: 'movies',
      label: 'Phim',
      icon: Film,
      count: 156,
    },
    {
      id: 'bookings',
      label: 'Đặt vé',
      icon: Ticket,
      count: 3421,
    },
    {
      id: 'theater-management',
      label: 'Quản lý rạp',
      icon: Building,
      count: null,
    },
    {
      id: 'analytics',
      label: 'Phân tích',
      icon: BarChart3,
      count: null,
    },
    {
      id: 'schedule',
      label: 'Lịch chiếu',
      icon: Calendar,
      count: 245,
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      count: null,
    }
  ];

  return (
    <aside className={`bg-slate-800/90 backdrop-blur-sm border-r border-slate-700/50 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen overflow-y-auto`}>
      <div className="p-4">
        {/* Logo Section */}
        {!isCollapsed && (
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Film size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-heading">CinemaOS</h2>
                <p className="text-xs text-slate-400 font-body">Bảng điều khiển quản trị</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`} />
                
                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left font-body">
                      {item.label}
                    </span>
                    
                    {item.count && (
                      <span className={`text-xs px-2 py-1 rounded-full font-body ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-600/50 text-slate-300 group-hover:bg-slate-600 group-hover:text-white'
                      } transition-colors`}>
                        {item.count}
                      </span>
                    )}
                    
                    {isActive && (
                      <ChevronRight size={16} className="text-white" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2 font-heading">Thống kê nhanh</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-body">Người dùng hoạt động</span>
                  <span className="text-emerald-400 font-medium font-body">2,847</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-body">Doanh thu hôm nay</span>
                  <span className="text-emerald-400 font-medium font-body">$12,450</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-body">Tải hệ thống</span>
                  <span className="text-orange-400 font-medium font-body">67%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
