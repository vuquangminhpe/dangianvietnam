import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuthStore();

  const getDefaultPage = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'staff': return '/partner';
      case 'customer': return '/home';
      default: return '/home';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to={getDefaultPage()}
            className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            to="/home"
            className="block w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
        
        {user && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">
              Logged in as: <span className="text-white font-medium">{user.name}</span>
            </p>
            <p className="text-sm text-gray-400">
              Role: <span className="text-blue-400 font-medium capitalize">{user.role}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;
